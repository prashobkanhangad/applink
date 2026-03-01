import { Router } from "express";
import { getAllPlans } from "../controllers/plans/plans.controller.js";
import { handleTrackInstall, deeplinkClick } from "../controllers/sdk/sdk.controller.js";
import { apiKeyValidation } from "../middleware/apikey.js";
const sdkRoute = Router();

// route to get all plans


    sdkRoute.use(apiKeyValidation);

    sdkRoute.post("/install",handleTrackInstall);

    sdkRoute.post("/deeplink",deeplinkClick);


export default sdkRoute;