import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'MudoList',
        short_name: 'MudoList',
        description: 'A Google Keep-style list application',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    watch: {
      usePolling: true,
    },
    host: '0.0.0.0',
    strictPort: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://mudolist:5000',
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  build: {
    sourcemap: true,
    commonjsOptions: {
      sourceMap: false
    },
    rollupOptions: {
      output: {
        sourcemap: true,
        sourcemapExcludeSources: true
      }
    }
  }
})
