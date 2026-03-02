import { Schema, model } from "mongoose";

const supportMessageSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "UserSchema", required: true },
    text: { type: String, required: true },
    fromSupport: { type: Boolean, default: false },
    deliveredAt: { type: Date, default: null },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

supportMessageSchema.index({ userId: 1, createdAt: 1 });

export const SupportMessage = model("SupportMessage", supportMessageSchema, "support_messages");
