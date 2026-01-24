import { detectPlatform } from "../app/app.service.js";
import { App } from "../../models/app.model.js";
import { throwCustomError } from "../../services/error.js";
import { sendError } from "../../services/requestHandler.js";
import { getAssetLinks } from "../app/app.service.js";

export const manageHome = async (req, res) => {
    try {
        const host = req.headers.host;
        console.log(host,"host");
        const platform = detectPlatform(req.headers['user-agent']);
        const appInfo = await App.findOne({subDomain: host});
        console.log(platform,"platform");
        console.log(appInfo,"appInfo");
    
        if(!appInfo){
            throwCustomError(1009);
        }
        let url = null;

        if(platform === "android"){
             url = `https://play.google.com/store/apps/details?id=com.whatsapp` || `https://play.google.com/store/apps/details?id=${appInfo.configurations.android.packageName}`;
            return res.redirect(url);
        }else if(platform === "ios"){
            const url = `https://apps.apple.com/us/app/${appInfo.name}/${appInfo.configurations.ios.bundleId}`;
            return res.redirect(url);
        }else if(platform === "web"){
            url = appInfo.fallbackUrl;
            return res.redirect(url);
        }else{
            throwCustomError(1016);
        }
    

    } catch (error) {
        sendError(req,res,error);
    }
}

export const manageAssetLinks = async (req, res) => {
    try {
    const host = req.headers.host;
    const assetLinks = await getAssetLinks(host);
    if(!assetLinks){
        throwCustomError(1009);
    }

    return res.json(assetLinks);
    } catch (error) {
        sendError(req,res,error);
    }
}