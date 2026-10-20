/** Map a pricing-plan API document into the fields the marketing page renders. */

export function mapPlanFromDb(plan) {
  const priceNum = Number(plan.price);
  const discountedNum = plan.discountedPrice != null ? Number(plan.discountedPrice) : null;
  const charge =
    discountedNum != null && discountedNum > 0 && discountedNum < priceNum
      ? discountedNum
      : priceNum;
  const isFree = charge === 0;
  const included = Array.isArray(plan.benefits)
    ? plan.benefits.map((text) => ({ text: String(text), included: true }))
    : [];
  const excluded =
    isFree || !Array.isArray(plan.notIncludedBenefits)
      ? []
      : plan.notIncludedBenefits.map((text) => ({ text: String(text), included: false }));
  const clickLimit = plan.monthlyClickLimit != null ? Number(plan.monthlyClickLimit) : 0;
  return {
    name: plan.title || "Plan",
    subtitle: "",
    price: isFree ? "$0" : `$${charge}`,
    period: isFree ? "" : "/mo",
    description: clickLimit > 0 ? `Up to ${clickLimit.toLocaleString()} clicks/mo` : "",
    clickLimit,
    features: [...included, ...excluded].length
      ? [...included, ...excluded]
      : [{ text: "Contact us", included: true }],
    cta: "Get Started",
    popular: Boolean(plan.isPopular),
  };
}

export function readPrerenderedPlans() {
  const plans = globalThis.__PRERENDER_PLANS__;
  return Array.isArray(plans) ? plans : [];
}

/** Offers schema is allowed only for prices that are rendered as dollar amounts. */
export function plansWithVisiblePrice(plans) {
  return plans.filter((plan) => /^\$\d+(\.\d+)?$/.test(plan.price));
}
