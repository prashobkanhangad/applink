import axios from "axios";
import * as dotenv from "dotenv";
import { App } from "../../models/app.model.js";
import { throwCustomError } from "../../services/error.js";
import { sendError, sendSuccess } from "../../services/requestHandler.js";
dotenv.config();


const API_KEY = process.env.GODADDY_API_KEY;
const API_SECRET = process.env.GODADDY_API_SECRET;

const DOMAIN =  process.env.DOMAIN_NAME;    
const IP_ADDRESS = process.env.IP_ADDRESS;     




export const createSubdomain = async (subDomain) => {

  console.log("Creating subdomain:", API_KEY, API_SECRET, subDomain, IP_ADDRESS, DOMAIN);  
  const url = `https://api.godaddy.com/v1/domains/${DOMAIN}/records/A/goku`;

  const body = [
    {
      data: IP_ADDRESS,
      ttl: 600
    }
  ];

  try {
    await axios.put(url, body, {
      headers: {
        Authorization: `sso-key ${API_KEY}:${API_SECRET}`,
        "Content-Type": "application/json"
      }
    });

    console.log("✅ Subdomain created successfully");
  } catch (err) {
    console.error("❌ Error creating subdomain:", err);
    throw new Error(`Failed to create subdomain: ${err}`);
  }
}







export const getAssetLinks = async (host) => {
  const appExists = await App.findOne({subDomain: host});

  if(!appExists){
    return null;
  }
  const androidConfig = appExists?.configurations?.android;
  const fingerPrints = (androidConfig?.fingerPrints || []).filter(Boolean);
  const packageName = androidConfig?.packageName;
  return [
    {
      "relation": ["delegate_permission/common.handle_all_urls"],
      "target": {
        "namespace": "android_app",
        "package_name": packageName,
        "sha256_cert_fingerprints": fingerPrints
          
        
      }
    }
  ]
}

export const getAppleAppSiteAssociationLink = async (host) => {
  const appExists = await App.findOne({subDomain: host});
  if(!appExists){
    return null;
  }
  return {
    "applinks": {
      "apps": [],
      "details": [
        {
          "appID": `${appExists.configurations.ios.teamId}.${appExists.configurations.ios.bundleId}`,
          "paths": ["*"]
        }
      ]
    }
  }
}




export const detectBrowser = (userAgent) => {
  if (typeof userAgent !== "string" || !userAgent.trim()) {
    return "unknown";
  }

  const ua = userAgent.toLowerCase();

  if (ua.includes("edg/")) return "edge";
  if (ua.includes("chrome") && !ua.includes("edg/")) return "chrome";
  if (ua.includes("safari") && !ua.includes("chrome")) return "safari";
  if (ua.includes("firefox")) return "firefox";
  if (ua.includes("opr/") || ua.includes("opera")) return "opera";

  return "unknown";
};

export const detectPlatform = (userAgent) => {
  if (typeof userAgent !== "string" || !userAgent.trim()) {
    return "unknown"; // safe fallback
  }

  const ua = userAgent.toLowerCase();

  if (ua.includes("android")) return "android";
  if (/(iphone|ipad|ipod)/.test(ua)) return "ios";
  if (ua.includes("windows") || ua.includes("macintosh") || ua.includes("linux"))
    return "web";

  return "unknown"; // final fallback
};