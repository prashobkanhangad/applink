import { Schema, model } from "mongoose";

const paymentOrderSchema = new Schema(
  {
    orderId: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "UserSchema", required: true },
    planId: { type: Schema.Types.ObjectId, ref: "PricingPlanSchema", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: { type: String, enum: ["created", "paid", "failed"], default: "created" },
    razorpayPaymentId: { type: String, default: null },
    billingPeriod: { type: String, enum: ["monthly", "yearly"], default: "monthly" },
  },
  { timestamps: true }
);

paymentOrderSchema.index({ userId: 1, createdAt: -1 });
paymentOrderSchema.index({ orderId: 1 });

export const PaymentOrder = model("PaymentOrder", paymentOrderSchema, "payment_orders");
