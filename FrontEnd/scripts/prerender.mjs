/**
 * Build-time HTML for marketing routes and published blog posts.
 * Uses React renderToString so CI does not need Chrome.
 */
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { CANONICAL_ORIGIN, HOME_TITLE, MARKETING_PAGES, PRODUCT_DESCRIPTION, SITEMAP_EXCLUDED_PATHS, countWords } from "../src/constants/siteCopy.js";
import { HOME_FAQS } from "../src/content/homeFaq.js";
import { GUIDES, guidePath, guideWordCount } from "../src/content/guides.js";
import { mapPlanFromDb } from "../src/content/pricingPlans.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const repoRoot = path.join(root, "..");
const distDir = path.join(root, "dist");

const PAGE_SOURCE = {
  "/": "FrontEnd/src/pages/Home.jsx",
  "/features": "FrontEnd/src/pages/Features.jsx",
  "/pricing": "FrontEnd/src/pages/PricingPage.jsx",
  "/guides": "FrontEnd/src/pages/guides/GuidesIndex.jsx",
  "/compare": "FrontEnd/src/pages/Compare.jsx",
  "/free-qr-code-generator": "FrontEnd/src/pages/FreeQrCodeGenerator.jsx",
  "/deep-link-tester": "FrontEnd/src/pages/DeepLinkTester.jsx",
  "/about": "FrontEnd/src/pages/About.jsx",
  "/login": "FrontEnd/src/pages/Signup.jsx",
  "/signup": "FrontEnd/src/pages/Signup.jsx",
  "/deep-linking-platform": "FrontEnd/src/pages/DeepLinkingPlatform.jsx",
  "/deferred-deep-linking": "FrontEnd/src/pages/DeferredDeepLinking.jsx",
  "/app-deep-links": "FrontEnd/src/pages/AppDeepLinks.jsx",
  "/blog": "FrontEnd/src/pages/Blog.jsx",
  "/affiliate": "FrontEnd/src/pages/Affiliate.jsx",
  "/privacy": "FrontEnd/src/pages/PrivacyPolicy.jsx",
  "/terms": "FrontEnd/src/pages/TermsOfService.jsx",
  "/cookies": "FrontEnd/src/pages/CookiePolicy.jsx",
  "/sitemap": "FrontEnd/src/pages/Sitemap.jsx",
};

