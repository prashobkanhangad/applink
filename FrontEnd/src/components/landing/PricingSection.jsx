import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "forever",
    description: "Perfect for side projects and testing",
    features: [
      "10,000 clicks/month",
      "3 custom domains",
      "Basic analytics",
      "Email support",
      "API access"
    ],
    cta: "Get Started",
    popular: false
  },
  {
    name: "Growth",
    price: "$49",
    period: "/month",
    description: "For growing apps and marketing teams",
    features: [
      "500,000 clicks/month",
      "Unlimited domains",
      "Advanced analytics",
      "Priority support",
      "Webhooks & API",
      "Team collaboration",
      "A/B testing"
    ],
    cta: "Start Free Trial",
    popular: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large-scale applications",
    features: [
      "Unlimited clicks",
      "Dedicated infrastructure",
      "99.99% SLA",
      "24/7 phone support",
      "Custom integrations",
      "SOC 2 compliance",
      "Dedicated CSM"
    ],
    cta: "Contact Sales",
    popular: false
  }
];

export const PricingSection = () => {
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
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              className={`relative rounded-2xl p-8 ${
                plan.popular
                  ? "bg-gradient-to-b from-primary/10 to-card border-2 border-primary/50 shadow-xl shadow-primary/10"
                  : "bg-card border border-border shadow-sm"
              }`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-sm font-semibold">
                    <Sparkles className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {plan.cta === "Contact Sales" ? (
                <Button
                  variant={plan.popular ? "hero" : "hero-outline"}
                  className="w-full"
                  size="lg"
                >
                  {plan.cta}
                </Button>
              ) : (
                <Link to="/signup">
                  <Button
                    variant={plan.popular ? "hero" : "hero-outline"}
                    className="w-full"
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
