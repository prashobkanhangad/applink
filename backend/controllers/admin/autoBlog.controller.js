import { runAutoBlogGeneration, getAutoBlogLogs } from "../../services/autoBlog.service.js";
import { AutoBlogLog } from "../../models/autoBlogLog.model.js";

/** POST /api/v1/admin/auto-blog/run — manually trigger a generation run */
export const triggerAutoBlog = async (req, res) => {
  const count = Math.min(10, Math.max(1, parseInt(req.body?.count) || 5));

  // Don't allow a second run if one is already running
  const running = await AutoBlogLog.findOne({ status: "running" });
  if (running) {
    return res.status(409).json({
      status: "error",
      message: "A generation run is already in progress.",
      runId: running._id,
    });
  }

  // Fire-and-forget — respond immediately, run in background
  res.json({ status: "ok", message: `Generating ${count} blog post(s) in background...` });

  runAutoBlogGeneration("manual", count).catch((err) =>
    console.error("[AutoBlog] Manual trigger error:", err.message)
  );
};

/** GET /api/v1/admin/auto-blog/logs — recent generation logs */
export const getRunLogs = async (req, res) => {
  try {
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const logs = await getAutoBlogLogs(limit);
    res.json({ status: "ok", data: logs });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

/** GET /api/v1/admin/auto-blog/status — current running status */
export const getRunStatus = async (req, res) => {
  try {
    const running = await AutoBlogLog.findOne({ status: "running" }).lean();
    const latest = await AutoBlogLog.findOne({}).sort({ createdAt: -1 }).lean();
    res.json({ status: "ok", data: { running, latest } });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
