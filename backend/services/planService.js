import { PricingPlans } from "../models/pricingPlans.model.js";

/**
 * Returns the default plan (first active, sorted by price ascending).
 * Used when user has no planId or for new user signup.
 * @returns {Promise<import("mongoose").Document|null>}
 */
export async function getDefaultPlan() {
  return PricingPlans.findOne({ isActive: true }).sort({ price: 1 }).lean();
}

/**
 * Resolve plan by legacy slug (title match: Free, Starter, Pro, Enterprise).
 * @param {string} slug
 * @returns {Promise<import("mongoose").Document|null>}
 */
export async function getPlanByLegacySlug(slug) {
  if (!slug || typeof slug !== "string") return null;
  const title = slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase();
  return PricingPlans.findOne({ isActive: true, title }).lean();
}
