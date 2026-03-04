import http from 'http';
import express, { Router } from 'express';
import { Server as SocketServer } from 'socket.io';
import * as dotenv from 'dotenv'
import bodyParser from "body-parser";
import helmet from "helmet";
import cors from 'cors'
import { throwCustomError } from './services/error.js';
import { sendError } from './services/requestHandler.js';
import { sendAlert } from './services/telegram.js';
import mongoose from 'mongoose';
import { App } from './models/app.model.js';
import { getAssetLinks, detectPlatform } from './controllers/app/app.service.js';
import { manageHome, manageAssetLinks, manageAppleAppSiteAssociation} from './controllers/root/root.controller.js';
import { checkDomain } from './controllers/domain/domain.controller.js';
import morgan from 'morgan';
import { initCronJobs } from './services/cron.service.js';
import indexRoute from './routes/index.js';
import { checkValidDeepLink } from './controllers/app/app.controller.js';
import { sendSuccess } from './services/requestHandler.js';
import { setupSocketHandlers } from './socketHandlers.js';
dotenv.config()
const app = express()
const server = http.createServer(app)
const PORT = process.env.PORT;
app.set("trust proxy", true);

app.use(morgan('dev'));

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));


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


app.use('*', (req, res, next) => {
    const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  
    console.log("Full URL:", fullUrl);
  
    next();
  });

app.get('/check-domain', checkDomain);

// for dynamically setting asset links for the app
app.get('/.well-known/assetlinks.json', manageAssetLinks)

app.get('/.well-known/apple-app-site-association', manageAppleAppSiteAssociation)

// for redirecting to the app on the home page
app.get('/', manageHome)

app.get('/health', (req, res) => {
    sendSuccess(req, res, "still alive", 200);
})

app.use('/api/v1', indexRoute)

app.use('*', checkValidDeepLink)

// Socket.io for real-time chat (instant delivery, delivered/read ticks)
const io = new SocketServer(server, {
  path: '/socket.io',
});
app.set('io', io);
setupSocketHandlers(io);









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
    
    server.listen(PORT, () => {
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
