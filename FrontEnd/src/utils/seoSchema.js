import { SITE_ORIGIN } from "../constants/publicSite";

/**
 * Build FAQPage JSON-LD from [{ question, answer }].
 */
export function buildFaqSchema(faqs = []) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  };
}

/**
 * Build BlogPosting JSON-LD for blog posts.
 * Uses BlogPosting (more specific than Article) — preferred by Google for blog content.
 */
export function buildArticleSchema({
  title,
  description,
  path,
  datePublished,
  dateModified,
  authorName = "Deeplink Team",
  imageUrl,
  keywords,
  wordCount,
}) {
  const url = `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      "@type": "Organization",
      name: authorName,
      url: `${SITE_ORIGIN}/`,
      sameAs: [`${SITE_ORIGIN}/`],
    },
    publisher: {
      "@type": "Organization",
      name: "Deeplink",
      url: `${SITE_ORIGIN}/`,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_ORIGIN}/logo_dark.png`,
        width: 200,
        height: 60,
      },
    },
  };

  if (imageUrl) {
    schema.image = {
      "@type": "ImageObject",
      url: imageUrl,
      width: 1536,
      height: 864,
    };
  }
  if (keywords) schema.keywords = keywords;
  if (wordCount) schema.wordCount = wordCount;

  return schema;
}

/**
 * Build HowTo JSON-LD from numbered steps.
 */
export function buildHowToSchema({ name, description, steps = [] }) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    step: steps.map((text, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: `Step ${index + 1}`,
      text,
    })),
  };
}

/**
 * Build BreadcrumbList JSON-LD from [{ name, path }].
 */
export function buildBreadcrumbSchema(items = []) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_ORIGIN}${item.path === "/" ? "/" : item.path.startsWith("/") ? item.path : `/${item.path}`}`,
    })),
  };
}
