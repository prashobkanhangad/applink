import { Router } from "express";
import { handleTrackInstall } from "../controllers/track/track.controller.js";

const trackRoute = Router();
trackRoute.post("/install", handleTrackInstall);



export default trackRoute;
