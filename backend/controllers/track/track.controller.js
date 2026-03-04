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

// Try to derive a stable deviceId from SDK userAgent (when not explicitly sent).
// For Deeplink SDK we set userAgent like:
// - Android: "DeeplinkSDK (Android <osVersion>; <model>)"
// - iOS:     "DeeplinkSDK (iOS <systemVersion>; <machine>)"
// This helper extracts the last token inside the parentheses, which is model/machine.
const deriveDeviceIdFromUserAgent = (uaString) => {
    if (!uaString || typeof uaString !== "string") return null;
    const match = uaString.match(/\((?:Android|iOS) [^;]*; ([^)]+)\)/);
    if (match && match[1]) {
        return match[1].trim();
    }
    return null;
};

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
        const ipForMatch = bodyIpAddress ?? ip;
        const userAgentStr = req.headers["user-agent"] || unknown;
        const ua = useragent.parse(userAgentStr);
        const resolvedPlatform = platform || detectPlatform(userAgentStr);
        const browser = bodyBrowser ?? ua?.browser ?? ua?.source ?? unknown;
        const osVersion = bodyOSVersion ?? ua?.os ?? unknown;
        const deviceId = bodyDeviceId ?? model ?? referrer ?? unknown;

        console.log("[handleTrackInstall] resolved:", { ip, ipForMatch, resolvedPlatform, browser, osVersion, deviceId: deviceId === unknown ? unknown : "(set)" });

        let linkId = bodyLinkId || null;
        let responsePayload = { status: "organic" };

        // If linkId not in body, try to get it from Android referrer (e.g. referrer=linkId%3Dxxx%26source%3Ddeeplink from Play Store redirect)
        if (!linkId && referrer && typeof referrer === "string") {
            const linkIdMatch = referrer.match(/linkId=([^&]+)/);
            if (linkIdMatch && linkIdMatch[1]) {
                linkId = linkIdMatch[1].trim();
                console.log("[handleTrackInstall] linkId parsed from referrer:", linkId);
            }
        }

        // If linkId is still not set, try other attribution (referrer data, iOS device/IP match)
        if (!linkId) {
            if (platform === "android" && referrer) {
                responsePayload = { method: "referrer", data: referrer };
                console.log("[handleTrackInstall] android with referrer");
            } else if (platform === "ios") {
                const oneHourAgo = new Date(Date.now() - 3600 * 1000);
                let match = null;

                // Prefer matching on deviceId when available (more stable than IP)
                if (bodyDeviceId) {
                    match = await ClickEvent.findOne({
                        deviceId: bodyDeviceId,
                        createdAt: { $gt: oneHourAgo },
                    })
                        .sort({ createdAt: -1 })
                        .lean();
                }

                // Fallback to IP-based matching if no deviceId match
                if (!match) {
                    match = await ClickEvent.findOne({
                        ipAddress: ipForMatch,
                        createdAt: { $gt: oneHourAgo },
                    })
                        .sort({ createdAt: -1 })
                        .lean();
                }

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
        const { linkId: bodyLinkId, platform: bodyPlatform, packageName, browser: bodyBrowser, userAgent: bodyUserAgent, ipAddress: bodyIpAddress, deviceId: bodyDeviceId } = req.body || {};
        if (!bodyLinkId) {
            return res.status(400).json({ error: "linkId is required" });
        }

        const ip = getClientIp(req);
        const userAgentStr = req.headers["user-agent"] || unknown;
        const ua = useragent.parse(userAgentStr);
        const platform = bodyPlatform || detectPlatform(userAgentStr);
        const browser = bodyBrowser ?? ua?.browser ?? ua?.source ?? unknown;

        const geo = await getGeoFromIp(bodyIpAddress ?? ip);

        // Prefer explicit deviceId from SDK; otherwise try to derive from SDK userAgent format.
        const effectiveUserAgent = bodyUserAgent ?? userAgentStr;
        const derivedDeviceId = deriveDeviceIdFromUserAgent(effectiveUserAgent);
        const deviceIdToStore = bodyDeviceId ?? derivedDeviceId ?? null;

        await ClickEvent.create({
            linkId: bodyLinkId,
            platform,
            browser,
            userAgent: effectiveUserAgent,
            ipAddress: bodyIpAddress ?? ip,
            country: geo.country,
            state: geo.state,
            city: geo.city,
            deviceId: deviceIdToStore,
        });

        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error("[handleTrackClick] error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
