import { Link } from "react-router-dom";
import { LegalPageLayout } from "../components/legal/LegalPageLayout";
import { PageMeta } from "../components/PageMeta";
import { FaqSection } from "../components/FaqSection";
import { Helmet } from "react-helmet-async";
import { Button } from "../components/ui/button";
import { ArrowRight } from "lucide-react";
import { buildFaqSchema } from "../utils/seoSchema";
import { DOCS_URL } from "../constants/publicSite";

const META = {
  title: "App Deep Links for Android & iOS",
  description:
    "App deep links open specific screens inside mobile apps. Learn Android App Links, iOS Universal Links, fallbacks, and how Deeplink unifies both platforms.",
  keywords:
    "app deep links, Android app links, iOS universal links, mobile deep linking, in-app navigation",
};

const FAQS = [
  {
    question: "What are app deep links?",
    answer:
      "App deep links are URLs that open a specific screen inside a mobile app—such as a product, profile, or offer—instead of only launching the home screen.",
  },
  {
    question: "Can app deep links open web fallback pages?",
    answer:
      "Yes. Deeplink can redirect users to a configured web page or store listing if the app is not installed.",
  },
  {
    question: "What is the difference between Android App Links and iOS Universal Links?",
    answer:
      "Android App Links use verified intent filters and Digital Asset Links. iOS Universal Links use the Apple App Site Association (AASA) file over HTTPS. Deeplink helps you support both from one link.",
  },
  {
    question: "Do deep links work if the app is not installed?",
    answer:
      "With deferred deep linking, Deeplink can preserve intent through install and open the correct screen on first launch. Without it, users typically land on the store or a web fallback only.",
  },
  {
    question: "Can I use one link for email, SMS, and ads?",
    answer:
      "Yes. A single Deeplink URL can be reused across channels; add UTM parameters to measure which channel drove the click or install.",
  },
  {
    question: "How do I test app deep links?",
    answer:
      "Test on real Android and iOS devices with the app installed and uninstalled, verify assetlinks/AASA, and confirm fallback and deferred routes in the Deeplink dashboard analytics.",
  },
  {
    question: "Do custom URL schemes still matter?",
    answer:
      "Custom schemes (myapp://) still appear in legacy apps, but verified HTTPS App Links and Universal Links are preferred for security, reliability, and web fallbacks.",
  },
];

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
        <script type="application/ld+json">{JSON.stringify(buildFaqSchema(FAQS))}</script>
      </Helmet>

      <p>
        App deep links open specific screens inside a mobile application instead of only launching
        the home screen. Deeplink helps you ship reliable app deep links across Android and iOS—with
        verified HTTPS links, store or web fallbacks, and optional{" "}
        <Link to="/deferred-deep-linking">deferred deep linking</Link> when the app is not installed
        yet.
      </p>

      <h2>What Are App Deep Links?</h2>
      <p>
        An app deep link is a URL that points to in-app content such as a product page, profile,
        checkout step, or gated feature. Users skip intermediate navigation, which reduces friction
        and improves conversion for campaigns, shares, and notifications.
      </p>
      <p>
        Modern app deep links prefer <strong className="text-foreground">https://</strong> domains
        claimed by your app (Android App Links and iOS Universal Links) over opaque custom schemes,
        because HTTPS links can also open in the browser when the app is missing.
      </p>

      <h2>Types of App Deep Links</h2>
      <ul>
        <li>
          <strong className="text-foreground">Standard / basic deep links</strong> — open content when
          the app is installed
        </li>
        <li>
          <strong className="text-foreground">Universal Links (iOS)</strong> — Apple’s verified HTTPS
          linking via AASA
        </li>
        <li>
          <strong className="text-foreground">Android App Links</strong> — verified intent filters via
          Digital Asset Links
        </li>
        <li>
          <strong className="text-foreground">Deferred deep links</strong> — preserve destination
          through install
        </li>
      </ul>

      <h2>Android App Links</h2>
      <p>
        On Android, you declare intent filters for your host and path, then publish a Digital Asset
        Links JSON file so the OS trusts that your app owns the domain. Once verified, taps can open
        the app directly without a disambiguation dialog. Deeplink can serve asset link configuration
        for managed and custom domains after you add package name and signing fingerprints in the
        dashboard.
      </p>

      <h2>iOS Universal Links</h2>
      <p>
        On iOS, Universal Links require an Apple App Site Association (AASA) file over HTTPS and the
        Associated Domains entitlement. When configured correctly, Safari and other apps open your
        app for matching URLs. Misconfigured AASA files are a leading cause of “links open in Safari
        only” bugs—validate after every domain or entitlement change.
      </p>

      <h2>How Deeplink Improves App Deep Linking</h2>
      <ul>
        <li>Handles platform differences behind one campaign URL</li>
        <li>Provides fallback URLs for web and stores</li>
        <li>Supports secure domain validation workflows</li>
        <li>Offers click and install analytics with UTMs</li>
        <li>
          Documents SDK and API setup in the{" "}
          <a href={DOCS_URL} target="_blank" rel="noopener noreferrer">
            Deeplink docs
          </a>
        </li>
      </ul>

      <h2>Use Cases</h2>
      <ul>
        <li>Product and content sharing</li>
        <li>Push notification destinations</li>
        <li>Email and SMS campaigns</li>
        <li>Referral invites with prefilled context</li>
        <li>Support and help-center deep links into account screens</li>
      </ul>

      <h2>Why App Deep Links Increase Engagement</h2>
      <ul>
        <li>Faster navigation to the intended screen</li>
        <li>Less bounce from irrelevant landings</li>
        <li>Higher conversion on offers and checkouts</li>
        <li>Better retention when first sessions match intent</li>
      </ul>

      <h2>Implementation Tips</h2>
      <ul>
        <li>Prefer one HTTPS domain strategy for both stores</li>
        <li>Keep path naming stable so campaigns do not break</li>
        <li>Always define fallbacks for desktop and uninstalled users</li>
        <li>Test on physical devices; simulators miss store edge cases</li>
        <li>
          Follow the step-by-step guide:{" "}
          <Link to="/blog/how-to-implement-deep-linking-android-ios">
            implement deep linking on Android &amp; iOS
          </Link>
        </li>
      </ul>

      <FaqSection faqs={FAQS} />

      <h2>Learn More</h2>
      <p>
        Explore our <Link to="/deep-linking-platform">deep linking platform</Link> and{" "}
        <Link to="/deferred-deep-linking">deferred deep linking</Link> guides, or start from{" "}
        <Link to="/blog/what-is-deep-linking">what is deep linking</Link>.
      </p>

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
