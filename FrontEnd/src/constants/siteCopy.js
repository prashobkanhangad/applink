/**
 * Canonical host and the one-line product description.
 * www is canonical because deeplink.in 307s to www.deeplink.in in production.
 * The same description is used in the footer, Open Graph, JSON-LD, and llms.txt.
 */

export const CANONICAL_ORIGIN = "https://www.deeplink.in";

export const PRODUCT_DESCRIPTION =
  "Create deep links that open the right screen in your app or site. Deferred deep linking, universal links, Android App Links and click analytics.";

export const HOME_TITLE =
  "Deeplink: Deep Links, Deferred Deep Links & Link Analytics";

/** Indexable marketing routes. Titles are unique. Homepage title and description are fixed. */
export const MARKETING_PAGES = [
  {
    path: "/",
    title: HOME_TITLE,
    description: PRODUCT_DESCRIPTION,
    changefreq: "weekly",
    priority: "1.0",
  },
  {
    path: "/features",
    title: "Deeplink Features: Smart Links, Routing and Analytics",
    description:
      "See what Deeplink does today: one link for Android, iOS, and web, deferred deep linking, Universal Links, App Links, UTMs, and click analytics.",
    changefreq: "monthly",
    priority: "0.9",
  },
  {
    path: "/pricing",
    title: "Deeplink Pricing: Free Plan and Paid Click Limits",
    description:
      "Deeplink includes a free plan and paid plans with monthly click limits. Review how pricing is shown and what is still unpublished as static HTML.",
    changefreq: "weekly",
    priority: "0.9",
  },
  {
    path: "/guides",
    title: "Deep Linking Guides from Deeplink",
    description:
      "Plain-language guides to deep linking, deferred deep linking, Universal Links, Android App Links, WhatsApp campaigns, and QR code links.",
    changefreq: "weekly",
    priority: "0.9",
  },
  {
    path: "/compare",
    title: "Deeplink Capabilities Compared with Other Tools",
    description:
      "A factual list of Deeplink capabilities. Competitor cells stay blank until each claim is verified. No rankings or unsupported comparisons.",
    changefreq: "monthly",
    priority: "0.6",
  },
  {
    path: "/free-qr-code-generator",
    title: "Free QR Code Generator | Track Scans with Deeplink",
    description:
      "Create a free QR code PNG for any URL. For scan tracking, deep linking, and install analytics, create a Deeplink smart link and encode that URL.",
    changefreq: "weekly",
    priority: "0.9",
  },
  {
    path: "/deep-link-tester",
    title: "Free Deep Link Tester | Inspect URLs with Deeplink",
    description:
      "Paste a deep link to inspect scheme, host, path, and UTMs. Open it in the browser, then create a Deeplink account for analytics and deferred routing.",
    changefreq: "weekly",
    priority: "0.9",
  },
  {
    path: "/about",
    title: "About Deeplink",
    description:
      "Deeplink builds smart deep linking and install attribution for mobile apps and the web. Learn our mission: one link that opens the right screen on Android, iOS, and web.",
    changefreq: "monthly",
    priority: "0.8",
  },
  {
    path: "/signup",
    title: "Sign Up",
    description:
      "Create your Deeplink account. Get started with deep linking and attribution in seconds. Sign in with Google.",
    changefreq: "monthly",
    priority: "0.9",
  },
  {
    path: "/deep-linking-platform",
    title: "Deep Linking Platform for Apps and Web",
    description:
      "Deeplink is a deep linking platform for Android, iOS, and web. Create smart links with deferred deep linking, store fallbacks, UTMs, and click-to-install analytics.",
    changefreq: "monthly",
    priority: "0.85",
  },
  {
    path: "/deferred-deep-linking",
    title: "Deferred Deep Linking for Mobile Apps",
    description:
      "Deferred deep linking preserves click intent through app install so users open the right screen on first launch. How it works on Android and iOS with Deeplink.",
    changefreq: "monthly",
    priority: "0.85",
  },
  {
    path: "/app-deep-links",
    title: "App Deep Links for Android and iOS",
    description:
      "App deep links open specific screens inside mobile apps. Learn Android App Links, iOS Universal Links, fallbacks, and how Deeplink unifies both platforms.",
    changefreq: "monthly",
    priority: "0.85",
  },
  {
    path: "/blog",
    title: "Blog – Deep Linking, Mobile Growth and App Marketing",
    description:
      "Articles on deep linking, deferred deep linking, Firebase Dynamic Links alternatives, and implementing deep links for Android and iOS.",
    changefreq: "daily",
    priority: "0.9",
  },
  {
    path: "/affiliate",
    title: "Affiliate Program — Earn 30% Recurring Commission | deeplink.in",
    description:
      "Join the deeplink.in affiliate program. Earn 30% recurring commission for 12 months on every paid customer you refer. Built for developers.",
    changefreq: "monthly",
    priority: "0.65",
  },
  {
    path: "/privacy",
    title: "Privacy Policy",
    description:
      "Deeplink's Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our deep linking platform and services.",
    changefreq: "yearly",
    priority: "0.5",
  },
  {
    path: "/terms",
    title: "Terms of Service",
    description:
      "Deeplink's Terms of Service govern your access to and use of our website, APIs, SDKs, and deep linking services. Read our terms and conditions.",
    changefreq: "yearly",
    priority: "0.5",
  },
  {
    path: "/cookies",
    title: "Cookie Policy",
    description:
      "Deeplink's Cookie Policy explains how we use cookies and similar technologies on our website and services. Learn about cookie types and your choices.",
    changefreq: "yearly",
    priority: "0.5",
  },
  {
    path: "/sitemap",
    title: "Sitemap",
    description:
      "Find all pages and sections on Deeplink. Browse product, guide, legal, and account pages.",
    changefreq: "monthly",
    priority: "0.4",
  },
];

export function marketingMeta(path) {
  const page = MARKETING_PAGES.find((entry) => entry.path === path);
  if (!page) {
    throw new Error(`No marketing metadata for ${path}`);
  }
  return {
    title: page.title,
    description: page.description,
    path: page.path,
  };
}

export function countWords(value) {
  return String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}
