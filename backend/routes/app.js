import { Router } from "express";
import { createApp, createAppLink, getAllLinks, updateAppLink, getAnalytics } from "../controllers/app/app.controller.js";
import { verifyJWT } from "../services/jwt.js";


const appRoute = Router();

appRoute.use(verifyJWT)

appRoute.post("/create",createApp);

appRoute.post("/link",createAppLink);

appRoute.put("/link/:appId",updateAppLink); 

// appRoute.put("/update",updateAppLink);                   

appRoute.get("/links",getAllLinks);

appRoute.get("/link/:id",getAnalytics);





export default appRoute;