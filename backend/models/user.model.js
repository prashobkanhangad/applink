import { Schema, model } from "mongoose";

const UserSchema = new Schema({
  email: String,
  passwordHash: { type: String, default: null },
  authProvider: { type: String, enum: ["normal", "google", "facebook"] },
  status: { type: String, enum: ["active", "disabled"], default: "active" },
  role: { type: String, enum: ["user", "admin", "sub_user"], default: "user" },
  image_url: { type: String, default: null },
  username: { type: String, default: null },
  origin: { type: String, default: null },
  /** Current plan: ref to PricingPlans. Null = use default plan (resolved at read time). */
  planId: { type: Schema.Types.ObjectId, ref: "PricingPlanSchema", default: null },
  /** @deprecated Use planId. Kept for migration; resolved to planId when present. */
  planSlug: { type: String, default: null },

  // ── Post-signup onboarding ──────────────────────────────────────────────
  /** false = new user must complete onboarding; undefined/true = skip (existing users) */
  onboardingCompleted: { type: Boolean, default: undefined },
  phoneCountryCode: { type: String, default: null },
  phoneNumber: { type: String, default: null },
  companyName: { type: String, default: null },
  jobRole: { type: String, default: null },
  buildingType: { type: String, default: null },
  primaryUseCase: { type: String, default: null },
  platforms: [{ type: String }],
  mauRange: { type: String, default: null },
  teamSize: { type: String, default: null },
  heardFrom: { type: String, default: null },
  currentSolution: { type: String, default: null },
  onboardingOther: {
    buildingType: { type: String, default: null },
    currentSolution: { type: String, default: null },
    heardFrom: { type: String, default: null },
  },
  onboardingCompletedAt: { type: Date, default: null },

  createdAt: Date,
  updatedAt: Date,
  lastLoginAt: { type: Date, default: null },
}, { timestamps: true });

export const User = model("UserSchema", UserSchema, "users")

