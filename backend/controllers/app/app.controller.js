import { throwCustomError } from "../../services/error.js";
import { sendError, sendSuccess } from "../../services/requestHandler.js";
import { App } from "../../models/app.model.js";
import { Link } from "../../models/links.model.js";
import { createSubdomain, detectPlatform, detectBrowser } from "./app.service.js";
import { getGeoFromIp } from "../../services/geolocation.service.js";
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

export const updateAppLink = async (req, res) => {
    try {
        const { id } = req.params;
        const { path, destinationUrl, linkName, androidBehavior, iosBehavior, utm } = req.body;
        const { performingUser } = req;

        const linkExists = await Link.findById(id).populate('appId', 'createdBy');
        if (!linkExists) {
            throwCustomError(1008);
        }
        const app = linkExists.appId;
        if (!app || app.createdBy.toString() !== performingUser._id.toString()) {
            throwCustomError(1008);
        }

        const utmSchema = Joi.object({
            previewTitle: Joi.string().optional().allow(''),
            previewDescription: Joi.string().optional().allow(''),
            previewImageUrl: Joi.string().uri().optional().allow(''),
            campaignSource: Joi.string().optional().allow(''),
            campaignMedium: Joi.string().optional().allow(''),
            campaignName: Joi.string().optional().allow(''),
            campaignTerm: Joi.string().optional().allow(''),
            campaignContent: Joi.string().optional().allow(''),
        });
        const schema = Joi.object({
            path: Joi.string().optional(),
            destinationUrl: Joi.string().uri().optional(),
            linkName: Joi.string().min(3).max(30).optional(),
            androidBehavior: Joi.string().valid("open_app", "open_url").optional(),
            iosBehavior: Joi.string().valid("open_app", "open_url").optional(),
            utm: utmSchema.optional(),
        });
        const { error } = schema.validate(req.body);
        if (error) throwCustomError(1006);

        if (path !== undefined) linkExists.path = path;
        if (destinationUrl !== undefined) linkExists.destinationUrl = destinationUrl;
        if (linkName !== undefined) linkExists.linkName = linkName;
        if (androidBehavior !== undefined) linkExists.androidBehavior = androidBehavior;
        if (iosBehavior !== undefined) linkExists.iosBehavior = iosBehavior;

        if (utm !== undefined && utm !== null) {
            const u = linkExists.utm || {};
            if (utm.previewTitle !== undefined) u.previewTitle = utm.previewTitle || null;
            if (utm.previewDescription !== undefined) u.previewDescription = utm.previewDescription || null;
            if (utm.previewImageUrl !== undefined) u.previewImageUrl = utm.previewImageUrl || null;
            if (utm.campaignSource !== undefined) u.campaignSource = utm.campaignSource || null;
            if (utm.campaignMedium !== undefined) u.campaignMedium = utm.campaignMedium || null;
            if (utm.campaignName !== undefined) u.campaignName = utm.campaignName || null;
            if (utm.campaignTerm !== undefined) u.campaignTerm = utm.campaignTerm || null;
            if (utm.campaignContent !== undefined) u.campaignContent = utm.campaignContent || null;
            linkExists.utm = u;
        }

        await linkExists.save();
        await sendSuccess(req, res, "link updated successfully", 200, linkExists);
    } catch (error) {
        sendError(req, res, error);
    }
}


export const getAllLinks = async (req, res) => {
    try {
        const { performingUser } = req;
        const apps = await App.find({ createdBy: performingUser._id }).select('_id subDomain');
        const appIds = apps.map(a => a._id);
        const appDomainMap = {};
        for (const app of apps) {
            let d = app.subDomain || '';
            if (d && !d.startsWith('http://') && !d.startsWith('https://')) d = `https://${d}`;
            appDomainMap[app._id.toString()] = d || null;
        }
        const links = await Link.find({ appId: { $in: appIds } }).sort({ createdAt: -1 }).lean();
        const linkIds = links.map(l => l._id);

        const [clickCounts, installCounts] = await Promise.all([
            linkIds.length ? ClickEvent.aggregate([{ $match: { linkId: { $in: linkIds } } }, { $group: { _id: '$linkId', count: { $sum: 1 } } }]) : [],
            linkIds.length ? InstallEvent.aggregate([{ $match: { linkId: { $in: linkIds } } }, { $group: { _id: '$linkId', count: { $sum: 1 } } }]) : [],
        ]);
        const clicksMap = Object.fromEntries((clickCounts || []).map((d) => [d._id.toString(), d.count]));
        const installsMap = Object.fromEntries((installCounts || []).map((d) => [d._id.toString(), d.count]));

        const linksWithStats = links.map((link) => {
            const id = link._id.toString();
            const appIdStr = link.appId?.toString?.();
            const domain = appIdStr ? (appDomainMap[appIdStr] ?? null) : null;
            return {
                ...link,
                domain,
                clicks: clicksMap[id] ?? 0,
                installs: installsMap[id] ?? 0,
            };
        });
        await sendSuccess(req, res, "links fetched successfully", 200, linksWithStats);
    } catch (error) {
        sendError(req, res, error);
    }
};

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

