import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte()],
  build: {
    outDir: 'dist',
    minify: 'terser',
    sourcemap: false
  },
  server: {
    port: 3030,
    open: true,
    host: '0.0.0.0',
    proxy: {
      // Все запросы, начинающиеся с /api, пойдут на 3000 порт
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    },
    allowedHosts: [
      'trickiest-anjelica-fustier.ngrok-free.dev',
      'localhost:3000',
      'localhost:3030',
      '0.0.0.0:3030',
      '0.0.0.0:3000',
      '127.0.0.1:3030',
      '127.0.0.1:3000'
    ]
  }
})
