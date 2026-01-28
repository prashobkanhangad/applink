import { motion } from "framer-motion";
import { 
  Link, 
  BarChart3, 
  Smartphone, 
  Shield, 
  Zap, 
  Globe,
  Code,
  Users
} from "lucide-react";

const features = [
  {
    icon: Link,
    title: "Universal Deep Links",
    description: "One link that works everywhere. iOS, Android, web—your links adapt automatically to each platform."
  },
  {
    icon: BarChart3,
    title: "Real-Time Attribution",
    description: "Know exactly where your users come from. Track every click, install, and conversion with precision."
  },
  {
    icon: Smartphone,
    title: "Deferred Deep Linking",
    description: "Users land in the right spot even after installing. Context travels seamlessly through the app store."
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
            Everything You Need to{" "}
            <span className="text-gradient">Own Your Links</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From simple redirects to complex attribution funnels, DeepLink handles it all 
            with enterprise-grade reliability.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              className="group bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
