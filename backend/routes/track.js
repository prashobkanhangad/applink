import { Router } from "express";
import { handleTrackInstall, handleTrackClick } from "../controllers/track/track.controller.js";

const trackRoute = Router();

trackRoute.post("/install", handleTrackInstall);
trackRoute.post("/click", handleTrackClick);

export default trackRoute;
