import { motion } from "framer-motion";
import { Link2, MousePointer, Smartphone, BarChart } from "lucide-react";
import { HOW_IT_WORKS_STEPS } from "../../content/productFacts";

const stepIcons = [Link2, MousePointer, Smartphone, BarChart];
const steps = HOW_IT_WORKS_STEPS.map((step, index) => ({
  ...step,
  icon: stepIcons[index],
  number: String(index + 1).padStart(2, "0"),
}));

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
            How deep linking works
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Four steps from a link in the dashboard to a click and install report.
          </p>
        </motion.div>

        {/* Steps */}
        <ol className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 list-none p-0 m-0">
          {steps.map((step, i) => (
            <motion.li
              key={step.title}
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
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
};
