import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight,
  Search,
  Clock,
  User,
  BookOpen,
  ChevronRight,
  Rss,
} from "lucide-react";
import { PageMeta } from "../components/PageMeta";
import { useTheme } from "../contexts/ThemeContext";
import { listBlogPosts } from "../services/blogService";
import { buildBreadcrumbSchema } from "../utils/seoSchema";
import { SITE_ORIGIN } from "../constants/publicSite";

/* ─── constants ──────────────────────────────────────────────────────────────── */
const META = {
  title: "Blog – Deep Linking, Mobile Growth & App Marketing",
  description:
    "Expert insights on deep linking, deferred deep linking, Firebase Dynamic Links alternatives, and implementing deep links for Android and iOS. Written by the Deeplink team.",
  keywords:
    "deep linking blog, mobile deep linking, deferred deep linking, Firebase Dynamic Links alternative, android app links, iOS universal links",
};

/** JSON-LD for the blog listing (ItemList of Articles) */
function buildBlogListSchema(posts) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Deeplink Blog",
    description: META.description,
    url: `${SITE_ORIGIN}/blog`,
    publisher: {
      "@type": "Organization",
      name: "Deeplink",
      url: SITE_ORIGIN,
      logo: { "@type": "ImageObject", url: `${SITE_ORIGIN}/logo_dark.png` },
    },
    blogPost: posts.slice(0, 10).map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      description: p.excerpt,
      url: `${SITE_ORIGIN}/blog/${p.slug}`,
      datePublished: p.datePublished,
      author: { "@type": "Organization", name: p.author || "Deeplink Team" },
      ...(p.coverImage && {
        image: {
          "@type": "ImageObject",
          url: p.coverImage.startsWith("http") ? p.coverImage : `${SITE_ORIGIN}${p.coverImage}`,
          width: 1536,
          height: 864,
        },
      }),
    })),
  };
}

/* ─── helpers ────────────────────────────────────────────────────────────────── */
const formatDate = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/* Tag color palette — cycles by index */
const TAG_COLORS = [
  "bg-blue-50 text-blue-700 border-blue-200",
  "bg-purple-50 text-purple-700 border-purple-200",
  "bg-emerald-50 text-emerald-700 border-emerald-200",
  "bg-orange-50 text-orange-700 border-orange-200",
  "bg-rose-50 text-rose-700 border-rose-200",
  "bg-amber-50 text-amber-700 border-amber-200",
];
const tagColor = (tag, allTags) => TAG_COLORS[allTags.indexOf(tag) % TAG_COLORS.length];

