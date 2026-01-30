import { Link } from "react-router-dom";
import { LegalPageLayout } from "../components/legal/LegalPageLayout";
import { PageMeta } from "../components/PageMeta";
import { Helmet } from "react-helmet-async";
import { Button } from "../components/ui/button";
import { ArrowRight } from "lucide-react";

const META = {
  title: "Deferred Deep Linking for Mobile Apps",
  description: "Deferred deep linking allows users to reach specific in-app content even after installing the app. Deeplink remembers link intent and routes users to the correct screen on first launch.",
  keywords: "deferred deep linking, mobile deep linking, app install attribution, first-time user experience, app onboarding",
};

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Does deferred deep linking work on both Android and iOS?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, Deeplink supports deferred deep linking across major mobile platforms.",
      },
    },
  ],
};

export const DeferredDeepLinking = () => {
  return (
    <LegalPageLayout title="Deferred Deep Linking for Mobile Apps">
      <PageMeta
        title={META.title}
        description={META.description}
        keywords={META.keywords}
        path="/deferred-deep-linking"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(FAQ_SCHEMA)}</script>
      </Helmet>

      <p>
        Deferred deep linking allows users to reach specific in-app content even if they install the app after clicking a link. Deeplink ensures a seamless experience by remembering the original link intent and routing users to the correct screen once the app is installed and opened for the first time.
      </p>

      <h2>What Is Deferred Deep Linking?</h2>
      <p>
        Deferred deep linking solves the problem where users click a link but don't have the app installed. Instead of losing context, the system stores the intent and restores it after installation.
      </p>

      <h2>Why Deferred Deep Linking Matters</h2>
      <ul>
        <li>Improves app install conversions</li>
        <li>Reduces drop-offs after install</li>
        <li>Creates smoother onboarding</li>
        <li>Enables personalized first-time experiences</li>
      </ul>

      <h2>How Deeplink Handles Deferred Deep Linking</h2>
      <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-4">
        <li>Captures link context before install</li>
        <li>Stores user intent securely</li>
        <li>Restores deep link on first app launch</li>
        <li>Routes user to the correct in-app screen</li>
      </ol>

      <h2>Common Use Cases</h2>
      <ul>
        <li>User invites & referrals</li>
        <li>Promotional campaigns</li>
        <li>Influencer & ad tracking</li>
        <li>Personalized onboarding</li>
      </ul>

      <h2>Benefits</h2>
      <ul>
        <li>Higher retention</li>
        <li>Better attribution</li>
        <li>Improved user satisfaction</li>
        <li>Increased lifetime value (LTV)</li>
      </ul>

      <h2>FAQ</h2>
      <div className="space-y-4">
        <div>
          <p className="font-semibold text-foreground">Q: Does deferred deep linking work on both Android and iOS?</p>
          <p>Yes, Deeplink supports deferred deep linking across major mobile platforms.</p>
        </div>
      </div>

      <h2>Learn More</h2>
      <p>Explore our <Link to="/deep-linking-platform">deep linking platform</Link> overview and <Link to="/app-deep-links">app deep links for Android & iOS</Link>.</p>

      <div className="mt-12 pt-8 border-t border-border">
        <p className="font-semibold text-foreground mb-4">Ready to implement deferred deep linking?</p>
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

export default DeferredDeepLinking;
