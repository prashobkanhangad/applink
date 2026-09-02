import { Link } from "react-router-dom";
import { BookOpen, Calendar } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { CALENDLY_DEMO_URL, DOCS_URL } from "../../constants/publicSite";

const footerLinks = {
  Product: [
    { name: "Features", href: "/#features" },
    { name: "Pricing", href: "/#pricing" },
    { name: "Deep Linking Platform", href: "/deep-linking-platform" },
    { name: "Deferred Deep Linking", href: "/deferred-deep-linking" },
    { name: "App Deep Links", href: "/app-deep-links" },
  ],
  Company: [
    { name: "About", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Affiliate program", href: "/affiliate" },
    { name: "Contact", href: CALENDLY_DEMO_URL },
  ],
  Resources: [
    { name: "Sitemap", href: "/sitemap" },
    { name: "Documentation", href: DOCS_URL },
    { name: "llms.txt", href: "/llms.txt" },
  ],
  Legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
    { name: "GDPR", href: "/privacy" },
  ],
};

const brandLinks = [
  { icon: BookOpen, href: DOCS_URL, label: "Documentation" },
  { icon: Calendar, href: CALENDLY_DEMO_URL, label: "Book a demo" },
];

export const Footer = () => {
  const { theme } = useTheme();
  const logoSrc = theme === "dark" ? "/logo_light.png" : "/logo_dark.png";

  return (
    <footer className="bg-secondary/50 border-t border-border py-16 lg:py-20">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-6 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img
                src={logoSrc}
                alt="DeepLink"
                className="h-14 w-auto object-contain"
              />

            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-xs">
              The intelligent deep linking platform trusted by developers and marketers worldwide.
            </p>
            <div className="flex flex-wrap gap-3">
              {brandLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                >
                  <link.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => {
                  const external =
                    link.href.startsWith("http://") ||
                    link.href.startsWith("https://");
                  const staticFile = /\.(txt|xml|json)$/i.test(link.href);
                  return (
                    <li key={link.name}>
                      {link.href.startsWith("/") && !staticFile ? (
                        <Link
                          to={link.href}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {link.name}
                        </Link>
                      ) : (
                        <a
                          href={link.href}
                          target={external ? "_blank" : undefined}
                          rel={external ? "noopener noreferrer" : undefined}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {link.name}
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} DeepLink. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/sitemap" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Sitemap
            </Link>
            <p className="text-sm text-muted-foreground">
              Made with precision for developers everywhere.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
