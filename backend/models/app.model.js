    import { Mongoose, Schema ,model} from "mongoose";

    const androidConfigSchema = new Schema({
    packageName: String,
    fingerPrints: [String], // SHA-256 cert fingerprints (e.g. debug + release, or upload + Play App Signing)
    sdkVerifiedAt: { type: Date, default: null },
    }, { _id: false });

    const iosConfigSchema = new Schema({
    teamId: String,
    bundleId: String,
    storeId: String,
    sdkVerifiedAt: { type: Date, default: null },
    }, { _id: false });



    const appSChema = new Schema({
    name: String,
    // platform: {enum: ["android", "ios"]},
    status: { type: String, enum: ["active", "disabled"], default: "active" },
    subDomain: String,
    fallbackUrl: String,
    configurations: {
        android: androidConfigSchema,
        ios: iosConfigSchema
    },
    // Reference to custom domain (DomainVerification collection)
    domainId: {
        type: Schema.Types.ObjectId,
        ref: 'DomainVerificationSchema',
        default: null
    },
    createdBy:{
    type: Schema.Types.ObjectId,
    ref: 'UserSchema'
    }
    }, { timestamps: true });

    export const App = model("AppSchema", appSChema, "apps")