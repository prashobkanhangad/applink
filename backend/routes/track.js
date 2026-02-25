import { Router } from "express";
import { handleTrackInstall, handleTrackClick } from "../controllers/track/track.controller.js";
import { requireApiKey } from "../services/validateApiKey.js";

const trackRoute = Router();

trackRoute.post("/install", requireApiKey, handleTrackInstall);
trackRoute.post("/click", requireApiKey, handleTrackClick);

export default trackRoute;
