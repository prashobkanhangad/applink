import { Router } from "express";
import { createApp, createAppLink, getAllLinks, updateAppLink, getUserApps, getLinkDetails, getLinkAnalytics } from "../controllers/app/app.controller.js";
import { verifyJWT } from "../services/jwt.js";


const appRoute = Router();

appRoute.use(verifyJWT)

appRoute.post("/create",createApp);

appRoute.post("/link",createAppLink);

appRoute.put("/link/:appId",updateAppLink); 

// appRoute.put("/update",updateAppLink);                   

appRoute.get("/links",getAllLinks);

// Link details and analytics endpoints
appRoute.get("/link/:id", getLinkDetails);
appRoute.get("/link/:id/analytics", getLinkAnalytics);

appRoute.get("/apps",getUserApps);





export default appRoute;