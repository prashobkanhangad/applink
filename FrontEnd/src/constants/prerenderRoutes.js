/**
 * Public marketing routes to prerender into static HTML at build time.
 * Blog post routes are fetched dynamically from the API in prerender.mjs;
 * these are the base static routes.
 */
export const PRERENDER_ROUTES = [
  '/',
  '/about',
  '/signup',
  '/privacy',
  '/terms',
  '/cookies',
  '/sitemap',
  '/deep-linking-platform',
  '/deferred-deep-linking',
  '/app-deep-links',
  '/blog',
  '/affiliate',
];

/**
 * Known blog slugs (used as fallback if the API is unreachable during build).
 * The prerender script also fetches live slugs from /api/v1/blog.
 */
export const KNOWN_BLOG_SLUGS = [
  'firebase-dynamic-links-alternatives-2025',
  'what-is-deep-linking',
  'deferred-deep-linking-for-product-managers',
  'how-to-implement-deep-linking-android-ios',
];
