import { throwCustomError } from "../../services/error.js";
import { sendError, sendSuccess } from "../../services/requestHandler.js";
import { App } from "../../models/app.model.js";
import { Link } from "../../models/links.model.js";
import { createSubdomain } from "./app.service.js";
import Joi from "joi";
import mongoose from "mongoose";
import { ClickEvent } from "../../models/clickEvent.model.js";
import { InstallEvent } from "../../models/installEvent.model.js";


export const createApp = async (req, res) => {
    try {
        const {name , subDomain, fallbackUrl, configurations, domainId} = req.body;
        const {performingUser} = req;

        const schema = Joi.object({
            name: Joi.string().min(3).max(15).required(),
            subDomain: Joi.string().required(),
            fallbackUrl: Joi.string().uri().required(),
            domainId: Joi.string().optional().allow(null, ''), // Optional domain reference
            // platform: Joi.string().valid("android", "ios").required(),
            configurations: Joi.object({
                android: Joi.object().keys({
                    packageName: Joi.string().when('platform', {is: 'android', then: Joi.required(), otherwise: Joi.optional()}),
                    fingerPrint: Joi.string().when('platform', {is: 'android', then: Joi.required(), otherwise: Joi.optional()})
                }).optional(),
                ios: Joi.object().keys({
                    teamId: Joi.string().when('platform', {is: 'ios', then: Joi.required(), otherwise: Joi.optional()}),
                    bundleId: Joi.string().when('platform', {is: 'ios', then: Joi.required(), otherwise: Joi.optional()}),
                    storeId: Joi.string().when('platform', {is: 'ios', then: Joi.required(), otherwise: Joi.optional()})
                }).optional()
            }).optional()
        })
        const { error } = schema.validate(req.body)

        console.log(error,"validation error");
        error && throwCustomError(1006)
        let bundleIdExists = null;
        let fingerPrintExists = null;
        let packageNameExists = null;
        let appExists = await App.findOne({subDomain: subDomain});
        
        if(appExists){
            //subdomain already exists
            throwCustomError(1014);
        }

        if(configurations?.ios?.bundleId){
           bundleIdExists = await App.findOne({"configurations.ios.bundleId": configurations?.ios?.bundleId});
        }

        if(bundleIdExists){
            //bundle id already exists
            throwCustomError(1011);
        }

        if(configurations?.android?.fingerPrint){
          fingerPrintExists = await App.findOne({"configurations.android.fingerPrint": configurations.android.fingerPrint});
        }

        if(fingerPrintExists){
            //fingerprint already exists
            throwCustomError(1012);
        }

         if(configurations?.android?.packageName){
         packageNameExists = await App.findOne({"configurations.android.packageName": configurations.android.packageName});

         }
        
        if(packageNameExists){
            //package name already exists
            throwCustomError(1013);
        }

        console.log("Creating subdomain now...");
        // await createSubdomain(subDomain);
        console.log("Subdomain created successfully.");

        const appData = {
            name,
            subDomain,
            fallbackUrl,
            configurations,
            createdBy: performingUser._id
        };

        // Add domainId if provided (for custom domains)
        if (domainId) {
            appData.domainId = domainId;
        }

        await App.create(appData);

        await sendSuccess(req, res, "app created successfully", 201)

    } catch (error) {
        sendError(req,res,error)
    }
}


