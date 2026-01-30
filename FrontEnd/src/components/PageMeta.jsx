import { Helmet } from "react-helmet-async";

const SITE_URL = import.meta.env.VITE_APP_URL || "https://deeplink.in";
const SITE_NAME = "Deeplink";
const DEFAULT_IMAGE = `${SITE_URL.replace(/\/$/, "")}/og-image.png`;

/**
 * PageMeta – per-page title, description, Open Graph, and Twitter Card meta tags.
 * @param {string} title - Page title
 * @param {string} description - Meta description
 * @param {string} path - Path for canonical and og:url
 * @param {string} [keywords] - Optional meta keywords
 * @param {string} [image] - Optional og:image URL
 * @param {string} [imageAlt] - Optional og:image:alt
 * @param {string} [ogDescription] - Optional override for og:description (defaults to description)
 * @param {string} [twitterDescription] - Optional override for twitter:description (defaults to description)
 * @param {boolean} [noIndex] - Set true to add noindex
 */
export function PageMeta({
  title,
  description,
  path = "/",
  keywords,
  image = DEFAULT_IMAGE,
  imageAlt,
  ogDescription,
  twitterDescription,
  noIndex = false,
}) {
  const base = SITE_URL.replace(/\/$/, "");
  const url = path === "/" || !path ? base : `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const fullTitle = (title.includes("|") || title.includes("–")) ? title : `${title} | ${SITE_NAME}`;
  const ogDesc = ogDescription ?? description;
  const twDesc = twitterDescription ?? description;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={url} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={ogDesc} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      {imageAlt && <meta property="og:image:alt" content={imageAlt} />}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={twDesc} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