/* ─── Skeleton card ──────────────────────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3 animate-pulse">
    <div className="h-4 bg-gray-100 rounded w-1/4" />
    <div className="h-6 bg-gray-100 rounded w-3/4" />
    <div className="h-4 bg-gray-100 rounded w-full" />
    <div className="h-4 bg-gray-100 rounded w-2/3" />
    <div className="flex gap-2 pt-2">
      <div className="h-3 bg-gray-100 rounded w-20" />
      <div className="h-3 bg-gray-100 rounded w-16" />
    </div>
  </div>
);

/* ─── Featured post (hero card) ─────────────────────────────────────────────── */
const FeaturedCard = ({ post, allTags }) => (
  <motion.article
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.55 }}
  >
    <Link
      to={`/blog/${post.slug}`}
      className="group relative flex flex-col justify-end rounded-3xl overflow-hidden bg-gray-950 text-white min-h-[380px] hover:shadow-2xl transition-shadow duration-300"
      aria-label={`Read: ${post.title}`}
    >
      {/* Cover image or gradient placeholder */}
      {post.coverImage ? (
        <>
          <img
            src={post.coverImage}
            alt={post.title}
            className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-60 transition-opacity duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(240_60%_35%/0.35),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(200_85%_40%/0.2),transparent_55%)]" />
          {/* Large faded icon for visual interest */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[9rem] opacity-10 select-none">{post.icon || "📄"}</span>
          </div>
        </>
      )}

      {/* "Featured" badge */}
      <div className="absolute top-6 left-8 z-10">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-white/80 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
          Featured
        </span>
      </div>

      <div className="relative z-10 p-8 md:p-12 space-y-4">
        {/* Tags */}
        {Array.isArray(post.tags) && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((t) => (
              <span key={t} className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-white/75">
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Icon + Title */}
        <div>
          {post.icon && <span className="text-3xl mb-2 block">{post.icon}</span>}
          <h2 className="text-2xl md:text-3xl font-bold leading-snug group-hover:text-white/90 transition-colors">
            {post.title}
          </h2>
        </div>

        <p className="text-white/60 text-base leading-relaxed max-w-2xl line-clamp-2">
          {post.excerpt}
        </p>

        {/* Meta row */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4 text-sm text-white/50">
            {post.datePublished && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {formatDate(post.datePublished)}
              </span>
            )}
            {post.readTime && <span>{post.readTime}</span>}
            {post.author && (
              <span className="hidden sm:flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                {post.author}
              </span>
            )}
          </div>
          <span className="flex items-center gap-1.5 text-sm font-medium text-white/80 group-hover:text-white group-hover:gap-2.5 transition-all">
            Read article <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  </motion.article>
);

/* ─── Grid post card ─────────────────────────────────────────────────────────── */
const PostCard = ({ post, allTags, index }) => (
  <motion.article
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.07 }}
  >
    <Link
      to={`/blog/${post.slug}`}
      className="group flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all duration-300 overflow-hidden"
      aria-label={`Read: ${post.title}`}
    >
      {/* Cover image — real photo or styled placeholder */}
      <div className="relative h-44 bg-gray-950 overflow-hidden flex-shrink-0">
        {post.coverImage ? (
          <img
            src={post.coverImage}
            alt={post.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <>
            {/* Gradient placeholder */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(220_60%_30%/0.6),transparent_65%)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl opacity-30 select-none">{post.icon || "📄"}</span>
            </div>
          </>
        )}
        {/* Subtle bottom fade into card */}
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white/10 to-transparent" />
      </div>

      <div className="flex flex-col flex-1 p-6">
        {/* Tags */}
        {Array.isArray(post.tags) && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.tags.slice(0, 2).map((t) => (
              <span
                key={t}
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${tagColor(t, allTags)}`}
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-900 leading-snug mb-2 group-hover:text-gray-700 transition-colors line-clamp-2">
            {post.title}
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
            {post.excerpt}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            {post.datePublished && (
              <span>{formatDate(post.datePublished)}</span>
            )}
            {post.readTime && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {post.readTime}
                </span>
              </>
            )}
          </div>
          <span className="flex items-center gap-1 text-xs font-semibold text-gray-400 group-hover:text-gray-900 group-hover:gap-1.5 transition-all">
            Read <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  </motion.article>
);

/* ─── Tag filter bar ─────────────────────────────────────────────────────────── */
const TagFilter = ({ tags, active, onSelect }) => (
  <div className="flex flex-wrap gap-2 items-center">
    <button
      type="button"
      onClick={() => onSelect(null)}
      className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
        !active
          ? "bg-gray-900 text-white shadow-sm"
          : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:text-gray-900"
      }`}
    >
      All posts
    </button>
    {tags.map((t) => (
      <button
        key={t}
        type="button"
        onClick={() => onSelect(t === active ? null : t)}
        className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all ${
          active === t
            ? "bg-gray-900 text-white border-gray-900 shadow-sm"
            : "bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-900"
        }`}
      >
        {t}
      </button>
    ))}
  </div>
);

/* ─── Main component ─────────────────────────────────────────────────────────── */
export const Blog = () => {
  const { theme } = useTheme();
  const logoSrc = theme === "dark" ? "/logo_light.png" : "/logo_dark.png";

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTag, setActiveTag] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    listBlogPosts({ limit: 50 })
      .then((data) => setPosts(data.posts || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  /* Derive unique tags across all posts */
  const allTags = useMemo(() => {
    const set = new Set();
    posts.forEach((p) => (p.tags || []).forEach((t) => set.add(t)));
    return [...set];
  }, [posts]);

  /* Filter posts by active tag + search */
  const filteredPosts = useMemo(() => {
    let result = [...posts];
    if (activeTag) result = result.filter((p) => (p.tags || []).includes(activeTag));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.excerpt || "").toLowerCase().includes(q) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [posts, activeTag, searchQuery]);

  const featuredPost = !activeTag && !searchQuery.trim() ? filteredPosts[0] : null;
  const gridPosts = featuredPost ? filteredPosts.slice(1) : filteredPosts;

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
  ]);

  return (
    <div className="min-h-screen bg-[#f9f9f9] relative">
      <PageMeta
        title={META.title}
        description={META.description}
        keywords={META.keywords}
        path="/blog"
      />
      <Helmet>
        {!loading && posts.length > 0 && (
          <script type="application/ld+json">
            {JSON.stringify(buildBlogListSchema(posts))}
          </script>
        )}
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>

      {/* ── Nav bar ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoSrc} alt="Deeplink" className="h-10 w-auto object-contain" />
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
            <Link to="/deep-linking-platform" className="hover:text-gray-900 transition-colors">Platform</Link>
            <Link to="/blog" className="text-gray-900 font-semibold">Blog</Link>
            <Link to="/docs" className="hover:text-gray-900 transition-colors">Docs</Link>
          </nav>
          <Link
            to="/signup"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-black transition-colors"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* ── Breadcrumb ──────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-5">
        <nav className="flex items-center gap-1.5 text-xs text-gray-400" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-gray-600 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-700 font-medium">Blog</span>
        </nav>
      </div>

      {/* ── Hero headline ───────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-10 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-900 text-white text-xs font-semibold mb-4">
              <BookOpen className="w-3.5 h-3.5" />
              Deeplink Blog
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
              Deep Linking<br className="hidden sm:block" /> Insights & Guides
            </h1>
            <p className="mt-3 text-lg text-gray-500 max-w-xl leading-relaxed">
              Expert articles on deep linking, deferred deep linking, mobile growth, and SDK implementation—written by the Deeplink team.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 flex-shrink-0">
            <Rss className="w-4 h-4 text-orange-500" />
            <span>{posts.length > 0 ? `${posts.length} articles` : "Articles"}</span>
          </div>
        </motion.div>
      </section>

      {/* ── Search + filter bar ─────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 items-start sm:items-center"
        >
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="search"
              placeholder="Search articles…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition"
            />
          </div>
          {/* Tags */}
          {allTags.length > 0 && (
            <TagFilter tags={allTags} active={activeTag} onSelect={setActiveTag} />
          )}
        </motion.div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-5 sm:px-8 pb-20">
        {/* Loading skeletons */}
        {loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-6 py-5 text-sm">
            <strong>Could not load posts:</strong> {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filteredPosts.length === 0 && (
          <div className="text-center py-24">
            <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">
              {searchQuery || activeTag ? "No articles match your filter." : "No posts published yet."}
            </p>
            {(searchQuery || activeTag) && (
              <button
                type="button"
                onClick={() => { setSearchQuery(""); setActiveTag(null); }}
                className="mt-3 text-sm text-gray-900 underline underline-offset-2 hover:no-underline"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {!loading && !error && filteredPosts.length > 0 && (
          <AnimatePresence mode="wait">
            <div key={`${activeTag}-${searchQuery}`}>
              {/* Featured post */}
              {featuredPost && (
                <div className="mb-10">
                  <FeaturedCard post={featuredPost} allTags={allTags} />
                </div>
              )}

              {/* Grid */}
              {gridPosts.length > 0 && (
                <>
                  {featuredPost && (
                    <div className="flex items-center gap-3 mb-6">
                      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
                        More Articles
                      </h2>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>
                  )}
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {gridPosts.map((post, i) => (
                      <PostCard key={post.slug} post={post} allTags={allTags} index={i} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </AnimatePresence>
        )}
      </main>

      {/* ── Newsletter / CTA strip ──────────────────────────────────────────── */}
      {!loading && (
        <section className="bg-gray-950 text-white">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-lg">
              <h2 className="text-2xl font-bold mb-2">Ready to implement deep linking?</h2>
              <p className="text-gray-400 leading-relaxed">
                Deeplink gives you deferred deep linking, Android App Links, and iOS Universal Links in one platform — with a dashboard, REST API, and analytics.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-gray-900 text-sm font-semibold hover:bg-gray-100 transition-colors"
              >
                Start free <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="https://docs.deeplink.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white text-sm font-medium hover:bg-white/10 transition-colors"
              >
                Read the docs
              </a>
            </div>
          </div>
        </section>
      )}

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <img src={logoSrc} alt="Deeplink" className="h-7 w-auto object-contain" />
            <span>© {new Date().getFullYear()} Deeplink.in</span>
          </div>
          <div className="flex items-center gap-5">
            <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
            <Link to="/deep-linking-platform" className="hover:text-gray-900 transition-colors">Platform</Link>
            <Link to="/blog" className="hover:text-gray-900 transition-colors">Blog</Link>
            <Link to="/privacy" className="hover:text-gray-900 transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Blog;
