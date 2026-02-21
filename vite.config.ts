import path from 'path';
import { defineConfig, loadEnv } from 'vite';
/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        manifestFilename: 'manifest.json',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
        manifest: {
          name: 'Wealth Aggregator Pro',
          short_name: 'WealthPro',
          description: 'Advanced Personal Finance Dashboard',
          theme_color: '#4f46e5',
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
            }
          ]
        }
      })
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || '')
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      // Enable minification and tree-shaking
      minify: 'esbuild',
      sourcemap: mode === 'development',
      // Target modern browsers for better optimization
      target: 'es2022',
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './tests/setup.ts',
      css: true,
      pool: 'threads',
      poolOptions: {
        threads: {
          singleThread: true
        }
      },
    },
    // Optimize dependencies
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'zustand',
        'dexie',
        'recharts',
        'framer-motion',
        'lucide-react',
        'date-fns',
      ],
      exclude: [
        '@google/genai', // Lazy loaded
      ],
    },
  };
});
