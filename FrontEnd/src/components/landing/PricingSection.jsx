import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Forever Free",
    subtitle: "Forever Free Pack (upto 25K MAU)",
    price: "$0",
    period: "",
    description: "Under 25K Monthly Active Users",
    features: [
      { text: "Free upto 25K MAU", included: true },
      { text: "1 Android and iOS app", included: true },
      { text: "Unlimited Deeplinks via SDK", included: true },
      { text: "Hosted on chottu.link subdomain", included: true },
      { text: "Limited support", included: false },
      { text: "No custom domain", included: false },
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Indie",
    subtitle: "Premium subscription with additional features",
    price: "$19",
    period: "/mo",
    description: "Under 75K Monthly Active Users",
    features: [
      { text: "Upto 75K MAU Supported", included: true },
      { text: "Email support", included: true },
      { text: "Link analytics", included: true },
      { text: "App Install analytics", included: true },
      { text: "No custom domain", included: false },
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Growth",
    subtitle: "Premium subscription with all features unlocked",
    price: "$39",
    period: "/mo",
    description: "Under 150K Monthly Active Users",
    features: [
      { text: "Upto 150K MAU Supported", included: true },
      { text: "All Indie features", included: true },
      { text: "Custom domain support", included: true },
      { text: "Invite team members", included: true },
    ],
    cta: "Get Started",
    popular: true,
  },
  {
    name: "Scale",
    subtitle: "Premium subscription with all features unlocked",
    price: "$99",
    period: "/mo",
    description: "Under 500K Monthly Active Users",
    features: [
      { text: "Upto 500K MAU Supported", included: true },
      { text: "All Growth features", included: true },
      { text: "Webhook support (coming soon)", included: true },
      { text: "Priority support", included: true },
    ],
    cta: "Get Started",
    popular: false,
  },
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
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
      </div>
    </section>
  );
};
