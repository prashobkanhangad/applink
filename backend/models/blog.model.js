import { Schema, model } from "mongoose";

const faqItemSchema = new Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { _id: false }
);

const blogSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true, trim: true },
    title: { type: String, required: true, trim: true },
    excerpt: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    icon: { type: String, default: "📝" },
    coverImage: { type: String, default: "" },
    author: { type: String, default: "Deeplink Team", trim: true },
    tags: [{ type: String, trim: true }],
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true,
    },
    metaTitle: { type: String, default: "", trim: true },
    metaDescription: { type: String, default: "", trim: true },
    metaKeywords: { type: String, default: "", trim: true },
    readTime: { type: String, default: "5 min read" },
    datePublished: { type: Date, default: null },
    faqs: [faqItemSchema],
  },
  { timestamps: true }
);

blogSchema.index({ status: 1, datePublished: -1 });
blogSchema.index({ status: 1, createdAt: -1 });

export const BlogPost = model("BlogPost", blogSchema, "blogPosts");
