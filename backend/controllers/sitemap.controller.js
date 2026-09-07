import { BlogPost } from "../models/blog.model.js";

const SITE = "https://deeplink.in";
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
];

const today = () => new Date().toISOString().split("T")[0];

const entry = (loc, lastmod, changefreq, priority) =>
  `  <url>\n    <loc>${SITE}${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;

export const serveSitemap = async (req, res) => {
  try {
    const posts = await BlogPost.find({ status: "published" })
      .select("slug datePublished updatedAt")
      .sort({ datePublished: -1 })
      .lean();

    const staticEntries = STATIC_PAGES.map((p) =>
      entry(p.loc, today(), p.changefreq, p.priority)
    );

    const blogEntries = posts.map((p) => {
      const lastmod = p.datePublished
        ? new Date(p.datePublished).toISOString().split("T")[0]
        : today();
      return entry(`/blog/${p.slug}`, lastmod, "monthly", "0.75");
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...staticEntries, ...blogEntries].join("\n")}\n</urlset>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600"); // cache 1 hour
    res.send(xml);
  } catch (err) {
    res.status(500).send(`<?xml version="1.0"?><error>${err.message}</error>`);
  }
};
