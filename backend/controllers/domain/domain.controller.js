import { throwCustomError } from "../../services/error.js";
import { sendError, sendSuccess } from "../../services/requestHandler.js";
import { DomainVerification } from "../../models/domainVerification.model.js";
import { Domain } from "../../models/domain.model.js";
import { App } from "../../models/app.model.js";
import { 
    verifyDomain, 
    isValidDomain,
    isValidSubdomain,
    getCNAMETarget
} from "../../services/domainVerification.service.js";
import Joi from "joi";

/**
 * Check if a domain is valid and configured
 * GET /check-domain
 * Public endpoint - no authentication required
 */
export const checkDomain = async (req, res) => {
    try {
        const domain = req.hostname;

        console.log(domain);

        if (!domain) {
            return res.status(400).json({
                status: 'error',
                message: 'Domain parameter is required'
            });
        }

        // Normalize domain (remove protocol, www, trailing slashes)
        const normalizedDomain = domain
            .toLowerCase()
            .trim()
            .replace(/^https?:\/\//, '')
            .replace(/^www\./, '')
            .replace(/\/$/, '');

        // Check if domain exists in DomainVerification (verified custom domains)
        // For CNAME verification, the full domain would be subdomain.domain
        const verifiedDomain = await DomainVerification.findOne({
            status: 'verified',
            $or: [
                { domain: normalizedDomain },
                // Check if this is a subdomain.domain combination
            ]
        });

        if (verifiedDomain) {
            // Check if the hostname matches subdomain.domain
            const expectedFullDomain = `${verifiedDomain.subdomain}.${verifiedDomain.domain}`;
            if (normalizedDomain === expectedFullDomain || normalizedDomain === verifiedDomain.domain) {
                return res.sendStatus(200);
            }
        }

        // Check if domain exists in Domain model
        const domainRecord = await Domain.findOne({
            domain: normalizedDomain,
            verified: true
        });

        if (domainRecord) {
            return res.sendStatus(200);
        }

        // Check if it's a subdomain in App model
        const app = await App.findOne({
            subDomain: normalizedDomain
        });

        if (app) {
            return res.sendStatus(200);
        }

        // Domain not found or not verified
        return res.sendStatus(403);

    } catch (error) {
        console.error("Error checking domain:", error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};

/**
 * Add a new domain for verification
 * POST /api/v1/domain/add
 */
export const addDomain = async (req, res) => {
    try {
        const { domain, subdomain } = req.body;
        const { performingUser } = req;

        const schema = Joi.object({
            domain: Joi.string().required(),
            subdomain: Joi.string().default("link")
        });

        const { error } = schema.validate(req.body);
        if (error) {
            throwCustomError(1006); // Validation error
        }

        // Normalize domain (remove protocol, www, trailing slashes)
        let normalizedDomain = domain
            .toLowerCase()
            .trim()
            .replace(/^https?:\/\//, '')
            .replace(/^www\./, '')
            .replace(/\/$/, '');

        // Normalize subdomain
        let normalizedSubdomain = (subdomain || "link")
            .toLowerCase()
            .trim();

        // Validate domain format
        if (!isValidDomain(normalizedDomain)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid domain format. Please enter a valid domain (e.g., example.com)'
            });
        }

        // Validate subdomain format
        if (!isValidSubdomain(normalizedSubdomain)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid subdomain format. Use only letters, numbers, and hyphens (e.g., link, app, go)'
            });
        }

        // Check if domain + subdomain combination already exists for this user
        const existingDomain = await DomainVerification.findOne({
            domain: normalizedDomain,
            subdomain: normalizedSubdomain,
            createdBy: performingUser._id
        });

        if (existingDomain) {
            return res.status(400).json({
                status: 'error',
                message: 'This domain and subdomain combination has already been added',
                data: existingDomain
            });
        }

        const cnameTarget = getCNAMETarget();

        // Create domain verification record
        const domainVerification = await DomainVerification.create({
            domain: normalizedDomain,
            subdomain: normalizedSubdomain,
            cnameTarget: cnameTarget,
            verificationMethod: "cname",
            createdBy: performingUser._id,
            status: "pending"
        });

        // Prepare verification instructions
        const verificationInstructions = {
            type: "CNAME",
            name: normalizedSubdomain,
            value: cnameTarget,
            fullDomain: `${normalizedSubdomain}.${normalizedDomain}`,
            instructions: `Add a CNAME record to your DNS with the name "${normalizedSubdomain}" pointing to "${cnameTarget}"`
        };

        await sendSuccess(req, res, "Domain added successfully. Please configure CNAME record and verify.", 201, {
            domain: domainVerification,
            instructions: verificationInstructions
        });

    } catch (error) {
        sendError(req, res, error);
    }
};

