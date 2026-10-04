import { SITE_ORIGIN, SOCIAL_SAME_AS, SUPPORT_EMAIL } from "../constants/publicSite";
import { PRODUCT_DESCRIPTION } from "../constants/siteCopy";

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
  authorName = "Deeplink",
  imageUrl,
  keywords,
  wordCount,
  type = "BlogPosting",
}) {
  const url = `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": type,
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
      sameAs: SOCIAL_SAME_AS,
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

const organizationId = `${SITE_ORIGIN}/#organization`;
const websiteId = `${SITE_ORIGIN}/#website`;

/**
 * Organization and WebSite in one @graph.
 * sameAs lists only profile URLs that exist in the repo.
 */
export function buildHomeGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: "Deeplink",
        url: `${SITE_ORIGIN}/`,
        description: PRODUCT_DESCRIPTION,
        email: SUPPORT_EMAIL,
        logo: {
          "@type": "ImageObject",
          "@id": `${SITE_ORIGIN}/#logo`,
          url: `${SITE_ORIGIN}/logo_dark.png`,
          contentUrl: `${SITE_ORIGIN}/logo_dark.png`,
          width: 1024,
          height: 350,
          caption: "Deeplink",
        },
        sameAs: SOCIAL_SAME_AS,
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: "Deeplink",
        url: `${SITE_ORIGIN}/`,
        description: PRODUCT_DESCRIPTION,
        publisher: { "@id": organizationId },
      },
    ],
  };
}

/**
 * SoftwareApplication for the marketing site.
 * Pass offers only when those prices are visible HTML on the page.
 */
export function buildSoftwareApplicationSchema(offers = []) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${SITE_ORIGIN}/#software`,
    name: "Deeplink",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: `${SITE_ORIGIN}/`,
    description: PRODUCT_DESCRIPTION,
    publisher: { "@id": organizationId },
  };

  if (offers.length) {
    schema.offers = offers;
  }

  return schema;
}

export function offersFromPlans(plans = []) {
  return plans.map((plan) => ({
    "@type": "Offer",
    name: plan.name,
    price: plan.price.replace("$", ""),
    priceCurrency: "USD",
    description: plan.description || plan.name,
    url: `${SITE_ORIGIN}/pricing`,
  }));
}
