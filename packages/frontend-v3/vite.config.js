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
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization",
      // 2. Убиваем заглушку ngrok, которая ломает запросы ресурсов
      "ngrok-skip-browser-warning": "true" 
    },
    proxy: {
      // Все запросы, начинающиеся с /api, пойдут на 3000 порт
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    },
    //allowedHosts: 'all',
    allowedHosts: [
      'kl0fc7oqgqc4.share.zrok.io',
      'trickiest-anjelica-fustier.ngrok-free.dev',
      'localhost:3000',
      'localhost:3030',
      '0.0.0.0:3030',
      '0.0.0.0:3000',
      '127.0.0.1:3030',
      '127.0.0.1:3000',
      'trickiest-anjelica-fustier.ngrok-free.app', // Добавь этот на всякий случай
      'all' // Или просто напиши 'all' для тестов
    ]
  }
})
