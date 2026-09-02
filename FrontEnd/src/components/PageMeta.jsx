import { Helmet } from "react-helmet-async";
import { SITE_ORIGIN, TWITTER_SITE, defaultOgImageUrl } from "../constants/publicSite";

const SITE_NAME = "Deeplink";
const DEFAULT_IMAGE = defaultOgImageUrl();

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
 * @param {string} [ogType] - Open Graph type (website | article)
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
  ogType = "website",
}) {
  const base = SITE_ORIGIN;
  const url = path === "/" || !path ? base : `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const fullTitle = (title.includes("|") || title.includes("–")) ? title : `${title} | ${SITE_NAME}`;
  const ogDesc = ogDescription ?? description;
  const twDesc = twitterDescription ?? description;
  const twitterHandle = TWITTER_SITE ? (TWITTER_SITE.startsWith("@") ? TWITTER_SITE : `@${TWITTER_SITE}`) : "";

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={url} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
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
      {twitterHandle && <meta name="twitter:site" content={twitterHandle} />}
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={twDesc} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
