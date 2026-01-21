import { required } from "joi";
import { Schema, model } from "mongoose";



const clickEventSchema = new Schema({
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
    }
}, { timestamps: true });

export const ClickEvent = model("ClickEvent", clickEventSchema, "clickEvents");