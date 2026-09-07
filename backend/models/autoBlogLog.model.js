import { Schema, model } from "mongoose";

const postResultSchema = new Schema(
  {
    title: { type: String, default: "" },
    slug: { type: String, default: "" },
    status: { type: String, enum: ["ok", "failed"], default: "ok" },
    error: { type: String, default: "" },
    coverImage: { type: String, default: "" },
  },
  { _id: false }
);

const autoBlogLogSchema = new Schema(
  {
    triggeredBy: {
      type: String,
      enum: ["cron", "manual"],
      default: "cron",
    },
    status: {
      type: String,
      enum: ["running", "completed", "failed"],
      default: "running",
    },
    postsRequested: { type: Number, default: 3 },
    postsCreated: { type: Number, default: 0 },
    postsFailed: { type: Number, default: 0 },
    posts: [postResultSchema],
    error: { type: String, default: "" },
    startedAt: { type: Date, default: Date.now },
    finishedAt: { type: Date, default: null },
    durationMs: { type: Number, default: null },
  },
  { timestamps: true }
);

autoBlogLogSchema.index({ createdAt: -1 });

export const AutoBlogLog = model("AutoBlogLog", autoBlogLogSchema, "autoBlogLogs");
