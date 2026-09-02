import useragent from "express-useragent";
import { PageView } from "../../models/pageView.model.js";
import { getGeoFromIp } from "../../services/geolocation.service.js";

const SKIP_PATH_PREFIXES = ["/admin", "/dashboard", "/api"];
const MAX_STRING = 500;
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 60;

const searchHosts = [
  ["google.", "Google"],
  ["bing.", "Bing"],
  ["yahoo.", "Yahoo"],
  ["duckduckgo.", "DuckDuckGo"],
  ["baidu.", "Baidu"],
  ["yandex.", "Yandex"],
];

const socialHosts = [
  ["facebook.", "Facebook"],
  ["fb.com", "Facebook"],
  ["instagram.", "Instagram"],
  ["twitter.", "Twitter / X"],
  ["x.com", "Twitter / X"],
  ["t.co", "Twitter / X"],
  ["linkedin.", "LinkedIn"],
  ["lnkd.in", "LinkedIn"],
  ["reddit.", "Reddit"],
  ["youtube.", "YouTube"],
  ["youtu.be", "YouTube"],
  ["tiktok.", "TikTok"],
  ["pinterest.", "Pinterest"],
  ["whatsapp.", "WhatsApp"],
  ["telegram.", "Telegram"],
  ["threads.", "Threads"],
];

const rateBuckets = new Map();
const geoCache = new Map();
const GEO_TTL_MS = 60 * 60 * 1000;

const clip = (value, max = MAX_STRING) => {
  if (value == null) return "";
  return String(value).trim().slice(0, max);
};

const getClientIp = (req) => {
  return req.ip ||
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.connection?.remoteAddress ||
    "unknown";
};

const isRateLimited = (visitorId) => {
  const now = Date.now();
  const recent = (rateBuckets.get(visitorId) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) {
    rateBuckets.set(visitorId, recent);
    return true;
  }
  recent.push(now);
  rateBuckets.set(visitorId, recent);
  return false;
};

const parseHost = (url) => {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
};

const matchHostList = (host, list) => {
  for (const [needle, label] of list) {
    if (host === needle.replace(/\.$/, "") || host.includes(needle) || host.endsWith(needle.replace(/^\./, ""))) {
      return label;
    }
  }
  return null;
};

export const classifySource = ({ utmSource, utmMedium, referrer, siteHost }) => {
  const sourceName = clip(utmSource, 80);
  if (sourceName) {
    const medium = String(utmMedium || "").toLowerCase();
    const sourceType = medium === "organic" || medium === "search" ? "search" : "campaign";
    return { source: sourceName, sourceType };
  }

  const host = parseHost(referrer);
  if (!host) {
    return { source: "Direct", sourceType: "direct" };
  }

  const own = String(siteHost || "").replace(/^www\./, "").toLowerCase();
  if (own && (host === own || host.endsWith(`.${own}`))) {
    return { source: "Internal", sourceType: "internal", referrerHost: host };
  }

  const search = matchHostList(host, searchHosts);
  if (search) return { source: search, sourceType: "search", referrerHost: host };

  const social = matchHostList(host, socialHosts);
  if (social) return { source: social, sourceType: "social", referrerHost: host };

  return { source: host, sourceType: "referral", referrerHost: host };
};

const sanitizePath = (raw) => {
  let path = clip(raw, 200) || "/";
  if (!path.startsWith("/")) path = `/${path}`;
  path = path.replace(/\/{2,}/g, "/");
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  const lower = path.toLowerCase();
  if (SKIP_PATH_PREFIXES.some((prefix) => lower === prefix || lower.startsWith(`${prefix}/`))) {
    return null;
  }
  return path;
};

const detectDevice = (ua) => {
  if (!ua) return { browser: "unknown", platform: "web", deviceType: "desktop" };
  const parsed = useragent.parse(ua);
  let platform = "web";
  if (parsed.isiPhone || parsed.isiPad) platform = "ios";
  else if (parsed.isAndroid) platform = "android";

  let deviceType = "desktop";
  if (parsed.isMobile) deviceType = "mobile";
  else if (parsed.isTablet || parsed.isiPad) deviceType = "tablet";

  return {
    browser: parsed.browser || "unknown",
    platform,
    deviceType,
  };
};

const getCachedGeo = async (ip) => {
  const cached = geoCache.get(ip);
  if (cached && Date.now() - cached.at < GEO_TTL_MS) return cached.geo;
  const geo = await getGeoFromIp(ip);
  geoCache.set(ip, { geo, at: Date.now() });
  return geo;
};

/**
 * POST /analytics/pageview
 * Public, fire-and-forget visitor tracking for the marketing site.
 */
export const trackPageView = async (req, res) => {
  try {
    const visitorId = clip(req.body?.visitorId, 80);
    const sessionId = clip(req.body?.sessionId, 80);
    const path = sanitizePath(req.body?.path);

    if (!visitorId || !sessionId || !path) {
      return res.status(204).end();
    }
    if (isRateLimited(visitorId)) {
      return res.status(204).end();
    }

    const uaString = clip(req.headers["user-agent"], 500);
    if (/bot|crawl|spider|slurp|bingpreview|facebookexternalhit/i.test(uaString)) {
      return res.status(204).end();
    }

    res.status(204).end();

    const utmSource = clip(req.body?.utmSource, 80);
    const utmMedium = clip(req.body?.utmMedium, 80);
    const utmCampaign = clip(req.body?.utmCampaign, 120);
    const utmTerm = clip(req.body?.utmTerm, 120);
    const utmContent = clip(req.body?.utmContent, 120);
    const referrer = clip(req.body?.referrer, 500);
    const landingPage = sanitizePath(req.body?.landingPage) || path;
    const pageTitle = clip(req.body?.pageTitle, 200);
    const siteHost = parseHost(req.body?.siteOrigin) || clip(req.headers.origin, 200).replace(/^https?:\/\//, "");
    const classified = classifySource({ utmSource, utmMedium, referrer, siteHost });
    const device = detectDevice(uaString);
    const ip = getClientIp(req);
    const geo = await getCachedGeo(ip);

    await PageView.create({
      visitorId,
      sessionId,
      path,
      pageTitle,
      referrer,
      referrerHost: classified.referrerHost || parseHost(referrer),
      source: classified.source,
      sourceType: classified.sourceType,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
      landingPage,
      isLanding: Boolean(req.body?.isLanding),
      userAgent: uaString,
      browser: device.browser,
      platform: device.platform,
      deviceType: device.deviceType,
      country: geo.country || "unknown",
      city: geo.city || "unknown",
      ipAddress: ip,
    });
  } catch (error) {
    console.error("[trackPageView]", error);
    if (!res.headersSent) {
      res.status(204).end();
    }
  }
};
