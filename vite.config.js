import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import pkg from './package.json' with { type: 'json' }

export default defineConfig({
  plugins: [react()],
  base: '/',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Keep node_modules as vendor chunk
          if (id.includes('node_modules')) return 'vendor'
          // Group tool components + their utils by category
          if (id.includes('/components/Generate/') || id.includes('/utils/generators')) return 'tools-generate'
          if (id.includes('/components/Encode/')) return 'tools-encode'
          if (id.includes('/components/Convert/')) return 'tools-convert'
          if (id.includes('/components/Hash/') || id.includes('/utils/hash')) return 'tools-hash'
          if (id.includes('/components/Text/') || id.includes('/utils/text')) return 'tools-text'
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
  },
})
