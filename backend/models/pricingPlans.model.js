import { Schema,model } from "mongoose";

const pricingPlansSchema = new Schema( {
    title: {
      type: String,
      required: true,
      unique: true
    },

    price: {
      type: Number,
      required: true,
      default: 0
    },

    discountedPrice: {
      type: Number,
      default: 0
    },

    benefits: {
      type: [String],
      default: []
    },

    notIncludedBenefits: {
      type: [String],
      default: []
    },

    isPopular: {
      type: Boolean,
      default: false
    },

    isActive: {
      type: Boolean,
      default: true
    }}, { timestamps: true });

export const PricingPlans = model("PricingPlanSchema", pricingPlansSchema, "pricingPlans")   