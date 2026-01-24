import { Schema, model } from "mongoose";

const pendingInstallSchema = new Schema({
    fingerprintHash: {
        type: String,
        required: true,
        index: true
    },
    ip: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        required: true
    },
    linkData: {
        type: Schema.Types.Mixed,
        default: {}
    },
    linkId: {
        type: Schema.Types.ObjectId,
        ref: 'Link'
    }
}, { 
    timestamps: true,
    // TTL index to auto-delete documents after 1 hour (3600 seconds)
    expireAfterSeconds: 3600
});

// Index for faster lookups
pendingInstallSchema.index({ fingerprintHash: 1, createdAt: 1 });

export const PendingInstall = model("PendingInstall", pendingInstallSchema, "pendingInstalls");
