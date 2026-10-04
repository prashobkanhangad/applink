import { Helmet } from "react-helmet-async";
import { SITE_ORIGIN, TWITTER_SITE, defaultOgImageUrl } from "../constants/publicSite";

const SITE_NAME = "Deeplink";
const DEFAULT_IMAGE = defaultOgImageUrl();

/**
 * PageMeta – per-page title, description, Open Graph, and Twitter Card meta tags.
 * @param {string} title - Page title
 * @param {string} description - Meta description
 * @param {string} path - Path for canonical and og:url
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
  image = DEFAULT_IMAGE,
  imageAlt,
  ogDescription,
  twitterDescription,
  noIndex = false,
  ogType = "website",
}) {
  const base = SITE_ORIGIN;
  const url = path === "/" || !path ? `${base}/` : `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const fullTitle = /[|–—:]/.test(title) ? title : `${title} | ${SITE_NAME}`;
  const ogDesc = ogDescription ?? description;
  const twDesc = twitterDescription ?? description;
  const twitterHandle = TWITTER_SITE ? (TWITTER_SITE.startsWith("@") ? TWITTER_SITE : `@${TWITTER_SITE}`) : "";

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta
        name="robots"
        content={
          noIndex
            ? "noindex, nofollow"
            : "index, follow, max-image-preview:large, max-snippet:-1"
        }
      />

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={ogDesc} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content={ogType === "article" ? "1536" : "1024"} />
      <meta property="og:image:height" content={ogType === "article" ? "864" : "1024"} />
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
