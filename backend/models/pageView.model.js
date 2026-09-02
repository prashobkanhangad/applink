import { Schema, model } from "mongoose";

const pageViewSchema = new Schema({
  visitorId: { type: String, required: true, index: true },
  sessionId: { type: String, required: true, index: true },
  path: { type: String, required: true, index: true },
  pageTitle: { type: String, default: "" },
  referrer: { type: String, default: "" },
  referrerHost: { type: String, default: "" },
  source: { type: String, default: "Direct", index: true },
  sourceType: {
    type: String,
    enum: ["direct", "search", "social", "referral", "campaign", "internal"],
    default: "direct",
  },
  utmSource: { type: String, default: "" },
  utmMedium: { type: String, default: "" },
  utmCampaign: { type: String, default: "" },
  utmTerm: { type: String, default: "" },
  utmContent: { type: String, default: "" },
  landingPage: { type: String, default: "" },
  isLanding: { type: Boolean, default: false },
  userAgent: { type: String, default: "" },
  browser: { type: String, default: "unknown" },
  platform: { type: String, default: "web" },
  deviceType: { type: String, default: "desktop" },
  country: { type: String, default: "unknown" },
  city: { type: String, default: "unknown" },
  ipAddress: { type: String, default: "unknown" },
}, { timestamps: true });

pageViewSchema.index({ createdAt: -1 });
pageViewSchema.index({ path: 1, createdAt: -1 });
pageViewSchema.index({ source: 1, createdAt: -1 });
pageViewSchema.index({ visitorId: 1, createdAt: -1 });

export const PageView = model("PageView", pageViewSchema, "pageViews");
