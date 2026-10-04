import { Router } from "express";
import { loginUser, me, changePlan, getPlanHistory, completeOnboarding } from "../controllers/auth/auth.controller.js";
import { verifyJWT } from "../services/jwt.js";

const authRoute = Router();

authRoute.post("/", loginUser);
authRoute.get("/me", verifyJWT, me);
authRoute.patch("/onboarding", verifyJWT, completeOnboarding);

// Plan: change plan (tracked in plan_changes) and get history
authRoute.patch("/plan", verifyJWT, changePlan);
authRoute.get("/plan/history", verifyJWT, getPlanHistory);

export default authRoute;
