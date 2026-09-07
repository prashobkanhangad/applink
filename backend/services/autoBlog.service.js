/**
 * Auto Blog Service
 * ─────────────────
 * Generates 3 blog posts per day automatically:
 *   1. GPT picks 3 fresh topics (never-before-written)
 *   2. GPT writes each post as structured JSON (markdown + SEO)
 *   3. gpt-image-2 generates a 16:9 cover image
 *   4. Image is uploaded to Supabase Storage → public URL
 *   5. Post is saved to MongoDB as "published"
 *
 * Env vars required:
 *   OPENAI_API_KEY
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { BlogPost } from "../models/blog.model.js";
import { AutoBlogLog } from "../models/autoBlogLog.model.js";

/* ─── Clients ───────────────────────────────────────────────────────────────── */
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function getSupabase() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/* ─── Constants ─────────────────────────────────────────────────────────────── */
const SUPABASE_BUCKET = "blog-images";
// Local fallback: save to FrontEnd/public/blog-images/ when Supabase is not configured
const LOCAL_IMAGE_DIR = new URL("../../FrontEnd/public/blog-images", import.meta.url).pathname;
const TEXT_MODEL = process.env.AUTO_BLOG_TEXT_MODEL || "gpt-4o";
const IMAGE_MODEL = "gpt-image-2";
const POSTS_PER_RUN = Number(process.env.AUTO_BLOG_POSTS_PER_DAY) || 5;

/**
 * Deep-linking topic taxonomy — GPT draws from these to stay on-brand.
 * Add more categories/subtopics freely.
 */
const TOPIC_TAXONOMY = `
TOPIC CATEGORIES (pick from these broad areas):
1. Deep Linking Fundamentals — what is it, how it works, types (URI scheme, App Links, Universal Links, deferred)
2. Firebase Dynamic Links Alternatives — migration guides, comparisons, post-deprecation strategies
3. Mobile Marketing & Attribution — UTM tracking, install attribution, re-engagement campaigns
4. Developer Implementation Guides — Android App Links, iOS Universal Links, React Native, Flutter, Expo, Capacitor
5. E-commerce Deep Links — product page linking, cart recovery, push notification deep links, abandoned cart
6. Industry Use Cases — fintech, food delivery, edtech, healthcare, travel, gaming
7. Platform Comparisons — Branch.io vs Deeplink, Adjust vs Deeplink, AppsFlyer vs Deeplink, Firebase vs Deeplink
8. Analytics & Metrics — click-to-install rate, deep link conversion, funnel analytics
9. App Store Optimization (ASO) + Deep Links — Google Play instant apps, iOS App Clips
10. User Acquisition & Retargeting — smart banners, QR code deep links, email deep links, SMS
11. Web-to-App — Chrome App Banners, iOS Smart App Banners, progressive web app (PWA) to native
12. Link Management — custom domains, link shortening, UTM builder, A/B testing URLs
`;

/* ─── Helpers ───────────────────────────────────────────────────────────────── */
const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .slice(0, 100);

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/* ─── Step 1: Generate topic ideas ─────────────────────────────────────────── */
async function generateTopicIdeas(existingTitles, count = POSTS_PER_RUN) {
  const existingList = existingTitles.length
    ? `\nALREADY WRITTEN (do NOT repeat or closely paraphrase these):\n${existingTitles.map((t) => `- ${t}`).join("\n")}`
    : "";

  const prompt = `
You are a content strategist for Deeplink.in, a B2B SaaS deep linking platform for mobile apps.

${TOPIC_TAXONOMY}
${existingList}

Generate exactly ${count} fresh, high-value blog post ideas that:
- Target mobile developers, product managers, or mobile marketers
- Have strong SEO potential (specific, searchable, long-tail)
- Are NOT already in the written list above
- Cover different categories from the taxonomy above
- Are practical and actionable

Return ONLY a JSON array of ${count} objects, no markdown, no extra text:
[
  {
    "title": "Exact blog post title (SEO-optimized, 50-70 chars)",
    "category": "Category name from taxonomy",
    "targetAudience": "developer | product manager | marketer",
    "primaryKeyword": "main keyword phrase"
  }
]
`.trim();

  const res = await openai.chat.completions.create({
    model: TEXT_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.8,
    max_tokens: 800,
    response_format: { type: "json_object" },
  });

  const raw = res.choices[0].message.content;
  const parsed = JSON.parse(raw);
  // Handle both {ideas:[...]} and [...] responses
  const ideas = Array.isArray(parsed) ? parsed : (parsed.ideas || parsed.topics || Object.values(parsed)[0]);
  return ideas.slice(0, count);
}

