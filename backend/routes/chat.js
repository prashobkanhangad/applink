import { Router } from "express";
import { verifyJWT } from "../services/jwt.js";
import { getMessages, sendMessage } from "../controllers/chat/chat.controller.js";

const chatRoute = Router();
chatRoute.use(verifyJWT);

chatRoute.get("/messages", getMessages);
chatRoute.post("/messages", sendMessage);

export default chatRoute;
