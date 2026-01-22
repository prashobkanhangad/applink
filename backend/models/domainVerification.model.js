import { Schema, model } from "mongoose";

const domainVerificationSchema = new Schema({
    domain: { 
        type: String, 
        required: true,
        lowercase: true,
        trim: true
    },
    verificationToken: { 
        type: String, 
        required: true,
        unique: true
    },
    verificationMethod: {
        type: String,
        enum: ["txt", "html"],
        default: "txt"
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
    }
}, { timestamps: true });

// Index for faster queries
domainVerificationSchema.index({ createdBy: 1, domain: 1 });
domainVerificationSchema.index({ verificationToken: 1 });

export const DomainVerification = model("DomainVerificationSchema", domainVerificationSchema, "domain_verifications");
