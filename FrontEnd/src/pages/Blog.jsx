import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { PageMeta } from "../components/PageMeta";
import { useTheme } from "../contexts/ThemeContext";
import { blogPosts } from "../data/blogPosts";

const META = {
  title: "Blog – Deep Linking, Mobile Growth & App Marketing",
  description: "Expert insights on deep linking, deferred deep linking, Firebase Dynamic Links alternatives, and implementing deep links for Android and iOS apps.",
};

export const Blog = () => {
  const { theme } = useTheme();
  const logoSrc = theme === "dark" ? "/logo_light.png" : "/logo_dark.png";

  return (
    <div className="min-h-screen bg-background relative overflow-hidden link-pattern">
      <PageMeta title={META.title} description={META.description} path="/blog" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-primary/5 blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[hsl(200_85%_50%)]/5 blur-[100px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
      </div>

      <header className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-foreground">
              <img src={logoSrc} alt="Deeplink" className="h-14 w-auto object-contain" />
              <span className="text-xl font-bold">Deeplink</span>
            </Link>
            <Link
              to="/"
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-6 py-12 md:py-16 lg:py-20">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-6 h-6 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold">Blog</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Insights on deep linking, mobile growth, and app marketing.
            </p>
          </div>

          <div className="grid gap-6">
            {blogPosts.map((post, i) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Link
                  to={`/blog/${post.slug}`}
                  className="group block bg-card rounded-2xl border border-border shadow-sm hover:shadow-lg hover:border-primary/30 p-6 md:p-8 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <span className="text-2xl mb-2 block">{post.icon}</span>
                      <h2 className="text-xl md:text-2xl font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h2>
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{post.date}</span>
                        <span>•</span>
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Blog;
