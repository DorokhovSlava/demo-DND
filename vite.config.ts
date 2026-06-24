import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

/**
 * Конфигурация Vite для разработки и сборки.
 */
export default defineConfig({
  // Base-путь сборки. Для GitHub Pages project-page нужен "/<repo>/" (задаётся VITE_BASE
  // в CI). По умолчанию "/" — локальная разработка и custom-домен.
  base: process.env.VITE_BASE ?? '/',

  plugins: [vue()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:8080',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'pinia', 'vue-router'],
          'pixi': ['pixi.js'],
          'stomp': ['@stomp/stompjs'],
        },
      },
    },
  },
});
