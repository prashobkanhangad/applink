import { ClickEvent } from "../../models/clickEvent.model.js";
import useragent from "express-useragent";

/**
 * Get client IP (handles proxies).
 */
const getClientIp = (req) => {
    return req.ip ||
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.connection?.remoteAddress ||
        "unknown";
};

const detectPlatform = (userAgentStr) => {
    if (!userAgentStr) return "web";
    const ua = useragent.parse(userAgentStr);
    if (ua.isiPhone || ua.isiPad) return "ios";
    if (ua.isAndroid) return "android";
    return "web";
};



/**
 * B. When SDK calls .init() (the install)
 * POST /api/track/install
 * Returns attribution: referrer (Android), matched click UTM (iOS), or organic.
 */
export const handleTrackInstall = async (req, res) => {
    try {
        const { platform, referrer } = req.body || {};
        const ip = getClientIp(req);

        if (platform === "android" && referrer) {
            return res.json({ method: "referrer", data: referrer });
        }

        if (platform === "ios") {
            const oneHourAgo = new Date(Date.now() - 3600 * 1000);
            const match = await ClickEvent.findOne({
                ipAddress: ip,
                createdAt: { $gt: oneHourAgo }
            })
                .sort({ createdAt: -1 })
                .lean();

            if (match && match.utm && Object.keys(match.utm).length > 0) {
                return res.json(match.utm);
            }
        }

        return res.json({ status: "organic" });
    } catch (err) {
        console.error("Install track error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
