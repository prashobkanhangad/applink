/**
 * Homepage FAQ. Visible text and FAQPage JSON-LD must use this array unchanged.
 * Each answer is written to land in the 40–60 word range.
 */

export const HOME_FAQS = [
  {
    question: "What is a deep link?",
    answer:
      "A deep link is a URL that opens a specific screen or piece of content in a mobile app or on a website, instead of a generic home page. Teams use deep links from campaigns, email, QR codes, and messages. Deeplink (deeplink.in) creates these links and routes them to Android, iOS, or web.",
  },
  {
    question: "What is deferred deep linking?",
    answer:
      "Deferred deep linking stores the destination of a click when the app is not installed yet. The person can install from the store, and the original screen is still available on first open. Deeplink keeps that click intent so the first session does not start on a blank home screen.",
  },
  {
    question: "What is the difference between Universal Links and Android App Links?",
    answer:
      "Universal Links are Apple’s HTTPS links for iOS. A verified apple-app-site-association file lets the system open your app instead of Safari. Android App Links are the Android counterpart: verified HTTPS links plus a Digital Asset Links file, so the app opens without a chooser dialog.",
  },
  {
    question: "How do I use deep links in WhatsApp or email campaigns?",
    answer:
      "Create one Deeplink URL, then paste it into the WhatsApp message, email, or SMS. Add UTM parameters in the dashboard if you want that campaign named in analytics. A tap opens the app screen when the app is installed, or the store or web fallback when it is not.",
  },
  {
    question: "What analytics does Deeplink provide?",
    answer:
      "Deeplink records clicks and installs for each link and computes a click-to-install conversion rate. Results can be split by location, platform, and device. Links accept UTM parameters so traffic from email, ads, QR codes, and messaging apps can be compared in the dashboard.",
  },
];
