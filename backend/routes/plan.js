import { Router } from "express";
import { getAllPlans } from "../controllers/plans/plans.controller.js";

const planRoute = Router();

// route to get all plans
planRoute.get("/", getAllPlans);


export default planRoute;