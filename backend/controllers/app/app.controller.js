import { throwCustomError } from "../../services/error.js";
import { sendError, sendSuccess } from "../../services/requestHandler.js";
import { App } from "../../models/app.model.js";
import { Link } from "../../models/links.model.js";
import { createSubdomain } from "./app.service.js";
import Joi from "joi";

export const createApp = async (req, res) => {
    try {
        const {name , subDomain, fallbackUrl, configurations} = req.body;
        const {performingUser} = req;

        const schema = Joi.object({
            name: Joi.string().min(3).max(15).required(),
            subDomain: Joi.string().required(),
            fallbackUrl: Joi.string().uri().required(),
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

        await App.create({
            name,
            subDomain,
            fallbackUrl,
            configurations,
            createdBy: performingUser._id
        })

        await sendSuccess(req, res, "app created successfully", 201)

    } catch (error) {
        sendError(req,res,error)
    }
}


export const createAppLink =async  (req, res) => {
    try {

        const {domain , path ,destinationUrl, linkName, androidBehavior, iosBehavior, utm} = req.body;
        const {source, medium, previewTitle, previewDescription, previewImageUrl, campaignSource, campaignMedium, campaignName, campaignTerm, campaignContent} = req.body.utm || {};

      

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

        const {error} = schema.validate(req.body)
        console.log(error,"validation error<<");
        error && throwCustomError(1006)
        const appExists = await App.findOne({subDomain: domain});
        console.log(domain,"domain");
        console.log(appExists,"appExists");
        if(!appExists){
            throwCustomError(1009);
        }
        const appId = appExists._id;
        

       
        let utmData = {};

        if(utm){
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
        }
        await Link.create({
            appId,
            domain,
            path,
            destinationUrl,
            linkName,
            androidBehavior,
            iosBehavior,
            utm: utmData
        })

      await sendSuccess(req, res, "link created successfully", 201)

    } catch (error) {
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