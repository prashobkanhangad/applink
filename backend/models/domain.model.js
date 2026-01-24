import { Schema, model } from "mongoose";


const dnsRecordSchema = new Schema({
    type: { type: String, required: true },
    name: { type: String, required: true },
    value: { type: String, required: true },
    verified: { type: Boolean, default: false },
}, { _id: false });


const domainSchema = new Schema({
    domain: { type: String, required: true },
    appId: { type: Schema.Types.ObjectId, ref: 'App', required: true },
    verified: { type: Boolean, default: false },
    dnsRecords: { type: dnsRecordSchema ,default: []},
    sslEnabled: { type: Boolean, default: false },

}, { timestamps: true });

export const Domain = model("DomainSchema", domainSchema, "domains")