import { ClickEvent } from "../../models/clickEvent.model.js";
import { InstallEvent } from "../../models/installEvent.model.js";
import { App } from "../../models/app.model.js";
import useragent from "express-useragent";
import { getGeoFromIp } from "../../services/geolocation.service.js";

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
        const { platform, referrer, model, packageName, browser: bodyBrowser, userAgent: bodyUserAgent, country: bodyCountry, state: bodyState, city: bodyCity, deviceId: bodyDeviceId, OSVersion: bodyOSVersion, ipAddress: bodyIpAddress, linkId: bodyLinkId } = req.body || {};
        console.log("[handleTrackInstall] body:", { platform, referrer, model: model ? "(present)" : undefined, packageName: packageName || undefined, linkId: bodyLinkId || undefined });

        const ip = getClientIp(req);
        const userAgentStr = req.headers["user-agent"] || unknown;
        const ua = useragent.parse(userAgentStr);
        const resolvedPlatform = platform || detectPlatform(userAgentStr);
        const browser = bodyBrowser ?? ua?.browser ?? ua?.source ?? unknown;
        const osVersion = bodyOSVersion ?? ua?.os ?? unknown;
        const deviceId = bodyDeviceId ?? model ?? referrer ?? unknown;

        console.log("[handleTrackInstall] resolved:", { ip, resolvedPlatform, browser, osVersion, deviceId: deviceId === unknown ? unknown : "(set)" });

        let linkId = bodyLinkId || null;
        let responsePayload = { status: "organic" };

        // If linkId is provided in the request, use it; otherwise try to determine it
        if (!linkId) {
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
        } else {
            console.log("[handleTrackInstall] linkId provided in request:", linkId);
        }

        const hasBodyGeo = bodyCountry ?? bodyState ?? bodyCity;
        const geo = hasBodyGeo
            ? { country: bodyCountry ?? unknown, state: bodyState ?? unknown, city: bodyCity ?? unknown }
            : await getGeoFromIp(bodyIpAddress ?? ip);

        // Resolve app for sdkVerifiedAt; last activity is derived from events via linkId (no appId on event)
        const userId = req.apiKeyUserId;
        if (userId && packageName && (resolvedPlatform === "android" || resolvedPlatform === "ios")) {
            const query =
                resolvedPlatform === "android"
                    ? { createdBy: userId, "configurations.android.packageName": packageName }
                    : { createdBy: userId, "configurations.ios.bundleId": packageName };
            const app = await App.findOne(query).select("_id configurations").lean();
            if (app) {
                const prefix = resolvedPlatform === "android" ? "configurations.android" : "configurations.ios";
                if (!app.configurations?.[resolvedPlatform]?.sdkVerifiedAt) {
                    await App.updateOne({ _id: app._id }, { $set: { [`${prefix}.sdkVerifiedAt`]: new Date() } });
                }
            }
        }

        await InstallEvent.create({
            linkId: linkId || undefined,
            packageName: packageName || undefined,
            platform: resolvedPlatform,
            browser,
            userAgent: bodyUserAgent ?? userAgentStr,
            ipAddress: bodyIpAddress ?? ip,
            country: geo.country,
            state: geo.state,
            city: geo.city,
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

/**
 * When SDK or app records a link open (e.g. deep link opened in app).
 * POST /api/v1/track/click
 * Body: { linkId (required), platform?, packageName?, browser?, userAgent?, ipAddress? }
 * Persists a ClickEvent for analytics.
 */
export const handleTrackClick = async (req, res) => {
    try {
        const { linkId: bodyLinkId, platform: bodyPlatform, packageName, browser: bodyBrowser, userAgent: bodyUserAgent, ipAddress: bodyIpAddress } = req.body || {};
        if (!bodyLinkId) {
            return res.status(400).json({ error: "linkId is required" });
        }

        const ip = getClientIp(req);
        const userAgentStr = req.headers["user-agent"] || unknown;
        const ua = useragent.parse(userAgentStr);
        const platform = bodyPlatform || detectPlatform(userAgentStr);
        const browser = bodyBrowser ?? ua?.browser ?? ua?.source ?? unknown;

        const geo = await getGeoFromIp(bodyIpAddress ?? ip);

        await ClickEvent.create({
            linkId: bodyLinkId,
            platform,
            browser,
            userAgent: bodyUserAgent ?? userAgentStr,
            ipAddress: bodyIpAddress ?? ip,
            country: geo.country,
            state: geo.state,
            city: geo.city,
        });

        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error("[handleTrackClick] error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
