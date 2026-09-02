/** Public marketing site URLs — keep OG image path in sync with `index.html` and `/public`. */
export const SITE_ORIGIN = (import.meta.env.VITE_APP_URL || "https://deeplink.in").replace(
  /\/$/,
  ""
);

export const DOCS_URL = "https://docs.deeplink.in/";
export const CALENDLY_DEMO_URL = "https://calendly.com/deeplink-info/30min";
export const SUPPORT_EMAIL = "info@deeplink.in";

/** Organization sameAs entity URLs for JSON-LD (add LinkedIn / X / GitHub when live). */
export const SOCIAL_SAME_AS = [
  "https://docs.deeplink.in",
];

/** Twitter / X handle without @ — leave empty until the official account is confirmed. */
export const TWITTER_SITE = "";

/** Open Graph / Twitter default image (file in `FrontEnd/public`) */
export const DEFAULT_OG_IMAGE_PATH = "/og-image.png";

export const defaultOgImageUrl = () => `${SITE_ORIGIN}${DEFAULT_OG_IMAGE_PATH}`;
