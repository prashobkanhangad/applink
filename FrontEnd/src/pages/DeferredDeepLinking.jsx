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
  title: "Deferred Deep Linking for Mobile Apps",
  description:
    "Deferred deep linking preserves click intent through app install so users open the right screen on first launch. How it works on Android and iOS with Deeplink.",
  keywords:
    "deferred deep linking, mobile deep linking, app install attribution, first-time user experience, app onboarding",
};

const FAQS = [
  {
    question: "What is deferred deep linking?",
    answer:
      "Deferred deep linking preserves the original link intent when a user does not have the app installed. After they install and open the app, they are routed to the content they originally clicked.",
  },
  {
    question: "Does deferred deep linking work on both Android and iOS?",
    answer:
      "Yes. Deeplink supports deferred deep linking across Android and iOS, including install-referrer and matching flows where available.",
  },
  {
    question: "How is deferred deep linking different from a regular deep link?",
    answer:
      "A regular deep link opens content only if the app is already installed. Deferred deep linking also works when the user must install first, then restores the destination on first launch.",
  },
  {
    question: "Does deferred deep linking help attribution?",
    answer:
      "Yes. By tying the install and first open back to the original click (and UTMs), teams can measure which campaigns drove installs and in-app actions.",
  },
  {
    question: "What campaigns benefit most from deferred deep linking?",
    answer:
      "Referrals, influencer links, paid acquisition, email/SMS offers, and any flow where users often install before they can see the destination content.",
  },
  {
    question: "Do I need an SDK for deferred deep linking?",
    answer:
      "An SDK or Track Install API call on first launch is recommended so the app can receive attribution and route the user correctly. See Deeplink docs for setup.",
  },
  {
    question: "What happens if deferred matching fails?",
    answer:
      "Users still install and open the app; they may land on a default screen. Monitoring match rates in analytics helps you catch misconfigured domains or missing SDK init.",
  },
];

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
        <script type="application/ld+json">{JSON.stringify(buildFaqSchema(FAQS))}</script>
      </Helmet>

      <p>
        Deferred deep linking lets users reach specific in-app content even when they install the
        app after clicking a link. Deeplink stores the original link intent (path, destination, UTMs)
        and restores it on first launch so onboarding, offers, and referrals survive the store
        interrupt on Android and iOS.
      </p>

      <h2>What Is Deferred Deep Linking?</h2>
      <p>
        Classic deep links only work when the app is already installed. Deferred deep linking solves
        the common mobile growth gap: the user clicks a campaign, does not have the app, installs
        from the store, and would otherwise open a blank home screen with no memory of why they
        came.
      </p>
      <p>
        With deferred deep linking, the platform captures context at click time and reconnects that
        context when the app records an install or first open—so the user can land on the product,
        invite, or offer they expected.
      </p>

      <h2>Why Deferred Deep Linking Matters</h2>
      <ul>
        <li>Improves install-to-activation conversion</li>
        <li>Reduces post-install drop-off and confusion</li>
        <li>Enables personalized first-time experiences</li>
        <li>Preserves campaign and referral context for analytics</li>
        <li>Makes paid and influencer spend measurable beyond the click</li>
      </ul>
      <p>
        Product managers often treat deferred deep linking as infrastructure, not a growth lever. In
        practice it directly affects activation KPIs—see our guide for{" "}
        <Link to="/blog/deferred-deep-linking-for-product-managers">
          deferred deep linking for product managers
        </Link>
        .
      </p>

      <h2>How Deeplink Handles Deferred Deep Linking</h2>
      <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-4">
        <li>User clicks a Deeplink URL with path and optional UTM parameters.</li>
        <li>If the app is missing, Deeplink sends them to the appropriate store (or web fallback).</li>
        <li>Click context is stored securely for matching.</li>
        <li>On first launch, the app calls the SDK or Track Install API.</li>
        <li>Deeplink returns attribution (for example path and UTMs).</li>
        <li>Your app navigates to the correct in-app screen.</li>
      </ol>
      <p>
        Implementation details for Flutter and native setups live in the{" "}
        <a href={DOCS_URL} target="_blank" rel="noopener noreferrer">
          Deeplink docs
        </a>
        .
      </p>

      <h2>Android vs iOS Considerations</h2>
      <p>
        Android can often use Play Install Referrer data when the user installs from a link tied to
        your domain. iOS typically relies on probabilistic or fingerprint-style matching within a
        short window (IP, geo, platform, device signals) because Apple does not expose the same
        referrer channel. A good deferred deep linking platform abstracts those differences so your
        product logic stays one path: receive attribution → navigate.
      </p>

      <h2>Common Use Cases</h2>
      <ul>
        <li>User invites and referral codes</li>
        <li>Promotional and seasonal campaigns</li>
        <li>Influencer and creator links</li>
        <li>Personalized onboarding (plan, segment, or content ID)</li>
        <li>Re-engagement to a specific feature after reinstall</li>
      </ul>

      <h2>Benefits for Growth and Product</h2>
      <ul>
        <li>Higher retention from relevant first sessions</li>
        <li>Cleaner attribution from click → install → open</li>
        <li>Better user satisfaction versus “dead” home-screen landings</li>
        <li>Higher lifetime value when offers and referrals complete</li>
      </ul>

      <h2>Deferred Deep Linking Checklist</h2>
      <ul>
        <li>Configure Android package / iOS bundle in the dashboard</li>
        <li>Verify App Links and Universal Links for your domain</li>
        <li>Always define a web or store fallback</li>
        <li>Initialize SDK or Track Install on first open</li>
        <li>Map attribution path → in-app route in your navigator</li>
        <li>QA installed and uninstalled flows on real devices</li>
        <li>Watch match rates and conversion in analytics</li>
      </ul>

      <FaqSection faqs={FAQS} />

      <h2>Learn More</h2>
      <p>
        Explore the <Link to="/deep-linking-platform">deep linking platform</Link> overview,{" "}
        <Link to="/app-deep-links">app deep links for Android &amp; iOS</Link>, and{" "}
        <Link to="/blog/how-to-implement-deep-linking-android-ios">
          how to implement deep linking
        </Link>
        .
      </p>

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
