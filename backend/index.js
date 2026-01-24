import express, { Router } from 'express';
import * as dotenv from 'dotenv'
import bodyParser from "body-parser";
import helmet from "helmet";
import cors from 'cors'
import route from './routes/index.js';
import { throwCustomError } from './services/error.js';
import { sendError } from './services/requestHandler.js';
import { sendAlert } from './services/telegram.js';
import { logger } from './services/logger.js';
import mongoose from 'mongoose';
import { App } from './models/app.model.js';
import { getAssetLinks, detectPlatform } from './controllers/app/app.service.js';
import { checkDomain } from './controllers/domain/domain.controller.js';

dotenv.config()
const app = express()
const PORT = process.env.PORT;

app.use(helmet());
app.use(cors());


app.use(
    express.json({
        limit: "50mb",
        verify: (req, res, buf) => {
            req.rawBody = buf;
        },
    })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));


app.get('/check-domain', checkDomain);



app.get('/.well-known/assetlinks.json',async (req,res)=>{
    const host = req.headers.host;
    const assetLinks = await getAssetLinks(host);
    if(!assetLinks){
        throwCustomError(1009);
    }

    res.json(assetLinks);
});


app.get('/',async (req,res)=>{
    try {
        const host = req.headers.host;
        console.log(host,"host");
        const platform = detectPlatform(req.headers['user-agent']);
        const appInfo = await App.findOne({subDomain: host});
        console.log(platform,"platform");
        console.log(appInfo,"appInfo");

        if(!appInfo){
            return res.status(404).send("App not found");
        }

        let url = null;
        if(platform === "android"){
            url = appInfo.configurations?.android?.packageName 
                ? `https://play.google.com/store/apps/details?id=${appInfo.configurations.android.packageName}`
                : appInfo.fallbackUrl;
            return res.redirect(url);
        } else if(platform === "ios"){
            url = appInfo.configurations?.ios?.storeId
                ? `https://apps.apple.com/app/id${appInfo.configurations.ios.storeId}`
                : appInfo.fallbackUrl;
            return res.redirect(url);
        } else {
            // web or unknown platform - use fallback
            url = appInfo.fallbackUrl;
            return res.redirect(url);
        }
    } catch (err) {
        console.error("Root route error:", err);
        return res.status(500).send("Internal Server Error");
    }
})




app.get('/health',(req,res)=>{
   res.send("still alive").status(200);
})


app.use('/api/v1', route)

process.on('unhandledRejection', async (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // sendAlert(reason)
})

process.on("uncaughtException", async (err) => {
    console.error('Uncaught Exception:', err);
    // await sendAlert(err.toString())
});



process.on('SIGINT', async () => {
    // await sendAlert(`${process.env.APP_NAME}-${process.env.ENV} going down..`)
    // process.exit(0);
})




mongoose.connect(process.env.DB_URL).then(() => {
    console.log("connected to database")
    const server = app.listen(PORT, () => {
        console.log(`server started on port: ${PORT}`)
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.log('Port in use, retrying...');
                setTimeout(() => {
                    server.close();
                    server.listen(3001);
                }, 1000);
            }
        });
    })
}).catch(err => {
    console.log('error in connecting database')
    console.log(err)
})
