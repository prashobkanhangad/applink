import { Router } from "express";
import authRoute from "./auth.js";
import appRoute from "./app.js";
import planRoute from "./plan.js";
import domainRoute from "./domain.js";

const route = Router();




route.use("/auth", authRoute);

route.use("/app", appRoute);

route.use("/plans", planRoute);

route.use("/domain", domainRoute);




export default route;