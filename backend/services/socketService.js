import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

/** userId -> Set of socket ids */
const userToSockets = new Map();
/** socketId -> { userId, isAdmin } */
const socketToUser = new Map();

/**
 * Register a socket after auth. Call from io.on('connection').
 * @param {import("socket.io").Socket} socket
 * @param {{ userId: string, isAdmin: boolean }} user
 */
export function registerSocket(socket, user) {
  const { userId, isAdmin } = user;
  if (!userToSockets.has(userId)) userToSockets.set(userId, new Set());
  userToSockets.get(userId).add(socket.id);
  socketToUser.set(socket.id, { userId, isAdmin });

  socket.on("disconnect", () => {
    userToSockets.get(userId)?.delete(socket.id);
    if (userToSockets.get(userId)?.size === 0) userToSockets.delete(userId);
    socketToUser.delete(socket.id);
  });
}

/**
 * Verify JWT from handshake and return user info or null.
 * @param {import("socket.io").Handshake} handshake
 * @returns {Promise<{ userId: string, isAdmin: boolean } | null>}
 */
export async function verifySocketAuth(handshake) {
  const token =
    handshake.auth?.token ||
    handshake.query?.token ||
    (handshake.headers?.authorization && handshake.headers.authorization.replace("Bearer ", ""));
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email }).select("_id role").lean();
    if (!user) return null;
    return {
      userId: user._id.toString(),
      isAdmin: user.role === "admin",
    };
  } catch {
    return null;
  }
}

/**
 * Emit to all sockets for a user (e.g. when admin sends a reply).
 * @param {import("socket.io").Server} io
 * @param {string} userId
 * @param {string} event
 * @param {any} data
 */
export function emitToUser(io, userId, event, data) {
  const set = userToSockets.get(userId);
  if (!set) return;
  set.forEach((sid) => io.to(sid).emit(event, data));
}

/**
 * Emit to all admin sockets (e.g. when user sends a message).
 * @param {import("socket.io").Server} io
 * @param {string} event
 * @param {any} data
 */
export function emitToAdmins(io, event, data) {
  socketToUser.forEach((info, sid) => {
    if (info.isAdmin) io.to(sid).emit(event, data);
  });
}

/**
 * Emit to a specific socket (e.g. message_status to admin who is viewing).
 * @param {import("socket.io").Server} io
 * @param {string} socketId
 * @param {string} event
 * @param {any} data
 */
export function emitToSocket(io, socketId, event, data) {
  io.to(socketId).emit(event, data);
}
