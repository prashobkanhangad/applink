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

// Extract OS/app version from a user-agent string (both SDK and browser UAs).
// Examples:
// - "DeeplinkSDK (iOS 17.5; iPhone14,2)"        -> "17.5"
// - "DeeplinkSDK (Android 14; Pixel 7)"        -> "14"
// - "iPhone OS 18_7 like Mac OS X"             -> "18.7"
// - "... Version/26.2 Mobile/..."              -> "26.2"
const extractOsVersionFromUserAgent = (uaString) => {
    if (!uaString || typeof uaString !== "string") return null;

    // Safari / iOS browser pattern: "Version/26.2"
    let match = uaString.match(/Version\/([0-9._]+)/i);
    if (!match) {
        // iOS SDK pattern: "iOS 17.5;"
        match = uaString.match(/iOS\s+([0-9._]+)/i);
    }
    // iOS SDK pattern: "iOS 17.5;"
    if (!match) {
        // Browser pattern: "iPhone OS 18_7 like Mac OS X"
        match = uaString.match(/iPhone OS\s+([0-9_]+)/i);
    }
    if (!match) {
        // Android SDK/browser: "Android 14" or "Android 14.1"
        match = uaString.match(/Android\s+([0-9.]+)/i);
    }
    if (match && match[1]) {
        return match[1].replace(/_/g, ".").trim();
    }
    return null;
};

