import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPlans } from "@/services/appService";
import { cn } from "../../utils/cn";
import { mapPlanFromDb, readPrerenderedPlans } from "../../content/pricingPlans";

export const PricingSection = ({ showHeading = true }) => {
  const seededPlans = readPrerenderedPlans();
  const [plans, setPlans] = useState(seededPlans);
  const [loading, setLoading] = useState(seededPlans.length === 0);
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
    <section id="pricing" className="py-24 lg:py-32 relative bg-background">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto mb-8 text-center">
          <p className="text-muted-foreground leading-relaxed">
            Deeplink includes a free plan and paid plans. Each plan has a monthly click limit.
          </p>
          {plans.length === 0 && (
            <p className="text-sm text-muted-foreground mt-4">
              TODO: [fact needed] current public plan names, prices, currency, and monthly click limits, so this section does not depend on JavaScript.
            </p>
          )}
        </div>

        {showHeading && (
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="mx-auto mb-6 block h-1.5 w-16 rounded-full bg-brand" />
          <h2 className="display-heading text-3xl sm:text-4xl lg:text-[3.25rem] mb-6">
            Pricing
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Start free, scale as you grow. No hidden fees, no surprises.
          </p>
        </motion.div>
        )}

        {/* Pricing Cards */}
        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="soft-card p-6 lg:p-8 animate-pulse h-80" />
            ))}
          </div>
        )}
        {error && (
          <p className="text-center text-muted-foreground py-8">{error}</p>
        )}
        {!loading && !error && plans.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name ?? i}
              className={cn(
                "relative rounded-3xl p-6 lg:p-8 flex flex-col shadow-soft [transition:all_.25s_ease] hover:-translate-y-1.5 hover:shadow-soft-lg",
                plan.popular
                  ? "bg-brand text-brand-foreground border-2 border-brand lg:-mt-4 lg:mb-4 lg:pt-10"
                  : "bg-card border border-border/70"
              )}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1.5 bg-foreground text-background px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-soft">
                    <Sparkles className="w-3.5 h-3.5" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <h3
                  className={cn(
                    "eyebrow mb-2",
                    plan.popular ? "text-brand-foreground/70" : "text-muted-foreground"
                  )}
                >
                  {plan.name}
                </h3>
                {plan.subtitle && (
                  <p
                    className={cn(
                      "text-xs mb-2",
                      plan.popular ? "text-brand-foreground/70" : "text-muted-foreground"
                    )}
                  >
                    {plan.subtitle}
                  </p>
                )}
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="display-heading text-4xl">{plan.price}</span>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      plan.popular ? "text-brand-foreground/70" : "text-muted-foreground"
                    )}
                  >
                    {plan.period}
                  </span>
                </div>
                <p
                  className={cn(
                    "text-sm font-medium",
                    plan.popular ? "text-brand-foreground/80" : "text-muted-foreground"
                  )}
                >
                  {plan.description}
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-7 flex-grow">
                {plan.features.map((feature, j) => (
                  <li
                    key={j}
                    className={cn(
                      "flex items-start gap-2.5",
                      !feature.included && "opacity-60"
                    )}
                  >
                    {feature.included ? (
                      <span
                        className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                          plan.popular
                            ? "bg-brand-foreground text-brand"
                            : "bg-brand text-brand-foreground"
                        )}
                      >
                        <Check className="w-3 h-3" strokeWidth={3} />
                      </span>
                    ) : (
                      <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                        <X className="w-3 h-3 text-muted-foreground" />
                      </span>
                    )}
                    <span
                      className={cn(
                        "text-sm",
                        plan.popular ? "text-brand-foreground/90" : "text-muted-foreground",
                        !feature.included && "line-through"
                      )}
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link to="/signup" className="block mt-auto">
                <Button
                  variant={plan.popular ? "on-brand" : "brand-outline"}
                  className="w-full"
                  size="pill-sm"
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
