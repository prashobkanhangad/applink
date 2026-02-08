import { Router } from "express";
import { resolveLink } from "../controllers/redirect/redirect.controller.js";

const linksRoute = Router();
// Public route - no JWT; used by SDK to get link data when user opens a deep link
linksRoute.get("/resolve", resolveLink);

export default linksRoute;
