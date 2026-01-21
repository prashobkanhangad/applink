import { Schema, model } from "mongoose";

const openEventSchema = new Schema({
    linkId: {
        type: Schema.Types.ObjectId,
        ref: 'Link'
    },
    platform: {
        type: String,
        enum: ["web", "ios", "android"],
        required: true
    },
    browser: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        required: true
    },
    ipAddress: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    deepPath: {
        type: String,
        default: null
    },
    success: {
        type: Boolean,
        required: true
    }

}, { timestamps: true });

export const OpenEvent = model("OpenEvent", openEventSchema, "openEvents");