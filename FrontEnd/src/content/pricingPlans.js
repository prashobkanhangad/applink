/** Map a pricing-plan API document into the fields the marketing page renders. */

export function mapPlanFromDb(plan) {
  const isEnterprise = String(plan.title || "").toUpperCase() === "ENTERPRISE";
  const priceNum = Number(plan.price);
  const displayPrice = priceNum === 0 ? "$0" : `$${priceNum}`;
  const discountedNum = plan.discountedPrice != null ? Number(plan.discountedPrice) : null;
  const priceDisplay = isEnterprise
    ? "Custom pricing"
    : discountedNum != null && discountedNum > 0
      ? `$${discountedNum}`
      : displayPrice;
  const features = [
    ...(Array.isArray(plan.benefits) ? plan.benefits.map((text) => ({ text: String(text), included: true })) : []),
    ...(Array.isArray(plan.notIncludedBenefits)
      ? plan.notIncludedBenefits.map((text) => ({ text: String(text), included: false }))
      : []),
  ];
  const description = isEnterprise
    ? "Over 500K monthly clicks"
    : plan.monthlyClickLimit != null && plan.monthlyClickLimit > 0
      ? `Up to ${Number(plan.monthlyClickLimit).toLocaleString()} clicks/mo`
      : "";
  return {
    name: plan.title || "Plan",
    subtitle: "",
    price: priceDisplay,
    period: isEnterprise || priceNum === 0 ? "" : "/mo",
    description,
    features: features.length ? features : [{ text: "Contact us", included: true }],
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
