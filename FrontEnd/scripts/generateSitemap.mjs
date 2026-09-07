/**
 * Dynamic Sitemap Generator
 * Fetches all published blog posts from the API and writes sitemap.xml
 *
 * Usage (run after build or manually):
 *   node FrontEnd/scripts/generateSitemap.mjs
 *
 * Or from FrontEnd/:
 *   npm run generate:sitemap
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT = path.join(__dirname, "../public/sitemap.xml");
const SITE = "https://deeplink.in";
const API_BASE = process.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";
const TODAY = new Date().toISOString().split("T")[0];

/* ─── Static pages ──────────────────────────────────────────────────────────── */
const STATIC_PAGES = [
  { loc: "/",                       changefreq: "weekly",  priority: "1.0" },
  { loc: "/about",                  changefreq: "monthly", priority: "0.8" },
  { loc: "/signup",                 changefreq: "monthly", priority: "0.9" },
  { loc: "/deep-linking-platform",  changefreq: "monthly", priority: "0.85" },
  { loc: "/deferred-deep-linking",  changefreq: "monthly", priority: "0.85" },
  { loc: "/app-deep-links",         changefreq: "monthly", priority: "0.85" },
  { loc: "/blog",                   changefreq: "daily",   priority: "0.9" },
  { loc: "/affiliate",              changefreq: "monthly", priority: "0.65" },
  { loc: "/privacy",                changefreq: "yearly",  priority: "0.5" },
  { loc: "/terms",                  changefreq: "yearly",  priority: "0.5" },
  { loc: "/cookies",                changefreq: "yearly",  priority: "0.5" },
  { loc: "/sitemap",                changefreq: "monthly", priority: "0.6" },
];

/* ─── Fetch blog slugs from API ─────────────────────────────────────────────── */
async function fetchBlogPosts() {
  try {
    const res = await fetch(`${API_BASE}/blog?limit=500&page=1`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.posts || [];
  } catch (err) {
    console.warn(`[Sitemap] Could not fetch blog posts (${err.message}) — using only static pages`);
    return [];
  }
}

function urlEntry({ loc, lastmod, changefreq, priority }) {
  return `  <url>
    <loc>${SITE}${loc}</loc>
    <lastmod>${lastmod || TODAY}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

async function main() {
  const posts = await fetchBlogPosts();
  console.log(`[Sitemap] ${posts.length} blog post(s) fetched`);

  const staticEntries = STATIC_PAGES.map((p) =>
    urlEntry({ ...p, lastmod: TODAY })
  );

  const blogEntries = posts.map((p) => {
    const lastmod = p.datePublished
      ? new Date(p.datePublished).toISOString().split("T")[0]
      : TODAY;
    return urlEntry({
      loc: `/blog/${p.slug}`,
      lastmod,
      changefreq: "monthly",
      priority: "0.75",
    });
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticEntries, ...blogEntries].join("\n")}
</urlset>`;

  fs.writeFileSync(OUTPUT, xml, "utf8");
  console.log(`[Sitemap] ✅ Written ${staticEntries.length + blogEntries.length} URLs → public/sitemap.xml`);
}

main().catch((err) => { console.error(err); process.exit(1); });
