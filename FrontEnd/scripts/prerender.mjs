/**
 * Post-build prerender for public marketing routes.
 * Serves dist/, loads each route with system Chrome (puppeteer-core), writes static HTML.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createServer } from 'http'
import handler from 'serve-handler'
import puppeteer from 'puppeteer-core'
import { PRERENDER_ROUTES, KNOWN_BLOG_SLUGS } from '../src/constants/prerenderRoutes.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, '..', 'dist')
const PORT = 4179

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean)

function resolveChrome() {
  for (const candidate of CHROME_CANDIDATES) {
    if (fs.existsSync(candidate)) return candidate
  }
  return null
}

function routeToOutputPath(route) {
  if (route === '/') return path.join(distDir, 'index.html')
  const clean = route.replace(/\/$/, '')
  return path.join(distDir, clean, 'index.html')
}

/** Fetch published blog slugs from the API to include in the prerender. */
async function fetchBlogSlugs() {
  const apiBase = process.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'
  try {
    const res = await fetch(`${apiBase}/blog?limit=100`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const slugs = (data.posts || []).map((p) => p.slug).filter(Boolean)
    console.log(`[prerender] fetched ${slugs.length} blog slugs from API`)
    return slugs
  } catch (err) {
    console.warn(`[prerender] could not fetch blog slugs (${err.message}) — using known slugs`)
    return KNOWN_BLOG_SLUGS
  }
}

async function main() {
  if (process.env.SKIP_PRERENDER === '1' || process.env.SKIP_PRERENDER === 'true') {
    console.log('[prerender] SKIP_PRERENDER set — skipping static prerender')
    return
  }

  if (!fs.existsSync(path.join(distDir, 'index.html'))) {
    console.error('[prerender] dist/index.html missing — run vite build first')
    process.exit(1)
  }

  const blogSlugs = await fetchBlogSlugs()
  const blogRoutes = blogSlugs.map((s) => `/blog/${s}`)
  const allRoutes = [...PRERENDER_ROUTES, ...blogRoutes]

  const executablePath = resolveChrome()
  if (!executablePath) {
    // Vercel/CI images do not ship Chrome; SPA build is still valid.
    console.warn(
      '[prerender] No Chrome/Chromium found — skipping prerender (SPA fallback). ' +
        'Set CHROME_PATH locally or install Google Chrome to enable static HTML output.'
    )
    return
  }

  console.log(`[prerender] using Chrome at ${executablePath}`)

  const server = createServer((req, res) =>
    handler(req, res, {
      public: distDir,
      rewrites: [{ source: '**', destination: '/index.html' }],
    })
  )

  await new Promise((resolve) => server.listen(PORT, resolve))
  console.log(`[prerender] serving dist on http://127.0.0.1:${PORT}`)

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  })

  let ok = 0
  let failed = 0
  const page = await browser.newPage()

  try {
    for (const route of allRoutes) {
      const url = `http://127.0.0.1:${PORT}${route}`
      try {
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 })
        await new Promise((r) => setTimeout(r, 1200))
        const html = await page.content()
        const outPath = routeToOutputPath(route)
        fs.mkdirSync(path.dirname(outPath), { recursive: true })
        fs.writeFileSync(outPath, html, 'utf8')
        const hasJsonLd = html.includes('application/ld+json')
        console.log(
          `[prerender] ${route} → ${path.relative(distDir, outPath)}` +
            (hasJsonLd ? ' (json-ld)' : '')
        )
        ok += 1
      } catch (err) {
        failed += 1
        console.error(`[prerender] FAILED ${route}:`, err.message)
      }
    }
  } finally {
    await page.close().catch(() => {})
    await browser.close().catch(() => {})
    server.close()
  }

  console.log(`[prerender] done — ${ok} ok, ${failed} failed`)
  if (failed > 0) process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
