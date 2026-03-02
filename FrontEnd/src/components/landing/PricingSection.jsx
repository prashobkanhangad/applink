import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPlans } from "@/services/appService";

/** Map DB plan (title, price, benefits, notIncludedBenefits, isPopular, monthlyClickLimit) to UI shape */
function mapPlanFromDb(plan) {
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
    ...(Array.isArray(plan.notIncludedBenefits) ? plan.notIncludedBenefits.map((text) => ({ text: String(text), included: false })) : []),
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

export const PricingSection = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getPlans()
      .then((data) => {
        if (!cancelled && Array.isArray(data)) {
          const sortPrice = (p) =>
            String(p.title || "").toUpperCase() === "ENTERPRISE" ? Infinity : Number(p.price) ?? 0;
          const sorted = [...data].sort((a, b) => sortPrice(a) - sortPrice(b));
          setPlans(sorted.map(mapPlanFromDb));
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load plans");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <section id="pricing" className="py-24 lg:py-32 relative">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Simple, Transparent{" "}
            <span className="text-gradient">Pricing</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Start free, scale as you grow. No hidden fees, no surprises.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl p-6 lg:p-8 bg-card border border-border animate-pulse h-80" />
            ))}
          </div>
        )}
        {error && (
          <p className="text-center text-muted-foreground py-8">{error}</p>
        )}
        {!loading && !error && plans.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name ?? i}
              className={`relative rounded-2xl p-6 lg:p-8 flex flex-col ${
                plan.popular
                  ? "bg-gradient-to-b from-primary/10 to-card border-2 border-primary/50 shadow-xl shadow-primary/10"
                  : "bg-card border border-border shadow-sm"
              }`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-5">
                <h3 className="text-lg font-semibold mb-0.5">{plan.name}</h3>
                {plan.subtitle && (
                  <p className="text-muted-foreground text-xs mb-2">{plan.subtitle}</p>
                )}
                <p className="text-muted-foreground text-sm mb-3">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-2.5 mb-6 flex-grow">
                {plan.features.map((feature, j) => (
                  <li
                    key={j}
                    className={`flex items-start gap-2.5 ${
                      !feature.included ? "opacity-60" : ""
                    }`}
                  >
                    {feature.included ? (
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                        <X className="w-3 h-3 text-muted-foreground" />
                      </div>
                    )}
                    <span
                      className={`text-sm ${
                        feature.included
                          ? "text-muted-foreground"
                          : "text-muted-foreground line-through"
                      }`}
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link to="/signup" className="block mt-auto">
                <Button
                  variant={plan.popular ? "hero" : "hero-outline"}
                  className="w-full"
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
        )}
      </div>
    </section>
  );
};
