import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Home, FileText, Shield, Cookie, UserPlus, LayoutGrid, BookOpen } from "lucide-react";
import { PageMeta } from "../components/PageMeta";
import { useTheme } from "../contexts/ThemeContext";

const META = {
  title: "Sitemap",
  description: "Find all pages and sections on DeepLink. Browse our product, legal, and account pages.",
};

const groups = [
  {
    title: "Main",
    icon: Home,
    links: [
      { name: "Home", href: "/" },
      { name: "Features", href: "/#features" },
      { name: "How It Works", href: "/#how-it-works" },
      { name: "Pricing", href: "/#pricing" },
    ],
  },
  {
    title: "Product",
    icon: LayoutGrid,
    links: [
      { name: "Features", href: "/#features" },
      { name: "Pricing", href: "/#pricing" },
      { name: "Deep Linking Platform", href: "/deep-linking-platform" },
      { name: "Deferred Deep Linking", href: "/deferred-deep-linking" },
      { name: "App Deep Links", href: "/app-deep-links" },
    ],
  },
  {
    title: "Company",
    icon: FileText,
    links: [
      { name: "About", href: "/about" },
      { name: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Blog Posts",
    icon: BookOpen,
    links: [
      { name: "Firebase Dynamic Links Alternatives 2025", href: "/blog/firebase-dynamic-links-alternatives-2025" },
      { name: "What Is Deep Linking?", href: "/blog/what-is-deep-linking" },
      { name: "Deferred Deep Linking for Product Managers", href: "/blog/deferred-deep-linking-for-product-managers" },
      { name: "How to Implement Deep Linking", href: "/blog/how-to-implement-deep-linking-android-ios" },
    ],
  },
  {
    title: "Legal",
    icon: Shield,
    links: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
    ],
  },
  {
    title: "Account",
    icon: UserPlus,
    links: [
      { name: "Sign Up / Log In", href: "/signup" },
      { name: "Dashboard", href: "/dashboard" },
    ],
  },
];

export const Sitemap = () => {
  const { theme } = useTheme();
  const logoSrc = theme === "dark" ? "/logo_light.png" : "/logo_dark.png";

  return (
    <div className="min-h-screen bg-background relative overflow-hidden link-pattern">
      <PageMeta title={META.title} description={META.description} path="/sitemap" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-primary/5 blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[hsl(200_85%_50%)]/5 blur-[100px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
      </div>

      <header className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-foreground">
              <img src={logoSrc} alt="DeepLink" className="h-14 w-auto object-contain" />
              <span className="text-xl font-bold">DeepLink</span>
            </Link>
            <Link
              to="/"
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-6 py-12 md:py-16 lg:py-20">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Sitemap</h1>
            <p className="text-muted-foreground">
              Find all pages and sections on DeepLink.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group, i) => (
              <motion.div
                key={group.title}
                className="bg-card rounded-2xl border border-border shadow-sm p-6"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <group.icon className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">{group.title}</h2>
                </div>
                <ul className="space-y-2">
                  {group.links.map((link) => (
                    <li key={link.name}>
                      {link.href.startsWith("/#") ? (
                        <a
                          href={link.href}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          {link.name}
                        </a>
                      ) : (
                        <Link
                          to={link.href}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          {link.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Sitemap;
