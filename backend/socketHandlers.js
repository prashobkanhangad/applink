import { SupportMessage } from "./models/supportMessage.model.js";
import {
  registerSocket,
  verifySocketAuth,
  emitToUser,
  emitToAdmins,
} from "./services/socketService.js";

/**
 * Set up Socket.io connection and events (mark_delivered, mark_read).
 * @param {import("socket.io").Server} io
 */
export function setupSocketHandlers(io) {
  io.on("connection", async (socket) => {
    const user = await verifySocketAuth(socket.handshake);
    if (!user) {
      socket.emit("auth_error", { message: "Invalid or missing token" });
      socket.disconnect(true);
      return;
    }
    registerSocket(socket, user);

    socket.on("mark_delivered", async (data) => {
      const messageId = data?.messageId;
      if (!messageId) return;
      try {
        const msg = await SupportMessage.findById(messageId).lean();
        if (!msg || msg.userId.toString() !== user.userId) return;
        const deliveredAt = msg.deliveredAt || new Date();
        await SupportMessage.findByIdAndUpdate(messageId, { deliveredAt });
        const payload = { messageId, status: "delivered", deliveredAt };
        emitToAdmins(io, "message_status", payload);
        emitToUser(io, user.userId, "message_status", payload);
      } catch (err) {
        console.error("mark_delivered error:", err);
      }
    });

    socket.on("mark_read", async (data) => {
      const messageId = data?.messageId;
      if (!messageId) return;
      try {
        const msg = await SupportMessage.findById(messageId).lean();
        if (!msg || msg.userId.toString() !== user.userId) return;
        const readAt = msg.readAt || new Date();
        await SupportMessage.findByIdAndUpdate(messageId, { readAt });
        const payload = { messageId, status: "read", readAt };
        emitToAdmins(io, "message_status", payload);
        emitToUser(io, user.userId, "message_status", payload);
      } catch (err) {
        console.error("mark_read error:", err);
      }
    });
  });
}
