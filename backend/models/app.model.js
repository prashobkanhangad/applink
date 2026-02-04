    import { Mongoose, Schema ,model} from "mongoose";

    const androidConfigSchema = new Schema({
    packageName: String,
    fingerPrint: String,
    }, { _id: false });

    const iosConfigSchema = new Schema({
    teamId: String,
    bundleId: String,
    storeId: String
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
    ref: 'User'
    }
    }, { timestamps: true });

    export const App = model("AppSchema", appSChema, "apps")