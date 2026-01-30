import { Link } from "react-router-dom";
import { LegalPageLayout } from "../components/legal/LegalPageLayout";
import { PageMeta } from "../components/PageMeta";
import { Helmet } from "react-helmet-async";
import { Button } from "../components/ui/button";
import { ArrowRight } from "lucide-react";

const META = {
  title: "App Deep Links for Android & iOS",
  description: "App deep links open specific screens inside mobile apps instead of the home screen. Deeplink enables reliable app deep links that work across Android and iOS with a single tap.",
  keywords: "app deep links, Android app links, iOS universal links, mobile deep linking, in-app navigation",
};

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Can app deep links open web fallback pages?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, Deeplink automatically redirects users to web pages if the app is not installed.",
      },
    },
  ],
};

export const AppDeepLinks = () => {
  return (
    <LegalPageLayout title="App Deep Links for Android & iOS">
      <PageMeta
        title={META.title}
        description={META.description}
        keywords={META.keywords}
        path="/app-deep-links"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(FAQ_SCHEMA)}</script>
      </Helmet>

      <p>
        App deep links allow users to open specific screens inside a mobile application instead of just launching the home screen. Deeplink enables reliable app deep links that work across Android and iOS, ensuring users reach the exact content they expect with a single tap.
      </p>

      <h2>What Are App Deep Links?</h2>
      <p>
        App deep links are URLs that point directly to in-app content such as a product page, profile, or offer. They remove friction and improve engagement by skipping unnecessary steps.
      </p>

      <h2>Types of App Deep Links</h2>
      <ul>
        <li>Standard deep links</li>
        <li>Universal links (iOS)</li>
        <li>Android app links</li>
        <li>Deferred deep links</li>
      </ul>

      <h2>How Deeplink Improves App Deep Linking</h2>
      <ul>
        <li>Handles platform differences automatically</li>
        <li>Provides fallback URLs</li>
        <li>Supports secure link validation</li>
        <li>Offers analytics and tracking</li>
      </ul>

      <h2>Use Cases</h2>
      <ul>
        <li>Product sharing</li>
        <li>Content discovery</li>
        <li>Push notifications</li>
        <li>Email & SMS campaigns</li>
      </ul>

      <h2>Why App Deep Links Increase Engagement</h2>
      <ul>
        <li>Faster navigation</li>
        <li>Reduced user friction</li>
        <li>Higher conversion rates</li>
        <li>Better retention</li>
      </ul>

      <h2>FAQ</h2>
      <div className="space-y-4">
        <div>
          <p className="font-semibold text-foreground">Q: Can app deep links open web fallback pages?</p>
          <p>Yes, Deeplink automatically redirects users to web pages if the app is not installed.</p>
        </div>
      </div>

      <h2>Learn More</h2>
      <p>Explore our <Link to="/deep-linking-platform">deep linking platform</Link> and <Link to="/deferred-deep-linking">deferred deep linking</Link> guides.</p>

      <div className="mt-12 pt-8 border-t border-border">
        <p className="font-semibold text-foreground mb-4">Ready to add app deep links to your app?</p>
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

export default AppDeepLinks;
