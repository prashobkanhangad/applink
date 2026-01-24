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
import { getAssetLinks } from './controllers/app/app.service.js';

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


// --- CADDY SECURITY CHECK ---
app.get('/check-domain', (req, res) => {
    // 1. Get the domain Caddy is asking about
    const domain = req.query.domain;
    console.log(`Checking permission for: ${domain}`);

    // 2. The HARDCODED list of allowed domains
    // (Add your customer's domains here)
    const allowedDomains = [
        'link.invyto.in',
        'shop.custom-user.com',
        'test-domain.com'
    ];

    // 3. Check if the domain is in the list
    if (allowedDomains.includes(domain)) {
        console.log("Allowed! ✅");
        res.sendStatus(200); // 200 OK tells Caddy "Yes, proceed"
    } else {
        console.log("Blocked! ❌");
        res.sendStatus(403); // 403 Forbidden tells Caddy "No"
    }
});

app.get('/.well-known/assetlinks.json',async (req,res)=>{
    const host = req.headers.host;
    const assetLinks = await getAssetLinks(host);
    if(!assetLinks){
        throwCustomError(1009);
    }

    res.json(assetLinks);
});


app.get('/',async (req,res)=>{
    const host = req.headers.host;
    console.log(host,"host");
    const appInfo = await App.findOne({subDomain: host});
    if(!appInfo){
        throwCustomError(1009);
    }
    console.log(appInfo,"appInfo");
    // const url = `https://play.google.com/store/apps/details?id=${appInfo.configurations.android.packageName}`;
    const url = `https://play.google.com/store/apps/details?id=com.whatsapp`;
    res.redirect(url);
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
