import { Router } from "express";
import { createApp, createAppLink, getAllLinks, updateAppLink, getUserApps, getLinkDetails, getLinkAnalytics, getOverviewStats, getAnalyticsOverview, deleteLink, resetSdkVerification, updateApp } from "../controllers/app/app.controller.js";
import { verifyJWT } from "../services/jwt.js";


const appRoute = Router();

appRoute.use(verifyJWT)

appRoute.post("/create",createApp);

appRoute.post("/link",createAppLink);

appRoute.put("/link/:id", updateAppLink); 

// appRoute.put("/update",updateAppLink);                   

appRoute.get("/links",getAllLinks);
appRoute.get("/overview-stats", getOverviewStats);
appRoute.get("/analytics/overview", getAnalyticsOverview);

// Link details, analytics, and delete
appRoute.get("/link/:id", getLinkDetails);
appRoute.get("/link/:id/analytics", getLinkAnalytics);
appRoute.delete("/link/:id", deleteLink);

appRoute.get("/apps", getUserApps);
appRoute.patch("/:appId", updateApp);
appRoute.patch("/:appId/sdk-verification/reset", resetSdkVerification);


export default appRoute;