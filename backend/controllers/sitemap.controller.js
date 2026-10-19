import { BlogPost } from "../models/blog.model.js";

const SITE = "https://www.deeplink.in";
const STATIC_PAGES = [
  "/",
  "/features",
  "/pricing",
  "/guides",
  "/guides/what-is-deep-linking",
  "/guides/deferred-deep-linking",
  "/guides/universal-links-vs-app-links",
  "/guides/deep-links-whatsapp-campaigns",
  "/guides/qr-code-deep-links",
  "/compare",
  "/free-qr-code-generator",
  "/deep-link-tester",
  "/about",
  "/deep-linking-platform",
  "/deferred-deep-linking",
  "/app-deep-links",
  "/blog",
  "/affiliate",
  "/privacy",
  "/terms",
  "/cookies",
];

const GUIDE_LASTMOD = {
  "/guides/what-is-deep-linking": "2026-10-18",
  "/guides/deferred-deep-linking": "2026-10-18",
  "/guides/universal-links-vs-app-links": "2026-10-18",
  "/guides/deep-links-whatsapp-campaigns": "2026-10-18",
  "/guides/qr-code-deep-links": "2026-10-18",
};

const isoDay = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().split("T")[0];
};

const entry = (loc, lastmod) => {
  const mod = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : "";
  return `  <url>\n    <loc>${SITE}${loc === "/" ? "/" : loc}</loc>${mod}\n  </url>`;
};

export const serveSitemap = async (req, res) => {
  try {
    const posts = await BlogPost.find({ status: "published" })
      .select("slug datePublished updatedAt")
      .sort({ datePublished: -1 })
      .lean();

    const latestPost = posts.reduce((latest, post) => {
      const day = isoDay(post.updatedAt || post.datePublished);
      return day && (!latest || day > latest) ? day : latest;
    }, null);

    const staticEntries = STATIC_PAGES.map((loc) =>
      entry(loc, loc === "/blog" ? latestPost : GUIDE_LASTMOD[loc] || null)
    );

    const blogEntries = posts.map((post) =>
      entry(`/blog/${post.slug}`, isoDay(post.updatedAt || post.datePublished))
    );

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...staticEntries, ...blogEntries].join("\n")}\n</urlset>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");
    res.send(xml);
  } catch (err) {
    res.status(500).send(`<?xml version="1.0"?><error>${err.message}</error>`);
  }
};
