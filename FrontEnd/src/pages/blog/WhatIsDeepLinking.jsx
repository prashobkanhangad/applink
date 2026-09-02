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
} from "../../utils/seoSchema";
import { DOCS_URL } from "../../constants/publicSite";

const PATH = "/blog/what-is-deep-linking";
const DATE = "2025-01-15";

const META = {
  title: "What Is Deep Linking? A Complete Guide with Real App Examples",
  description:
    "Learn what deep linking is, how it works, and see real examples from e-commerce, food delivery, and fintech apps. Improve engagement and conversions.",
  keywords:
    "what is deep linking, deep link examples, app deep links, mobile deep linking, universal links",
};

const FAQS = [
  {
    question: "What is deep linking?",
    answer:
      "Deep linking is a technique that opens a specific screen or piece of content inside a mobile app or website from a URL, instead of always landing on the home page.",
  },
  {
    question: "What is the difference between a deep link and a deferred deep link?",
    answer:
      "A deep link works when the app is already installed. A deferred deep link preserves the destination through install so the user still reaches that content on first open.",
  },
  {
    question: "Do deep links work on both Android and iOS?",
    answer:
      "Yes. Android uses App Links and iOS uses Universal Links. Platforms like Deeplink help you manage both with one URL and web fallbacks.",
  },
  {
    question: "Why do marketers use deep links?",
    answer:
      "Deep links reduce friction in campaigns, referrals, and product shares—users land closer to conversion, which improves engagement and attribution.",
  },
  {
    question: "What happens if the app is not installed?",
    answer:
      "A well-configured deep link falls back to the web, an app store listing, or a deferred flow that restores the destination after install. Without that routing, users often lose context.",
  },
];

