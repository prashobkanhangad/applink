import { Schema, model } from "mongoose";

const domainVerificationSchema = new Schema({
    domain: { 
        type: String, 
        required: true,
        lowercase: true,
        trim: true
    },
    subdomain: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        default: "link"
    },
    cnameTarget: {
        type: String,
        default: "target.lorrymithra.in"
    },
    verificationMethod: {
        type: String,
        enum: ["cname"],
        default: "cname"
    },
    status: {
        type: String,
        enum: ["pending", "verified", "failed"],
        default: "pending"
    },
    verifiedAt: {
        type: Date,
        default: null
    },
    lastVerifiedAt: {
        type: Date,
        default: null
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Soft delete fields
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

// Index for faster queries
domainVerificationSchema.index({ createdBy: 1, domain: 1 });
domainVerificationSchema.index({ subdomain: 1, domain: 1 });

export const DomainVerification = model("DomainVerificationSchema", domainVerificationSchema, "domain_verifications");
