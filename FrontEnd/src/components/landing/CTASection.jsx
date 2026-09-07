import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CALENDLY_DEMO_URL } from "../../constants/publicSite";
import { cn } from "../../utils/cn";

export const CTASection = () => {
  const getAuthDestination = () =>
    typeof window !== "undefined" && localStorage.getItem("authToken")
      ? "/dashboard"
      : "/signup";

  return (
    <section className="py-20 lg:py-28 relative overflow-hidden bg-background">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="relative overflow-hidden bg-brand text-brand-foreground rounded-[2.5rem] px-8 py-14 sm:px-12 sm:py-16 lg:px-16 lg:py-20 text-center max-w-5xl mx-auto shadow-soft-lg"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Decorative rings */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.12]">
            <div className="absolute -top-24 -left-16 w-72 h-72 rounded-full border-[24px] border-brand-foreground" />
            <div className="absolute -bottom-28 -right-10 w-80 h-80 rounded-full border-[24px] border-brand-foreground" />
          </div>

          <div className="relative">
            <h2 className="display-heading text-3xl sm:text-4xl lg:text-[3.5rem] mb-6">
              Use App Deep Links to{" "}
              <span className="underline decoration-brand-foreground/30 decoration-[6px] underline-offset-[10px]">
                Increase Retention
              </span>
            </h2>
            <p className="text-base sm:text-lg text-brand-foreground/80 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
              Join thousands of developers and marketers who trust Deeplink as their deep linking platform 
              for user acquisition. Start free, upgrade when you're ready.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to={getAuthDestination()} className="w-full sm:w-auto">
                <Button variant="on-brand" size="pill" className="group w-full sm:w-auto">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <a
                href={CALENDLY_DEMO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-bold w-full sm:w-auto",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-foreground focus-visible:ring-offset-2",
                  "h-14 rounded-full px-9 text-base border-2 border-brand-foreground/30 text-brand-foreground",
                  "hover:border-brand-foreground hover:bg-brand-foreground/5 [transition:all_.25s_ease]"
                )}
              >
                Schedule a Demo
              </a>
            </div>
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