function isoDay(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function gitDate(relativePath) {
  try {
    const out = execSync(`git log -1 --format=%cs -- ${relativePath}`, {
      cwd: repoRoot,
      encoding: "utf8",
    }).trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(out) ? out : null;
  } catch {
    return null;
  }
}

function routeToOutputPath(route) {
  if (route === "/") return path.join(distDir, "index.html");
  const clean = route.replace(/\/$/, "");
  return path.join(distDir, clean, "index.html");
}

/** Drop SSR animation start-states so crawlers see visible text. The client re-renders with motion. */
function visibleHtml(html) {
  return html.replace(/ style="opacity:0[^"]*"/g, "");
}

function toShell(html) {
  if (html.includes('<div id="root"></div>')) return html;
  const start = html.indexOf('<div id="root">');
  const endBody = html.lastIndexOf("</body>");
  if (start === -1 || endBody === -1 || start > endBody) {
    throw new Error("Could not recover an empty #root shell from dist/index.html. Run vite build first.");
  }
  return `${html.slice(0, start)}<div id="root"></div>\n  ${html.slice(endBody)}`;
}

function applyHead(template, head) {
  return template.replace(
    /<!--seo:start-->[\s\S]*?<!--seo:end-->/,
    `<!--seo:start-->\n${head}\n<!--seo:end-->`
  );
}

function extractJsonLd(html) {
  const blocks = [];
  const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  let match = re.exec(html);
  while (match) {
    blocks.push(JSON.parse(match[1]));
    match = re.exec(html);
  }
  return blocks;
}

function assertWordCounts() {
  for (const faq of HOME_FAQS) {
    const words = countWords(faq.answer);
    if (words < 40 || words > 60) {
      throw new Error(`Homepage FAQ "${faq.question}" is ${words} words (expected 40-60)`);
    }
  }
  if (HOME_TITLE.length < 50 || HOME_TITLE.length > 60) {
    throw new Error(`Homepage title is ${HOME_TITLE.length} characters`);
  }
  if (PRODUCT_DESCRIPTION.length < 140 || PRODUCT_DESCRIPTION.length > 155) {
    throw new Error(`Product description is ${PRODUCT_DESCRIPTION.length} characters`);
  }
  for (const guide of GUIDES) {
    const words = guideWordCount(guide);
    const lead = countWords(guide.directAnswer);
    if (words < 800 || words > 1500) {
      throw new Error(`${guide.slug} is ${words} words (expected 800-1500)`);
    }
    if (lead < 40 || lead > 60) {
      throw new Error(`${guide.slug} direct answer is ${lead} words (expected 40-60)`);
    }
  }
}

function assertPage(route, html) {
  const h1s = html.match(/<h1\b/gi) || [];
  if (h1s.length !== 1) {
    throw new Error(`${route} has ${h1s.length} <h1> tags`);
  }
  if (/name="keywords"/i.test(html)) {
    throw new Error(`${route} still contains meta keywords`);
  }
  if (!html.includes('rel="canonical"')) {
    throw new Error(`${route} is missing a canonical link`);
  }
  if (!html.includes(CANONICAL_ORIGIN)) {
    throw new Error(`${route} canonical host is not ${CANONICAL_ORIGIN}`);
  }
  if (!/name="robots"/i.test(html)) {
    throw new Error(`${route} is missing robots`);
  }

  const blocks = extractJsonLd(html);
  for (const block of blocks) {
    const types = [];
    const visit = (node) => {
      if (!node || typeof node !== "object") return;
      if (Array.isArray(node)) {
        node.forEach(visit);
        return;
      }
      if (node["@type"]) types.push(node["@type"]);
      if (node["@graph"]) visit(node["@graph"]);
      if (node.mainEntity) visit(node.mainEntity);
    };
    visit(block);
    if (types.includes("AggregateRating") || types.includes("Review")) {
      throw new Error(`${route} includes review schema without a visible review`);
    }
    const questions = block["@type"] === "FAQPage"
      ? block.mainEntity || []
      : (block["@graph"] || []).filter((node) => node["@type"] === "FAQPage").flatMap((node) => node.mainEntity || []);
    for (const question of questions) {
      const answer = question?.acceptedAnswer?.text;
      if (!answer || !html.includes(answer)) {
        throw new Error(`${route} FAQ schema text is not visible: ${question?.name}`);
      }
    }
  }

  if (route !== "/" && html.includes(">Deep links for mobile apps and websites</h1>")) {
    throw new Error(`${route} rendered the homepage body. The HTML shell was not empty.`);
  }
  if (route === "/") {
    const titleTags = html.match(/<title[^>]*>[\s\S]*?<\/title>/gi) || [];
    const expectedTitle = HOME_TITLE.replace(/&/g, "&amp;");
    const titleOk = titleTags.some((tag) => tag.includes(HOME_TITLE) || tag.includes(expectedTitle));
    if (!titleOk) {
      throw new Error(`Homepage title does not match the required string. Found: ${titleTags.join(" | ")}`);
    }
    if (!html.includes(PRODUCT_DESCRIPTION)) {
      throw new Error("Homepage is missing the shared product description");
    }
    for (const faq of HOME_FAQS) {
      if (!html.includes(faq.question) || !html.includes(faq.answer)) {
        throw new Error(`Homepage is missing FAQ text: ${faq.question}`);
      }
    }
  }
}

const API_CANDIDATES = [
  process.env.VITE_API_BASE_URL,
  "http://localhost:3000/api/v1",
  "https://api.lorrymithra.in/api/v1",
].filter(Boolean);

async function fetchJson(pathname) {
  let lastError = null;
  for (const apiBase of API_CANDIDATES) {
    try {
      const res = await fetch(`${apiBase}${pathname}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error(`No API response for ${pathname}`);
}

async function fetchPlans() {
  try {
    const json = await fetchJson("/plans");
    const data = json.data ?? json;
    if (!Array.isArray(data) || !data.length) return [];
    console.log(`[prerender] loaded ${data.length} pricing plans for static HTML`);
    return data.map(mapPlanFromDb);
  } catch (err) {
    console.warn(`[prerender] pricing catalog unavailable (${err.message}) — static TODO will be used`);
    return [];
  }
}

async function fetchBlogPosts() {
  const first = await fetchJson("/blog?page=1&limit=50");
  const summaries = [...(first.posts || [])];
  const totalPages = first.totalPages || 1;
  for (let page = 2; page <= totalPages; page += 1) {
    const next = await fetchJson(`/blog?page=${page}&limit=50`);
    summaries.push(...(next.posts || []));
  }
  const posts = [];
  for (let index = 0; index < summaries.length; index += 8) {
    const batch = summaries.slice(index, index + 8);
    const full = await Promise.all(batch.map(async (item) => {
      const json = await fetchJson(`/blog/${encodeURIComponent(item.slug)}`);
      return json.post || json;
    }));
    posts.push(...full.filter((post) => post && post.slug && post.content));
  }
  console.log(`[prerender] loaded ${posts.length} blog posts`);
  return posts;
}

function sitemapEntry(locPath, lastmod) {
  const loc = locPath === "/" ? `${CANONICAL_ORIGIN}/` : `${CANONICAL_ORIGIN}${locPath}`;
  const mod = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : "";
  return `  <url>\n    <loc>${loc}</loc>${mod}\n  </url>`;
}

function writeSitemap(posts) {
  const excluded = new Set(SITEMAP_EXCLUDED_PATHS);
  const latestPost = posts.reduce((latest, post) => {
    const day = isoDay(post.updatedAt || post.datePublished);
    return day && (!latest || day > latest) ? day : latest;
  }, null);
  const pages = MARKETING_PAGES
    .filter((page) => !excluded.has(page.path))
    .map((page) => sitemapEntry(
      page.path,
      page.path === "/blog" ? latestPost : gitDate(PAGE_SOURCE[page.path])
    ));
  const guides = GUIDES.map((guide) => sitemapEntry(guidePath(guide), guide.dateModified || guide.datePublished));
  const articles = posts.map((post) => sitemapEntry(
    `/blog/${post.slug}`,
    isoDay(post.updatedAt || post.datePublished)
  ));
  const urls = [...pages, ...guides, ...articles];
  if (urls.some((entry) => !entry.includes("<lastmod>"))) {
    throw new Error("sitemap.xml is missing a real lastmod date");
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
  if (/<changefreq>|<priority>|\/signup<|\/sitemap</.test(xml)) {
    throw new Error("sitemap.xml still contains changefreq, priority, /signup, or /sitemap");
  }
  fs.writeFileSync(path.join(distDir, "sitemap.xml"), xml, "utf8");
  console.log(`[prerender] sitemap.xml (${urls.length} urls)`);
}

function injectBlogData(html, data) {
  if (!data) return html;
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return html.replace("</body>", `<script>window.__BLOG_DATA__=${json}</script>\n</body>`);
}

async function main() {
  if (process.env.SKIP_PRERENDER === "1" || process.env.SKIP_PRERENDER === "true") {
    console.log("[prerender] SKIP_PRERENDER set — skipping static prerender");
    return;
  }

  const templatePath = path.join(distDir, "index.html");
  if (!fs.existsSync(templatePath)) {
    console.error("[prerender] dist/index.html missing — run vite build first");
    process.exit(1);
  }

  assertWordCounts();
  globalThis.__PRERENDER_PLANS__ = await fetchPlans();
  const blogPosts = await fetchBlogPosts();
  const blogList = blogPosts.map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    icon: post.icon,
    coverImage: post.coverImage,
    author: post.author,
    readTime: post.readTime,
    datePublished: post.datePublished,
    tags: post.tags,
  }));
  const postsBySlug = new Map(blogPosts.map((post) => [post.slug, post]));

  const template = toShell(fs.readFileSync(templatePath, "utf8"));
  const spaHead = `<title>Deeplink</title>
<meta name="robots" content="noindex, nofollow" />`;
  fs.writeFileSync(path.join(distDir, "spa.html"), applyHead(template, spaHead), "utf8");

  process.env.SSR_PRERENDER = "1";
  const vite = await createViteServer({
    root,
    server: { middlewareMode: true },
    appType: "custom",
    logLevel: "error",
    ssr: { noExternal: ["react-helmet-async"] },
  });

  let render;
  try {
    ({ render } = await vite.ssrLoadModule("/src/entry-server.jsx"));
  } catch (err) {
    await vite.close();
    throw err;
  }

  const routes = [
    ...MARKETING_PAGES.map((page) => page.path),
    ...GUIDES.map((guide) => guidePath(guide)),
    ...blogPosts.map((post) => `/blog/${post.slug}`),
  ];

  try {
    for (const route of routes) {
      const blogData = route === "/blog"
        ? { list: blogList }
        : postsBySlug.has(route.slice("/blog/".length)) && route.startsWith("/blog/")
          ? { post: postsBySlug.get(route.slice("/blog/".length)) }
          : null;
      globalThis.__PRERENDER_BLOG_DATA__ = blogData;
      const { html, head } = await render(route);
      let pageHtml = visibleHtml(applyHead(template, head).replace(
        '<div id="root"></div>',
        `<div id="root">${html}</div>`
      ));
      pageHtml = injectBlogData(pageHtml, blogData);
      assertPage(route, pageHtml);
      if (route.startsWith("/blog/") && !pageHtml.includes(postsBySlug.get(route.slice("/blog/".length)).title)) {
        throw new Error(`${route} is missing the post title in raw HTML`);
      }
      if (route === "/blog" && blogList[0] && !pageHtml.includes(blogList[0].title)) {
        throw new Error("Blog index is missing post titles in raw HTML");
      }
      const outPath = routeToOutputPath(route);
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, pageHtml, "utf8");
      console.log(`[prerender] ${route}`);
    }

    const notFound = await render("/this-page-does-not-exist");
    const notFoundHtml = visibleHtml(applyHead(template, notFound.head).replace(
      '<div id="root"></div>',
      `<div id="root">${notFound.html}</div>`
    ));
    if (!/noindex/i.test(notFoundHtml) || !/<h1\b/i.test(notFoundHtml)) {
      throw new Error("404.html is missing noindex or an h1");
    }
    fs.writeFileSync(path.join(distDir, "404.html"), notFoundHtml, "utf8");
    console.log("[prerender] 404.html");

    writeSitemap(blogPosts);
  } finally {
    await vite.close();
  }

  console.log("[prerender] done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
