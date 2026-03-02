import crypto from "crypto";
import Joi from "joi";
import Razorpay from "razorpay";
import { sendError, sendSuccess } from "../../services/requestHandler.js";
import { User } from "../../models/user.model.js";
import { PricingPlans } from "../../models/pricingPlans.model.js";
import { PlanChange } from "../../models/planChange.model.js";
import { PaymentOrder } from "../../models/paymentOrder.model.js";
import { getDefaultPlan } from "../../services/planService.js";

const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

// Plan prices are stored in USD. Convert to INR for Indian users using this rate (set in env).
const USD_TO_INR_RATE = Number(process.env.USD_TO_INR_RATE) || 92;

/**
 * POST /payment/create-order
 * Body: { planId: string, billingPeriod: 'monthly' | 'yearly', country?: string } — country 'IN' => charge in INR
 * Plan prices are in USD; for India we convert to INR. Returns: { orderId, keyId, amount, currency } for Razorpay.
 */
export const createOrder = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({ status: "error", message: "Payment is not configured" });
    }
    const { performingUser } = req;
    const schema = Joi.object({
      planId: Joi.string().required(),
      billingPeriod: Joi.string().valid("monthly", "yearly").default("monthly"),
      country: Joi.string().length(2).uppercase().optional(),
    });
    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ status: "error", message: error.details[0]?.message || "Invalid body" });
    }
    const { planId, billingPeriod, country } = value;

    const plan = await PricingPlans.findOne({ _id: planId, isActive: true }).lean();
    if (!plan) {
      return res.status(400).json({ status: "error", message: "Plan not found or inactive" });
    }
    const priceUSD = Number(plan.price);
    const isEnterprise = String(plan.title || "").toUpperCase() === "ENTERPRISE";
    if (isEnterprise || priceUSD <= 0) {
      return res.status(400).json({ status: "error", message: "This plan is not available for online payment" });
    }

    const amountUSD = billingPeriod === "yearly"
      ? (plan.yearlyPrice != null ? Number(plan.yearlyPrice) : priceUSD * 10)
      : priceUSD;

    const isIndia = country === "IN";
    let currency;
    let amountSmallestUnit;
    if (isIndia) {
      currency = "INR";
      const amountINR = Math.round(amountUSD * USD_TO_INR_RATE * 100) / 100;
      amountSmallestUnit = Math.round(amountINR * 100);
    } else {
      currency = "USD";
      amountSmallestUnit = Math.round(amountUSD * 100);
    }

    const receipt = `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`.slice(0, 40);
    const order = await razorpay.orders.create({
      amount: amountSmallestUnit,
      currency,
      receipt,
    });

    await PaymentOrder.create({
      orderId: order.id,
      userId: performingUser._id,
      planId: plan._id,
      amount: amountSmallestUnit,
      currency,
      status: "created",
      billingPeriod,
    });

    await sendSuccess(req, res, "Order created", 200, {
      orderId: order.id,
      keyId: process.env.RAZORPAY_KEY_ID,
      amount: amountSmallestUnit,
      currency,
    });
  } catch (err) {
    console.error("createOrder error:", err);
    sendError(req, res, err);
  }
};

/**
 * POST /payment/verify
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 * Verifies signature, updates user plan, records plan change.
 */
export const verifyPayment = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return res.status(503).json({ status: "error", message: "Payment is not configured" });
    }
    const { performingUser } = req;
    const schema = Joi.object({
      razorpay_order_id: Joi.string().required(),
      razorpay_payment_id: Joi.string().required(),
      razorpay_signature: Joi.string().required(),
    });
    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ status: "error", message: error.details[0]?.message || "Invalid body" });
    }
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = value;

    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest("hex");
    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ status: "error", message: "Invalid payment signature" });
    }

    const paymentOrder = await PaymentOrder.findOne({
      orderId: razorpay_order_id,
      userId: performingUser._id,
      status: "created",
    }).lean();
    if (!paymentOrder) {
      return res.status(400).json({ status: "error", message: "Order not found or already used" });
    }

    const plan = await PricingPlans.findById(paymentOrder.planId).lean();
    if (!plan) {
      return res.status(400).json({ status: "error", message: "Plan no longer available" });
    }

    await PaymentOrder.updateOne(
      { orderId: razorpay_order_id },
      { status: "paid", razorpayPaymentId: razorpay_payment_id }
    );

    const user = await User.findById(performingUser._id).lean();
    let fromPlanId = user.planId;
    if (!fromPlanId) {
      const defaultPlan = await getDefaultPlan();
      fromPlanId = defaultPlan?._id ?? null;
    }
    if (!fromPlanId) fromPlanId = plan._id;

    await User.findByIdAndUpdate(performingUser._id, { planId: plan._id });
    await PlanChange.create({
      userId: performingUser._id,
      fromPlanId,
      toPlanId: plan._id,
      source: "billing",
    });

    await sendSuccess(req, res, "Payment verified and plan updated", 200, {
      planId: plan._id,
      currentPlan: plan.title,
    });
  } catch (err) {
    console.error("verifyPayment error:", err);
    sendError(req, res, err);
  }
};
