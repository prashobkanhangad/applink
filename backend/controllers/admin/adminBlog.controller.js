import { BlogPost } from "../../models/blog.model.js";

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .slice(0, 100);

/** GET /api/v1/admin/blog */
export const adminListPosts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.search) filter.title = { $regex: req.query.search, $options: "i" };

    const [total, posts] = await Promise.all([
      BlogPost.countDocuments(filter),
      BlogPost.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("slug title excerpt icon status readTime datePublished createdAt tags"),
    ]);

    res.json({ posts, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

/** GET /api/v1/admin/blog/:id */
export const adminGetPost = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ status: "error", message: "Post not found" });
    res.json({ post });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

/** POST /api/v1/admin/blog */
export const adminCreatePost = async (req, res) => {
  try {
    const {
      title, content, excerpt, icon, coverImage, author, tags,
      status, metaTitle, metaDescription, metaKeywords, readTime,
      datePublished, faqs,
    } = req.body;

    if (!title || !content || !excerpt) {
      return res.status(400).json({ status: "error", message: "title, content, and excerpt are required" });
    }

    let slug = req.body.slug ? String(req.body.slug).trim() : slugify(title);
    const conflict = await BlogPost.findOne({ slug });
    if (conflict) slug = `${slug}-${Date.now()}`;

    const isPublishing = status === "published";

    const post = await BlogPost.create({
      slug,
      title: title.trim(),
      content,
      excerpt: excerpt.trim(),
      icon: icon || "📝",
      coverImage: coverImage || "",
      author: author || "Deeplink Team",
      tags: Array.isArray(tags) ? tags : [],
      status: isPublishing ? "published" : "draft",
      metaTitle: (metaTitle || title).trim(),
      metaDescription: (metaDescription || excerpt).trim(),
      metaKeywords: metaKeywords || "",
      readTime: readTime || "5 min read",
      datePublished: isPublishing ? (datePublished ? new Date(datePublished) : new Date()) : null,
      faqs: Array.isArray(faqs) ? faqs : [],
    });

    res.status(201).json({ post });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ status: "error", message: "A post with this slug already exists" });
    }
    res.status(500).json({ status: "error", message: err.message });
  }
};

/** PUT /api/v1/admin/blog/:id */
export const adminUpdatePost = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ status: "error", message: "Post not found" });

    const editableFields = [
      "title", "content", "excerpt", "icon", "coverImage", "author",
      "tags", "metaTitle", "metaDescription", "metaKeywords", "readTime", "faqs",
    ];
    for (const f of editableFields) {
      if (req.body[f] !== undefined) post[f] = req.body[f];
    }
    if (req.body.slug !== undefined) post.slug = String(req.body.slug).trim();
    if (req.body.status !== undefined) {
      const wasUnpublished = post.status !== "published";
      post.status = req.body.status;
      if (req.body.status === "published" && wasUnpublished && !post.datePublished) {
        post.datePublished = new Date();
      }
    }
    if (req.body.datePublished !== undefined) {
      post.datePublished = req.body.datePublished ? new Date(req.body.datePublished) : null;
    }

    await post.save();
    res.json({ post });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ status: "error", message: "A post with this slug already exists" });
    }
    res.status(500).json({ status: "error", message: err.message });
  }
};

/** DELETE /api/v1/admin/blog/:id */
export const adminDeletePost = async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ status: "error", message: "Post not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

/** PATCH /api/v1/admin/blog/:id/toggle — toggle draft ↔ published */
export const adminToggleStatus = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ status: "error", message: "Post not found" });

    post.status = post.status === "published" ? "draft" : "published";
    if (post.status === "published" && !post.datePublished) {
      post.datePublished = new Date();
    }
    await post.save();
    res.json({ _id: post._id, status: post.status });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
