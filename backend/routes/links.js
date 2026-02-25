import { Router } from "express";
import { resolveLink } from "../controllers/redirect/redirect.controller.js";
import { requireApiKey } from "../services/validateApiKey.js";

const linksRoute = Router();
// SDK must send API key (X-Api-Key or Authorization: Bearer <key>) to resolve link
linksRoute.get("/resolve", requireApiKey, resolveLink);

export default linksRoute;
