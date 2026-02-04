import { Router } from "express";
import { getAllPlans } from "../controllers/plans/plans.controller.js";

const sdkRoute = Router();

// route to get all plans
sdkRoute.post("/install", async (req, res)=>{
  
    console.log("installed successfully",req.body);
    res.send("installed successfully").status(200);
});


export default sdkRoute;