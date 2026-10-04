import { CANONICAL_ORIGIN, PRODUCT_DESCRIPTION } from "./siteCopy.js";

/** Public marketing site URLs — keep OG image path in sync with `index.html` and `/public`. */
export const SITE_ORIGIN = (import.meta.env.VITE_APP_URL || CANONICAL_ORIGIN).replace(
  /\/$/,
  ""
);

export { PRODUCT_DESCRIPTION };

export const DOCS_URL = "https://docs.deeplink.in/";
export const CALENDLY_DEMO_URL = "https://calendly.com/deeplink-info/30min";
export const SUPPORT_EMAIL = "info@deeplink.in";

/**
 * Organization sameAs URLs that exist in the repo.
 * TODO: [fact needed] official LinkedIn, X, and GitHub profile URLs.
 */
export const SOCIAL_SAME_AS = [
  "https://docs.deeplink.in",
];

/** Twitter / X handle without @ — leave empty until the official account is confirmed. */
export const TWITTER_SITE = "";

/** Open Graph / Twitter default image (file in `FrontEnd/public`) */
export const DEFAULT_OG_IMAGE_PATH = "/og-image.png";

export const defaultOgImageUrl = () => `${SITE_ORIGIN}${DEFAULT_OG_IMAGE_PATH}`;
