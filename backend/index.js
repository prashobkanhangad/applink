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
import { manageHome, manageAssetLinks } from './controllers/root/root.controller.js';
import { checkDomain } from './controllers/domain/domain.controller.js';
import { initCronJobs } from './services/cron.service.js';

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





// for dynamically setting asset links for the app
app.get('/.well-known/assetlinks.json', manageAssetLinks)

// for redirecting to the app on the home page
app.get('/', manageHome)

app.get('/health', (req, res) => {
    res.send("still alive").status(200);
})

app.use('*', async (req, res) => {
    const host = req.headers.host;
    const originalUrl = req.originalUrl;

    const appInfo = await App.findOne({ subDomain: host });

    if (!appInfo) {
        throwCustomError(1009);
    }

    const linkInfo = await Link.findOne({ domain: host, path: originalUrl });


    if (!linkInfo) {
        throwCustomError(1008);
    }

    const platform = detectPlatform(req.headers['user-agent']);


    if (platform === "android") {
        if (linkInfo.androidBehavior === "open_app") {
            const cleanPath = originalUrl.replace(/^\//, '');
            const intentUrl =
                `intent://${cleanPath}` +
                `#Intent;scheme=https;package=${appInfo.packageName};end;`;

            return res.redirect(302, intentUrl);
        }

        if (linkInfo.androidBehavior === "open_url") {

        }

    } else if (platform === "ios") {
        res.redirect(appInfo.configurations.ios.bundleId);
    } else {
        res.redirect(appInfo.fallbackUrl);
    }
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
    
    // Initialize cron jobs for domain verification
    initCronJobs();
    
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
