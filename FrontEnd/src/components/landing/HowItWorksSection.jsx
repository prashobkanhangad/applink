import { motion } from "framer-motion";
import { Link2, MousePointer, Smartphone, BarChart } from "lucide-react";

const steps = [
  {
    icon: Link2,
    number: "01",
    title: "Create Your Smart Deep Link",
    description: "Generate a smart deep link in seconds with our dashboard or API. Set fallbacks, add parameters, customize everything."
  },
  {
    icon: MousePointer,
    number: "02",
    title: "Share Everywhere",
    description: "Use your app deep link in ads, emails, social posts, QR codes—anywhere. One link adapts to all platforms automatically."
  },
  {
    icon: Smartphone,
    number: "03",
    title: "Users Land Perfectly",
    description: "With mobile deep linking, your audience opens the app to exactly the right screen. No app? They're guided to install first."
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
    <section
      id="how-it-works"
      className="py-24 lg:py-32 bg-surface-lilac relative overflow-hidden"
    >
      {/* Soft brand glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -bottom-40 -left-24 w-[520px] h-[520px] rounded-full bg-brand/15 blur-[130px]" />
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
          <span className="mx-auto mb-6 block h-1.5 w-16 rounded-full bg-brand" />
          <h2 className="display-heading text-3xl sm:text-4xl lg:text-[3.25rem] mb-6">
            Mobile Deep Linking for{" "}
            <span className="brand-highlight">Android &amp; iOS Apps</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Get started in minutes, not weeks. Here's how app deep links work.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              className="relative"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              <div className="soft-card soft-card-hover h-full p-7 pt-9 relative">
                {/* Number Badge */}
                <span className="absolute -top-5 left-7 w-12 h-12 rounded-full bg-brand text-brand-foreground font-extrabold text-base flex items-center justify-center shadow-soft">
                  {step.number}
                </span>

                {/* Icon */}
                <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mb-5">
                  <step.icon className="w-6 h-6 text-foreground" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold tracking-tight mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
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