/**
 * Verify a domain by checking CNAME records
 * POST /api/v1/domain/verify/:id
 */
export const verifyDomainEndpoint = async (req, res) => {
    try {
        const { id } = req.params;
        const { performingUser } = req;

        // Find the domain verification record
        const domainVerification = await DomainVerification.findOne({
            _id: id,
            createdBy: performingUser._id
        });

        if (!domainVerification) {
            return res.status(404).json({
                status: 'error',
                message: 'Domain verification record not found'
            });
        }

        // If already verified, return success
        if (domainVerification.status === 'verified') {
            return await sendSuccess(req, res, "Domain is already verified", 200, domainVerification);
        }

        // Verify the domain using CNAME
        const isVerified = await verifyDomain(
            domainVerification.subdomain,
            domainVerification.domain,
            domainVerification.cnameTarget
        );

        // Update the domain verification status
        if (isVerified) {
            domainVerification.status = 'verified';
            domainVerification.verifiedAt = new Date();
            domainVerification.lastVerifiedAt = new Date();
        } else {
            domainVerification.status = 'failed';
            domainVerification.lastVerifiedAt = new Date();
        }

        await domainVerification.save();

        if (isVerified) {
            await sendSuccess(req, res, "Domain verified successfully", 200, domainVerification);
        } else {
            await sendSuccess(req, res, "Domain verification failed. Please check your CNAME record and try again.", 200, {
                ...domainVerification.toObject(),
                verified: false
            });
        }

    } catch (error) {
        sendError(req, res, error);
    }
};

/**
 * Get all domains for the current user
 * GET /api/v1/domain/list
 */
export const getDomains = async (req, res) => {
    try {
        const { performingUser } = req;

        const domains = await DomainVerification.find({
            createdBy: performingUser._id
        }).sort({ createdAt: -1 });

        await sendSuccess(req, res, "Domains fetched successfully", 200, domains);

    } catch (error) {
        sendError(req, res, error);
    }
};

/**
 * Get a specific domain by ID
 * GET /api/v1/domain/:id
 */
export const getDomain = async (req, res) => {
    try {
        const { id } = req.params;
        const { performingUser } = req;

        const domain = await DomainVerification.findOne({
            _id: id,
            createdBy: performingUser._id
        });

        if (!domain) {
            return res.status(404).json({
                status: 'error',
                message: 'Domain not found'
            });
        }

        // Prepare verification instructions
        const verificationInstructions = {
            type: "CNAME",
            name: domain.subdomain,
            value: domain.cnameTarget,
            fullDomain: `${domain.subdomain}.${domain.domain}`,
            instructions: `Add a CNAME record to your DNS with the name "${domain.subdomain}" pointing to "${domain.cnameTarget}"`
        };

        await sendSuccess(req, res, "Domain fetched successfully", 200, {
            ...domain.toObject(),
            instructions: verificationInstructions
        });

    } catch (error) {
        sendError(req, res, error);
    }
};

/**
 * Delete a domain verification record
 * DELETE /api/v1/domain/:id
 */
export const deleteDomain = async (req, res) => {
    try {
        const { id } = req.params;
        const { performingUser } = req;

        const domain = await DomainVerification.findOne({
            _id: id,
            createdBy: performingUser._id
        });

        if (!domain) {
            return res.status(404).json({
                status: 'error',
                message: 'Domain not found'
            });
        }

        await DomainVerification.deleteOne({ _id: id });

        await sendSuccess(req, res, "Domain deleted successfully", 200);

    } catch (error) {
        sendError(req, res, error);
    }
};
