import { Link } from "react-router-dom";
import { LegalPageLayout } from "../components/legal/LegalPageLayout";
import { PageMeta } from "../components/PageMeta";
import { Helmet } from "react-helmet-async";
import { Button } from "../components/ui/button";
import { ArrowRight } from "lucide-react";

const META = {
  title: "Deep Linking Platform for Apps & Web",
  description: "Deeplink is a powerful deep linking platform that helps businesses connect users directly to the right content inside mobile apps and websites with smart deep links, routing, and analytics.",
  keywords: "deep linking platform, smart deep links, mobile deep linking, app deep links, URL redirection, deep link analytics",
};

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is Deeplink suitable for startups?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, Deeplink is designed for startups, growing businesses, and enterprises.",
      },
    },
  ],
};

export const DeepLinkingPlatform = () => {
  return (
    <LegalPageLayout title="Deep Linking Platform for Apps & Web">
      <PageMeta
        title={META.title}
        description={META.description}
        keywords={META.keywords}
        path="/deep-linking-platform"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(FAQ_SCHEMA)}</script>
      </Helmet>

      <p>
        Deeplink is a powerful deep linking platform that helps businesses connect users directly to the right content inside mobile apps and websites. Instead of sending users to generic landing pages, Deeplink ensures seamless redirection to specific app screens or web pages across Android, iOS, and desktop. With smart deep links, advanced routing, and analytics, Deeplink improves user experience, retention, and conversion rates.
      </p>

      <h2>What Is a Deep Linking Platform?</h2>
      <p>
        A deep linking platform allows you to create and manage links that take users directly to specific content inside an app or website. These links work across platforms and devices, ensuring users land in the right place whether the app is installed or not.
      </p>

      <h2>How Deeplink Works</h2>
      <ol className="list-decimal list-inside space-y-3 text-muted-foreground mb-4">
        <li>User clicks a Deeplink URL</li>
        <li>Deeplink detects device, OS, and app availability</li>
        <li>User is redirected to:
          <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
            <li>App content (if installed)</li>
            <li>App store (if not installed)</li>
            <li>Web fallback (if on desktop)</li>
          </ul>
        </li>
      </ol>

      <h2>Key Features</h2>
      <ul>
        <li>Smart deep links for iOS, Android, and Web</li>
        <li>Automatic fallback routing</li>
        <li>Cross-platform compatibility</li>
        <li>Link analytics & performance tracking</li>
        <li>Secure and scalable infrastructure</li>
      </ul>

      <h2>Use Cases</h2>
      <ul>
        <li>App onboarding & activation</li>
        <li>Marketing campaigns & ads</li>
        <li>Email and SMS campaigns</li>
        <li>Referral and invite systems</li>
      </ul>

      <h2>Why Choose Deeplink?</h2>
      <ul>
        <li>Simple setup</li>
        <li>Developer-friendly APIs</li>
        <li>Faster redirection</li>
        <li>Better user experience</li>
        <li>Built for scale</li>
      </ul>

      <h2>FAQ</h2>
      <div className="space-y-4">
        <div>
          <p className="font-semibold text-foreground">Q: Is Deeplink suitable for startups?</p>
          <p>Yes, Deeplink is designed for startups, growing businesses, and enterprises.</p>
        </div>
      </div>

      <h2>Learn More</h2>
      <p>Explore our guides on <Link to="/deferred-deep-linking">deferred deep linking</Link> and <Link to="/app-deep-links">app deep links for Android & iOS</Link>.</p>

      <div className="mt-12 pt-8 border-t border-border">
        <p className="font-semibold text-foreground mb-4">Ready to get started?</p>
        <Link to="/signup">
          <Button variant="hero" size="lg" className="group">
            Get Started Free
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </LegalPageLayout>
  );
};

export default DeepLinkingPlatform;