// Compute attribution score between an install event and a click event.
// Higher score = better match. Weights based on IP, geo, platform, deviceId, and OS version.
// Max score ~= 100:
// - deviceId: up to 25
// - OSVersion: up to 15
// - IP:       up to 30
// - country:  10
// - city:     10
// - platform: 10
const computeAttributionScore = (install, click) => {
    let score = 0;
    const breakdown = {
        ip: 0,
        country: 0,
        city: 0,
        platform: 0,
        osVersion: 0,
        deviceId: 0,
    };

    // IP-based score: higher when more parts (octets) match (max 30).
    // Example for IPv4:
    // - All 4 parts match: +30
    // - First 3 parts match: +25
    // (2 or 1 octet matches are treated as 0 – too weak)
    if (click.ipAddress && install.ipAddress && click.ipAddress !== unknown && install.ipAddress !== unknown) {
        const a = click.ipAddress.split(".");
        const b = install.ipAddress.split(".");
        if (a.length === 4 && b.length === 4) {
            let partsMatch = 0;
            for (let i = 0; i < 4; i++) {
                if (a[i] === b[i]) {
                    partsMatch++;
                } else {
                    break;
                }
            }
            if (partsMatch === 4) {
                score += 30;
                breakdown.ip = 30;
            } else if (partsMatch === 3) {
                score += 25;
                breakdown.ip = 25;
            }
        } else if (click.ipAddress === install.ipAddress) {
            // Non-IPv4 (e.g. IPv6) – if exact string matches, give full score.
            score += 30;
            breakdown.ip = 30;
        }
    }

    if (click.country && install.country && click.country === install.country) {
        score += 10;
        breakdown.country = 10;
    }
    if (click.city && install.city && click.city === install.city) {
        score += 10;
        breakdown.city = 10;
    }
    if (click.platform && install.platform && click.platform === install.platform) {
        score += 10;
        breakdown.platform = 10;
    }

    // OS version match (from install.OSVersion vs click.userAgent) – medium weight (up to 15)
    if (install.OSVersion) {
        const clickOs = extractOsVersionFromUserAgent(click.userAgent || "");
        if (clickOs) {
            // Normalize to major.minor for comparison when possible
            const norm = (v) => v.toString().split(".").slice(0, 2).join(".");
            if (norm(install.OSVersion) === norm(clickOs)) {
                score += 15;
                breakdown.osVersion = 15;
            }
        }
    }

    // DeviceId is still a strong signal when present – give it good weight (up to 25)
    if (install.deviceId && click.deviceId && install.deviceId === click.deviceId) {
        score += 25;
        breakdown.deviceId = 25;
    }

    console.log("[computeAttributionScore]", {
        install: {
            ip: install.ipAddress,
            country: install.country,
            city: install.city,
            platform: install.platform,
            OSVersion: install.OSVersion,
            deviceId: install.deviceId,
        },
        click: {
            ip: click.ipAddress,
            country: click.country,
            city: click.city,
            platform: click.platform,
            userAgent: click.userAgent,
            deviceId: click.deviceId,
        },
        breakdown,
        totalScore: score,
    });

    return score;
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

        const hasBodyGeo = bodyCountry ?? bodyState ?? bodyCity;
        const geo = hasBodyGeo
            ? { country: bodyCountry ?? unknown, state: bodyState ?? unknown, city: bodyCity ?? unknown }
            : await getGeoFromIp(bodyIpAddress ?? ip);

        console.log("[handleTrackInstall] resolved:", {
            ip,
            ipForMatch,
            resolvedPlatform,
            browser,
            osVersion,
            geo,
            deviceId: deviceId === unknown ? unknown : "(set)",
        });

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

        // If linkId is still not set, try other attribution (referrer data, iOS scoring match)
        if (!linkId) {
            if (platform === "android" && referrer) {
                responsePayload = { method: "referrer", data: referrer };
                console.log("[handleTrackInstall] android with referrer");
            } else if (platform === "ios") {
                const oneHourAgo = new Date(Date.now() - 3600 * 1000);

                // Build candidate filter: recent iOS clicks that share at least one signal (ip, deviceId, geo)
                const candidateFilter = {
                    platform: "ios",
                    createdAt: { $gt: oneHourAgo },
                };
                const orConditions = [];
                if (bodyDeviceId) {
                    orConditions.push({ deviceId: bodyDeviceId });
                }
                if (ipForMatch && ipForMatch !== unknown) {
                    orConditions.push({ ipAddress: ipForMatch });
                }
                if (geo.country && geo.country !== unknown) {
                    orConditions.push({ country: geo.country });
                }
                if (geo.city && geo.city !== unknown) {
                    orConditions.push({ city: geo.city });
                }
                if (orConditions.length > 0) {
                    candidateFilter.$or = orConditions;
                }

                const candidates = await ClickEvent.find(candidateFilter).sort({ createdAt: -1 }).lean();

                let bestMatch = null;
                let bestScore = 0;

                const installFingerprint = {
                    ipAddress: ipForMatch,
                    country: geo.country,
                    city: geo.city,
                    platform: resolvedPlatform,
                    deviceId: bodyDeviceId || (deviceId !== unknown ? deviceId : null),
                    OSVersion: osVersion,
                };

                for (const click of candidates) {
                    const score = computeAttributionScore(installFingerprint, click);
                    if (score > bestScore) {
                        bestScore = score;
                        bestMatch = click;
                    }
                }

                // Require a minimum score to avoid random matches
                if (bestMatch && bestScore >= 60) {
                    linkId = bestMatch.linkId || null;
                    if (bestMatch.utm && Object.keys(bestMatch.utm).length > 0) {
                        responsePayload = bestMatch.utm;
                        console.log("[handleTrackInstall] ios scored match", { linkId, bestScore, utmKeys: Object.keys(bestMatch.utm) });
                    } else {
                        console.log("[handleTrackInstall] ios scored match (no utm)", { linkId, bestScore });
                    }
                } else {
                    console.log("[handleTrackInstall] ios no scored click match (organic)", { bestScore, candidates: candidates.length });
                }
            } else {
                console.log("[handleTrackInstall] organic");
            }
        } else {
            console.log("[handleTrackInstall] linkId provided in request:", linkId);
        }

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
        console.log("[handleTrackClick] effectiveUserAgent:", effectiveUserAgent);
        console.log("[handleTrackClick] bodyDeviceId:", bodyDeviceId);

        const derivedDeviceId = deriveDeviceIdFromUserAgent(effectiveUserAgent);
        const deviceIdToStore = bodyDeviceId ?? derivedDeviceId ?? null;
        console.log("[handleTrackClick] deviceIdToStore:", deviceIdToStore);
        console.log("[handleTrackClick] bodyIpAddress:", bodyIpAddress);
        console.log("[handleTrackClick] ip:", ip);

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