export const WhatIsDeepLinking = () => {
  return (
    <LegalPageLayout
      title="What Is Deep Linking? A Complete Guide with Real App Examples"
      backHref="/blog"
      backLabel="Back to Blog"
      lastUpdated="January 15, 2025"
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
            buildBreadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Blog", path: "/blog" },
              { name: "What Is Deep Linking?", path: PATH },
            ])
          )}
        </script>
        <script type="application/ld+json">{JSON.stringify(buildFaqSchema(FAQS))}</script>
      </Helmet>

      <p>
        Deep linking is a technique that allows users to land directly on specific content inside a
        mobile app or website from a single URL. Instead of opening a homepage and forcing people to
        search again, a deep link routes them to the exact product, profile, offer, or screen they
        expected—improving experience, engagement, and conversions across marketing and product flows.
      </p>
      <p>
        For product, growth, and engineering teams, deep linking is foundational infrastructure. It
        connects ads, email, SMS, referrals, QR codes, and web content to native app destinations,
        and it determines whether campaign intent survives the install journey. This guide explains
        what deep linking is, how it works on Android and iOS, real app examples, and how platforms
        like <Link to="/deep-linking-platform">Deeplink</Link> simplify cross-platform routing.
      </p>

      <h2>What Is Deep Linking?</h2>
      <p>
        A deep link is a URL that points to a specific destination inside an app or site—not just the
        root domain. When the app is installed and domain verification is configured correctly, the
        operating system can open that destination natively. When it is not installed, the same URL
        should still resolve usefully: to a web page, an app store listing, or a{" "}
        <Link to="/deferred-deep-linking">deferred deep link</Link> that restores context after
        install.
      </p>
      <p>Common destinations include:</p>
      <ul>
        <li>A product page or SKU detail screen</li>
        <li>A user profile, chat thread, or content item</li>
        <li>A checkout, pricing, or signup screen with parameters applied</li>
        <li>A campaign landing path with UTM and offer metadata</li>
      </ul>
      <p>
        In practice, teams publish one short or branded URL and let a deep linking platform handle
        platform detection, store redirects, and fallbacks. That is the difference between a raw
        custom scheme and a production-grade <Link to="/app-deep-links">app deep link</Link>.
      </p>

      <h2>How Does Deep Linking Work?</h2>
      <p>
        At a high level, the OS and your associated domain files decide whether a URL opens in the
        app or in a browser. Android uses verified App Links with Digital Asset Links. iOS uses
        Universal Links with an Apple App Site Association (AASA) file served over HTTPS. Your app
        then reads the incoming path and query parameters and navigates to the matching screen.
      </p>
      <p>
        A dedicated platform sits in front of that complexity. It hosts verified domains, creates
        links with destinations and metadata, redirects users based on device and install state, and
        records clicks for analytics. For a step-by-step implementation path, see{" "}
        <Link to="/blog/how-to-implement-deep-linking-android-ios">
          how to implement deep linking on Android and iOS
        </Link>
        . Technical setup details also live in the{" "}
        <a href={DOCS_URL} target="_blank" rel="noopener noreferrer">
          Deeplink docs
        </a>
        .
      </p>

      <h2>Real App Examples of Deep Linking</h2>
      <p>
        Abstract definitions are easier to remember with concrete product journeys. The examples
        below show why deep links outperform homepage landings for conversion.
      </p>

      <h3>E-commerce App</h3>
      <p>
        A shopper taps a product link from Instagram, email, or a retargeting ad. With deep linking,
        the app opens on the product detail page—size selectors, price, and reviews already in view.
        Without it, the same user lands on the home feed, searches again, and often abandons. For
        catalogs with thousands of SKUs, that lost context is a direct conversion tax.
      </p>

      <h3>Food Delivery App</h3>
      <p>
        A restaurant promotion link should open the restaurant page (or a pre-filled cart for a
        featured meal) rather than the city-wide discovery home. Deep links also carry promo codes
        and geo parameters so marketing can measure which creative drove the order. During peak
        hours, reducing even one extra tap materially improves completion rates.
      </p>

      <h3>Fintech App</h3>
      <p>
        A referral link opens the signup screen with the referral code pre-filled and attributed to
        the inviter. That removes friction, reduces support tickets about missing codes, and makes
        referral ROI measurable. The same pattern applies to KYC resume links, statement downloads,
        and card activation flows where context must survive across channels.
      </p>

      <h2>What Are the Types of Deep Linking?</h2>
      <p>
        Teams usually talk about several related capabilities. Understanding the differences helps
        you choose the right behavior for each campaign.
      </p>
      <ul>
        <li>
          <strong>Basic deep links</strong> — Open a specific in-app destination when the app is
          already installed (often via custom schemes or verified HTTPS links).
        </li>
        <li>
          <strong>Deferred deep links</strong> — Preserve destination and parameters through the app
          store install so first open still lands on the intended content. See{" "}
          <Link to="/blog/deferred-deep-linking-for-product-managers">
            deferred deep linking for product managers
          </Link>
          .
        </li>
        <li>
          <strong>Universal Links (iOS)</strong> — HTTPS links associated with your app via AASA,
          preferred for security and reliability over legacy custom URL schemes alone.
        </li>
        <li>
          <strong>Android App Links</strong> — Verified HTTPS links with intent filters and
          assetlinks.json so Android can open your app without an ambiguous chooser when possible.
        </li>
      </ul>

      <h2>Why Does Deep Linking Matter for Growth?</h2>
      <p>
        Deep linking is not a cosmetic UX tweak. It changes funnel math. Users who land closer to
        the promised content convert more often, complain less, and are easier to attribute. Marketers
        can run channel experiments with cleaner destination URLs. Product teams can personalize first
        sessions. Engineers avoid maintaining brittle per-channel redirect logic.
      </p>
      <ul>
        <li>Reduces friction between click and destination</li>
        <li>Improves conversion rates on ads, email, and referrals</li>
        <li>Boosts retention by improving first-session relevance</li>
        <li>Enables seamless, measurable marketing campaigns</li>
        <li>Supports web-to-app continuity for users who start on mobile web</li>
      </ul>
      <p>
        After Firebase Dynamic Links shut down, many teams also treated deep linking as a migration
        and platform decision. If you are evaluating replacements, read{" "}
        <Link to="/blog/firebase-dynamic-links-alternatives-2025">
          Firebase Dynamic Links alternatives in 2025
        </Link>
        .
      </p>

      <h2>What Happens When the App Is Not Installed?</h2>
      <p>
        The uninstalled path is where many naive implementations fail. A bare custom scheme may do
        nothing useful. A store redirect without deferred context sends new users to a generic home
        screen after install. Production systems combine store routing, optional web fallbacks, and
        deferred deep linking so intent survives. That is especially important for paid acquisition,
        influencer links, and viral referrals where most clickers are not yet users.
      </p>

      <h2>How Deeplink Simplifies Deep Linking</h2>
      <p>
        <Link to="/deep-linking-platform">Deeplink</Link> is built to give product-led teams one URL
        that works across Android, iOS, and web. Instead of hand-rolling platform detection and
        association files for every campaign, you configure destinations once and let the platform
        handle routing, fallbacks, and measurement.
      </p>
      <p>
        <Link to="/deep-linking-platform">Deeplink</Link> handles:
      </p>
      <ul>
        <li>Platform detection and smart redirection</li>
        <li>App availability checks and store routing</li>
        <li>Web fallbacks when the app is unavailable</li>
        <li>Secure routing with verified domain association</li>
        <li>Deferred deep linking for install-time journeys</li>
        <li>Click and install analytics for campaign visibility</li>
      </ul>
      <p>
        Teams typically start in the dashboard, create links with paths and parameters, then wire the
        SDK or install tracking APIs. Developer documentation is available at{" "}
        <a href={DOCS_URL} target="_blank" rel="noopener noreferrer">
          docs.deeplink.in
        </a>
        , and you can{" "}
        <Link to="/signup">create a free account</Link> to test flows on real devices.
      </p>

      <FaqSection faqs={FAQS} />

      <h2>Conclusion</h2>
      <p>
        Deep linking is no longer optional. It is core infrastructure for modern apps that acquire
        users through links—ads, content, referrals, and product shares. When every important URL can
        open the right screen on Android, iOS, and web (and recover after install), campaigns become
        more measurable and product journeys feel intentional instead of accidental.
      </p>
      <p>
        If you are defining deep linking for the first time, start with clear destinations, verified
        domains, fallbacks, and deferred behavior for high-intent acquisition. Then scale with a
        platform so engineering is not reinventing routing for every channel.
      </p>

      <div className="mt-12 pt-8 border-t border-border">
        <p className="font-semibold text-foreground mb-4">Start building with Deeplink</p>
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
