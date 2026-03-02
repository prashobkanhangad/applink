import Joi from "joi";
import jwt from "jsonwebtoken";
import * as jwt_decode from "jwt-decode";
import { sendError, sendSuccess } from "../../services/requestHandler.js";
import { throwCustomError } from "../../services/error.js";
import { User } from "../../models/user.model.js";
import { PlanChange } from "../../models/planChange.model.js";
import { App } from "../../models/app.model.js";
import { PricingPlans } from "../../models/pricingPlans.model.js";
import { getPlanDisplayName } from "../../constants/plans.js";
import { getDefaultPlan, getFreePlan, getPlanByLegacySlug } from "../../services/planService.js";


export const loginUser = async (req, res) => {
    try {
        const {idToken, provider, email, picture} = req.body;
       
        const schema = Joi.object({
            idToken: Joi.string().optional(),
            provider: Joi.string().valid("google", "normal").required(),
            email: Joi.string().email().required(),
            picture: Joi.string().optional(),
        })

        const { error } = schema.validate(req.body)
        console.log(error,"error");
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
                const freePlan = await getFreePlan();
                userExists = await User.create({
                    email: user?.email,
                    authProvider: "google",
                    username: user?.name,
                    image_url: user?.picture,
                    origin: "google",
                    planId: freePlan?._id ?? undefined,
                });
                if (freePlan?._id) {
                    await PlanChange.create({
                        userId: userExists._id,
                        fromPlanId: freePlan._id,
                        toPlanId: freePlan._id,
                        source: "signup",
                    });
                }
                userExists.new = true;
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

        // Resolve current plan: planId (ref) > legacy planSlug > default plan
        let plan = null;
        if (performingUser.planId) {
            plan = await PricingPlans.findById(performingUser.planId).lean();
        }
        if (!plan && performingUser.planSlug) {
            plan = await getPlanByLegacySlug(performingUser.planSlug);
            if (plan) {
                await User.findByIdAndUpdate(performingUser._id, { planId: plan._id, planSlug: null });
            }
        }
        if (!plan) {
            plan = await getDefaultPlan();
            if (plan) {
                await User.findByIdAndUpdate(performingUser._id, { planId: plan._id });
                await PlanChange.create({
                    userId: performingUser._id,
                    fromPlanId: plan._id,
                    toPlanId: plan._id,
                    source: "admin",
                });
            }
        }
        const currentPlan = plan?.title ?? getPlanDisplayName(performingUser?.planSlug ?? "free");
        const planId = plan?._id?.toString() ?? null;

        const response = {
            username: performingUser.username,
            email: performingUser.email,
            createdAt: performingUser.createdAt,
            isAppExists: isAppExists ? true : false,
            userType: performingUser?.role || "user",
            currentPlan,
            planId,
        };

        await sendSuccess(req, res, "user fetched successfully", 200, response);
    } catch (error) {
        sendError(req, res, error);
    }
};

/**
 * PATCH /auth/plan - Change current user's plan (by PricingPlan _id). Tracks change in plan_changes.
 * Body: { planId: string (ObjectId), source?: "user" | "admin" | "billing" }
 */
export const changePlan = async (req, res) => {
    try {
        const { performingUser } = req;
        const { planId: toPlanIdRaw, source } = req.body || {};

        const schema = Joi.object({
            planId: Joi.string().required(),
            source: Joi.string().valid("user", "admin", "billing").optional(),
        });
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0]?.message || "Invalid body" });
        }

        const toPlan = await PricingPlans.findOne({ _id: toPlanIdRaw, isActive: true }).lean();
        if (!toPlan) {
            return res.status(400).json({ error: "Plan not found or inactive" });
        }

        const user = await User.findById(performingUser._id).lean();
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        let fromPlanId = user.planId;
        if (!fromPlanId) {
            const defaultPlan = await getDefaultPlan();
            fromPlanId = defaultPlan?._id ?? null;
        }
        if (fromPlanId && fromPlanId.toString() === toPlan._id.toString()) {
            return res.status(200).json({
                status: "success",
                message: "Plan unchanged",
                data: {
                    planId: toPlan._id,
                    currentPlan: toPlan.title,
                },
            });
        }

        if (!fromPlanId) {
            fromPlanId = toPlan._id;
        }

        await User.findByIdAndUpdate(performingUser._id, { planId: toPlan._id });
        await PlanChange.create({
            userId: performingUser._id,
            fromPlanId,
            toPlanId: toPlan._id,
            source: source || "user",
        });

        await sendSuccess(req, res, "Plan updated successfully", 200, {
            planId: toPlan._id,
            currentPlan: toPlan.title,
        });
    } catch (err) {
        sendError(req, res, err);
    }
};

/**
 * GET /auth/plan/history - List plan changes for the current user (newest first).
 * Query: limit (default 20), skip (default 0)
 */
export const getPlanHistory = async (req, res) => {
    try {
        const { performingUser } = req;
        const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
        const skip = parseInt(req.query.skip, 10) || 0;

        const items = await PlanChange.find({ userId: performingUser._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("fromPlanId", "title price")
            .populate("toPlanId", "title price")
            .lean();
        const total = await PlanChange.countDocuments({ userId: performingUser._id });

        const history = items.map((h) => ({
            fromPlanId: h.fromPlanId?._id ?? h.fromPlanId,
            toPlanId: h.toPlanId?._id ?? h.toPlanId,
            fromPlan: h.fromPlanId?.title ?? null,
            toPlan: h.toPlanId?.title ?? null,
            source: h.source,
            createdAt: h.createdAt,
        }));

        await sendSuccess(req, res, "Plan history fetched successfully", 200, {
            history,
            total,
            limit,
            skip,
        });
    } catch (err) {
        sendError(req, res, err);
    }
};