/**
 * Generate cover images for all blog posts that don't have one.
 *
 * Usage:
 *   node --env-file=backend/.env backend/scripts/generateBlogImages.js
 *
 *   # Regenerate all (even posts that already have an image):
 *   node --env-file=backend/.env backend/scripts/generateBlogImages.js --force
 *
 * Images are saved to:  FrontEnd/public/blog-images/{slug}.jpeg
 * MongoDB field updated: BlogPost.coverImage = "/blog-images/{slug}.jpeg"
 *
 * Model:   gpt-image-2 (latest, best text rendering & composition)
 * Size:    1536×864 px  — exact 16:9, same ratio as 1200×675
 * Quality: medium
 * Cost:    ~$0.041 per image  ×4 posts ≈ $0.16 ≈ ₹13 total
 */

import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { BlogPost } from "../models/blog.model.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, "../../FrontEnd/public/blog-images");
const FORCE = process.argv.includes("--force");
const SUPABASE_BUCKET = "blog-images";

function getSupabase() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/* ─── Validate env ─────────────────────────────────────────────────────────── */
const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || process.env.DB_URL;
if (!MONGODB_URI) {
  console.error("❌  No MongoDB URI found. Set DB_URL in .env");
  process.exit(1);
}
if (!process.env.OPENAI_API_KEY) {
  console.error("❌  OPENAI_API_KEY is not set in .env");
  console.error("   Get your key at https://platform.openai.com/api-keys");
  process.exit(1);
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/* ─── Image prompt builder ──────────────────────────────────────────────────── */
/**
 * Hardcoded prompts for the 4 seed posts. Falls back to a dynamic prompt for new posts.
 * Every prompt explicitly suppresses text — gpt-image-2 is very good at rendering
 * text, so we must be forceful to prevent any labels appearing in the artwork.
 */
const SLUG_PROMPTS = {
  "firebase-dynamic-links-alternatives-2025": `
    A professional tech blog hero illustration, 16:9 widescreen, flat digital art style.
    Scene: A large glowing Firebase logo (orange hexagon) on the left side is visually 
    "fading out" with a subtle crack running through it. On the right, a modern electric-blue 
    deep-link chain icon glows brightly, representing the replacement. Between them, small 
    mobile app icons (shopping cart, food delivery map pin, fintech dollar icon) float and 
    drift toward the blue deep link icon. Background: very dark charcoal (#0f0f14) with faint 
    concentric circle grid lines. Clean B2B SaaS aesthetic. Dramatic side lighting. 
    CRITICAL: Absolutely zero text, zero letters, zero words, zero numbers, zero labels, 
    zero UI copy anywhere in the image.
  `,
  "what-is-deep-linking": `
    A professional tech blog hero illustration, 16:9 widescreen, flat digital art style.
    Scene: Center frame — a sleek modern smartphone held upright, its screen showing a product 
    detail page inside a mobile shopping app (visible: a product image, a colored button, 
    price indicator shapes — no readable text). From the left edge of the frame, a glowing 
    electric-blue curved arrow sweeps through the air and enters the phone screen directly, 
    bypassing everything. Small orbiting circles represent other app types (food, banking, 
    social). Background: deep navy blue to near-black gradient. Soft blue glow halos.
    CRITICAL: Absolutely zero text, zero letters, zero words, zero numbers, zero labels, 
    zero UI copy anywhere in the image.
  `,
  "deferred-deep-linking-for-product-managers": `
    A professional tech blog hero illustration, 16:9 widescreen, flat digital art style.
    Scene: A horizontal left-to-right flow diagram using icon metaphors only. Step 1 — 
    a glowing link-chain icon. Step 2 — a smartphone showing an app store download screen 
    (abstract, no text: just a download arrow icon and star ratings). Step 3 — a green 
    checkmark install confirmation. Step 4 — the same phone now open to a product screen, 
    with a soft golden "intent preserved" glow surrounding it. Behind the flow, a blurred 
    analytics dashboard silhouette. Background: deep indigo to near-black gradient.
    CRITICAL: Absolutely zero text, zero letters, zero words, zero numbers, zero labels, 
    zero UI copy anywhere in the image.
  `,
  "how-to-implement-deep-linking-android-ios": `
    A professional tech blog hero illustration, 16:9 widescreen, flat digital art style.
    Scene: Left side — the Android robot icon in green. Right side — the Apple logo in silver. 
    Between them, a glowing electric-blue chain of links connects the two, symbolizing deep 
    linking. Behind them both, faint lines of code (abstract green and blue glowing lines — 
    no readable code or characters, purely decorative streaks) fade into the dark background. 
    Two modern smartphones flank the icons, their screens both showing the same abstract 
    app destination screen (no text, just colored UI shapes). 
    Background: very dark charcoal, subtle blue-green code ambient glow.
    CRITICAL: Absolutely zero text, zero letters, zero words, zero numbers, zero labels, 
    zero UI copy anywhere in the image. Code lines must be purely decorative abstract streaks.
  `,
};

/** Build a generic prompt for any post not in the hardcoded map */
function buildDynamicPrompt(post) {
  const topic = post.title.replace(/[|–—:]/g, " ").trim();
  const tags = (post.tags || []).slice(0, 3).join(", ");
  return `
    A professional tech blog hero illustration, 16:9 widescreen, flat digital art style.
    The visual metaphor should represent the concept of: ${tags || "mobile app deep linking and developer tools"}.
    Topic area: ${topic}.
    Style: flat minimalist illustration, very dark background (#0f0f14), electric blue and 
    white glowing accents, clean B2B SaaS aesthetic. Dramatic composition with depth and atmosphere.
    CRITICAL: Absolutely zero text, zero letters, zero words, zero numbers, zero labels, 
    zero UI copy anywhere in the image. Purely visual metaphors only.
  `;
}

/* ─── Main ──────────────────────────────────────────────────────────────────── */
async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  await mongoose.connect(MONGODB_URI);
  console.log("✅  Connected to MongoDB\n");

  const posts = await BlogPost.find({}).sort({ createdAt: 1 });
  const targets = FORCE
    ? posts
    : posts.filter((p) => !p.coverImage);

  if (targets.length === 0) {
    console.log("✨  All posts already have cover images. Use --force to regenerate.");
    await mongoose.disconnect();
    return;
  }

  console.log(`🎨  Generating images for ${targets.length} post(s)...\n`);

  let ok = 0;
  let failed = 0;

  for (const post of targets) {
    const slug = post.slug;
    const filename = `${slug}.jpeg`;
    const outputPath = path.join(OUTPUT_DIR, filename);
    const publicPath = `/blog-images/${filename}`;

    console.log(`  ⏳  "${post.title}"`);

    try {
      const rawPrompt = (SLUG_PROMPTS[slug] || buildDynamicPrompt(post)).trim();

      const result = await openai.images.generate({
        model: "gpt-image-2",
        prompt: rawPrompt,
        size: "1536x864",      // exact 16:9 — same ratio as 1200×675, both ÷16 valid
        quality: "medium",
        output_format: "jpeg",
        n: 1,
      });

      const b64 = result.data[0].b64_json;
      if (!b64) throw new Error("No image data returned");

      const imageBuffer = Buffer.from(b64, "base64");
      const supabase = getSupabase();
      let savedPath = publicPath;

      if (supabase) {
        // Upload to Supabase
        const remotePath = `posts/${filename}`;
        const { error: upErr } = await supabase.storage
          .from(SUPABASE_BUCKET)
          .upload(remotePath, imageBuffer, { contentType: "image/jpeg", upsert: true });
        if (upErr) throw new Error(`Supabase upload failed: ${upErr.message}`);
        const { data: urlData } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(remotePath);
        savedPath = urlData.publicUrl;
        console.log(`  ✅  Uploaded to Supabase → ${savedPath.slice(0, 80)}…`);
      } else {
        // Fallback: save locally
        fs.writeFileSync(outputPath, imageBuffer);
        console.log(`  ✅  Saved locally → ${publicPath}  (${(fs.statSync(outputPath).size / 1024).toFixed(0)} KB)`);
      }

      await BlogPost.findByIdAndUpdate(post._id, { coverImage: savedPath });
      ok++;
    } catch (err) {
      console.error(`  ❌  FAILED for "${post.title}": ${err.message}`);
      if (err?.status === 401) {
        console.error("      → Invalid API key. Check OPENAI_API_KEY in .env");
        break;
      }
      if (err?.status === 403) {
        console.error("      → Your OpenAI account needs image API access. See: https://platform.openai.com/docs/guides/production-best-practices");
        break;
      }
      failed++;
    }

    // Small delay to stay within rate limits
    if (ok + failed < targets.length) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  console.log(`\n📊  Done — ${ok} generated, ${failed} failed`);
  if (ok > 0) {
    console.log(`\n📁  Images saved to: FrontEnd/public/blog-images/`);
    console.log(`🔄  Restart your dev server to serve the new images.`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
