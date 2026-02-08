import { Router } from "express";
import { getAllPlans } from "../controllers/plans/plans.controller.js";
import { handleTrackInstall } from "../controllers/sdk/sdk.controller.js";
const sdkRoute = Router();

// route to get all plans
    sdkRoute.post("/install",handleTrackInstall);


export default sdkRoute;