/* ─── Step 2: Generate full blog post content ───────────────────────────────── */
async function generateBlogContent(idea) {
  const prompt = `
You are an expert technical writer for Deeplink.in, a B2B SaaS deep linking platform.

Write a comprehensive, SEO-optimized blog post for the following topic:
Title: "${idea.title}"
Primary Keyword: "${idea.primaryKeyword}"
Target Audience: ${idea.targetAudience}

Requirements:
- 1400-1800 words of high-quality prose (not counting headings)
- Written in Markdown format
- Structure: Introduction → 4-6 main sections with ## headings → Conclusion
- Use question-style H2/H3 headings where appropriate (great for AEO/GEO)
- Include at least 2 real-world examples or scenarios
- Mention "Deeplink.in" or "Deeplink platform" naturally 2-3 times as a solution
- Include a comparison table (markdown) where relevant
- End with a clear actionable conclusion
- NO placeholder text, NO [insert X here] gaps — write the full content

Return ONLY a JSON object with this exact schema (no markdown code blocks, pure JSON):
{
  "title": "Final SEO-optimized title",
  "slug": "url-slug-here",
  "excerpt": "155-character meta description and card excerpt",
  "content": "# Full markdown content here...",
  "tags": ["tag1", "tag2", "tag3"],
  "metaTitle": "SEO meta title (55-60 chars) | Deeplink",
  "metaDescription": "SEO meta description (145-155 chars)",
  "metaKeywords": "keyword1, keyword2, keyword3",
  "readTime": "X min read",
  "icon": "single emoji that represents the topic",
  "faqs": [
    { "question": "FAQ question?", "answer": "Concise answer (2-3 sentences)." },
    { "question": "FAQ question?", "answer": "Concise answer." },
    { "question": "FAQ question?", "answer": "Concise answer." }
  ]
}
`.trim();

  const res = await openai.chat.completions.create({
    model: TEXT_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 4000,
    response_format: { type: "json_object" },
  });

  const data = JSON.parse(res.choices[0].message.content);

  // Ensure slug is properly formatted
  data.slug = data.slug ? slugify(data.slug) : slugify(data.title);

  return data;
}

/* ─── Step 3: Generate cover image ─────────────────────────────────────────── */
async function generateCoverImagePrompt(post) {
  const promptGen = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: `Create a detailed image generation prompt for a professional tech blog cover image.
Blog title: "${post.title}"
Tags: ${(post.tags || []).join(", ")}

The image should be:
- A flat digital illustration, 16:9 widescreen
- Dark background (#0f0f14 charcoal), electric blue and white glowing accents
- Clean B2B SaaS aesthetic — professional, modern, dramatic
- Visually represent the concept through metaphors (no literal screenshots)
- CRITICAL: Absolutely NO text, NO letters, NO words, NO numbers, NO labels, NO UI copy anywhere in the image

Return only the image prompt text, nothing else.`,
      },
    ],
    temperature: 0.8,
    max_tokens: 300,
  });

  return promptGen.choices[0].message.content.trim();
}

async function generateAndUploadImage(post) {
  const imagePrompt = await generateCoverImagePrompt(post);

  const result = await openai.images.generate({
    model: IMAGE_MODEL,
    prompt: imagePrompt,
    size: "1536x864",
    quality: "medium",
    output_format: "jpeg",
    n: 1,
  });

  const b64 = result.data[0].b64_json;
  if (!b64) throw new Error("No image data returned from OpenAI");

  const imageBuffer = Buffer.from(b64, "base64");
  const supabase = getSupabase();

  if (supabase) {
    // ── Ensure bucket exists ─────────────────────────────────────────────────
    const { data: buckets } = await supabase.storage.listBuckets();
    if (buckets && !buckets.some((b) => b.name === SUPABASE_BUCKET)) {
      await supabase.storage.createBucket(SUPABASE_BUCKET, { public: true, fileSizeLimit: 10 * 1024 * 1024 });
    }

    // ── Upload to Supabase Storage ───────────────────────────────────────────
    const filePath = `posts/${post.slug}.jpeg`;
    const { error: uploadError } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload(filePath, imageBuffer, { contentType: "image/jpeg", upsert: true });

    if (uploadError) throw new Error(`Supabase upload failed: ${uploadError.message}`);

    const { data: urlData } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(filePath);
    return urlData.publicUrl;
  } else {
    // ── Fallback: save locally to FrontEnd/public/blog-images/ ──────────────
    fs.mkdirSync(LOCAL_IMAGE_DIR, { recursive: true });
    const localPath = path.join(LOCAL_IMAGE_DIR, `${post.slug}.jpeg`);
    fs.writeFileSync(localPath, imageBuffer);
    console.log(`[AutoBlog]   → Saved locally (Supabase not configured)`);
    return `/blog-images/${post.slug}.jpeg`;
  }
}

