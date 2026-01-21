import { Router } from "express";
import { loginUser, me } from "../controllers/auth/auth.controller.js";
import { verifyJWT } from "../services/jwt.js";

const authRoute = Router();

// route to initiate kyc
authRoute.post("/",loginUser);

authRoute.get("/me",verifyJWT,me);

export default authRoute;