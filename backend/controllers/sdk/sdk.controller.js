import { InstallEvent } from "../../models/installEvent.model.js";
import { sendError, sendSuccess } from "../../services/requestHandler.js";
import { getGeoFromIp } from "../../services/geolocation.service.js";
import { ClickEvent } from "../../models/clickEvent.model.js";
import { App } from "../../models/app.model.js";
import { Link } from "../../models/links.model.js";

const getClientIp = (req) =>
    req.ip ||
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.connection?.remoteAddress ||
    "unknown";

export const handleTrackInstall = async (req, res) => {
    try {
        console.log("handleTrackInstall", req.body);
        const { referrer, install_type, app_package, device_brand, device_model, manufacturer, os, os_version } = req.body;

        if (os === "android") {
            if (referrer === "source=deeplink") {
                const ip = getClientIp(req);
                const geo = await getGeoFromIp(ip);

                await InstallEvent.create({
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
                    OSVersion: os_version,
                });
            }
        } else if (os === "ios") {
            console.log("ios detected");
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
      
        const ip = req.headers['cf-connecting-ip'];
        const geo = await getGeoFromIp(ip);
        
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
            platform: "web",
            browser: "test",
            userAgent: "test",
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