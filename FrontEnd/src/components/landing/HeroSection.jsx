import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CALENDLY_DEMO_URL } from "../../constants/publicSite";
import { cn } from "../../utils/cn";

const stats = [
  { value: "99.9%", label: "Uptime SLA" },
  { value: "50ms", label: "Avg Response" },
  { value: "5 min", label: "SDK Setup" },
  { value: "150+", label: "Countries" },
];

const previewCards = [
  {
    icon: Zap,
    title: "One SDK",
    value: "Unified mobile",
    change: "Android & iOS ready",
    tint: "bg-surface-cream",
  },
  {
    icon: Globe,
    title: "Custom Domains",
    value: "Brand-safe links",
    change: "Use your own URL",
    tint: "bg-surface-mint",
  },
  {
    icon: Sparkles,
    title: "Smart Routing",
    value: "Right app, every time",
    change: "Deep links that just work",
    tint: "bg-surface-lilac",
  },
];

export const HeroSection = () => {
  const getAuthDestination = () =>
    typeof window !== "undefined" && localStorage.getItem("authToken")
      ? "/dashboard"
      : "/signup";

  return (
    <section className="relative overflow-hidden bg-surface-cream pt-32 pb-20 lg:pt-40 lg:pb-28">
      {/* Soft brand blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[520px] rounded-full bg-brand/25 blur-[130px] animate-pulse-glow" />
        <div
          className="absolute bottom-0 right-[10%] w-[420px] h-[420px] rounded-full bg-[hsl(200_85%_60%)]/15 blur-[120px] animate-pulse-glow"
          style={{ animationDelay: "1.5s" }}
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Eyebrow */}
          <motion.p
            className="eyebrow text-muted-foreground mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Sparkles className="inline-block w-4 h-4 mr-2 align-[-3px] text-brand-foreground dark:text-brand" />
            Trusted by 10,000+ developers worldwide
          </motion.p>

          {/* Headline - Primary keyword for SEO */}
          <motion.h1
            className="display-heading text-[2.75rem] sm:text-6xl lg:text-7xl mb-7"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Smart Deep Linking{" "}
            <span className="brand-highlight">Platform for Apps &amp; Web</span>
          </motion.h1>

          {/* First 100 words - Context lock with primary & secondary keywords */}
          <motion.p
            className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-5"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Deeplink is a powerful deep linking platform that helps businesses create smart deep links for mobile apps and websites. With support for mobile deep linking and app deep links, Deeplink ensures users land in the right place across Android, iOS, and web.
          </motion.p>
          <motion.p
            className="text-sm font-semibold mb-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link
              to="/deep-linking-platform"
              className="inline-block border-b-2 border-brand pb-0.5 hover:border-foreground transition-colors"
            >
              Learn more about our deep linking platform →
            </Link>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link to={getAuthDestination()} className="w-full sm:w-auto">
              <Button variant="brand" size="pill" className="group w-full sm:w-auto">
                Start Building Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <a
              href={CALENDLY_DEMO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center justify-center gap-2 whitespace-nowrap font-bold w-full sm:w-auto",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                "h-14 rounded-full px-9 text-base bg-card border-2 border-border text-foreground",
                "hover:border-foreground/40 hover:bg-secondary/60 [transition:all_.25s_ease]"
              )}
            >
              Book Demo
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="soft-card max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {stats.map((stat, i) => (
              <div
                key={i}
                className={cn(
                  "px-4 py-6 text-center border-border/70",
                  i % 2 === 0 && "border-r",
                  i === 1 && "md:border-r",
                  i < 2 && "border-b md:border-b-0"
                )}
              >
                <div className="display-heading text-2xl sm:text-3xl mb-1">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Hero Visual */}
        <motion.div
          className="mt-16 lg:mt-20 relative"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="bg-card rounded-[2rem] p-3 sm:p-4 max-w-4xl mx-auto shadow-soft-lg border border-border/70">
            <div className="bg-secondary/40 rounded-[1.5rem] p-4 sm:p-8">
              {/* Mock Dashboard */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive/80" />
                  <div className="w-3 h-3 rounded-full bg-brand" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 bg-background rounded-full px-4 py-2 text-sm text-muted-foreground font-mono border border-border">
                  deeplink.in/dashboard
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {previewCards.map((card, i) => (
                  <div
                    key={i}
                    className={cn(
                      "rounded-2xl p-5 border border-border/60 shadow-soft soft-card-hover",
                      card.tint
                    )}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-8 h-8 rounded-full bg-brand flex items-center justify-center">
                        <card.icon className="w-4 h-4 text-brand-foreground" />
                      </span>
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {card.title}
                      </span>
                    </div>
                    <div className="text-lg font-bold text-foreground mb-0.5 tracking-tight">
                      {card.value}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">
                      {card.change}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
