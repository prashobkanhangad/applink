import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const prerenderSsr = process.env.SSR_PRERENDER === '1'

// https://vitejs.dev/config/
// Prerender runs as a separate postbuild script (scripts/prerender.mjs) — vite-plugin-prerender
// is incompatible with ESM vite configs in this project.
export default defineConfig({
  plugins: [
    react(),
    !prerenderSsr && VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.jpg', 'llms.txt', 'robots.txt'],
      manifest: {
        name: 'Deeplink – Smart Deep Linking Platform',
        short_name: 'Deeplink',
        description: 'Create deep links that open the right screen in your app or site. Deferred deep linking, universal links, Android App Links and click analytics.',
        theme_color: '#0f172a',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/favicon.jpg', sizes: '192x192', type: 'image/jpeg', purpose: 'any' },
          { src: '/favicon.jpg', sizes: '512x512', type: 'image/jpeg', purpose: 'any' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,jpg,jpeg,png,svg,woff2,txt,xml}'],
        navigateFallback: 'index.html',
        navigateFallbackAllowlist: [/^\/dashboard/, /^\/admin/, /^\/onboarding/, /^\/blog\/.+/],
        navigateFallbackDenylist: [/^\/api/, /^\/llms\.txt$/, /^\/sitemap\.xml$/, /^\/robots\.txt$/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/accounts\.google\.com\/.*/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'google-apis', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 } },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
