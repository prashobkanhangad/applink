import { Router } from "express";
import { trackPageView } from "../controllers/analytics/analytics.controller.js";

const analyticsRoute = Router();

analyticsRoute.post("/pageview", trackPageView);

export default analyticsRoute;
