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

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 lg:py-32 relative">
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
            How Smart Deep Links{" "}
            <span className="text-gradient">Improve User Experience</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From simple redirects to complex attribution funnels, our deep linking platform handles it all 
            with enterprise-grade reliability.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  className={`group block bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${feature.href ? "cursor-pointer" : ""}`}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    {feature.title}
                    {feature.href && <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
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
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-sm text-muted-foreground mb-3">Explore our guides</p>
          <div className="flex flex-wrap justify-center gap-4">
            <RouterLink to="/deep-linking-platform" className="text-primary hover:underline underline-offset-2 text-sm font-medium">
              Deep Linking Platform
            </RouterLink>
            <RouterLink to="/deferred-deep-linking" className="text-primary hover:underline underline-offset-2 text-sm font-medium">
              Deferred Deep Linking
            </RouterLink>
            <RouterLink to="/app-deep-links" className="text-primary hover:underline underline-offset-2 text-sm font-medium">
              App Deep Links
            </RouterLink>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
