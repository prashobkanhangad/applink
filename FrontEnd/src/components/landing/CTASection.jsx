import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "../../utils/cn";

export const CTASection = () => {
  const getAuthDestination = () =>
    typeof window !== "undefined" && localStorage.getItem("authToken")
      ? "/dashboard"
      : "/signup";

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="bg-card rounded-3xl p-8 sm:p-12 lg:p-16 text-center max-w-4xl mx-auto border border-border shadow-xl"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Use App Deep Links to{" "}
            <span className="text-gradient">Increase Retention</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Join thousands of developers and marketers who trust Deeplink as their deep linking platform 
            for user acquisition. Start free, upgrade when you're ready.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to={getAuthDestination()}>
              <Button variant="hero" size="xl" className="group">
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <a
              href="https://calendly.com/deeplink-info/30min"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "border-2 border-primary text-primary hover:bg-primary/10",
                "h-14 rounded-lg px-10 text-lg"
              )}
            >
              Schedule a Demo
            </a>
          </div>

          {/* Trust Indicators */}
          {/* <div className="mt-12 pt-8 border-t border-border/50">
            <p className="text-sm text-muted-foreground mb-4">Trusted by leading companies</p>
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-50">
              {["Spotify", "Uber", "Airbnb", "Stripe", "Slack"].map((company, i) => (
                <span key={i} className="text-lg font-semibold text-muted-foreground">
                  {company}
                </span>
              ))}
            </div>
          </div> */}
        </motion.div>
      </div>
    </section>
  );
};
