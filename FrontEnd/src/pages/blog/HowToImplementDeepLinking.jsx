import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { LegalPageLayout } from "../../components/legal/LegalPageLayout";
import { PageMeta } from "../../components/PageMeta";
import { FaqSection } from "../../components/FaqSection";
import { Button } from "../../components/ui/button";
import { ArrowRight } from "lucide-react";
import {
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildHowToSchema,
} from "../../utils/seoSchema";
import { DOCS_URL } from "../../constants/publicSite";

const PATH = "/blog/how-to-implement-deep-linking-android-ios";
const DATE = "2025-01-22";

const META = {
  title: "How to Implement Deep Linking in Android & iOS (Step-by-Step)",
  description:
    "Learn how to implement deep linking for Android App Links and iOS Universal Links. Common challenges, best practices, and how Deeplink simplifies cross-platform support.",
  keywords:
    "implement deep linking, Android App Links, iOS Universal Links, deep linking implementation, AASA",
};

const HOW_TO_STEPS = [
  "Create your app in the Deeplink dashboard and configure Android package name and/or iOS bundle ID.",
  "Add Android App Links intent filters and confirm Digital Asset Links are served for your domain.",
  "Add iOS Associated Domains and verify the Apple App Site Association (AASA) file.",
  "Create a deep link with path, destination URL, and optional UTM parameters.",
  "Initialize the SDK or Track Install API on first launch for deferred deep linking and attribution.",
  "Test installed and uninstalled flows on real Android and iOS devices, then monitor analytics.",
];

const FAQS = [
  {
    question: "How do I implement deep linking on Android?",
    answer:
      "Use Android App Links: add verified intent filters for your host/path, ensure assetlinks.json is correct, and handle the incoming intent in your app.",
  },
  {
    question: "How do I implement deep linking on iOS?",
    answer:
      "Use Universal Links with an Apple App Site Association (AASA) file over HTTPS, enable Associated Domains, and handle the URL in your app delegate/scene.",
  },
  {
    question: "Why do deep links fail after install?",
    answer:
      "Without deferred deep linking, install interrupts context. Use a platform that stores click intent and restores the destination on first open.",
  },
  {
    question: "Can one platform handle both Android and iOS?",
    answer:
      "Yes. Deeplink provides one URL with automatic platform detection, fallbacks, and deferred routing so you do not maintain separate link systems.",
  },
  {
    question: "What should I test before launching campaigns?",
    answer:
      "Verify installed open, uninstalled store redirect, deferred first-open destination match, web fallbacks, and analytics events on real devices—not only simulators.",
  },
];

