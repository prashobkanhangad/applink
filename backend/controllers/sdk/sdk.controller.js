import { InstallEvent } from "../../models/installEvent.model.js";
import { sendError, sendSuccess } from "../../services/requestHandler.js";
import { getGeoFromIp } from "../../services/geolocation.service.js";

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
        console.log("deeplinkClick", req.body, req.headers['cf-connecting-ip']);
        const ip = req.headers['cf-connecting-ip'];
        console.log(ip,"ip");
        const geo = await getGeoFromIp(ip);
        console.log(geo,"geo");
        sendSuccess(req, res, "deeplink clicked successfully", 200);
    } catch (error) {
        console.log(error, "error");
        sendError(req, res, error);
    }
};