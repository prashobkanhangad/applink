import { Schema, model } from "mongoose";

const planChangeSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "UserSchema", required: true },
    fromPlanId: { type: Schema.Types.ObjectId, ref: "PricingPlanSchema", required: true },
    toPlanId: { type: Schema.Types.ObjectId, ref: "PricingPlanSchema", required: true },
    source: {
      type: String,
      enum: ["user", "admin", "billing"],
      default: "user",
    },
  },
  { timestamps: true }
);

planChangeSchema.index({ userId: 1, createdAt: -1 });

export const PlanChange = model("PlanChange", planChangeSchema, "plan_changes");