export const HowToImplementDeepLinking = () => {
  return (
    <LegalPageLayout
      title="How to Implement Deep Linking in Android & iOS (Step-by-Step)"
      backHref="/blog"
      backLabel="Back to Blog"
      lastUpdated="January 22, 2025"
    >
      <PageMeta
        title={META.title}
        description={META.description}
        keywords={META.keywords}
        path={PATH}
        ogType="article"
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(
            buildArticleSchema({
              title: META.title,
              description: META.description,
              path: PATH,
              datePublished: DATE,
            })
          )}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(
            buildHowToSchema({
              name: META.title,
              description: META.description,
              steps: HOW_TO_STEPS,
            })
          )}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(
            buildBreadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Blog", path: "/blog" },
              { name: "Implement Deep Linking", path: PATH },
            ])
          )}
        </script>
        <script type="application/ld+json">{JSON.stringify(buildFaqSchema(FAQS))}</script>
      </Helmet>

      <p>
        Implementing deep linking correctly ensures users land on the right content every time—on
        Android App Links, iOS Universal Links, and web fallbacks. However, Android and iOS handle
        deep links differently, making cross-platform support challenging without a unified platform
        that also covers the uninstalled and deferred cases.
      </p>
      <p>
        This step-by-step guide walks through what each OS requires, a practical checklist you can
        ship against, common failure modes, and how{" "}
        <Link to="/deep-linking-platform">Deeplink</Link> consolidates routing so you maintain one
        link model instead of two fragile implementations. For conceptual background, see{" "}
        <Link to="/blog/what-is-deep-linking">what deep linking is</Link>.
      </p>

      <h2>How Does Deep Linking Work on Android?</h2>
      <p>
        Android uses App Links: HTTPS URLs associated with your app through Digital Asset Links
        verification. When verification succeeds, tapping a matching URL can open your app directly
        instead of showing a disambiguation dialog. Your manifest declares intent filters for the
        host and paths you own, and your activity (or navigation layer) parses the incoming intent
        data to route to the correct screen.
      </p>
      <p>In practice, Android deep linking depends on:</p>
      <ul>
        <li>Verified domains via assetlinks.json</li>
        <li>Correct intent filters for scheme, host, and path patterns</li>
        <li>Automatic app opening when verification is healthy</li>
        <li>In-app handling that maps paths and query params to navigation</li>
      </ul>
      <p>
        Misconfigured asset links are a frequent production issue. Always confirm the JSON is served
        over HTTPS without unexpected redirects, and re-check after package name or signing key
        changes. Platform docs and SDK setup steps are covered in the{" "}
        <a href={DOCS_URL} target="_blank" rel="noopener noreferrer">
          Deeplink documentation
        </a>
        .
      </p>

      <h2>How Does Deep Linking Work on iOS?</h2>
      <p>
        iOS uses Universal Links. You host an Apple App Site Association (AASA) file over HTTPS,
        enable Associated Domains in your app entitlements, and handle the URL when the system opens
        your app. Universal Links are preferred over custom URL schemes alone because they are harder
        to spoof and integrate more cleanly with Safari and other apps.
      </p>
      <p>iOS deep linking typically requires:</p>
      <ul>
        <li>A valid Apple App Site Association (AASA) file</li>
        <li>HTTPS-only association (no insecure hosting shortcuts)</li>
        <li>Associated Domains entitlement matching your link domain</li>
        <li>App delegate or scene handling to navigate from the URL</li>
      </ul>
      <p>
        AASA caching and CDN quirks can make iOS debugging feel non-deterministic. After publishing
        association changes, test on a physical device, and avoid assuming Simulator behavior matches
        production. If you only validate the installed path, you will still miss deferred install
        failures that matter for acquisition.
      </p>

      <h2>Step-by-Step Implementation Checklist</h2>
      <p>
        Use the following checklist whether you are greenfield or migrating from a legacy link
        provider such as Firebase Dynamic Links. Keep{" "}
        <Link to="/deferred-deep-linking">deferred deep linking</Link> in scope from day one if any
        of your campaigns target users who do not yet have the app.
      </p>
      <ol className="list-decimal list-inside space-y-2">
        {HOW_TO_STEPS.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <p>
        Steps one through three establish OS trust. Step four creates the marketing and product
        surface area. Step five closes the install gap. Step six is where teams catch the bugs that
        unit tests cannot see—especially store redirects and first-open restoration.
      </p>

      <h2>What About Web Fallbacks and Desktop Clicks?</h2>
      <p>
        Not every click comes from a phone with your app installed. Desktop users, tablets, and
        in-app browsers all hit the same public URLs. A complete implementation defines a web
        fallback destination that still communicates the offer, and optionally prompts mobile users
        toward the store. Without fallbacks, shared links look broken outside your ideal device
        matrix.
      </p>
      <p>
        <Link to="/app-deep-links">App deep links</Link> should therefore be designed as
        multi-surface URLs: native when possible, useful on web otherwise, and deferred when install
        is required. That is the standard users already expect from mature consumer apps.
      </p>

      <h2>Why Do Deep Links Fail After Install?</h2>
      <p>
        Install interrupts context. The user clicks a campaign URL, leaves for the store, installs,
        and opens the app from the store icon—often without the original URL in hand. Unless you
        capture click intent server-side (or via a deferred deep linking platform) and restore it on
        first launch, the user lands on a generic home screen and the campaign promise is lost.
      </p>
      <p>
        This is why deferred deep linking is not optional for paid acquisition, referrals, and
        influencer programs. Product managers evaluating the business case can start with{" "}
        <Link to="/blog/deferred-deep-linking-for-product-managers">
          deferred deep linking for product managers
        </Link>
        . Teams migrating after the FDL shutdown should also review{" "}
        <Link to="/blog/firebase-dynamic-links-alternatives-2025">
          Firebase Dynamic Links alternatives in 2025
        </Link>
        .
      </p>

      <h2>Common Implementation Challenges</h2>
      <p>
        Even experienced mobile teams hit the same failure modes when deep linking is treated as a
        late-stage marketing add-on instead of platform work.
      </p>
      <ul>
        <li>Platform inconsistencies between Android verification and iOS AASA behavior</li>
        <li>Broken fallback behavior for desktop or unsupported devices</li>
        <li>App-not-installed scenarios that drop deferred context</li>
        <li>Attribution loss when UTMs are stripped or never restored</li>
        <li>Path mapping drift between marketing URLs and in-app routes</li>
        <li>Release process gaps when signing keys or bundle IDs change</li>
      </ul>
      <p>
        Mitigate these by owning a single source of truth for destinations, automating association
        file hosting where possible, and adding analytics alerts when destination match rates drop
        after a release.
      </p>

      <h2>How Deeplink Simplifies Implementation</h2>
      <p>
        <Link to="/deep-linking-platform">Deeplink</Link> provides a unified layer above OS-specific
        mechanics so growth and engineering share one link model:
      </p>
      <ul>
        <li>One unified link across Android, iOS, and web</li>
        <li>Automatic platform detection and redirection</li>
        <li>
          <Link to="/deferred-deep-linking">Deferred deep linking</Link> support for post-install
          restoration
        </li>
        <li>Web fallback handling for non-app contexts</li>
        <li>Dashboard link creation with paths, destinations, and campaign parameters</li>
        <li>Analytics to validate clicks, installs, and routing quality</li>
      </ul>
      <p>
        Instead of maintaining separate Android-only and iOS-only campaign systems, you configure the
        app once, create links centrally, and ship SDK initialization as part of your standard app
        bootstrap. Full API and SDK references are in the{" "}
        <a href={DOCS_URL} target="_blank" rel="noopener noreferrer">
          docs
        </a>
        .
      </p>

      <h2>Best Practices for Production Deep Links</h2>
      <ul>
        <li>Always include fallback URLs for web and unsupported environments</li>
        <li>Test across real devices, OS versions, and major in-app browsers</li>
        <li>Monitor link analytics for match rate regressions after every release</li>
        <li>Avoid hardcoded per-campaign routing logic inside the client</li>
        <li>Version your path schema so older links still resolve safely</li>
        <li>Document ownership between marketing, product, and mobile engineering</li>
      </ul>
      <p>
        Treat deep linking as a living system. New screens, rebrands, and package renames all
        invalidate old assumptions. A short pre-release checklist for association files and deferred
        first open prevents expensive campaign waste.
      </p>

      <FaqSection faqs={FAQS} />

      <h2>Conclusion</h2>
      <p>
        Using a dedicated deep linking platform saves time, reduces bugs, and ensures scalability
        across Android App Links and iOS Universal Links. Implement verified domains, define
        fallbacks, wire deferred restoration, and test both installed and uninstalled journeys before
        you scale spend.
      </p>
      <p>
        When those pieces are in place, deep links stop being a fragile special case and become
        reliable infrastructure for acquisition, onboarding, and retention.{" "}
        <Link to="/signup">Get started with Deeplink</Link> to ship the checklist above with one
        cross-platform URL model.
      </p>

      <div className="mt-12 pt-8 border-t border-border">
        <p className="font-semibold text-foreground mb-4">Simplify your deep linking implementation</p>
        <Link to="/signup">
          <Button variant="hero" size="lg" className="group">
            Get Started with Deeplink
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </LegalPageLayout>
  );
};
