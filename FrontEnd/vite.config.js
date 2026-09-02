import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
// Prerender runs as a separate postbuild script (scripts/prerender.mjs) — vite-plugin-prerender
// is incompatible with ESM vite configs in this project.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.jpg', 'llms.txt', 'robots.txt', 'sitemap.xml'],
      manifest: {
        name: 'Deeplink – Smart Deep Linking Platform',
        short_name: 'Deeplink',
        description: 'Smart deep linking platform for apps & web with seamless redirection and analytics.',
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
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
