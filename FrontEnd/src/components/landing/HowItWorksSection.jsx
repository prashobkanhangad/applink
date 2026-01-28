import { motion } from "framer-motion";
import { Link2, MousePointer, Smartphone, BarChart } from "lucide-react";

const steps = [
  {
    icon: Link2,
    number: "01",
    title: "Create Your Link",
    description: "Generate a smart link in seconds with our dashboard or API. Set fallbacks, add parameters, customize everything."
  },
  {
    icon: MousePointer,
    number: "02",
    title: "Share Everywhere",
    description: "Use your link in ads, emails, social posts, QR codes—anywhere. One link adapts to all platforms automatically."
  },
  {
    icon: Smartphone,
    number: "03",
    title: "Users Land Perfectly",
    description: "Your audience opens the app to exactly the right screen. If they don't have the app, they're guided to install it first."
  },
  {
    icon: BarChart,
    number: "04",
    title: "Track Everything",
    description: "See real-time analytics on clicks, installs, and conversions. Know which campaigns drive results."
  }
];

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 lg:py-32 bg-secondary/50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Deep Linking Made{" "}
            <span className="text-gradient">Simple</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Get started in minutes, not weeks. Here's how it works.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              className="relative"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              {/* Connector Line (hidden on last item and mobile) */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-border to-transparent z-0" />
              )}

              <div className="relative z-10">
                {/* Number Badge */}
                <div className="text-5xl font-bold text-primary/20 mb-4 font-mono">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 border border-primary/20">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
