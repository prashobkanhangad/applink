/** Product facts already present in the app. Do not add unverified metrics here. */

export const PRODUCT_FEATURES = [
  {
    title: "Universal deep links",
    description:
      "One link can route Android, iOS, and web visitors. The dashboard stores a path, a fallback URL, and optional UTM parameters.",
    href: "/app-deep-links",
  },
  {
    title: "Deferred deep linking",
    description:
      "If the app is not installed, the click can still lead to the original screen after install and first open.",
    href: "/deferred-deep-linking",
  },
  {
    title: "Click and install analytics",
    description:
      "The dashboard shows clicks, installs, and a click-to-install conversion rate, with location, platform, and device breakdowns.",
    href: "/guides/what-is-deep-linking",
  },
  {
    title: "Universal Links and App Links",
    description:
      "Deeplink serves the Apple App Site Association file and Digital Asset Links for the link domain so verified HTTPS links can open the app.",
    href: "/guides/universal-links-vs-app-links",
  },
  {
    title: "APIs, webhooks, and SDKs",
    description:
      "Links can be managed from the dashboard or the REST API. The product also documents webhooks and SDKs.",
    href: "https://docs.deeplink.in/",
  },
  {
    title: "Custom domains and QR codes",
    description:
      "Links are hosted on a chottu.link subdomain or a verified custom domain. The link screen can generate a QR code for that URL.",
    href: "/guides/qr-code-deep-links",
  },
];

export const HOW_IT_WORKS_STEPS = [
  {
    title: "Create the link",
    description:
      "In the dashboard or API, set the path, the web fallback URL, and any UTM parameters. Android package details and iOS bundle details are stored on the app when you configure them.",
  },
  {
    title: "Share the URL",
    description:
      "Put the same URL in an ad, an email, a WhatsApp message, or a QR code. The link is served on your chottu.link subdomain or on a custom domain you have verified.",
  },
  {
    title: "Route the tap",
    description:
      "Deeplink looks at the device. If the app can open the link, the person goes to the in-app destination. If not, they go to the store or the fallback URL you configured.",
  },
  {
    title: "Read the result",
    description:
      "Clicks and installs are recorded for the link, along with a click-to-install conversion rate. UTM parameters stay attached so you can tell campaigns apart.",
  },
];

export const USE_CASES = [
  {
    title: "WhatsApp campaigns",
    description:
      "Paste a Deeplink URL into a WhatsApp message. The product does not add a separate WhatsApp integration; the message carries the same smart link you use everywhere else. Add UTMs if you want those taps labeled in analytics.",
    href: "/guides/deep-links-whatsapp-campaigns",
    linkLabel: "How to use deep links in WhatsApp campaigns",
  },
  {
    title: "QR codes",
    description:
      "The link screen in the dashboard can generate a QR code that encodes the link URL. Print or display that code, and the scan opens the same routing path as a tap.",
    href: "/guides/qr-code-deep-links",
    linkLabel: "How QR code deep links work",
  },
  {
    title: "Email",
    description:
      "Use the link as the button or text URL in an email. Recipients who already have the app can land on the intended screen. Others hit the store or the web fallback.",
    href: "/guides/deferred-deep-linking",
    linkLabel: "Read the deferred deep linking guide",
  },
  {
    title: "Ads",
    description:
      "Use one campaign URL in an ad so clicks, and installs when they are recorded, stay tied to that link. Name the campaign with UTM parameters in the dashboard.",
    href: "/guides/what-is-deep-linking",
    linkLabel: "What is deep linking?",
  },
];