/* ─── Step 4: Ensure unique slug ────────────────────────────────────────────── */
async function ensureUniqueSlug(baseSlug) {
  let slug = baseSlug;
  let counter = 1;
  while (await BlogPost.exists({ slug })) {
    slug = `${baseSlug}-${counter++}`;
  }
  return slug;
}

/* ─── Main orchestrator ─────────────────────────────────────────────────────── */
/**
 * @param {"cron"|"manual"} triggeredBy
 * @param {number} [count] override number of posts (defaults to POSTS_PER_RUN)
 */
export async function runAutoBlogGeneration(triggeredBy = "cron", count) {
  const postsRequested = count || POSTS_PER_RUN;
  const log = await AutoBlogLog.create({ triggeredBy, postsRequested });
  const startedAt = Date.now();

  console.log(`[AutoBlog] Starting run (${triggeredBy}) — ${postsRequested} posts`);

  try {
    // Fetch existing titles to avoid duplicates
    const existing = await BlogPost.find({}).select("title slug").lean();
    const existingTitles = existing.map((p) => p.title);

    // Generate topic ideas
    console.log("[AutoBlog] Generating topic ideas...");
    const ideas = await generateTopicIdeas(existingTitles, postsRequested);
    console.log(`[AutoBlog] Got ${ideas.length} ideas`);

    const postResults = [];
    let postsCreated = 0;
    let postsFailed = 0;

    for (let i = 0; i < ideas.length; i++) {
      const idea = ideas[i];
      console.log(`[AutoBlog] [${i + 1}/${ideas.length}] Writing: "${idea.title}"`);

      const result = { title: idea.title, slug: "", status: "ok", error: "", coverImage: "" };

      try {
        // Generate content
        const postData = await generateBlogContent(idea);
        postData.slug = await ensureUniqueSlug(postData.slug || slugify(postData.title));

        // Generate & upload image
        console.log(`[AutoBlog]   → Generating cover image...`);
        let coverImage = "";
        try {
          coverImage = await generateAndUploadImage(postData);
          console.log(`[AutoBlog]   → Image uploaded: ${coverImage}`);
        } catch (imgErr) {
          console.error(`[AutoBlog]   → Image failed (post will save without cover): ${imgErr.message}`);
        }

        // Save to MongoDB as published
        const now = new Date();
        await BlogPost.create({
          slug: postData.slug,
          title: postData.title,
          excerpt: postData.excerpt || "",
          content: postData.content,
          icon: postData.icon || "📝",
          coverImage,
          author: "Deeplink Team",
          tags: postData.tags || [],
          status: "published",
          metaTitle: postData.metaTitle || postData.title,
          metaDescription: postData.metaDescription || postData.excerpt,
          metaKeywords: postData.metaKeywords || "",
          readTime: postData.readTime || "7 min read",
          datePublished: now,
          faqs: postData.faqs || [],
        });

        result.slug = postData.slug;
        result.coverImage = coverImage;
        postsCreated++;
        console.log(`[AutoBlog]   ✅ Saved: /blog/${postData.slug}`);
      } catch (err) {
        result.status = "failed";
        result.error = err.message;
        postsFailed++;
        console.error(`[AutoBlog]   ❌ Failed: ${err.message}`);
      }

      postResults.push(result);

      // Rate-limit: wait between posts to avoid throttling
      if (i < ideas.length - 1) {
        await delay(2000);
      }
    }

    const durationMs = Date.now() - startedAt;
    await AutoBlogLog.findByIdAndUpdate(log._id, {
      status: "completed",
      postsCreated,
      postsFailed,
      posts: postResults,
      finishedAt: new Date(),
      durationMs,
    });

    console.log(`[AutoBlog] ✅ Run complete — ${postsCreated} created, ${postsFailed} failed (${(durationMs / 1000).toFixed(1)}s)`);
    return { postsCreated, postsFailed, posts: postResults };
  } catch (err) {
    const durationMs = Date.now() - startedAt;
    await AutoBlogLog.findByIdAndUpdate(log._id, {
      status: "failed",
      error: err.message,
      finishedAt: new Date(),
      durationMs,
    });
    console.error(`[AutoBlog] ❌ Run failed: ${err.message}`);
    throw err;
  }
}

/**
 * Returns the most recent run logs
 */
export async function getAutoBlogLogs(limit = 10) {
  return AutoBlogLog.find({}).sort({ createdAt: -1 }).limit(limit).lean();
}