export const createAppLink =async  (req, res) => {
    try {
        console.log("[createAppLink] ====== Starting link creation ======");
        console.log("[createAppLink] Request body:", JSON.stringify(req.body, null, 2));

        const {domain , path ,destinationUrl, linkName, androidBehavior, iosBehavior, utm} = req.body;
        const {source, medium, previewTitle, previewDescription, previewImageUrl, campaignSource, campaignMedium, campaignName, campaignTerm, campaignContent} = req.body.utm || {};

        console.log("[createAppLink] Extracted fields:");
        console.log("  - domain:", domain);
        console.log("  - path:", path);
        console.log("  - destinationUrl:", destinationUrl);
        console.log("  - linkName:", linkName);
        console.log("  - androidBehavior:", androidBehavior);
        console.log("  - iosBehavior:", iosBehavior);
        console.log("  - utm:", utm ? JSON.stringify(utm) : "none");

        const schema = Joi.object({
            domain: Joi.string().uri().required(),
            path: Joi.string().required(),
            destinationUrl: Joi.string().uri().required(),
            linkName: Joi.string().min(3).max(30).required(),
            androidBehavior: Joi.string().valid("open_app", "open_url").required(),
            iosBehavior: Joi.string().valid("open_app", "open_url").required(),
            utm: Joi.object({
                previewTitle: Joi.string().optional(),
                previewDescription: Joi.string().optional(),
                previewImageUrl: Joi.string().uri().optional(),
                campaignSource: Joi.string().optional(),
                campaignMedium: Joi.string().optional(),
                campaignName: Joi.string().optional(),
                campaignTerm: Joi.string().optional(),
                campaignContent: Joi.string().optional(),
            }).optional()
        })

        console.log("[createAppLink] Validating request body...");
        const {error} = schema.validate(req.body)
        if (error) {
            console.log("[createAppLink] ✗ Validation error:", error.details[0]?.message || error);
            throwCustomError(1006)
        }
        console.log("[createAppLink] ✓ Validation passed");

        // Normalize domain - remove protocol and trailing slashes
        const normalizedDomain = domain
            .replace(/^https?:\/\//, '')  // Remove http:// or https://
            .replace(/\/$/, '')            // Remove trailing slash
            .toLowerCase();
        
        console.log("[createAppLink] Looking up app with domain:", domain);
        console.log("[createAppLink] Normalized domain:", normalizedDomain);

        // Search by multiple possible domain formats
        let appExists = await App.findOne({
            $or: [
                { subDomain: domain },                    // Exact match with protocol
                { subDomain: normalizedDomain },          // Match without protocol
            ]
        });

        console.log("[createAppLink] App lookup (subDomain) result:", appExists ? {
            _id: appExists._id,
            name: appExists.name,
            subDomain: appExists.subDomain
        } : "Not found");

        // If not found by subDomain, also try to find by domainId (custom domain)
        if (!appExists) {
            console.log("[createAppLink] Trying to find app by custom domain reference...");
            const { DomainVerification } = await import('../../models/domainVerification.model.js');
            
            // Parse subdomain and main domain from normalized domain
            const domainParts = normalizedDomain.split('.');
            let searchSubdomain = null;
            let searchMainDomain = normalizedDomain;
            
            if (domainParts.length > 2) {
                searchSubdomain = domainParts[0];
                searchMainDomain = domainParts.slice(1).join('.');
            }

            console.log("[createAppLink] Parsed - subdomain:", searchSubdomain, ", mainDomain:", searchMainDomain);

            // Find verified domain
            const domainVerification = await DomainVerification.findOne({
                $or: [
                    { subdomain: searchSubdomain, domain: searchMainDomain, status: 'verified' },
                    { domain: normalizedDomain, status: 'verified' }
                ],
                isDeleted: { $ne: true }
            });

            if (domainVerification) {
                console.log("[createAppLink] Found domain verification:", {
                    _id: domainVerification._id,
                    subdomain: domainVerification.subdomain,
                    domain: domainVerification.domain
                });

                // Find app linked to this domain
                appExists = await App.findOne({ domainId: domainVerification._id });
                console.log("[createAppLink] App lookup (by domainId) result:", appExists ? {
                    _id: appExists._id,
                    name: appExists.name,
                    subDomain: appExists.subDomain
                } : "Not found");
            }
        }

        if(!appExists){
            console.log("[createAppLink] ✗ App not found for domain:", domain);
            throwCustomError(1009);
        }
        const appId = appExists._id;
        console.log("[createAppLink] ✓ App found, appId:", appId);

        let utmData = {};
        if(utm){
            console.log("[createAppLink] Processing UTM data...");
            if (source) utmData.source = source;
            if (medium) utmData.medium = medium;
            if (previewTitle) utmData.previewTitle = previewTitle;
            if (previewDescription) utmData.previewDescription = previewDescription;
            if (previewImageUrl) utmData.previewImageUrl = previewImageUrl;
            if (campaignSource) utmData.campaignSource = campaignSource;
            if (campaignMedium) utmData.campaignMedium = campaignMedium;
            if (campaignName) utmData.campaignName = campaignName;
            if (campaignTerm) utmData.campaignTerm = campaignTerm;
            if (campaignContent) utmData.campaignContent = campaignContent;
            console.log("[createAppLink] UTM data:", JSON.stringify(utmData));
        }

        console.log("[createAppLink] Creating link in database...");
        const linkData = {
            appId,
            path,
            destinationUrl,
            linkName,
            androidBehavior,
            iosBehavior,
            utm: utmData
        };
        console.log("[createAppLink] Link data:", JSON.stringify(linkData, null, 2));

        const newLink = await Link.create(linkData);
        console.log("[createAppLink] ✓ Link created successfully, linkId:", newLink._id);
        console.log("[createAppLink] ====== Link creation complete ======");

        await sendSuccess(req, res, "link created successfully", 201)

    } catch (error) {
        console.log("[createAppLink] ✗ Error occurred:", error.message || error);
        console.log("[createAppLink] Error stack:", error.stack);
        sendError(req,res,error)
    }
}

export const updateAppLink =async  (req, res) => {
    try {
        const {id} = req.params;
        const {domain , path ,destinationUrl, linkName, androidBehavior, iosBehavior } = req.body;

        const linkExists = await Link.findById(id);

        if(!linkExists){
            throwCustomError(1008);
        }

        const schema = Joi.object({
            domain: Joi.string().uri().optional(),
            path: Joi.string().optional(),
            destinationUrl: Joi.string().uri().optional(),
            linkName: Joi.string().min(3).max(30).optional(),
            androidBehavior: Joi.string().valid("open_app", "open_url").optional(),
            iosBehavior: Joi.string().valid("open_app", "open_url").optional()
        })

        const {error} = schema.validate(req.body)
        error && throwCustomError(1006)


        if(domain) linkExists.domain = domain;
        if(path) linkExists.path = path;
        if(destinationUrl) linkExists.destinationUrl = destinationUrl;
        if(linkName) linkExists.linkName = linkName;
        if(androidBehavior) linkExists.androidBehavior = androidBehavior;
        if(iosBehavior) linkExists.iosBehavior = iosBehavior;

        await linkExists.save();
        await sendSuccess(req, res, "link updated successfully", 200, linkExists)

    } catch (error) {
        sendError(req,res,error)
    }
}


export const getAllLinks = async (req, res) => {
    try {
        const { performingUser } = req;
        const apps = await App.find({ createdBy: performingUser._id }).select('_id');
        const appIds = apps.map(a => a._id);
        const links = await Link.find({ appId: { $in: appIds } }).sort({ createdAt: -1 });
        await sendSuccess(req, res, "links fetched successfully", 200, links)
    } catch (error) {
        sendError(req,res,error)
    }
}

// Overview stats for dashboard (links count, total clicks, total installs)
export const getOverviewStats = async (req, res) => {
    try {
        const { performingUser } = req;
        const apps = await App.find({ createdBy: performingUser._id }).select('_id');
        const appIds = apps.map(a => a._id);
        const links = await Link.find({ appId: { $in: appIds } }).select('_id');
        const linkIds = links.map(l => l._id);

        const [linksCount, totalClicks, totalInstalls] = await Promise.all([
            Promise.resolve(links.length),
            linkIds.length ? ClickEvent.countDocuments({ linkId: { $in: linkIds } }) : 0,
            linkIds.length ? InstallEvent.countDocuments({ linkId: { $in: linkIds } }) : 0,
        ]);

        await sendSuccess(req, res, "Overview stats fetched successfully", 200, {
            linksCount,
            totalClicks,
            totalInstalls,
        });
    } catch (error) {
        sendError(req, res, error);
    }
};

// Full analytics overview: account stats + per-link performance + date filter + country/device/platform
export const getAnalyticsOverview = async (req, res) => {
    try {
        const { performingUser } = req;
        const { startDate, endDate } = req.query;

        const apps = await App.find({ createdBy: performingUser._id }).select('_id name subDomain');
        const appIds = apps.map(a => a._id);
        const appMap = Object.fromEntries(apps.map(a => [a._id.toString(), { name: a.name, subDomain: a.subDomain }]));
        const links = await Link.find({ appId: { $in: appIds } }).select('_id linkName path appId').lean();
        const linkIds = links.map(l => l._id);

        // Date range (optional): if both provided, filter; otherwise all-time
        let dateFilter = {};
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            dateFilter = { createdAt: { $gte: start, $lte: end } };
        }
        const matchClicks = linkIds.length ? { linkId: { $in: linkIds }, ...dateFilter } : {};

        const [
            totalClicksResult,
            totalInstallsResult,
            clickByLink,
            installByLink,
            locationAgg,
            platformAgg,
            deviceAgg,
            installLocationAgg,
            installPlatformAgg,
            installDeviceAgg,
        ] = await Promise.all([
            linkIds.length ? ClickEvent.countDocuments({ linkId: { $in: linkIds }, ...dateFilter }) : 0,
            linkIds.length ? InstallEvent.countDocuments({ linkId: { $in: linkIds }, ...dateFilter }) : 0,
            linkIds.length ? ClickEvent.aggregate([{ $match: { linkId: { $in: linkIds }, ...dateFilter } }, { $group: { _id: '$linkId', count: { $sum: 1 } } }]) : [],
            linkIds.length ? InstallEvent.aggregate([{ $match: { linkId: { $in: linkIds }, ...dateFilter } }, { $group: { _id: '$linkId', count: { $sum: 1 } } }]) : [],
            Object.keys(matchClicks).length ? ClickEvent.aggregate([{ $match: matchClicks }, { $group: { _id: '$country', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 10 }]) : [],
            Object.keys(matchClicks).length ? ClickEvent.aggregate([{ $match: matchClicks }, { $group: { _id: '$platform', count: { $sum: 1 } } }, { $sort: { count: -1 } }]) : [],
            Object.keys(matchClicks).length ? ClickEvent.aggregate([
                { $match: matchClicks },
                { $group: { _id: { $cond: [{ $in: ['$platform', ['ios', 'android']] }, 'Mobile', 'Desktop'] }, count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]) : [],
            Object.keys(matchClicks).length ? InstallEvent.aggregate([{ $match: matchClicks }, { $group: { _id: '$country', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 10 }]) : [],
            Object.keys(matchClicks).length ? InstallEvent.aggregate([{ $match: matchClicks }, { $group: { _id: '$platform', count: { $sum: 1 } } }, { $sort: { count: -1 } }]) : [],
            Object.keys(matchClicks).length ? InstallEvent.aggregate([
                { $match: matchClicks },
                { $group: { _id: { $cond: [{ $in: ['$platform', ['ios', 'android']] }, 'Mobile', 'Desktop'] }, count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]) : [],
        ]);

        const totalClicks = typeof totalClicksResult === 'number' ? totalClicksResult : 0;
        const totalInstalls = typeof totalInstallsResult === 'number' ? totalInstallsResult : 0;
        const linksCount = links.length;
        const conversionRate = totalClicks > 0 ? Math.round((totalInstalls / totalClicks) * 1000) / 10 : 0;

        const clicksMap = Object.fromEntries((clickByLink || []).map((d) => [d._id.toString(), d.count]));
        const installsMap = Object.fromEntries((installByLink || []).map((d) => [d._id.toString(), d.count]));

        const linkPerformance = links.map((link) => {
            const lid = link._id.toString();
            const clicks = clicksMap[lid] ?? 0;
            const installs = installsMap[lid] ?? 0;
            const conv = clicks > 0 ? Math.round((installs / clicks) * 1000) / 10 : 0;
            const app = appMap[link.appId?.toString()];
            const domain = app?.subDomain ? `${app.subDomain}${link.path.startsWith('/') ? '' : '/'}${link.path}` : link.path;
            return {
                linkId: lid,
                linkName: link.linkName,
                path: link.path,
                domain: domain || link.path,
                appName: app?.name,
                clicks,
                installs,
                conversionRate: conv,
            };
        });
        linkPerformance.sort((a, b) => b.clicks - a.clicks);

        const locationAnalytics = (locationAgg || []).map((d) => ({ name: d._id || 'Unknown', count: d.count }));
        const platformAnalytics = (platformAgg || []).map((d) => ({ name: (d._id && d._id.charAt(0).toUpperCase() + d._id.slice(1)) || 'Unknown', count: d.count }));
        const deviceAnalytics = (deviceAgg || []).map((d) => ({ name: d._id, count: d.count }));
        const installLocationAnalytics = (installLocationAgg || []).map((d) => ({ name: d._id || 'Unknown', count: d.count }));
        const installPlatformAnalytics = (installPlatformAgg || []).map((d) => ({ name: (d._id && d._id.charAt(0).toUpperCase() + d._id.slice(1)) || 'Unknown', count: d.count }));
        const installDeviceAnalytics = (installDeviceAgg || []).map((d) => ({ name: d._id, count: d.count }));

        await sendSuccess(req, res, "Analytics overview fetched successfully", 200, {
            linksCount,
            totalClicks,
            totalInstalls,
            conversionRate,
            linkPerformance,
            locationAnalytics: locationAnalytics.length ? locationAnalytics : [{ name: 'No data', count: 0 }],
            platformAnalytics: platformAnalytics.length ? platformAnalytics : [{ name: 'No data', count: 0 }],
            deviceAnalytics: deviceAnalytics.length ? deviceAnalytics : [{ name: 'No data', count: 0 }],
            installLocationAnalytics: installLocationAnalytics.length ? installLocationAnalytics : [{ name: 'No data', count: 0 }],
            installPlatformAnalytics: installPlatformAnalytics.length ? installPlatformAnalytics : [{ name: 'No data', count: 0 }],
            installDeviceAnalytics: installDeviceAnalytics.length ? installDeviceAnalytics : [{ name: 'No data', count: 0 }],
        });
    } catch (error) {
        sendError(req, res, error);
    }
};

export const getLinkInfo = async (req, res) => {
    try {
        const {id} = req.params;

        const linkExists = await Link.findById(id);

        if(!linkExists){
            throwCustomError(1008);
        }

        await sendSuccess(req, res, "link fetched successfully", 200, linkExists)

    } catch (error) {
        sendError(req,res,error)
    }
}




// Get link details by ID
export const getLinkDetails = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("[getLinkDetails] Fetching link with ID:", id);

        const link = await Link.findById(id).populate('appId', 'name subDomain');

        if (!link) {
            console.log("[getLinkDetails] Link not found");
            throwCustomError(1008);
        }

        console.log("[getLinkDetails] Link found:", link.linkName);
        await sendSuccess(req, res, "Link details fetched successfully", 200, { link })

    } catch (error) {
        console.error("[getLinkDetails] Error:", error);
        sendError(req, res, error)
    }
}

// Get analytics for a specific link
export const getLinkAnalytics = async (req, res) => {
    try {
        const { id } = req.params;
        const { startDate, endDate } = req.query;

        console.log("[getLinkAnalytics] Fetching analytics for link:", id);
        console.log("[getLinkAnalytics] Date range:", startDate, "-", endDate);

        const link = await Link.findById(id);
        if (!link) {
            console.log("[getLinkAnalytics] Link not found");
            throwCustomError(1008);
        }

        const linkObjectId = new mongoose.Types.ObjectId(id);

        // Parse dates from query (frontend sends startDate, endDate as YYYY-MM-DD)
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();
        end.setHours(23, 59, 59, 999);

        // ----- Clicks: count in date range (no daily breakdown) -----
        const totalClicks = await ClickEvent.countDocuments({
            linkId: linkObjectId,
            createdAt: { $gte: start, $lte: end },
        });

        // ----- Installs: count in date range (no daily breakdown) -----
        const totalInstalls = await InstallEvent.countDocuments({
            linkId: linkObjectId,
            createdAt: { $gte: start, $lte: end },
        });

        const conversionRate = totalClicks > 0 ? Math.round((totalInstalls / totalClicks) * 1000) / 10 : 0;

        // Single summary for the selected range (for charts that expect an array)
        const rangeLabel = `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
        const clickAnalytics = [{ date: rangeLabel, count: totalClicks }];
        const installAnalytics = [{ date: rangeLabel, count: totalInstalls }];

        // ----- Location (by country) from clicks in range -----
        const locationAgg = await ClickEvent.aggregate([
            { $match: { linkId: linkObjectId, createdAt: { $gte: start, $lte: end } } },
            { $group: { _id: "$country", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
        ]);
        const locationAnalytics = locationAgg.map((d) => ({ name: d._id || "Unknown", count: d.count }));

        // ----- Platform (android / ios / web) from clicks in range -----
        const platformAgg = await ClickEvent.aggregate([
            { $match: { linkId: linkObjectId, createdAt: { $gte: start, $lte: end } } },
            { $group: { _id: "$platform", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
        const platformAnalytics = platformAgg.map((d) => ({ name: (d._id && d._id.charAt(0).toUpperCase() + d._id.slice(1)) || "Unknown", count: d.count }));

        // ----- Device: Mobile (ios+android) vs Desktop (web) from clicks -----
        const deviceAgg = await ClickEvent.aggregate([
            { $match: { linkId: linkObjectId, createdAt: { $gte: start, $lte: end } } },
            {
                $group: {
                    _id: { $cond: [{ $in: ["$platform", ["ios", "android"]] }, "Mobile", "Desktop"] },
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
        ]);
        const deviceAnalytics = deviceAgg.map((d) => ({ name: d._id, count: d.count }));

        // ----- Same breakdowns for installs (for toggle on frontend) -----
        const installLocationAgg = await InstallEvent.aggregate([
            { $match: { linkId: linkObjectId, createdAt: { $gte: start, $lte: end } } },
            { $group: { _id: "$country", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
        ]);
        const installLocationAnalytics = installLocationAgg.map((d) => ({ name: d._id || "Unknown", count: d.count }));
        const installPlatformAgg = await InstallEvent.aggregate([
            { $match: { linkId: linkObjectId, createdAt: { $gte: start, $lte: end } } },
            { $group: { _id: "$platform", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
        const installPlatformAnalytics = installPlatformAgg.map((d) => ({ name: (d._id && d._id.charAt(0).toUpperCase() + d._id.slice(1)) || "Unknown", count: d.count }));
        const installDeviceAgg = await InstallEvent.aggregate([
            { $match: { linkId: linkObjectId, createdAt: { $gte: start, $lte: end } } },
            { $group: { _id: { $cond: [{ $in: ["$platform", ["ios", "android"]] }, "Mobile", "Desktop"] }, count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
        const installDeviceAnalytics = installDeviceAgg.map((d) => ({ name: d._id, count: d.count }));

        const analyticsData = {
            lifetimeStats: {
                totalClicks,
                totalInstalls,
                conversionRate,
                last7Days: totalClicks,
                last30Days: totalClicks,
            },
            clickAnalytics,
            installAnalytics,
            locationAnalytics: locationAnalytics.length ? locationAnalytics : [{ name: "No data", count: 0 }],
            platformAnalytics: platformAnalytics.length ? platformAnalytics : [{ name: "No data", count: 0 }],
            deviceAnalytics: deviceAnalytics.length ? deviceAnalytics : [{ name: "No data", count: 0 }],
            installLocationAnalytics: installLocationAnalytics.length ? installLocationAnalytics : [{ name: "No data", count: 0 }],
            installPlatformAnalytics: installPlatformAnalytics.length ? installPlatformAnalytics : [{ name: "No data", count: 0 }],
            installDeviceAnalytics: installDeviceAnalytics.length ? installDeviceAnalytics : [{ name: "No data", count: 0 }],
        };

        console.log("[getLinkAnalytics] Analytics fetched from DB for link", id, "date range", start, "-", end);
        await sendSuccess(req, res, "Analytics fetched successfully", 200, { analytics: analyticsData });
    } catch (error) {
        console.error("[getLinkAnalytics] Error:", error);
        sendError(req, res, error);
    }
};

// Legacy getAnalytics function for backward compatibility
export const getAnalytics = async (req, res) => {
    try {
        const {id} = req.params;

        const linkExists = await Link.findById(id);

        if(!linkExists){
            throwCustomError(1008);
        }

        //dummy analytics data for now
        const analyticsData = {
            totalClicks: 1500,
            totalInstallations: 300,
        }

        await sendSuccess(req, res, "analytics fetched successfully", 200, analyticsData)

    } catch (error) { 
        sendError(req,res,error)
    }   
}

export const getUserApps = async (req, res) => {
    try {
        const {performingUser} = req;

        const apps = await App.find({
            createdBy: performingUser._id
        })
        .select('name subDomain fallbackUrl domainId')
        .populate({
            path: 'domainId',
            select: 'domain subdomain status verifiedAt isDeleted',
            match: { isDeleted: { $ne: true } } // Only populate non-deleted domains
        })
        .sort({ createdAt: -1 });

        await sendSuccess(req, res, "Apps fetched successfully", 200, apps)

    } catch (error) {
        sendError(req,res,error)
    }
}       



export const checkValidDeepLink = async (req, res) => {

    try {
        const host = req.get("host");
        const fullPath = req.originalUrl;   // real path
        const path = req.originalUrl.split("?")[0];

        const appExists = await App.findOne({ subDomain: host });

        console.log(appExists,"appExists<");
        const linkExists = await Link.findOne({ path: path, appId: appExists._id }).populate('appId');

        if (!appExists || !linkExists) {
            throwCustomError(1017);
        }

        if (appExists.subDomain !== linkExists.appId.subDomain) {
            throwCustomError(1017);
        }

        const app = linkExists.appId;


        if (app.subDomain !== host) {
            throwCustomError(1017);
        }

        await ClickEvent.create({
            linkId: linkExists._id,
            platform: "web",
            browser: "test",
            userAgent: "test",
            ipAddress: req.ip,
            country: "test",
            state: "test",
            city: "test",
        })

        await sendSuccess(req, res, "deep link validated successfully", 201)
    } catch (error) {
        sendError(req, res, error)
    }
}