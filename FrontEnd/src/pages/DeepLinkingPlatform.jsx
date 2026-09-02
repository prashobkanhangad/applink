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
  title: "Deep Linking Platform for Apps & Web",
  description:
    "Deeplink is a deep linking platform for Android, iOS, and web. Create smart links with deferred deep linking, store fallbacks, UTMs, and click-to-install analytics.",
  keywords:
    "deep linking platform, smart deep links, mobile deep linking, app deep links, URL redirection, deep link analytics",
};

const FAQS = [
  {
    question: "What is a deep linking platform?",
    answer:
      "A deep linking platform lets you create and manage URLs that open specific in-app or web content across Android, iOS, and desktop, with fallbacks when the app is not installed.",
  },
  {
    question: "Is Deeplink suitable for startups?",
    answer:
      "Yes. Deeplink is designed for startups, growing product teams, and enterprises that need reliable smart links, deferred deep linking, and analytics without a heavy enterprise sales process.",
  },
  {
    question: "Does Deeplink support Android and iOS?",
    answer:
      "Yes. Deeplink supports Android App Links and iOS Universal Links, plus web fallbacks so the same campaign URL works across platforms.",
  },
  {
    question: "Can I track clicks and installs?",
    answer:
      "Yes. The Deeplink dashboard and APIs report clicks, installs, and conversion metrics so you can measure which campaigns and links drive results.",
  },
  {
    question: "Do I need separate links for each platform?",
    answer:
      "No. One Deeplink URL can detect the device and route to the app, the store, or a web page based on your configuration.",
  },
  {
    question: "Is there a free plan?",
    answer:
      "Yes. Deeplink offers a free plan with monthly click limits so you can start building and testing before upgrading.",
  },
  {
    question: "How is Deeplink different from an MMP?",
    answer:
      "Mobile measurement partners focus on paid attribution suites. Deeplink focuses on developer-friendly deep linking, deferred routing, and link analytics you can ship without a multi-month MMP project.",
  },
];

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
        <script type="application/ld+json">{JSON.stringify(buildFaqSchema(FAQS))}</script>
      </Helmet>

      <p>
        Deeplink is a deep linking platform that connects users to the right content inside mobile
        apps and websites. Instead of dumping every click on a generic homepage, Deeplink routes
        people to a specific screen—or to the store and then that screen after install—across
        Android, iOS, and desktop. Smart deep links, deferred deep linking, fallbacks, and analytics
        are built for product, growth, and engineering teams that need reliable journeys without
        enterprise MMP complexity.
      </p>

      <h2>What Is a Deep Linking Platform?</h2>
      <p>
        A deep linking platform is infrastructure for creating, hosting, and measuring URLs that open
        specific in-app or web destinations. It typically handles platform detection, app-installed
        vs not-installed behavior, store redirects, web fallbacks, and optional attribution data such
        as UTM parameters.
      </p>
      <p>
        Without a platform, teams reinvent the same fragile logic for Android App Links, iOS
        Universal Links, asset link files, and post-install routing. A dedicated deep linking
        platform centralizes that work so marketing can ship campaigns while engineering keeps one
        integration path.
      </p>

      <h2>How Deeplink Works</h2>
      <ol className="list-decimal list-inside space-y-3 text-muted-foreground mb-4">
        <li>You create an app and links in the Deeplink dashboard (path, destination, UTMs).</li>
        <li>A user clicks a Deeplink URL from ads, email, SMS, referrals, or social.</li>
        <li>Deeplink detects device, OS, and whether the app can open the link.</li>
        <li>
          The user is routed to:
          <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
            <li>In-app content if the app is installed</li>
            <li>The app store if the app is not installed</li>
            <li>A web fallback on desktop or when configured</li>
          </ul>
        </li>
        <li>
          With{" "}
          <Link to="/deferred-deep-linking">deferred deep linking</Link>, first open after install
          can still land on the original destination.
        </li>
      </ol>

      <h2>Key Features</h2>
      <ul>
        <li>Smart deep links for iOS, Android, and web from one URL</li>
        <li>Automatic fallback routing to store or web</li>
        <li>
          <Link to="/app-deep-links">App deep links</Link> with Universal Links and App Links support
        </li>
        <li>Deferred deep linking through install to first open</li>
        <li>Link analytics for clicks, installs, and conversions</li>
        <li>UTM and campaign parameters on every link</li>
        <li>REST APIs, webhooks, and SDKs for product teams</li>
      </ul>

      <h2>Who Should Use a Deep Linking Platform?</h2>
      <p>
        Deep linking platforms are most valuable when multiple teams share the same mobile journeys:
      </p>
      <ul>
        <li>
          <strong className="text-foreground">Product managers</strong> improving onboarding and
          activation after install
        </li>
        <li>
          <strong className="text-foreground">Growth marketers</strong> running paid, referral, and
          influencer campaigns
        </li>
        <li>
          <strong className="text-foreground">Engineers</strong> who want one integration instead of
          bespoke link routers per channel
        </li>
      </ul>
      <p>
        If your app still sends every new user to the home screen after a campaign click, you are
        leaving conversion on the table.
      </p>

      <h2>Use Cases</h2>
      <ul>
        <li>App onboarding and first-session activation</li>
        <li>Marketing campaigns and paid acquisition</li>
        <li>Email and SMS promotions</li>
        <li>Referral and invite systems</li>
        <li>Product sharing (SKU, content, or profile links)</li>
        <li>Migration away from Firebase Dynamic Links</li>
      </ul>

      <h2>Deep Linking Platform vs Building In-House</h2>
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="text-left p-2 border-b border-border">Concern</th>
              <th className="text-left p-2 border-b border-border">In-house</th>
              <th className="text-left p-2 border-b border-border">Deeplink platform</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr>
              <td className="p-2 border-b border-border/60">Android + iOS verification</td>
              <td className="p-2 border-b border-border/60">You own assetlinks / AASA forever</td>
              <td className="p-2 border-b border-border/60">Configured once in the dashboard</td>
            </tr>
            <tr>
              <td className="p-2 border-b border-border/60">Deferred install routing</td>
              <td className="p-2 border-b border-border/60">Custom matching and edge cases</td>
              <td className="p-2 border-b border-border/60">Built-in deferred deep linking</td>
            </tr>
            <tr>
              <td className="p-2 border-b border-border/60">Campaign analytics</td>
              <td className="p-2 border-b border-border/60">Pipe into your own warehouse</td>
              <td className="p-2 border-b border-border/60">Dashboard clicks / installs</td>
            </tr>
            <tr>
              <td className="p-2">Time to first campaign</td>
              <td className="p-2">Weeks to months</td>
              <td className="p-2">Hours to days with docs + SDK</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Why Choose Deeplink?</h2>
      <ul>
        <li>Simple setup with clear documentation</li>
        <li>Developer-friendly APIs and SDKs</li>
        <li>Reliable redirection and fallbacks</li>
        <li>Transparent plans, including a free tier</li>
        <li>Built for startups and scale-ups, not only enterprise MMP buyers</li>
      </ul>
      <p>
        Read the{" "}
        <a href={DOCS_URL} target="_blank" rel="noopener noreferrer">
          Deeplink documentation
        </a>{" "}
        for SDK setup, or compare options in our{" "}
        <Link to="/blog/firebase-dynamic-links-alternatives-2025">
          Firebase Dynamic Links alternatives
        </Link>{" "}
        guide.
      </p>

      <FaqSection faqs={FAQS} />

      <h2>Learn More</h2>
      <p>
        Continue with <Link to="/deferred-deep-linking">deferred deep linking</Link>,{" "}
        <Link to="/app-deep-links">app deep links for Android &amp; iOS</Link>, and{" "}
        <Link to="/blog/what-is-deep-linking">what is deep linking</Link>.
      </p>

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
