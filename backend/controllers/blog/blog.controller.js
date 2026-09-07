import { BlogPost } from "../../models/blog.model.js";

/** GET /api/v1/blog — list published posts, newest first */
export const listPublishedPosts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const filter = { status: "published" };
    if (req.query.tag) filter.tags = req.query.tag;

    const [total, posts] = await Promise.all([
      BlogPost.countDocuments(filter),
      BlogPost.find(filter)
        .sort({ datePublished: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("slug title excerpt icon coverImage author readTime datePublished tags"),
    ]);

    res.json({ posts, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

/** GET /api/v1/blog/:slug — get single published post */
export const getPublishedPostBySlug = async (req, res) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug, status: "published" });
    if (!post) {
      return res.status(404).json({ status: "error", message: "Post not found" });
    }
    res.json({ post });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
