/**
 * Plan constants. Default plan is resolved from PricingPlans (first active by price).
 * Legacy slug display names for migration only.
 */

const DISPLAY_NAMES = Object.freeze({
  free: 'Free',
  starter: 'Starter',
  pro: 'Pro',
  enterprise: 'Enterprise',
});

/**
 * Display name for a plan slug/title (e.g. 'free' -> 'Free'). Used when plan doc has title.
 * @param {string} slugOrTitle
 * @returns {string}
 */
export function getPlanDisplayName(slugOrTitle) {
  if (!slugOrTitle || typeof slugOrTitle !== 'string') return 'Free';
  const normalized = slugOrTitle.toLowerCase().trim();
  return DISPLAY_NAMES[normalized] ?? slugOrTitle;
}