// Delete a link (only if it belongs to the user's app)
export const deleteLink = async (req, res) => {
    try {
        const { id } = req.params;
        const { performingUser } = req;
        const link = await Link.findById(id).populate('appId', 'createdBy');
        if (!link) {
            throwCustomError(1008);
        }
        const app = link.appId;
        if (!app || app.createdBy.toString() !== performingUser._id.toString()) {
            throwCustomError(1008);
        }
        await Link.findByIdAndDelete(id);
        await sendSuccess(req, res, "Link deleted successfully", 200, {});
    } catch (error) {
        sendError(req, res, error);
    }
};

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

        // ----- Location (by city) from clicks in range -----
        const cityAgg = await ClickEvent.aggregate([
            { $match: { linkId: linkObjectId, createdAt: { $gte: start, $lte: end } } },
            { $group: { _id: "$city", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
        ]);
        const cityAnalytics = cityAgg.map((d) => ({ name: d._id || "Unknown", count: d.count }));

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
        const installCityAgg = await InstallEvent.aggregate([
            { $match: { linkId: linkObjectId, createdAt: { $gte: start, $lte: end } } },
            { $group: { _id: "$city", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
        ]);
        const installCityAnalytics = installCityAgg.map((d) => ({ name: d._id || "Unknown", count: d.count }));
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
            cityAnalytics: cityAnalytics.length ? cityAnalytics : [{ name: "No data", count: 0 }],
            platformAnalytics: platformAnalytics.length ? platformAnalytics : [{ name: "No data", count: 0 }],
            deviceAnalytics: deviceAnalytics.length ? deviceAnalytics : [{ name: "No data", count: 0 }],
            installLocationAnalytics: installLocationAnalytics.length ? installLocationAnalytics : [{ name: "No data", count: 0 }],
            installCityAnalytics: installCityAnalytics.length ? installCityAnalytics : [{ name: "No data", count: 0 }],
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
        console.log(host,"host in checkValidDeepLink");
        const fullPath = req.originalUrl;   // real path
        const path = req.originalUrl.split("?")[0];
        console.log(path,"path in checkValidDeepLink");
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

        const ip = req.ip || req.socket?.remoteAddress || "";
        const userAgentStr = req.get("user-agent") || "";
        const detectedPlatform = detectPlatform(userAgentStr);
        const platform = ["web", "ios", "android"].includes(detectedPlatform) ? detectedPlatform : "web";
        const geo = await getGeoFromIp(ip);

        await ClickEvent.create({
            linkId: linkExists._id,
            platform,
            browser: detectBrowser(userAgentStr) || "unknown",
            userAgent: userAgentStr || "unknown",
            ipAddress: ip || "unknown",
            country: geo?.country ?? "Unknown",
            state: geo?.state ?? "Unknown",
            city: geo?.city ?? "Unknown",
        });

        // Navigation: redirect based on platform and link behavior
        let destination = app.fallbackUrl || linkExists.destinationUrl;

        if (platform === "ios") {
            if (linkExists.iosBehavior === "open_app" && app.configurations?.ios) {
                const storeId = app.configurations.ios.storeId;
                if (storeId) {
                    destination = `https://apps.apple.com/app/id${storeId}`;
                } else {
                    destination = linkExists.destinationUrl;
                }
            } else {
                destination = linkExists.destinationUrl;
            }
        } else if (platform === "android") {
            if (linkExists.androidBehavior === "open_app" && app.configurations?.android?.packageName) {
                try {
                    const urlParts = new URL(linkExists.destinationUrl);
                    destination = `intent://${urlParts.host}${urlParts.pathname}${urlParts.search || ""}#Intent;scheme=https;package=${app.configurations.android.packageName};end`;
                } catch (_) {
                    destination = `https://play.google.com/store/apps/details?id=${app.configurations.android.packageName}&referrer=source%3Ddeeplink`;
                }
            } else {
                destination = linkExists.destinationUrl;
            }
        } else {
            // web or unknown: use destination URL or fallback
            destination = linkExists.destinationUrl || app.fallbackUrl;
        }

        return res.redirect(301, destination);
    } catch (error) {
        sendError(req, res, error);
    }
};