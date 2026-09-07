/**
 * Seed the 4 existing hardcoded blog posts into MongoDB.
 * Run with: node backend/scripts/seedBlog.js
 */
import "dotenv/config";
import mongoose from "mongoose";
import { BlogPost } from "../models/blog.model.js";

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || process.env.DB_URL;
if (!MONGODB_URI) {
  console.error("No MongoDB URI found. Set MONGODB_URI, DATABASE_URL, or DB_URL in .env");
  process.exit(1);
}

const posts = [
  {
    slug: "firebase-dynamic-links-alternatives-2025",
    title: "Firebase Dynamic Links Shutdown – Best Alternatives in 2025",
    excerpt:
      "Google shut down Firebase Dynamic Links in 2024. Learn why it was discontinued, what to look for in a replacement, and the best alternatives including Deeplink.",
    icon: "🔥",
    author: "Deeplink Team",
    tags: ["deep linking", "firebase", "migration"],
    status: "published",
    datePublished: new Date("2025-01-20"),
    readTime: "5 min read",
    metaTitle: "Firebase Dynamic Links Shutdown – Best Alternatives in 2025",
    metaDescription:
      "Google shut down Firebase Dynamic Links in 2024. Compare Deeplink, Branch, and AppsFlyer OneLink, and learn how to migrate deferred deep linking.",
    metaKeywords:
      "Firebase Dynamic Links alternative, Firebase Dynamic Links shutdown, deep linking platform, deferred deep linking migration",
    faqs: [
      {
        question: "When did Firebase Dynamic Links shut down?",
        answer:
          "Google announced the shutdown of Firebase Dynamic Links in 2024. Teams that depended on deferred deep linking and link routing needed to migrate to another platform.",
      },
      {
        question: "What is the best Firebase Dynamic Links alternative for startups?",
        answer:
          "Deeplink is a strong fit for startups and growing teams that need deferred deep linking, Android/iOS support, analytics, and developer-friendly APIs without enterprise sales friction.",
      },
      {
        question: "What features must a Firebase Dynamic Links replacement include?",
        answer:
          "Look for deferred deep linking, Android App Links and iOS Universal Links, web fallbacks, fast redirection, click/install analytics, and reliable scale.",
      },
      {
        question: "How long does migration from Firebase Dynamic Links take?",
        answer:
          "Most teams can migrate by auditing existing links, mapping destinations to the new platform, updating SDKs, and testing deferred flows—often days to a few weeks depending on link volume.",
      },
      {
        question: "Do I need an MMP to replace Firebase Dynamic Links?",
        answer:
          "Not necessarily. If your primary need is deep linking and deferred routing, a focused deep linking platform can replace FDL without adopting a full mobile measurement partner stack.",
      },
    ],
    content: `Google's decision to shut down Firebase Dynamic Links in 2024 left tens of thousands of mobile teams scrambling for a replacement. If your app relies on deferred deep linking—the mechanism that remembers where a user was trying to go before they installed your app—you need a robust alternative in place before your links stop working.

This guide covers why Firebase Dynamic Links was discontinued, what to look for in a replacement, and how the leading alternatives compare.

## Why Did Google Shut Down Firebase Dynamic Links?

Firebase Dynamic Links was a free product that provided deep linking and deferred deep linking for iOS and Android. Google officially announced its deprecation in mid-2024, citing strategic realignment across the Firebase product suite. The service stopped serving new dynamic links and existing links began failing.

For teams that had built marketing campaigns, onboarding flows, and referral programs around FDL, this created an urgent migration requirement. The challenge: deep linking infrastructure is invisible until it breaks, and when it does, conversion rates drop immediately.

## What to Look for in a Firebase Dynamic Links Alternative

Before evaluating options, define what you actually need:

- **Deferred deep linking** — the link must survive the App Store / Play Store install journey and restore the destination after first launch.
- **Android App Links and iOS Universal Links** — proper platform-verified link handling so the OS opens your app directly, without a browser interstitial.
- **Web fallback routing** — when the app is not installed, redirect to a web page, a store listing, or a custom landing page.
- **Click and install analytics** — attribution data to measure campaign performance.
- **Short link generation** — programmatic and manual link creation via API or dashboard.
- **Developer-friendly APIs and SDKs** — fast integration with your existing codebase.

## Best Firebase Dynamic Links Alternatives

### Deeplink

[Deeplink](https://deeplink.in) is purpose-built for teams that need reliable deferred deep linking, Android App Links, and iOS Universal Links without the overhead of a full MMP stack. It provides a REST API, dashboard-based link management, click analytics, and domain verification. Pricing is transparent and accessible for startups.

### Branch

Branch is the most widely deployed deep linking platform, used by large consumer apps. It offers deep linking, deferred routing, email and QR deep links, and attribution. Branch is a strong option for enterprise teams with a dedicated growth engineering budget.

### AppsFlyer OneLink

OneLink is part of the AppsFlyer mobile measurement platform. It is a good fit for teams already using AppsFlyer for attribution who want to consolidate their stack. It requires a full AppsFlyer contract and is priced accordingly.

### Adjust

Adjust's deep linking product is bundled into their measurement platform. Like AppsFlyer, it suits teams already committed to Adjust for attribution.

## Comparison at a Glance

| Feature | Deeplink | Branch | AppsFlyer OneLink |
|---|---|---|---|
| Deferred deep linking | Yes | Yes | Yes |
| Android App Links | Yes | Yes | Yes |
| iOS Universal Links | Yes | Yes | Yes |
| Dashboard | Yes | Yes | Yes |
| REST API | Yes | Yes | Yes |
| Attribution / MMP | No | Add-on | Yes (full MMP) |
| Startup pricing | Yes | Enterprise | Enterprise |

## How to Migrate from Firebase Dynamic Links

1. **Audit your existing FDL links.** Export all link patterns and destination mappings from the Firebase console.
2. **Choose a platform and set up domain verification.** For Android App Links and iOS Universal Links to work, you need to verify your domain. Platforms like Deeplink walk you through this.
3. **Update your mobile SDKs.** Replace the Firebase Dynamic Links SDK with the new platform's SDK in both your Android and iOS codebases.
4. **Recreate link patterns.** Map your FDL short links and parameters to the new platform's routing logic.
5. **Test deferred flows end-to-end.** Install the app fresh on a test device after clicking a deep link to confirm intent is correctly preserved.
6. **Update all your campaigns.** Replace FDL URLs in emails, push notifications, QR codes, and ads.

## The Bottom Line

The shutdown of Firebase Dynamic Links is an opportunity to upgrade to a platform built specifically for deep linking. If you're a startup or scaling team, Deeplink offers the core capabilities—deferred deep linking, App Links, Universal Links, and analytics—with developer-friendly pricing. Larger teams with attribution requirements may prefer Branch or AppsFlyer.

Don't wait. Every day your FDL links are live is a day closer to them failing entirely. Start your migration now.`,
  },
  {
    slug: "what-is-deep-linking",
    title: "What Is Deep Linking? A Complete Guide with Real App Examples",
    excerpt:
      "Deep linking lets users land directly on specific in-app content. Learn how it works, see real examples from e-commerce, food delivery, and fintech, and why it matters.",
    icon: "📘",
    author: "Deeplink Team",
    tags: ["deep linking", "guide", "mobile"],
    status: "published",
    datePublished: new Date("2025-01-15"),
    readTime: "6 min read",
    metaTitle: "What Is Deep Linking? A Complete Guide with Real App Examples",
    metaDescription:
      "Learn what deep linking is, how it works, and see real examples from e-commerce, food delivery, and fintech apps. Improve engagement and conversions.",
    metaKeywords:
      "what is deep linking, deep link examples, app deep links, mobile deep linking, universal links",
    faqs: [
      {
        question: "What is deep linking?",
        answer:
          "Deep linking is a technique that opens a specific screen or piece of content inside a mobile app or website from a URL, instead of always landing on the home page.",
      },
      {
        question: "What is the difference between a deep link and a universal link?",
        answer:
          "A deep link is the broad concept of linking to specific in-app content. A Universal Link is Apple's verified implementation that opens the app directly from a standard HTTPS URL—without a custom scheme or browser redirect.",
      },
      {
        question: "What is deferred deep linking?",
        answer:
          "Deferred deep linking is a variant where the destination is remembered even if the app is not yet installed. After the user installs the app, they are routed to the correct content on first launch.",
      },
      {
        question: "Why do deep links improve conversion rates?",
        answer:
          "Deep links reduce friction in campaigns, referrals, and product shares—users land closer to conversion, which improves engagement and attribution.",
      },
      {
        question: "What happens if the app is not installed?",
        answer:
          "A well-configured deep link falls back to the web, an app store listing, or a deferred flow that restores the destination after install. Without that routing, users often lose context.",
      },
    ],
    content: `Deep linking is a technique that allows users to land directly on specific content inside a mobile app or website from a single URL. Instead of opening a homepage and forcing people to search again, a deep link routes them to the exact product, profile, offer, or screen they expected—improving experience, engagement, and conversions across marketing and product flows.

For product, growth, and engineering teams, deep linking is foundational infrastructure. It connects ads, email, SMS, referrals, QR codes, and web content to native app destinations, and it determines whether campaign intent survives the install journey.

## What Is Deep Linking?

A deep link is a URL that points to a specific destination inside an app or site—not just the root domain. When the app is installed and domain verification is configured correctly, the operating system intercepts the URL and opens the app at the right screen.

On iOS, this is implemented via **Universal Links** (HTTPS URLs verified through Apple's App Site Association file). On Android, it uses **Android App Links** (HTTPS URLs verified through a Digital Asset Links file). Both mechanisms let standard HTTPS URLs open native app screens without custom URL schemes or redirects.

## Real App Examples

### E-commerce
A fashion retailer sends a promotional email with a link to a discounted jacket. The deep link opens the exact product page in their app, with the sale price already applied. Without deep linking, the link opens the home page and the user has to search again—losing the conversion.

### Food Delivery
A food delivery app lets users share their favourite restaurant. The share URL is a deep link that opens the restaurant page directly for recipients who have the app, or redirects to a web fallback for those who don't.

### Fintech
A banking app sends a push notification about a pending action. The notification contains a deep link that opens the specific account transaction screen, not just the home dashboard.

### Referrals
A ride-hailing app's referral program shares a deep link with a promo code embedded in the URL. The code is preserved even if the new user has to install the app first—this is deferred deep linking.

## Types of Deep Links

| Type | Description | App install required? |
|------|------------|----------------------|
| Basic deep link | Opens in-app content if app is installed | Yes |
| Universal Link (iOS) / App Link (Android) | Platform-verified HTTPS link | Yes |
| Deferred deep link | Preserves destination across install | No |
| Web deep link | Opens web content with smart app banner | No |

## Why Deep Linking Matters for Growth

Mobile campaigns without deep linking suffer a drop-off problem: users click an ad, go to an app store, install the app, and land on a generic home screen with no memory of what they originally wanted. Deep linking—especially the deferred variant—solves this.

Studies consistently show that deferred deep linking improves post-install conversion by 20–60% compared to links that simply open the app home screen. The improvement is largest in referral programs, paid campaigns, and email marketing where intent is highest at click time.

## How Deep Linking Works: Step by Step

1. A user clicks a deep link (in an ad, email, SMS, or QR code).
2. The operating system checks if the target app is installed.
3. If installed: the OS opens the app at the correct screen directly.
4. If not installed: the user is redirected to the appropriate app store.
5. For deferred flows: the platform stores the destination, and the app retrieves it on first launch after install.

## Implementing Deep Linking

Setting up deep links properly requires:
- Hosting an AASA (Apple App Site Association) file for iOS Universal Links.
- Hosting a Digital Asset Links file for Android App Links.
- Configuring your app to handle incoming deep link URLs and route to the correct screen.
- (Optionally) integrating a deep linking platform to manage links, analytics, and deferred routing centrally.

Platforms like [Deeplink](https://deeplink.in) handle the verification files, link management, analytics, and deferred routing so your team can focus on building product rather than deep link infrastructure.

## Conclusion

Deep linking is not a nice-to-have—it is table stakes for mobile growth. Every marketing channel, referral program, and re-engagement campaign performs better when links route users to the right content. Understanding how Universal Links, App Links, and deferred deep linking work together lets you build the kind of seamless cross-channel experience users expect.`,
  },
  {
    slug: "deferred-deep-linking-for-product-managers",
    title: "Deferred Deep Linking Explained for Product Managers",
    excerpt:
      "One of the biggest challenges in mobile growth is losing users during app installation. Deferred deep linking preserves user intent and improves conversion.",
    icon: "🔁",
    author: "Deeplink Team",
    tags: ["deferred deep linking", "product management", "mobile growth"],
    status: "published",
    datePublished: new Date("2025-01-18"),
    readTime: "5 min read",
    metaTitle: "Deferred Deep Linking Explained for Product Managers",
    metaDescription:
      "Deferred deep linking preserves user intent across app installs. Learn how it works, why it boosts conversion, and what product managers need to know.",
    metaKeywords:
      "deferred deep linking, mobile deep linking, user intent, app install conversion, deep link for product managers",
    faqs: [
      {
        question: "What is deferred deep linking?",
        answer:
          "Deferred deep linking is a mechanism that remembers where a user was trying to go before they had the app installed, and routes them to that exact destination on first launch after install.",
      },
      {
        question: "How is deferred deep linking different from a regular deep link?",
        answer:
          "A regular deep link only works when the app is already installed. A deferred deep link works even when the app is not installed—it stores the intent and resumes it after install.",
      },
      {
        question: "Why does deferred deep linking improve conversion rates?",
        answer:
          "When users land on a relevant screen after installing, they engage immediately rather than abandoning an unfamiliar home screen. Campaigns report 20–60% higher post-install conversion with deferred deep links.",
      },
      {
        question: "Does deferred deep linking work on both Android and iOS?",
        answer:
          "Yes. Both platforms support the mechanism, though the implementation details differ. iOS uses Universal Links via the App Store redirect flow; Android uses App Links via the Play Store redirect. Deep linking platforms like Deeplink handle both.",
      },
      {
        question: "Can deferred deep linking survive iOS app review?",
        answer:
          "Yes. Deferred deep linking uses standard HTTPS URLs and does not violate Apple App Store guidelines. It is widely used by major consumer apps and B2B products alike.",
      },
    ],
    content: `Every mobile product manager has seen this pattern: a user clicks a campaign link, gets redirected to the App Store, installs the app, and then opens a generic home screen with no memory of what they came for. The moment is lost. This is the problem deferred deep linking solves.

## What Is Deferred Deep Linking?

Deferred deep linking is a mechanism that stores the destination a user intended to reach before installing an app, and routes them to that exact destination on their very first launch.

Here's the flow:

1. A user clicks a deep link (from an ad, email, referral, or QR code).
2. The device detects the app is not installed.
3. The user is redirected to the App Store or Play Store.
4. The user installs and opens the app for the first time.
5. The app retrieves the stored destination and routes the user there immediately.

The key mechanism is a data store (usually a server-side lookup keyed by device fingerprint or a click ID) that bridges the gap between click and first launch.

## Why Product Managers Should Care

### Conversion and Activation

Post-install conversion is the metric most affected by deferred deep linking. When a user installs an app from a paid ad promoting a specific product, and they land on that product page instead of a home screen, the activation rate is measurably higher.

Referral programs are especially sensitive. A referred user who receives a personalised deep link—containing a promo code, a friend's profile, or a shared item—and lands on that exact content after install is far more likely to complete their first meaningful action.

### Attribution Accuracy

Deferred deep linking improves attribution. When the platform can connect the pre-install click to the post-install session, you get accurate source attribution without relying entirely on probabilistic matching. This makes ROAS calculations more reliable.

### Onboarding Personalisation

Some teams use deferred deep links to personalise onboarding. A user coming from a social campaign sees a different onboarding flow than a user from a paid search ad. The deep link carries context that the app can use to tailor the first-run experience.

## How It Works on iOS and Android

### iOS

On iOS, the flow uses Universal Links. When a user clicks a deep link and the app is not installed, they go to the App Store. After install, the app can retrieve the original click data via the deep linking platform's SDK on first launch.

Apple's SKAdNetwork and ATT changes in iOS 14+ have made device fingerprinting less reliable. Good platforms handle this by combining multiple signals and using click ID passthrough where possible.

### Android

Android's equivalent is Android App Links. The flow is similar: click → Play Store → install → first launch retrieves destination. Android's environment is generally more permissive for device identification, making deferred routing more reliable.

## Implementing Deferred Deep Linking

You can build this from scratch—but it requires maintaining server-side state, device fingerprinting, and SDK integrations on both platforms. Most product teams use a dedicated platform:

- **[Deeplink](https://deeplink.in)** — API-first, fast integration, supports both platforms, good for startups and growth teams.
- **Branch** — enterprise-grade, robust analytics, widely deployed.
- **AppsFlyer OneLink** — best for teams using AppsFlyer for attribution already.

## Key Metrics to Track

Once deferred deep linking is in place, track:

- **Deferred open rate** — percentage of installs that came via a deferred deep link.
- **Intent match rate** — percentage of deferred deep links that successfully routed to the correct destination.
- **Post-install conversion** — actions completed in the first session, segmented by deferred vs direct install.
- **Campaign-level attribution** — which campaigns produce deferred installs and how they convert.

## Conclusion

Deferred deep linking is one of the highest-leverage improvements a mobile product team can make. It closes the context gap that costs conversion on every paid, referral, and organic campaign that touches a user before they have your app. For product managers evaluating mobile growth infrastructure, it belongs in the same tier as push notifications and app store optimisation.`,
  },
  {
    slug: "how-to-implement-deep-linking-android-ios",
    title: "How to Implement Deep Linking in Android & iOS (Step-by-Step)",
    excerpt:
      "Android and iOS handle deep links differently. Learn the implementation steps, common challenges, and how a unified platform simplifies cross-platform support.",
    icon: "⚙️",
    author: "Deeplink Team",
    tags: ["implementation", "android", "ios", "deep linking"],
    status: "published",
    datePublished: new Date("2025-01-22"),
    readTime: "7 min read",
    metaTitle: "How to Implement Deep Linking in Android & iOS (Step-by-Step)",
    metaDescription:
      "Step-by-step guide to implementing Android App Links and iOS Universal Links, including AASA files, Digital Asset Links, and common pitfalls to avoid.",
    metaKeywords:
      "implement deep linking android, implement deep linking iOS, universal links, android app links, AASA file, digital asset links",
    faqs: [
      {
        question: "What is the difference between Android App Links and iOS Universal Links?",
        answer:
          "Both use standard HTTPS URLs that open native app content, but they are implemented differently. Android App Links use a Digital Asset Links JSON file at /.well-known/assetlinks.json. iOS Universal Links use an Apple App Site Association (AASA) file at /.well-known/apple-app-site-association.",
      },
      {
        question: "Do I need a custom domain for deep linking?",
        answer:
          "Yes. Both Android App Links and iOS Universal Links require a verified HTTPS domain where you host the .well-known verification files. You can use your own domain or a subdomain provided by a deep linking platform.",
      },
      {
        question: "What is the assetlinks.json file?",
        answer:
          "assetlinks.json is a JSON file hosted at https://yourdomain.com/.well-known/assetlinks.json. It declares the association between your domain and your Android app by listing your app's package name and SHA-256 certificate fingerprint.",
      },
      {
        question: "What is the Apple App Site Association file?",
        answer:
          "The AASA file is a JSON file hosted at https://yourdomain.com/.well-known/apple-app-site-association. It tells iOS which URL paths should open your app and links your Team ID and Bundle ID to the domain.",
      },
      {
        question: "Can I test deep links without publishing to the app store?",
        answer:
          "Yes. You can test Android App Links with adb commands and test iOS Universal Links via TestFlight or development builds, as long as the AASA file is correctly hosted and your bundle ID matches.",
      },
    ],
    content: `Deep linking on mobile requires platform-specific configuration. Android and iOS each have their own verification mechanism, and getting the details wrong means links silently fail—opening a browser instead of your app, or not opening at all. This guide walks through the exact steps for both platforms.

## Prerequisites

Before you start:
- A registered Android app (package name) and/or iOS app (Bundle ID + Team ID).
- A verified HTTPS domain where you can host files at the \`.well-known/\` path.
- Access to your app's signing keys.

## Part 1: Android App Links

### Step 1 – Create the Digital Asset Links file

Create a file at \`https://yourdomain.com/.well-known/assetlinks.json\`:

\`\`\`json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.yourcompany.yourapp",
    "sha256_cert_fingerprints": [
      "AA:BB:CC:DD:EE:FF:..."
    ]
  }
}]
\`\`\`

Get your SHA-256 fingerprint with:

\`\`\`bash
keytool -list -v -keystore your-release-key.jks -alias your-alias
\`\`\`

The file must be served with \`Content-Type: application/json\` and **no redirects** on the path.

### Step 2 – Configure intent filters in AndroidManifest.xml

\`\`\`xml
<activity android:name=".MainActivity">
  <intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data
      android:scheme="https"
      android:host="yourdomain.com"
      android:pathPrefix="/app" />
  </intent-filter>
</activity>
\`\`\`

The \`android:autoVerify="true"\` attribute triggers automatic domain verification on install.

### Step 3 – Handle the incoming intent

In your \`MainActivity\`:

\`\`\`kotlin
override fun onCreate(savedInstanceState: Bundle?) {
  super.onCreate(savedInstanceState)
  val action = intent.action
  val data = intent.data
  if (Intent.ACTION_VIEW == action && data != null) {
    handleDeepLink(data)
  }
}

private fun handleDeepLink(uri: Uri) {
  val path = uri.path ?: return
  // Route to the correct screen based on path
}
\`\`\`

### Step 4 – Verify

Use the Android Digital Asset Links verification tool:

\`\`\`
https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://yourdomain.com&relation=delegate_permission/common.handle_all_urls
\`\`\`

Expect \`complete: true\` in the response.

---

## Part 2: iOS Universal Links

### Step 1 – Create the Apple App Site Association file

Create \`https://yourdomain.com/.well-known/apple-app-site-association\` (no file extension):

\`\`\`json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAMID.com.yourcompany.yourapp",
        "paths": ["/app/*", "/share/*"]
      }
    ]
  }
}
\`\`\`

\`TEAMID\` is your 10-character Apple Developer Team ID. The file must be served over HTTPS with no redirect.

### Step 2 – Enable Associated Domains in Xcode

1. Open your project in Xcode.
2. Select your target → **Signing & Capabilities**.
3. Add **Associated Domains** capability.
4. Add entry: \`applinks:yourdomain.com\`

### Step 3 – Handle the URL in AppDelegate or SceneDelegate

\`\`\`swift
// SceneDelegate.swift
func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
  guard userActivity.activityType == NSUserActivityTypeBrowsingWeb,
        let url = userActivity.webpageURL else { return }
  handleDeepLink(url)
}

func handleDeepLink(_ url: URL) {
  let path = url.path
  // Route to the correct screen
}
\`\`\`

### Step 4 – Test

Use a TestFlight or development build. Open the link in Notes or Safari and tap it—it should open the app directly.

**Common iOS pitfall:** The AASA file is fetched by Apple's CDN at app install time, not at runtime. If you update the file, users need to reinstall or the OS needs to refresh it (which can take time). Always validate your AASA with the [AASA Validator](https://branch.io/resources/aasa-validator/) before submitting.

---

## Part 3: Handling Edge Cases

### App not installed fallback

Configure a fallback URL for when the app is not installed. This can be:
- An App Store / Play Store redirect.
- A marketing landing page with smart app banner.
- A web version of the content.

### Deferred deep linking

Neither Android App Links nor Universal Links natively support preserving context across an install. You need a server-side platform for this. When a user clicks your link and is redirected to the store, the platform stores their click data. Your SDK retrieves it on first launch and routes accordingly.

### Link in a WebView

Deep links clicked inside a WebView may not trigger the OS intent-handling mechanism. Configure your \`WebViewClient\` (Android) or \`WKNavigationDelegate\` (iOS) to intercept deep link URLs and route them appropriately.

---

## Using a Platform Instead of Building From Scratch

Building and maintaining AASA files, Digital Asset Links, deferred routing, and analytics across both platforms is a significant ongoing engineering investment. Platforms like [Deeplink](https://deeplink.in) provide:

- Managed hosting of AASA and assetlinks.json files.
- Deferred deep linking with server-side click storage.
- Dashboard for creating and managing links without code.
- Analytics per link and per campaign.
- REST API for programmatic link creation.

If your team's focus is product rather than infrastructure, using a dedicated platform is typically faster and more reliable than building the stack yourself.

---

## Summary

| Step | Android | iOS |
|------|---------|-----|
| Verification file | assetlinks.json at /.well-known/ | AASA at /.well-known/ |
| App configuration | intent-filter with autoVerify | Associated Domains capability |
| Code to handle | Intent data in Activity | NSUserActivity in Scene/AppDelegate |
| Deferred deep linking | Not native — requires SDK | Not native — requires SDK |

Getting these steps right takes a day or two of careful implementation. The reward is links that open the right screen in your app every time—no browser flash, no home-screen confusion.`,
  },
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  let created = 0;
  let skipped = 0;

  for (const data of posts) {
    const existing = await BlogPost.findOne({ slug: data.slug });
    if (existing) {
      console.log(`  ⏭  Skipping "${data.title}" — already exists`);
      skipped++;
      continue;
    }
    await BlogPost.create(data);
    console.log(`  ✅ Created "${data.title}"`);
    created++;
  }

  console.log(`\nDone. ${created} created, ${skipped} skipped.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
