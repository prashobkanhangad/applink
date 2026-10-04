import { Link as RouterLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Link,
  BarChart3,
  Smartphone,
  Globe,
  Code,
  QrCode,
  ArrowRight,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { PRODUCT_FEATURES } from "../../content/productFacts";

const featureIcons = [Link, Smartphone, BarChart3, Globe, Code, QrCode];

const features = PRODUCT_FEATURES.map((feature, index) => ({
  ...feature,
  icon: featureIcons[index] || Link,
}));

const iconTints = [
  "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
  "bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
  "bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300",
  "bg-orange-100 text-orange-700 dark:bg-orange-400/15 dark:text-orange-300",
  "bg-teal-100 text-teal-700 dark:bg-teal-400/15 dark:text-teal-300",
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-300",
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 lg:py-32 relative bg-background">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="mx-auto mb-6 block h-1.5 w-16 rounded-full bg-brand" />
          <h2 className="display-heading text-3xl sm:text-4xl lg:text-[3.25rem] mb-6">
            What you can do with Deeplink
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            These are the capabilities implemented in the product: routing, deferred deep linking, analytics, association files, APIs, and QR codes.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {features.map((feature, i) => {
            const external = feature.href?.startsWith("http");
            const Wrapper = !feature.href ? "div" : external ? "a" : RouterLink;
            const wrapperProps = !feature.href
              ? {}
              : external
                ? { href: feature.href }
                : { to: feature.href };
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Wrapper
                  {...wrapperProps}
                  className={cn(
                    "group soft-card soft-card-hover block h-full p-6",
                    feature.href && "cursor-pointer"
                  )}
                >
                  <div
                    className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center mb-5",
                      iconTints[i % iconTints.length]
                    )}
                  >
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold tracking-tight mb-2 flex items-center gap-2">
                    {feature.title}
                    {feature.href && (
                      <ArrowRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    )}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </Wrapper>
              </motion.div>
            );
          })}
        </div>

        {/* Internal links to SEO pages */}
        <motion.div
          className="mt-14 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="eyebrow text-muted-foreground mb-5">Explore our guides</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { to: "/features", label: "All Deeplink features" },
              { to: "/guides/what-is-deep-linking", label: "What is deep linking?" },
              { to: "/guides/deferred-deep-linking", label: "Deferred deep linking guide" },
              { to: "/app-deep-links", label: "App deep links for Android and iOS" },
            ].map((item) => (
              <RouterLink
                key={item.to}
                to={item.to}
                className="rounded-full border-2 border-border bg-card px-5 py-2.5 text-sm font-bold hover:border-foreground/40 hover:bg-brand-soft [transition:all_.25s_ease]"
              >
                {item.label}
              </RouterLink>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
