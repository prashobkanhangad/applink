import {PricingPlans} from "../../models/pricingPlans.model.js";
import { sendError, sendSuccess } from "../../services/requestHandler.js";

export const getAllPlans = async (req, res) => {
    try {
        const plans = await PricingPlans.find({isActive: true});
        await sendSuccess(req, res, "Plans fetched successfully", 200, plans)
    } catch (error) {
        sendError(req,res,error)
    }
}