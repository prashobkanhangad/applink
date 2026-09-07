import { Link as RouterLink } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Link, 
  BarChart3, 
  Smartphone, 
  Shield, 
  Zap, 
  Globe,
  Code,
  Users,
  ArrowRight
} from "lucide-react";
import { cn } from "../../utils/cn";

const features = [
  {
    icon: Link,
    title: "Universal Deep Links",
    description: "One link that works everywhere. iOS, Android, web—your links adapt automatically to each platform.",
    href: "/app-deep-links",
  },
  {
    icon: BarChart3,
    title: "Real-Time Attribution",
    description: "Know exactly where your users come from. Track every click, install, and conversion with precision."
  },
  {
    icon: Smartphone,
    title: "Deferred Deep Linking",
    description: "Users land in the right spot even after installing. Context travels seamlessly through the app store.",
    href: "/deferred-deep-linking",
  },
  {
    icon: Shield,
    title: "Fraud Protection",
    description: "Built-in fraud detection stops fake installs and attribution manipulation before they cost you money."
  },
  {
    icon: Zap,
    title: "Lightning Fast SDK",
    description: "Sub-50ms response times globally. Our lightweight SDK won't slow down your app launch."
  },
  {
    icon: Globe,
    title: "Global CDN",
    description: "Edge servers in 150+ locations ensure your links resolve instantly, anywhere in the world."
  },
  {
    icon: Code,
    title: "Developer First",
    description: "RESTful APIs, webhooks, and SDKs for every major platform. Build exactly what you need."
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Invite your team, set permissions, and work together on campaigns with full audit trails."
  }
];

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
            How Smart Deep Links{" "}
            <span className="brand-highlight">Improve User Experience</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            From simple redirects to complex attribution funnels, our deep linking platform handles it all 
            with enterprise-grade reliability.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {features.map((feature, i) => {
            const Wrapper = feature.href ? RouterLink : "div";
            const wrapperProps = feature.href ? { to: feature.href } : {};
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
              { to: "/deep-linking-platform", label: "Deep Linking Platform" },
              { to: "/deferred-deep-linking", label: "Deferred Deep Linking" },
              { to: "/app-deep-links", label: "App Deep Links" },
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
