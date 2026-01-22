import { throwCustomError } from "../../services/error.js";
import { sendError, sendSuccess } from "../../services/requestHandler.js";
import { DomainVerification } from "../../models/domainVerification.model.js";
import { 
    verifyDomain, 
    generateVerificationToken, 
    isValidDomain 
} from "../../services/domainVerification.service.js";
import Joi from "joi";

/**
 * Add a new domain for verification
 * POST /api/v1/domain/add
 */
export const addDomain = async (req, res) => {
    try {
        const { domain, verificationMethod } = req.body;
        const { performingUser } = req;

        const schema = Joi.object({
            domain: Joi.string().required(),
            verificationMethod: Joi.string().valid("txt", "html").default("txt")
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

        // Validate domain format
        if (!isValidDomain(normalizedDomain)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid domain format. Please enter a valid domain (e.g., example.com)'
            });
        }

        // Check if domain already exists for this user
        const existingDomain = await DomainVerification.findOne({
            domain: normalizedDomain,
            createdBy: performingUser._id
        });

        if (existingDomain) {
            return res.status(400).json({
                status: 'error',
                message: 'This domain has already been added',
                data: existingDomain
            });
        }

        // Generate verification token
        const verificationToken = generateVerificationToken();

        // Create domain verification record
        const domainVerification = await DomainVerification.create({
            domain: normalizedDomain,
            verificationToken,
            verificationMethod: verificationMethod || "txt",
            createdBy: performingUser._id,
            status: "pending"
        });

        // Prepare verification instructions
        const verificationInstructions = {
            txt: {
                type: "TXT",
                name: normalizedDomain,
                value: `chottu-verify=${verificationToken}`,
                instructions: `Add a TXT record to your DNS with the name "${normalizedDomain}" and value "chottu-verify=${verificationToken}"`
            },
            html: {
                type: "HTML File",
                path: `/.well-known/chottu-verify-${verificationToken}.html`,
                content: verificationToken,
                instructions: `Create a file at ${normalizedDomain}/.well-known/chottu-verify-${verificationToken}.html containing the verification token: ${verificationToken}`
            }
        };

        await sendSuccess(req, res, "Domain added successfully. Please configure verification and verify.", 201, {
            domain: domainVerification,
            verificationToken,
            instructions: verificationInstructions[domainVerification.verificationMethod]
        });

    } catch (error) {
        sendError(req, res, error);
    }
};

/**
 * Verify a domain by checking DNS records
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

        // Verify the domain
        const isVerified = await verifyDomain(
            domainVerification.domain,
            domainVerification.verificationToken,
            domainVerification.verificationMethod
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
            await sendSuccess(req, res, "Domain verification failed. Please check your DNS settings and try again.", 200, {
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
            txt: {
                type: "TXT",
                name: domain.domain,
                value: `chottu-verify=${domain.verificationToken}`,
                instructions: `Add a TXT record to your DNS with the name "${domain.domain}" and value "chottu-verify=${domain.verificationToken}"`
            },
            html: {
                type: "HTML File",
                path: `/.well-known/chottu-verify-${domain.verificationToken}.html`,
                content: domain.verificationToken,
                instructions: `Create a file at ${domain.domain}/.well-known/chottu-verify-${domain.verificationToken}.html containing the verification token: ${domain.verificationToken}`
            }
        };

        await sendSuccess(req, res, "Domain fetched successfully", 200, {
            ...domain.toObject(),
            instructions: verificationInstructions[domain.verificationMethod]
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

        await sendSuccess(req, res, "Domain removed successfully", 200);

    } catch (error) {
        sendError(req, res, error);
    }
};
