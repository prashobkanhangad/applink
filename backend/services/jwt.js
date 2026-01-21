import jwt from 'jsonwebtoken';
import { User } from "../models/user.model.js";

export const verifyJWT = async (req, res, next) => {
    try {
        console.log("Verifying JWT...");
        const token = req.headers.authorization.split(" ")[1];
        if (!token) {
            return res.status(401).json({ status: 'error', message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ status: 'error', message: 'Invalid token' });
        }
        const userData = await User.findOne({ email: decoded.email });

        if (!userData) {
            return res.status(401).json({ status: 'error', message: 'Invalid token' });
        }
        req.performingUser = userData;
        next();

    } catch (error) {
        console.error("JWT verification failed:", error);
        return res.status(401).json({ status: 'error', message: 'Invalid token' });
    }
}

