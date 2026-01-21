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
    status: {enum: ["active", "disabled"]},
    subDomain: String,
    fallbackUrl: String,
    configurations: {
        android: androidConfigSchema,
        ios: iosConfigSchema
    },  
    createdBy:{
    type: Schema.Types.ObjectId,
    ref: 'User'
    }
    }, { timestamps: true });

    export const App = model("AppSchema", appSChema, "apps")