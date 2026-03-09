import { InstallEvent } from "../../models/installEvent.model.js";
import { sendError, sendSuccess } from "../../services/requestHandler.js";
import { getGeoFromIp } from "../../services/geolocation.service.js";
import { ClickEvent } from "../../models/clickEvent.model.js";
import { App } from "../../models/app.model.js";
import { Link } from "../../models/links.model.js";
import useragent from "express-useragent";
import { detectPlatform, detectBrowser } from "../app/app.service.js";

const getClientIp = (req) =>
    req.headers["cf-connecting-ip"] ||
    req.ip ||
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.connection?.remoteAddress ||
    "unknown";

export const handleTrackInstall = async (req, res) => {
    try {
        console.log("handleTrackInstall", req.body);
        const { referrer, install_type, app_package, device_brand, device_model, manufacturer, os, os_version } = req.body;
        const ip = getClientIp(req);
        const geo = await getGeoFromIp(ip);

        // Parse referrer string coming from Play Install Referrer, e.g. "linkId=<id>&source=deeplink"
        let parsedLinkId = null;
        let refSource = null;
        if (typeof referrer === "string" && referrer.length > 0) {
            try {
                const params = new URLSearchParams(referrer);
                parsedLinkId = params.get("linkId");
                refSource = params.get("source");
            } catch (e) {
                console.log("failed to parse referrer string", referrer, e);
            }
        }

        if (os === "android") {
            console.log("android detected", ip);
            console.log("refSource", refSource);
            console.log("parsedLinkId", parsedLinkId);
            // Only attribute Android install if source is deeplink
            if (refSource === "deeplink") {
                
                await InstallEvent.create({
                    linkId: parsedLinkId,
                    packageName: app_package,
                    platform: "android",
                    OSVersion: os_version,
                    userAgent: device_brand + " " + device_model + " " + manufacturer,
                    browser: "android",
                    ipAddress: ip,
                    country: geo.country,
                    state: geo.state,
                    city: geo.city,
                    deviceId: "device_id",
                });
            }
        } else if (os === "ios") {
            console.log("ios detected", ip);

            // Fallback logic for iOS: if we don't have a linkId from referrer,
            // try to attribute based on the most recent click from the same IP
            let finalLinkId = parsedLinkId;

            if (!finalLinkId && ip) {
                try {
                    const now = new Date();
                    const lookbackMs = 0.5 * 60 * 60 * 1000; // 30 minutes window

                    const recentClick = await ClickEvent.findOne({
                        ipAddress: ip,
                        platform: "ios",
                        createdAt: { $gte: new Date(now.getTime() - lookbackMs) },
                    }).sort({ createdAt: -1 }).limit(1);

                    if (recentClick?.linkId) {
                        finalLinkId = recentClick.linkId;
                    }
                } catch (e) {
                    console.log("failed to find recent iOS click for attribution", e);
                }
            }

            await InstallEvent.create({
                linkId: finalLinkId || null,
                packageName: app_package,
                platform: "ios",
                OSVersion: os_version,
                userAgent: device_brand + " " + device_model + " " + manufacturer,
                browser: "ios",
                ipAddress: ip,
                country: geo.country,
                state: geo.state,
                city: geo.city,
                deviceId: "device_id",
            });
        }
        sendSuccess(req, res, "install tracked successfully", 200);
    } catch (error) {
        console.log(error, "error");
        sendError(req, res, error);
    }
};

export const deeplinkClick = async (req, res) => {
    try {
        const { deep_link, timestamp, app_package } = req.body;
      
        const ip = getClientIp(req);
        const geo = await getGeoFromIp(ip);
        
        const userAgentStr = req.headers["user-agent"] || unknown;
        const platform =  detectPlatform(userAgentStr);
        const browser = detectBrowser(userAgentStr);

        const url = new URL(deep_link);

        const host = url.hostname;
        const path = url.pathname;

        const app = await App.findOne({ subDomain: host });

        if (!app) {
            return sendError(req, res, "app not found", 404);
        }

        const link = await Link.findOne({ appId: app._id, path: path });
        if (!link) {
            return sendError(req, res, "link not found", 404);
        }

     

        await ClickEvent.create({
            linkId: link._id,
            platform: platform,
            browser: browser,
            userAgent: userAgentStr,
            ipAddress: ip,
            country: geo.country,
            state: geo.state,
            city: geo.city,
        })
       
        sendSuccess(req, res, "deeplink clicked successfully", 200);
    } catch (error) {
        console.log(error, "error");
        sendError(req, res, error);
    }
};