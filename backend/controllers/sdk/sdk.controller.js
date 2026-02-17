import { InstallEvent } from "../../models/installEvent.model.js";
import { sendError, sendSuccess } from "../../services/requestHandler.js";
import mongoose from "mongoose";

export const handleTrackInstall = async (req, res) => {
    try {
        console.log("handleTrackInstall",req.body);
        const { referrer, install_type, app_package, device_brand, device_model, manufacturer, os, os_version } = req.body;

        if(os === "android"){
            if(referrer === "source=deeplink" ){
                let ipInfo = null;
                try {
                     ipInfo = await axios.get(`https://ipwhois.app/json/${req?.ip}`);
                     console.log(ipInfo,"ipInfo");
                } catch (error) {
                    ipInfo = {
                        country: 'unknown',
                        state: 'unknown',
                        city: 'unknown',
                    }
                }
                 // install is coming from the basedomain link
                 await InstallEvent.create({
                    packageName: app_package,
                    platform: "android",
                    OSVersion: os_version,
                    userAgent: device_brand + " " + device_model + " " + manufacturer,
                    browser: "android",
                    ipAddress: req?.ip ,
                    country: ipInfo?.country || 'unknown',
                    state: ipInfo?.state || 'unknown',
                    city: ipInfo?.city || 'unknown',
                    deviceId: 'device_id',
                    OSVersion: os_version,
                }); 

            }
               
           
        }
        else if(os === "ios"){
            console.log("ios detected");
        }
         sendSuccess(req,res,"install tracked successfully",200);
    } catch (error) {
         sendError(req,res,error)
    }
}