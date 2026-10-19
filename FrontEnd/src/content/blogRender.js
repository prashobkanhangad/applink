/** Blog payload shared by the prerender and the hydrated page. */

export function readBlogRenderData() {
  if (globalThis.__PRERENDER_BLOG_DATA__) return globalThis.__PRERENDER_BLOG_DATA__;
  if (typeof window !== "undefined" && window.__BLOG_DATA__) return window.__BLOG_DATA__;
  return null;
}
