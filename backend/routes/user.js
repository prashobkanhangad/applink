import { Router } from "express";

const authRoute = Router();

// route to initiate kyc
authRoute.post("/create",createUserAccount);


export default authRoute;