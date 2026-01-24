import { Router } from "express";
import { handleRedirect } from "../controllers/redirect/redirect.controller.js";

const redirectRoute = Router();

// Public route - no JWT authentication required
// This handles all redirect requests: GET /:slug
// Note: This route should be registered AFTER API routes in index.js
// to ensure API routes are matched first
redirectRoute.get("/:slug", handleRedirect);

export default redirectRoute;
