import { Router } from "express";
import { verifyJWT } from "../services/jwt.js";
import { createOrder, verifyPayment } from "../controllers/payment/payment.controller.js";

const paymentRoute = Router();
paymentRoute.use(verifyJWT);

paymentRoute.post("/create-order", createOrder);
paymentRoute.post("/verify", verifyPayment);

export default paymentRoute;
