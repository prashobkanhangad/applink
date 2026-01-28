import { Helmet } from "react-helmet-async";

const SITE_URL = import.meta.env.VITE_APP_URL || "https://deeplink.io";
const SITE_NAME = "DeepLink";
const DEFAULT_IMAGE = `${SITE_URL}/logo_deeplink.png`;

/**
 * PageMeta – per-page title, description, Open Graph, and Twitter Card meta tags.
 * @param {string} title - Page title (e.g. "Home | DeepLink")
 * @param {string} description - Meta description
 * @param {string} path - Path for canonical and og:url (e.g. "/", "/about")
 * @param {string} [image] - Optional og:image URL
 * @param {boolean} [noIndex] - Set true to add noindex (e.g. dashboard)
 */
export function PageMeta({ title, description, path = "/", image = DEFAULT_IMAGE, noIndex = false }) {
  const base = SITE_URL.replace(/\/$/, "");
  const url = path === "/" || !path ? base : `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const fullTitle = title.includes("|") ? title : `${title} | ${SITE_NAME}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
