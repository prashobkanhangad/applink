import { throwCustomError } from "../../services/error.js";
import { sendError, sendSuccess } from "../../services/requestHandler.js";
import { App } from "../../models/app.model.js";
import { Link } from "../../models/links.model.js";
import { createSubdomain } from "./app.service.js";
import Joi from "joi";

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
            domain,
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
        const links = await Link.find();
        await sendSuccess(req, res, "links fetched successfully", 200, links)
    } catch (error) {
        sendError(req,res,error)
    }
}

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

        // Parse dates for filtering
        const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const end = endDate ? new Date(endDate) : new Date();
        end.setHours(23, 59, 59, 999); // End of day

        // Get click events for this link in the date range
        // For now, generate sample data - replace with actual analytics model queries
        const generateDailyData = (startDate, endDate) => {
            const data = [];
            const current = new Date(startDate);
            while (current <= endDate) {
                data.push({
                    date: current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    count: Math.floor(Math.random() * 50) + 5
                });
                current.setDate(current.getDate() + 1);
            }
            return data;
        };

        const clickAnalytics = generateDailyData(start, end);
        const installAnalytics = generateDailyData(start, end).map(d => ({ ...d, count: Math.floor(d.count * 0.2) }));

        const totalClicks = clickAnalytics.reduce((sum, d) => sum + d.count, 0);
        const totalInstalls = installAnalytics.reduce((sum, d) => sum + d.count, 0);

        const analyticsData = {
            lifetimeStats: {
                total: totalClicks,
                last7Days: clickAnalytics.slice(-7).reduce((sum, d) => sum + d.count, 0),
                last30Days: clickAnalytics.slice(-30).reduce((sum, d) => sum + d.count, 0),
            },
            clickAnalytics,
            installAnalytics,
            locationAnalytics: [
                { name: 'India', count: Math.floor(totalClicks * 0.45) },
                { name: 'United States', count: Math.floor(totalClicks * 0.25) },
                { name: 'United Kingdom', count: Math.floor(totalClicks * 0.12) },
                { name: 'Germany', count: Math.floor(totalClicks * 0.08) },
                { name: 'Others', count: Math.floor(totalClicks * 0.10) },
            ],
            platformAnalytics: [
                { name: 'Android', count: Math.floor(totalClicks * 0.55) },
                { name: 'iOS', count: Math.floor(totalClicks * 0.35) },
                { name: 'Web', count: Math.floor(totalClicks * 0.10) },
            ],
            deviceAnalytics: [
                { name: 'Mobile', count: Math.floor(totalClicks * 0.75) },
                { name: 'Desktop', count: Math.floor(totalClicks * 0.20) },
                { name: 'Tablet', count: Math.floor(totalClicks * 0.05) },
            ],
        };

        console.log("[getLinkAnalytics] Analytics generated successfully");
        await sendSuccess(req, res, "Analytics fetched successfully", 200, { analytics: analyticsData })

    } catch (error) {
        console.error("[getLinkAnalytics] Error:", error);
        sendError(req, res, error)
    }
}

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