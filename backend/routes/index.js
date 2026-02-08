import { Router } from "express";
import authRoute from "./auth.js";
import appRoute from "./app.js";
import planRoute from "./plan.js";
import domainRoute from "./domain.js";
import trackRoute from "./track.js";
import linksRoute from "./links.js";

const route = Router();

route.use("/auth", authRoute);
route.use("/app", appRoute);
route.use("/plans", planRoute);
route.use("/domain", domainRoute);
route.use("/track", trackRoute);
route.use("/links", linksRoute);

export default route;