import { ClickEvent } from "../../models/clickEvent.model.js";
import { InstallEvent } from "../../models/installEvent.model.js";
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

const unknown = "unknown";

/**
 * B. When SDK calls .init() (the install)
 * POST /api/track/install
 * Returns attribution: referrer (Android), matched click UTM (iOS), or organic.
 * Persists install using InstallEvent schema.
 */
export const handleTrackInstall = async (req, res) => {
    try {
        const { platform, referrer, model } = req.body || {};
        console.log("[handleTrackInstall] body:", { platform, referrer, model: model ? "(present)" : undefined });

        const ip = getClientIp(req);
        const userAgentStr = req.headers["user-agent"] || unknown;
        const ua = useragent.parse(userAgentStr);
        const resolvedPlatform = platform || detectPlatform(userAgentStr);
        const browser = ua?.browser || ua?.source || unknown;
        const osVersion = ua?.os || unknown;
        const deviceId = model || referrer || unknown;

        console.log("[handleTrackInstall] resolved:", { ip, resolvedPlatform, browser, osVersion, deviceId: deviceId === unknown ? unknown : "(set)" });

        let linkId = null;
        let responsePayload = { status: "organic" };

        if (platform === "android" && referrer) {
            responsePayload = { method: "referrer", data: referrer };
            console.log("[handleTrackInstall] android with referrer");
        } else if (platform === "ios") {
            const oneHourAgo = new Date(Date.now() - 3600 * 1000);
            const match = await ClickEvent.findOne({
                ipAddress: ip,
                createdAt: { $gt: oneHourAgo }
            })
                .sort({ createdAt: -1 })
                .lean();

            if (match) {
                linkId = match.linkId || null;
                if (match.utm && Object.keys(match.utm).length > 0) {
                    responsePayload = match.utm;
                    console.log("[handleTrackInstall] ios matched click, linkId:", linkId, "utm keys:", Object.keys(match.utm));
                } else {
                    console.log("[handleTrackInstall] ios matched click, no utm");
                }
            } else {
                console.log("[handleTrackInstall] ios no click match (organic)");
            }
        } else {
            console.log("[handleTrackInstall] organic");
        }

        await InstallEvent.create({
            linkId: linkId || undefined,
            platform: resolvedPlatform,
            browser,
            userAgent: userAgentStr,
            ipAddress: ip,
            country: unknown,
            state: unknown,
            city: unknown,
            deviceId,
            OSVersion: osVersion,
        });
        console.log("[handleTrackInstall] InstallEvent created, responding:", responsePayload);

        return res.json(responsePayload);
    } catch (err) {
        console.error("[handleTrackInstall] error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
