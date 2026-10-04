import { countWords } from "../constants/siteCopy.js";

const published = "2026-10-04";

/**
 * Long-form guides. Word count is the visible article body.
 * Product claims are limited to behavior implemented in this repo.
 */
export const GUIDES = [
  {
    slug: "what-is-deep-linking",
    title: "What is deep linking?",
    description:
      "A deep link is a URL that opens a specific screen in an app or on a website. Learn how routing, fallbacks, and deferred deep linking fit together.",
    datePublished: published,
    directAnswer:
      "Deep linking is the use of a URL to open a specific screen inside a mobile app or on a website, instead of always landing on a home page. If the app is missing, the same URL should still resolve to a store listing or a web page. Deeplink (deeplink.in) hosts and routes those links.",
    sections: [
      {
        heading: "A link that names the screen",
        paragraphs: [
          "A normal website URL already deep links the web. The path /pricing opens pricing, not the homepage, because the server and the router agree on what that path means. Mobile deep linking applies the same idea to an installed app. The operating system has to decide whether a tap stays in the browser or hands the URL to an app that has proved it owns the domain.",
          "Two older patterns still show up in apps. A custom scheme such as myapp://product/42 can open an installed app, but another app can register the same scheme, and a scheme does nothing useful in a desktop email client that does not know the app. HTTPS links avoid that ambiguity when the phone has verified the association between the domain and the app. That verification is what iOS calls Universal Links and Android calls App Links.",
          "The destination is whatever the product treats as addressable: a product, a chat, a password reset, an offer, or a web fallback with the same path. Parameters on the URL can carry a campaign name or an item id. If those parameters are stripped before the app opens, the screen may still open while the measurement is lost. Keeping the original URL intact is part of making the link trustworthy.",
        ],
      },
      {
        heading: "What happens on a tap",
        paragraphs: [
          "A person taps the link in a browser, an email, a message, or a camera app that understands QR codes. The phone looks at the domain. If an app is installed and the domain association is valid, the app opens and receives the URL. The app, or a library it embeds, maps that URL onto a screen. If no app can claim the domain, the link loads as a normal web page or follows a redirect the link host configured.",
          "That branch is why teams bother with a deep linking platform instead of only publishing a website. The website can be the fallback, the store can be the fallback, and the app can be the preferred target, all from one URL. Deeplink stores a path and a fallback URL on the link, and it serves the association files for the link domain so Android and iOS can verify the app.",
          "Links created in this product are hosted on a subdomain of chottu.link, or on a custom domain after that domain is verified. The marketing site at www.deeplink.in is not the host that redirects campaign clicks. Campaign URLs use the link domain configured for the app.",
        ],
      },
      {
        heading: "When the app is not installed",
        paragraphs: [
          "A deep link that only works for people who already have the app fails the first session of a new user. The usual web fallback is a page on your site, or a redirect to the App Store or Google Play. Deferred deep linking adds another step: remember the URL that was clicked, and after the install, open that destination on first launch. Without that memory, the install succeeds and the campaign context does not.",
          "Deeplink’s deferred path is there so the click can survive the store. The dashboard and API also record clicks and installs for the link and compute a click-to-install conversion rate. Location, platform, and device breakdowns are part of the analytics already shown in the product. That is measurement of the link, not a promise about revenue or retention.",
        ],
      },
    ],
    steps: [
      {
        title: "Decide the destination",
        text: "Pick the in-app screen and the web fallback URL. If the screen needs an id, put it in the path or the query string.",
      },
      {
        title: "Create the link",
        text: "In the Deeplink dashboard or REST API, save the path, the fallback URL, and any UTM parameters you want on the campaign.",
      },
      {
        title: "Configure the app",
        text: "Add the Android package name and SHA-256 fingerprints, and the iOS bundle id and team id, so the association files match the binaries you ship.",
      },
      {
        title: "Share and check analytics",
        text: "Use the link in the channel you care about. Confirm clicks, and installs when they occur, on that link in the dashboard.",
      },
    ],
    table: {
      caption: "Common URL behaviors",
      headers: ["Situation", "What the person should get"],
      rows: [
        ["App installed and domain verified", "The app opens on the intended screen"],
        ["App not installed", "The store or the configured web fallback"],
        ["Desktop browser", "The web fallback, unless you have a desktop app that claims the domain"],
        ["App installed after the click", "The original destination, if deferred deep linking is in place"],
      ],
    },
    example: {
      heading: "Example",
      text: "A link hosted at https://your-app.chottu.link/product/42, or on a verified custom domain with the same path, is one URL. The path identifies the product. The fallback URL is the web page you stored for people who do not open the app. Replace your-app with the subdomain configured for that app. This is a pattern from how Deeplink builds link hosts, not a live customer URL.",
    },
    faqs: [
      {
        question: "Is a deep link the same as a website URL?",
        answer:
          "On the web, a URL that opens a specific page is already a deep link. On mobile, the same HTTPS URL can also open an app when the operating system has a verified association for that domain. A custom scheme can open an app too, but it does not behave like a normal link in email and on the desktop web.",
      },
      {
        question: "Do I need a separate link for Android and iOS?",
        answer:
          "Not with Deeplink. One URL is stored for the campaign. The app record holds Android package details and iOS bundle details, and the link host serves the association files those platforms check. The web fallback is the same URL’s safety net when neither app opens.",
      },
    ],
  },
  {
    slug: "deferred-deep-linking",
    title: "What is deferred deep linking?",
    description:
      "Deferred deep linking keeps the clicked destination through an app install so the first open still lands on that screen. How the flow works and what Deeplink records.",
    datePublished: published,
    directAnswer:
      "Deferred deep linking keeps a link’s destination when the app is not installed yet. The person installs from the store, and the first open still routes to the content they clicked. A normal deep link only works if the app is already installed. Deeplink (deeplink.in) stores that click so the first session can resume it.",
    sections: [
      {
        heading: "Why the store drops context",
        paragraphs: [
          "A campaign click and an app install are two different events. The click happens in a browser or another app. The install happens in the App Store or Google Play. Those stores do not, by themselves, hand your original URL to the binary on first launch. If you only redirect to the store, the app opens on its default home screen and the product, offer, or invite that motivated the install is gone.",
          "Deferred deep linking is the glue between those events. Something that saw the click has to recognize the new install and pass the original destination into the first session. The match might use a store referrer on Android, a device-side handshake, or another method the SDK implements. The user-visible result is the same: first open continues the journey instead of restarting it.",
          "This matters for invites, abandoned carts, passwordless flows, and any ad that promised a specific screen. It does not replace onboarding. It only restores the address the person already chose. If the destination itself requires an account the person does not have, the app still has to handle that state after it receives the URL.",
        ],
      },
      {
        heading: "How a Deeplink click is remembered",
        paragraphs: [
          "You create a link with a path and a fallback URL. Someone without the app taps it. Deeplink can send them to the store or to the web fallback you configured. The click is stored against that link so a later first open can be tied back to it. The product copy in this codebase describes that path as preserving click intent through install to first open, including install-referrer and matching flows where those are available.",
          "After the app is opened, the SDK or API resolution is what turns the stored click into a destination the app can navigate to. The public docs at docs.deeplink.in are the integration reference for that call. This guide does not invent SDK method names beyond what the marketing site and dashboard already describe: create the link, route the tap, and read clicks and installs afterward.",
          "Analytics then shows the click, the install when one is recorded, and a click-to-install conversion rate. You can split those numbers by location, platform, and device. UTM parameters saved on the link tell you which campaign the click belonged to. That is the measurement available in the dashboard today.",
        ],
      },
      {
        heading: "What deferred deep linking is not",
        paragraphs: [
          "It is not a guarantee that every install will match. People switch devices, wait days, or install from a search that never touched your link. A match rate below 100 percent is normal, and this site does not publish a match-rate number. TODO: [fact needed] the match method Deeplink uses on each platform, and any published match window, if the team wants that stated on this page.",
          "It is also not a substitute for domain verification. Universal Links and Android App Links still decide whether an installed app opens immediately, before any store visit. Deferred deep linking is the path for the person who has to install first. Both behaviors belong on the same URL so you do not maintain one link for customers and another for prospects.",
        ],
      },
    ],
    steps: [
      {
        title: "Create the link before the campaign",
        text: "Set the path, fallback URL, and UTMs. Confirm the app record has the Android package and iOS bundle details you actually ship.",
      },
      {
        title: "Send new users through that URL",
        text: "Do not send prospects to a bare store listing if you need the original screen. The store visit should start from the Deeplink URL so the click exists.",
      },
      {
        title: "Resolve the destination on first open",
        text: "Integrate the SDK or the documented resolve call so the first session reads the stored destination and navigates to it.",
      },
      {
        title: "Compare clicks and installs",
        text: "Use the link analytics to see clicks, installs, and the click-to-install rate for that campaign.",
      },
    ],
    table: {
      caption: "Deep link versus deferred deep link",
      headers: ["", "App already installed", "App not installed"],
      rows: [
        ["Deep link only", "Opens the screen", "Store or web page, context often lost after install"],
        ["Deferred deep link", "Opens the screen", "Store or web page, then the original screen on first open"],
      ],
    },
    example: {
      heading: "Example",
      text: "An email promotes a single order status URL on your link domain. A customer who already has the app opens the order. A customer who does not have the app installs it, and the first open still requests that order path because the click was stored. If the order requires a login, the app shows login and then the order. The link does not create the account.",
    },
    faqs: [
      {
        question: "Does deferred deep linking work on Android and iOS?",
        answer:
          "Yes. Deeplink supports deferred deep linking on both. Android can use the install referrer where that signal is available. iOS uses the matching flow the SDK provides, because Apple does not give a public install-referrer equivalent. Test both with a real device that does not already have the app.",
      },
      {
        question: "What should I measure?",
        answer:
          "Start with clicks, installs, and the click-to-install conversion rate on the link. Add UTM parameters so each campaign is distinct. A destination match after first open is the product question deferred deep linking is meant to answer. TODO: [fact needed] whether the dashboard exposes a separate match-rate metric beyond click-to-install.",
      },
    ],
  },
  {
    slug: "universal-links-vs-app-links",
    title: "What is the difference between Universal Links and Android App Links?",
    description:
      "Universal Links and Android App Links are the verified HTTPS deep links for iOS and Android. Compare the association files and how Deeplink serves them.",
    datePublished: published,
    directAnswer:
      "Universal Links are Apple’s verified HTTPS links for iOS. Android App Links are Google’s verified HTTPS links for Android. Each platform checks a file on your domain before it will open the app instead of the browser. Deeplink (deeplink.in) serves those files for the link domain and stores the app ids the files must contain.",
    sections: [
      {
        heading: "Same idea, different files",
        paragraphs: [
          "Both systems start from an HTTPS URL. The phone will not open an app for that URL until it has fetched a signed statement that the app owner controls the domain. On iOS the statement is the apple-app-site-association file, often called the AASA file. On Android it is assetlinks.json, the Digital Asset Links statement. Custom URL schemes skip this check, which is why they are easier to spoof and harder to use from the web.",
          "iOS looks up the AASA file for the domain, typically at /.well-known/apple-app-site-association, and compares it with the Associated Domains entitlement in the app. The file lists the team id and the bundle id. If they match, a tap on that domain can open the app. The file is JSON and must be served without a redirect that breaks Apple’s fetch.",
          "Android looks up /.well-known/assetlinks.json. The statement includes the package name and the SHA-256 certificate fingerprints of the signing key. The app’s intent filters declare the hosts and paths it handles, and android:autoVerify tells the system to check the statement. When verification succeeds, the link opens the app without a disambiguation dialog.",
        ],
      },
      {
        heading: "What Deeplink configures",
        paragraphs: [
          "The API process serves both files. Requests to /.well-known/assetlinks.json and /.well-known/apple-app-site-association are handled by the backend so each link domain can publish the apps configured for it. In the dashboard, an Android app is stored with a package name and SHA-256 fingerprints. An iOS app is stored with a bundle id and an Apple team id. Those are the values the association files have to agree with.",
          "The link itself still has a path and a fallback URL. Verification only answers “may this app open this domain?” The path answers “which screen?” The fallback answers “where does the browser go if the app does not open?” You need all three. Verification without a path mapping dumps people on the app home screen. A path without verification leaves them on the website even when the app is installed.",
          "Link hosts are a chottu.link subdomain or a custom domain you verify. The association files have to be reachable on the host that appears in the campaign URL. Pointing the AASA file at www.deeplink.in does not verify a link that people actually tap on your-app.chottu.link or on your own domain.",
        ],
      },
      {
        heading: "Differences that affect testing",
        paragraphs: [
          "iOS caches the AASA file. After you change the file or the entitlement, an already installed build may keep the old decision until the system refreshes it. Android verification is tied to the install and to the signing certificate. A debug keystore and a Play App Signing key have different SHA-256 fingerprints. The dashboard has to list the fingerprint of the build you are testing, or auto-verify fails and the browser keeps the link.",
          "Neither file makes deferred deep linking happen by itself. They only cover the installed-app case. A phone without the app still needs the fallback and, if you want the screen after install, the deferred flow. Treat a successful Universal Link or App Link test and a successful first-open-after-install test as two separate checks.",
          "TODO: [fact needed] any extra path-pattern limits Deeplink writes into the AASA or asset links files, if the team wants those patterns documented beside the platform rules.",
        ],
      },
    ],
    steps: [
      {
        title: "Collect the app identifiers",
        text: "Android: application id and the SHA-256 of the key that signs the build you ship. iOS: bundle id and Apple team id, plus the Associated Domains entitlement for the link host.",
      },
      {
        title: "Save them on the Deeplink app",
        text: "Enter those values in the dashboard so the generated association files match the binaries.",
      },
      {
        title: "Confirm the files on the link host",
        text: "Fetch /.well-known/apple-app-site-association and /.well-known/assetlinks.json on the domain you put in campaigns. They should return JSON, not an HTML error page.",
      },
      {
        title: "Tap a real link on a device",
        text: "Install the matching build, tap an HTTPS link to that host, and confirm the app opens. Then repeat with the app uninstalled to see the fallback.",
      },
    ],
    table: {
      caption: "Universal Links and Android App Links",
      headers: ["", "iOS Universal Links", "Android App Links"],
      rows: [
        ["Association file", "apple-app-site-association", "assetlinks.json"],
        ["Identity in the file", "Team id and bundle id", "Package name and SHA-256 fingerprints"],
        ["App-side setting", "Associated Domains entitlement", "Intent filter with autoVerify"],
        ["If verification fails", "Link stays in Safari or the in-app browser", "A chooser or the browser handles the link"],
      ],
    },
    example: {
      heading: "Example",
      text: "You ship com.example.shop signed by a Play app signing key, and an iOS app with bundle id com.example.shop under team ABCDE12345. Both ids are saved on the Deeplink app. A campaign uses https://go.example.com/product/42 on a verified custom domain. iOS opens the app only if the AASA on go.example.com lists ABCDE12345.com.example.shop. Android opens the app only if assetlinks.json lists com.example.shop and that signing certificate’s SHA-256.",
    },
    faqs: [
      {
        question: "Can one HTTPS link serve both platforms?",
        answer:
          "Yes. Universal Links and Android App Links are both HTTPS. One host can publish both association files, and one path can be the campaign URL. Deeplink is built so that host is the link domain for the app, with both files generated from the ids you stored.",
      },
      {
        question: "Why does the link open the website even though the app is installed?",
        answer:
          "The usual causes are a missing or mismatched association file, an entitlement or intent filter that names a different host, or an Android fingerprint for the wrong keystore. Fetch the well-known files on the exact host in the URL and compare them with the installed build. A custom scheme can still open the app when HTTPS verification has not succeeded, but that is a separate link.",
      },
    ],
  },
  {
    slug: "deep-links-whatsapp-campaigns",
    title: "How do I use deep links in WhatsApp or email campaigns?",
    description:
      "Use one Deeplink URL in WhatsApp, email, and SMS. How taps are routed, how to label the campaign with UTMs, and what this product does not add for WhatsApp.",
    datePublished: published,
    directAnswer:
      "Paste one Deeplink URL into the WhatsApp message, email, or SMS. Deeplink does not ship a separate WhatsApp API. The tap uses the same link as any other channel: the app opens when it can, otherwise the person gets the store or the web fallback you saved. Add UTM parameters on the link so the campaign is labeled in analytics.",
    sections: [
      {
        heading: "WhatsApp is a channel, not a special integration",
        paragraphs: [
          "WhatsApp sends people to whatever HTTPS URL you put in the message. There is no extra Deeplink product surface for WhatsApp templates, the WhatsApp Business API, or click-to-chat widgets in this codebase. If you need those, they belong to your messaging tool. The part Deeplink owns is the URL itself: where it is hosted, how it routes, and the clicks and installs recorded against it.",
          "That is still enough for a campaign. Write the message, put the link on the call to action, and send it. People who have the app and a verified domain association can land in the app. People who do not have the app follow the fallback. If deferred deep linking is integrated, the first open after install can still reach the path you put in the link.",
          "Email and SMS work the same way. A button href and a texted URL are both just the link. Some email clients open links in an in-app browser. Universal Links and App Links can still take over when the association is valid, but a client that rewrites or wraps the URL can break that handoff. Send a test to the same clients your audience uses, on iOS and Android.",
        ],
      },
      {
        heading: "Label the campaign with UTMs",
        paragraphs: [
          "The dashboard lets you store UTM parameters on a link. Use them to name the source, medium, and campaign, for example a WhatsApp broadcast versus an email. Analytics can then show clicks and installs for that link instead of one undifferentiated total. Do not create a different routing path only to measure a channel. Keep the destination stable and change the UTM values, or create a second link that shares the destination and carries different UTMs, if you need the numbers split.",
          "The click-to-install conversion rate is installs divided by clicks for the data the dashboard already aggregates. It is not an email open rate and it is not a WhatsApp read receipt. Those metrics stay in the tool that sent the message. Deeplink sees the tap that hit the link host.",
          "TODO: [fact needed] whether UTM values are echoed into the in-app destination automatically, or only stored for analytics. The dashboard collects them on the link. This page does not claim they appear inside the app screen unless the path or query string you chose already includes them.",
        ],
      },
      {
        heading: "What to put in the message",
        paragraphs: [
          "Use the full HTTPS URL of the link host, not the homepage of www.deeplink.in and not a custom scheme, if you want the message to look like a normal link and to fall back on the web. A chottu.link subdomain or a verified custom domain are the hosts this product configures. A custom domain is easier to read in a chat. Verification of that domain is required before you should trust it as the campaign host.",
          "Say what will open. “Track your order” is a true statement only if the path you created maps to that order screen and the app handles a logged-out visitor. The link cannot collect a WhatsApp phone number by itself. If you need the phone number, your own form or the messaging platform has to ask for it.",
          "QR codes are the same URL in another wrapper. If the WhatsApp campaign and a printed code should be measured separately, give them different UTM parameters or different links. The routing rules do not have to change.",
        ],
      },
    ],
    steps: [
      {
        title: "Create the link with a fallback",
        text: "Set the in-app path and a web fallback that makes sense if the app does not open. Add utm_source, utm_medium, and utm_campaign for this send.",
      },
      {
        title: "Paste the HTTPS URL into the message",
        text: "In WhatsApp, email, or SMS, use that URL as the only destination. Do not point the button at the store if you still want deferred routing.",
      },
      {
        title: "Send a device test",
        text: "Tap it with the app installed and with the app deleted. On the deleted-app pass, install and confirm the first open if you rely on deferred deep linking.",
      },
      {
        title: "Read clicks and installs",
        text: "Check the link in analytics after the send. Compare channels by the UTM values, not by guessing from the message text.",
      },
    ],
    table: {
      caption: "Where the link goes in a message",
      headers: ["Channel", "What you put in the message", "What Deeplink adds"],
      rows: [
        ["WhatsApp", "The HTTPS link URL", "Routing, fallback, click and install analytics"],
        ["Email", "The same URL on the button or text", "The same routing and analytics"],
        ["SMS", "The same URL", "The same routing and analytics"],
        ["WhatsApp Business API", "TODO: [fact needed] no in-product connector is documented", "Only the URL, if your tool can send one"],
      ],
    },
    example: {
      heading: "Example",
      text: "A restock note says “Your size is back” and links to https://shop.example.com/product/42?utm_source=whatsapp&utm_medium=message&utm_campaign=restock. shop.example.com is a verified custom domain on the Deeplink app. The fallback URL is the same product on the website. Recipients with the app open the product screen. Others get the website or the store, and installs that come back to the link show up beside the clicks.",
    },
    faqs: [
      {
        question: "Does Deeplink integrate with WhatsApp directly?",
        answer:
          "No WhatsApp Business API integration is present in this product. You paste a Deeplink HTTPS URL into the message your team or your messaging tool sends. Routing and analytics start when that URL is tapped. Template approval, opt-in, and delivery receipts stay with WhatsApp or the tool you use to send.",
      },
      {
        question: "Should email and WhatsApp share one link?",
        answer:
          "They can share the destination and even the same URL. If you need separate click counts, store different UTM parameters or create two links that point at the same path and fallback. The app does not need a second integration for the second channel.",
      },
    ],
  },
  {
    slug: "qr-code-deep-links",
    title: "How do QR code deep links work?",
    description:
      "A QR code deep link is a Deeplink URL encoded as a QR image. The dashboard can generate that image. Scanning uses the same routing as a tap.",
    datePublished: published,
    directAnswer:
      "A QR code deep link is a Deeplink URL encoded as a QR image. Scanning it opens the app when the app and domain association allow it, or the store or web fallback when they do not. Deeplink (deeplink.in) generates that image from the link in the dashboard. The code is not a different kind of link.",
    sections: [
      {
        heading: "The code is only an encoding of the URL",
        paragraphs: [
          "A QR code stores text. For deep linking, that text should be the HTTPS URL of the campaign link, including the path and any UTM parameters you care about. The camera app or a scanner reads the text and opens it as a link. From that moment the behavior is identical to a tap in email or WhatsApp. There is no separate “QR protocol” in iOS or Android for deep links.",
          "Because the URL is the product, a code printed last month keeps working when you change routing only if the URL itself still resolves. If you need to change the destination, change the link the URL points at, or print a new code for a new URL. A code cannot be edited after it is printed. The link host can still change where that URL goes, as long as you keep serving that exact URL.",
          "The dashboard link screen generates a QR image for the link once a path is entered. It encodes the link domain plus the path. You can download a larger PNG from that screen. The image is produced for the URL you already created. It does not create a different destination.",
        ],
      },
      {
        heading: "Print and placement",
        paragraphs: [
          "Use the HTTPS URL, not a custom scheme. A scheme may fail in camera apps that only open web links. Use a host people can also type if the code is damaged: a verified custom domain is easier to read than a long subdomain. The association files for Universal Links and Android App Links must be on that same host, or installed apps will not take over from the camera.",
          "Leave quiet space around the code, print it large enough for the distance people will scan from, and keep contrast high. Those are printing constraints, not Deeplink settings. A code on a glossy screen or a moving vehicle fails for optical reasons even when the URL is correct. Test a scan with the app installed and with the app removed, in the lighting you expect.",
          "If the same poster and an email should be measured separately, encode different UTM parameters or use two links. The QR image will differ because the URL text differs. Routing can still share a path and a fallback.",
        ],
      },
      {
        heading: "Analytics and deferred opens",
        paragraphs: [
          "A successful scan that opens the URL is a click on that link. Installs attributed to the link, and the click-to-install rate, show up in the same analytics as any other channel. The dashboard does not know the scan came from paper unless you labeled the link with UTMs such as a source or campaign name you choose. There is no automatic “this was a poster” field.",
          "Deferred deep linking still applies. Someone who scans the code without the app can install and reach the original path on first open, if that integration is in place. Someone who already has the app should hit the Universal Link or App Link path and skip the store. Test both. A scan that only opens a website means verification failed or the URL in the code is not the verified host.",
          "TODO: [fact needed] whether the QR download should be mentioned as a supported public feature in docs, and the image dimensions the team wants cited. The dashboard currently requests a QR image for the link URL and offers a PNG download.",
        ],
      },
    ],
    steps: [
      {
        title: "Create the link first",
        text: "Set the path, fallback, and UTMs that identify this placement, such as a poster or a package insert.",
      },
      {
        title: "Generate the QR image",
        text: "On the link screen, use the generated QR code for that path and download the PNG if you need a file.",
      },
      {
        title: "Scan it on a phone",
        text: "Confirm the camera opens the URL, the installed app takes over when verification is valid, and the uninstalled path hits the fallback.",
      },
      {
        title: "Check the link report",
        text: "After the codes are in the world, clicks and installs for that URL are the usage signal. UTMs distinguish this placement from other uses of a similar path.",
      },
    ],
    table: {
      caption: "What a scan can do",
      headers: ["Scanner result", "Likely cause"],
      rows: [
        ["App opens on the right screen", "URL is the verified link host and the app maps the path"],
        ["Website or store opens", "App missing, or domain verification failed"],
        ["Nothing opens", "The image is unscannable, or the text is not a URL"],
        ["Wrong campaign in analytics", "The code encoded a different URL or different UTMs than you think"],
      ],
    },
    example: {
      heading: "Example",
      text: "A table tent encodes https://go.example.com/menu?utm_source=qr&utm_medium=print&utm_campaign=table. go.example.com is the verified custom domain. The fallback is the web menu. A guest with the app lands in the menu screen. A guest without the app sees the website. The next day, the link report shows clicks tagged with that campaign. Replacing the tent with a new offer means a new path or a new URL, then a new image, because the printed code cannot change.",
    },
    faqs: [
      {
        question: "Does Deeplink generate the QR code?",
        answer:
          "Yes. The dashboard link screen builds a QR image from the link domain and path and can download a PNG. The code contains that URL only. Scanning does not use a different router than a tap on the same URL.",
      },
      {
        question: "Can I change the destination after printing?",
        answer:
          "You can change where that exact URL routes only if the link host still serves that URL and you edit the link behind it. You cannot change the text inside a code that is already printed. If the URL itself must change, print a new code. Confirm the edit on a phone before you rely on old paper.",
      },
    ],
  },
];

export function guidePath(guide) {
  return `/guides/${guide.slug}`;
}

export function guideBodyText(guide) {
  const parts = [guide.title, guide.directAnswer];
  for (const section of guide.sections) {
    parts.push(section.heading, ...section.paragraphs);
  }
  for (const step of guide.steps) {
    parts.push(step.title, step.text);
  }
  if (guide.table) {
    parts.push(guide.table.caption, ...guide.table.headers);
    for (const row of guide.table.rows) parts.push(...row);
  }
  if (guide.example) parts.push(guide.example.heading, guide.example.text);
  for (const faq of guide.faqs) parts.push(faq.question, faq.answer);
  return parts.filter(Boolean).join(" ");
}

export function guideWordCount(guide) {
  return countWords(guideBodyText(guide));
}
