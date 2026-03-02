import { Router } from "express";
import authRoute from "./auth.js";
import appRoute from "./app.js";
import planRoute from "./plan.js";
import domainRoute from "./domain.js";
import trackRoute from "./track.js";
import linksRoute from "./links.js";
import sdkRoute from "./sdk.js";
import adminRoute from "./admin.js";
import affiliateRoute from "./affiliate.js";
import keysRoute from "./keys.js";
import paymentRoute from "./payment.js";
import chatRoute from "./chat.js";

const indexRoute = Router();

indexRoute.use("/auth", authRoute);
indexRoute.use("/app", appRoute);
indexRoute.use("/plans", planRoute);
indexRoute.use("/domain", domainRoute);
indexRoute.use("/track", trackRoute);
indexRoute.use("/links", linksRoute);
indexRoute.use("/sdk", sdkRoute);
indexRoute.use("/admin", adminRoute);
indexRoute.use("/affiliate", affiliateRoute);
indexRoute.use("/keys", keysRoute);
indexRoute.use("/payment", paymentRoute);
indexRoute.use("/chat", chatRoute);

export default indexRoute;