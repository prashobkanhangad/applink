import { PricingPlans } from "../models/pricingPlans.model.js";

/**
 * Returns the FREE plan (first active with price === 0). Used for new user signup.
 * @returns {Promise<import("mongoose").Document|null>}
 */
export async function getFreePlan() {
  const free = await PricingPlans.findOne({ isActive: true, price: 0 }).lean();
  return free ?? getDefaultPlan();
}

/**
 * Returns the default plan (first active, sorted by price ascending).
 * Used when user has no planId (e.g. legacy users); new users get FREE via getFreePlan().
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
