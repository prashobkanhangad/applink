import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { ArrowLeft, Clock, User, Tag, ChevronRight, BookOpen } from "lucide-react";
import { PageMeta } from "../components/PageMeta";
import { useTheme } from "../contexts/ThemeContext";
import { getBlogPostBySlug } from "../services/blogService";
import {
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildFaqSchema,
} from "../utils/seoSchema";
import { SITE_ORIGIN } from "../constants/publicSite";

const formatDate = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/** Custom renderers for react-markdown to apply Tailwind prose-like classes */
const markdownComponents = {
  h1: ({ children }) => (
    <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-4 leading-tight">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4 leading-snug">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-lg font-semibold text-gray-800 mt-5 mb-2">{children}</h4>
  ),
  p: ({ children }) => (
    <p className="text-gray-700 leading-relaxed mb-4 text-[1.05rem]">{children}</p>
  ),
  a: ({ href, children }) => {
    const isExternal = href && (href.startsWith("http://") || href.startsWith("https://"));
    return isExternal ? (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline underline-offset-2">
        {children}
      </a>
    ) : (
      <Link to={href} className="text-blue-600 hover:text-blue-800 underline underline-offset-2">
        {children}
      </Link>
    );
  },
  ul: ({ children }) => (
    <ul className="list-disc list-outside pl-6 mb-4 space-y-1 text-gray-700">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-outside pl-6 mb-4 space-y-1 text-gray-700">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed text-[1.05rem]">{children}</li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-blue-400 pl-4 py-1 my-4 bg-blue-50 rounded-r text-gray-700 italic">
      {children}
    </blockquote>
  ),
  code: ({ inline, children }) =>
    inline ? (
      <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">
        {children}
      </code>
    ) : (
      <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono leading-relaxed my-4 whitespace-pre">
        {children}
      </code>
    ),
  pre: ({ children }) => (
    <pre className="my-4 rounded-lg overflow-hidden">{children}</pre>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-6">
      <table className="min-w-full border border-gray-200 rounded-lg text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
  tbody: ({ children }) => <tbody className="divide-y divide-gray-200">{children}</tbody>,
  tr: ({ children }) => <tr className="hover:bg-gray-50">{children}</tr>,
  th: ({ children }) => (
    <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b border-gray-200">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-3 text-gray-600 align-top">{children}</td>
  ),
  hr: () => <hr className="my-8 border-gray-200" />,
  strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
  em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
};

export const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const logoSrc = theme === "dark" ? "/logo_light.png" : "/logo_dark.png";

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getBlogPostBySlug(slug)
      .then(setPost)
      .catch((err) => {
        if (err.message.includes("not found") || err.message.includes("404")) {
          navigate("/blog", { replace: true });
        } else {
          setError(err.message);
        }
      })
      .finally(() => setLoading(false));
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-red-600">{error}</p>
        <Link to="/blog" className="text-primary hover:underline text-sm">← Back to Blog</Link>
      </div>
    );
  }

  if (!post) return null;

  const postPath = `/blog/${post.slug}`;
  const metaTitle = post.metaTitle || post.title;
  const metaDesc = post.metaDescription || post.excerpt;
  const datePublished = post.datePublished || post.createdAt;

  // Resolve cover image to absolute URL (Supabase = already absolute, local = prepend origin)
  const coverImageUrl = post.coverImage
    ? post.coverImage.startsWith("http")
      ? post.coverImage
      : `${SITE_ORIGIN}${post.coverImage}`
    : null;

  const estimatedWordCount = post.content
    ? post.content.trim().split(/\s+/).length
    : undefined;

  const articleSchema = buildArticleSchema({
    title: metaTitle,
    description: metaDesc,
    path: postPath,
    datePublished: datePublished ? new Date(datePublished).toISOString() : undefined,
    dateModified: post.updatedAt ? new Date(post.updatedAt).toISOString() : undefined,
    authorName: post.author || "Deeplink Team",
    imageUrl: coverImageUrl || undefined,
    keywords: post.metaKeywords || undefined,
    wordCount: estimatedWordCount,
  });

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: post.title, path: postPath },
  ]);

  const hasFaqs = Array.isArray(post.faqs) && post.faqs.length > 0;

  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      <PageMeta
        title={metaTitle}
        description={metaDesc}
        keywords={post.metaKeywords}
        path={postPath}
        ogType="article"
        image={coverImageUrl || undefined}
        imageAlt={post.title}
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        {hasFaqs && (
          <script type="application/ld+json">{JSON.stringify(buildFaqSchema(post.faqs))}</script>
        )}
      </Helmet>

      {/* ── Sticky nav ────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoSrc} alt="Deeplink" className="h-10 w-auto object-contain" />
          </Link>
          <Link
            to="/blog"
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>
      </header>

      {/* ── Hero cover image ──────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-5 sm:px-8 pt-8 pb-2">
        <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-gray-950 shadow-lg">
          {post.coverImage ? (
            <img
              src={post.coverImage}
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover"
              loading="eager"
            />
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(240_60%_35%/0.3),transparent_60%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(200_85%_40%/0.15),transparent_55%)]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[8rem] opacity-15 select-none">{post.icon || "📄"}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-5 sm:px-8 py-10 md:py-14">
        <article>
          {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-8" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-gray-600 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/blog" className="hover:text-gray-600 transition-colors">Blog</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-700 truncate font-medium">{post.title}</span>
          </nav>

          {/* ── Post header ────────────────────────────────────────────────── */}
          <header className="mb-10">
            {/* Tags */}
            {Array.isArray(post.tags) && post.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {post.tags.map((t) => (
                  <span
                    key={t}
                    className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-900 text-white"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight mb-4">
              {post.title}
            </h1>

            <p className="text-lg text-gray-600 mb-6 leading-relaxed">{post.excerpt}</p>

            {/* Author / date / read time row */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500 pb-6 border-b border-gray-200">
              {post.author && (
                <span className="flex items-center gap-1.5 font-medium text-gray-700">
                  <User className="w-4 h-4 text-gray-400" />
                  {post.author}
                </span>
              )}
              {datePublished && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {formatDate(datePublished)}
                </span>
              )}
              {post.readTime && (
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-gray-400" />
                  {post.readTime}
                </span>
              )}
            </div>
          </header>

          {/* ── Article body ───────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-10">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={markdownComponents}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {/* ── FAQ section ────────────────────────────────────────────────── */}
          {hasFaqs && (
            <section className="mt-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-5">
                Frequently Asked Questions
              </h2>
              <div className="space-y-3">
                {post.faqs.map((faq, i) => (
                  <details
                    key={i}
                    className="group bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
                  >
                    <summary className="flex items-center justify-between px-6 py-4 cursor-pointer font-semibold text-gray-900 hover:bg-gray-50 transition-colors list-none text-base">
                      <span>{faq.question}</span>
                      <span className="text-gray-400 group-open:rotate-45 transition-transform duration-200 text-xl ml-4 flex-shrink-0 font-light">
                        +
                      </span>
                    </summary>
                    <div className="px-6 pb-5 text-gray-600 leading-relaxed text-[0.97rem] border-t border-gray-50 pt-3">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* ── CTA strip ──────────────────────────────────────────────────── */}
          <div className="mt-12 bg-gray-950 rounded-2xl p-8 md:p-10 text-white text-center">
            <h3 className="text-xl font-bold mb-2">
              Ready to implement deep linking?
            </h3>
            <p className="text-gray-400 mb-6 leading-relaxed max-w-md mx-auto">
              Deeplink gives you deferred deep linking, Android App Links, and iOS Universal Links — with a dashboard, REST API, and analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-colors"
              >
                Get started free <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
              <a
                href="https://docs.deeplink.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/20 rounded-xl text-sm text-white font-medium hover:bg-white/10 transition-colors"
              >
                Read the docs
              </a>
            </div>
          </div>

          {/* ── Back link ─────────────────────────────────────────────────── */}
          <div className="mt-8 pb-4 flex items-center gap-2">
            <Link
              to="/blog"
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to all articles
            </Link>
          </div>
        </article>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <img src={logoSrc} alt="Deeplink" className="h-7 w-auto object-contain" />
            <span>© {new Date().getFullYear()} Deeplink.in</span>
          </div>
          <div className="flex items-center gap-5">
            <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
            <Link to="/blog" className="hover:text-gray-900 transition-colors">Blog</Link>
            <Link to="/privacy" className="hover:text-gray-900 transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BlogPost;
