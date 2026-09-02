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
 * Build Article JSON-LD for blog posts.
 */
export function buildArticleSchema({
  title,
  description,
  path,
  datePublished,
  dateModified,
  authorName = "Deeplink Team",
}) {
  const url = `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
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
    },
    publisher: {
      "@type": "Organization",
      name: "Deeplink",
      url: `${SITE_ORIGIN}/`,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_ORIGIN}/logo_dark.png`,
      },
    },
  };
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
