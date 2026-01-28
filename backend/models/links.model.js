import { Schema, model } from "mongoose";

const linkSchema = new Schema({
    appId: {
        type: Schema.Types.ObjectId,
        ref: 'AppSchema'
    },
    domain: { type: String, required: true },
    path: { type: String, required: true },
    destinationUrl: { type: String, required: true },
    linkName: { type: String, required: true },
    androidBehavior: { type: String, enum: ["open_app", "open_url"], required: true },
    iosBehavior: { type: String, enum: ["open_app", "open_url"], required: true },
    utm: {
        source: { type: String, default: null },
        medium: { type: String, default: null },
        previewTitle: { type: String, default: null },
        previewDescription: { type: String, default: null },
        previewImageUrl: { type: String, default: null },
        campaignSource: { type: String, default: null },
        campaignMedium: { type: String, default: null },
        campaignName: { type: String, default: null },
        campaignTerm: { type: String, default: null },
        campaignContent: { type: String, default: null },
    }

}, { timestamps: true });


export const Link = model("LinkSchema", linkSchema, "links")