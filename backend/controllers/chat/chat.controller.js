import { sendError, sendSuccess } from "../../services/requestHandler.js";
import { SupportMessage } from "../../models/supportMessage.model.js";
import { emitToAdmins } from "../../services/socketService.js";

/**
 * GET /chat/messages
 * Returns support chat messages for the current user (newest first, then we reverse on client if needed).
 */
export const getMessages = async (req, res) => {
  try {
    const { performingUser } = req;
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 200);
    const messages = await SupportMessage.find({ userId: performingUser._id })
      .sort({ createdAt: 1 })
      .limit(limit)
      .lean();
    const list = messages.map((m) => ({
      id: m._id.toString(),
      from: m.fromSupport ? "support" : "user",
      text: m.text,
      time: m.createdAt,
      deliveredAt: m.deliveredAt ?? null,
      readAt: m.readAt ?? null,
    }));
    await sendSuccess(req, res, "Messages fetched", 200, { messages: list });
  } catch (err) {
    console.error("getMessages error:", err);
    sendError(req, res, err);
  }
};

/**
 * POST /chat/messages
 * Body: { text: string }
 * Adds a message from the current user to the support thread.
 */
export const sendMessage = async (req, res) => {
  try {
    const { performingUser } = req;
    const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
    if (!text) {
      return res.status(400).json({ status: "error", message: "Message text is required" });
    }
    const doc = await SupportMessage.create({
      userId: performingUser._id,
      text,
      fromSupport: false,
    });
    const msg = {
      id: doc._id.toString(),
      from: "user",
      text: doc.text,
      time: doc.createdAt,
      deliveredAt: doc.deliveredAt ?? null,
      readAt: doc.readAt ?? null,
    };
    const io = req.app.get("io");
    if (io) emitToAdmins(io, "new_message", { message: msg, userId: performingUser._id.toString() });
    await sendSuccess(req, res, "Message sent", 201, { message: msg });
  } catch (err) {
    console.error("sendMessage error:", err);
    sendError(req, res, err);
  }
};
