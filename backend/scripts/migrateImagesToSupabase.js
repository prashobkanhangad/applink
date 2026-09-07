/**
 * Migrate local blog images → Supabase Storage
 *
 * Reads every .jpeg/.jpg/.png from FrontEnd/public/blog-images/,
 * uploads it to the Supabase "blog-images" bucket under posts/{filename},
 * and updates the matching BlogPost.coverImage with the public URL.
 *
 * Usage:
 *   node --env-file=.env scripts/migrateImagesToSupabase.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { createClient } from "@supabase/supabase-js";
import { BlogPost } from "../models/blog.model.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCAL_DIR = path.join(__dirname, "../../FrontEnd/public/blog-images");
const BUCKET = "blog-images";

/* ─── Validate env ──────────────────────────────────────────────────────────── */
const DB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || process.env.DB_URL;
if (!DB_URI) { console.error("❌  No DB URI found"); process.exit(1); }
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌  SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env");
  process.exit(1);
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

/* ─── Ensure bucket exists and is public ────────────────────────────────────── */
async function ensureBucket() {
  // Try listing to verify the key works
  const { data: buckets, error: listErr } = await supabase.storage.listBuckets();

  if (listErr) {
    // anon key can't list buckets — warn and continue (bucket may exist)
    console.warn(`⚠️  Cannot list buckets (${listErr.message}) — make sure you created "blog-images" as a public bucket in Supabase dashboard`);
    return;
  }

  const exists = buckets.some((b) => b.name === BUCKET);
  if (exists) {
    console.log(`✅  Bucket "${BUCKET}" exists`);
    return;
  }

  // Try creating it
  const { error: createErr } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024,
  });

  if (createErr) {
    console.warn(`⚠️  Could not auto-create bucket: ${createErr.message}`);
    console.warn(`    → Please create a PUBLIC bucket named "${BUCKET}" in Supabase Dashboard → Storage`);
    console.warn(`    → Then re-run this script`);
    process.exit(1);
  }

  console.log(`✅  Created public bucket "${BUCKET}"`);
}

/* ─── Main ──────────────────────────────────────────────────────────────────── */
async function main() {
  await mongoose.connect(DB_URI);
  console.log("✅  Connected to MongoDB");

  await ensureBucket();
  console.log();

  const files = fs.readdirSync(LOCAL_DIR).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
  if (files.length === 0) {
    console.log("No images found in FrontEnd/public/blog-images/");
    await mongoose.disconnect();
    return;
  }

  console.log(`📦  Found ${files.length} image(s) to migrate\n`);

  let ok = 0, skipped = 0, failed = 0;

  for (const file of files) {
    const slug = file.replace(/\.[^.]+$/, "");           // remove extension
    const ext  = path.extname(file).slice(1);             // "jpeg" | "png" etc.
    const mime = ext === "png" ? "image/png" : "image/jpeg";
    const remotePath = `posts/${file}`;
    const localPath  = path.join(LOCAL_DIR, file);

    process.stdout.write(`  ⏳  ${file}  →  `);

    try {
      const buffer = fs.readFileSync(localPath);

      const { error: uploadErr } = await supabase.storage
        .from(BUCKET)
        .upload(remotePath, buffer, { contentType: mime, upsert: true });

      if (uploadErr) throw new Error(uploadErr.message);

      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(remotePath);
      const publicUrl = urlData.publicUrl;

      // Update any post whose coverImage is the local path
      const result = await BlogPost.updateOne(
        { $or: [
            { coverImage: `/blog-images/${file}` },
            { coverImage: `blog-images/${file}` },
            { slug },
          ]
        },
        { coverImage: publicUrl }
      );

      if (result.matchedCount === 0) {
        console.log(`⚠️  uploaded but no matching post for slug "${slug}"`);
        skipped++;
      } else {
        console.log(`✅  ${publicUrl.slice(0, 80)}…`);
        ok++;
      }
    } catch (err) {
      console.log(`❌  ${err.message}`);
      failed++;
    }
  }

  console.log(`\n📊  Done — ${ok} migrated, ${skipped} no-match, ${failed} failed`);
  if (ok > 0) {
    console.log("✨  Posts in MongoDB now point to Supabase URLs.");
    console.log("    You can delete FrontEnd/public/blog-images/ from git if you want.");
  }

  await mongoose.disconnect();
}

main().catch((err) => { console.error(err); process.exit(1); });
