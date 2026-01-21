import Joi from "joi";
import { sendError, sendSuccess } from "../../services/requestHandler.js";
import { throwCustomError } from "../../services/error.js";
import * as jwt_decode from "jwt-decode";
import { User } from "../../models/user.model.js";
import jwt from 'jsonwebtoken';
import { App } from "../../models/app.model.js";


export const loginUser = async (req, res) => {
    try {
        const {idToken, provider, email} = req.body;
       
        const schema = Joi.object({
            idToken: Joi.string().optional(),
            provider: Joi.string().valid("google", "normal").required(),
            email: Joi.string().email().required(),
        })

        const { error } = schema.validate(req.body)

        if (error) {
            throwCustomError(1006)
        }
        let response = {};

        if (provider === "google") {
            const user = jwt_decode.jwtDecode(idToken)
            if(!user){
                throwCustomError(1010)
            }
            let userExists = await User.findOne({
                email: user?.email
            })
            console.log(userExists,"userExists");

            if (!userExists) {
                userExists = await User.create({
                    email: user?.email,
                    authProvider: "google",
                    username: user?.name,
                    image_url: user?.picture,
                    origin: "google",
                    currentPlan: "free"
                })
                userExists.new = true
            }

            response = {
                username: userExists.username,
                email: userExists.email,
                createdAt: userExists.createdAt,
                new: userExists?.new
            }

            const token = jwt.sign(response, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES })
            const refreshToken = jwt.sign(response, process.env.JWT_SECRET, { expiresIn: '7d' })

            response.token = token;
            response.refreshToken = refreshToken;


        } 
         await sendSuccess(req, res, "user authentication success", 201, response)

    } catch (error) {
        sendError(req, res, error)
    }
}


export const me = async (req, res) => {
    try {
        const performingUser = req.performingUser;

        const isAppExists = await App.findOne({ createdBy: performingUser._id });

        const response = {
            username: performingUser.username,
            email: performingUser.email,
            createdAt: performingUser.createdAt,
            isAppExists: isAppExists ? true : false,
            userType: performingUser?.role || "user",
            currentPlan: performingUser?.currentPlan || "free",
        }

        await sendSuccess(req, res, "user fetched successfully", 200, response)

    } catch (error) {
        sendError(req, res, error)
    }
}