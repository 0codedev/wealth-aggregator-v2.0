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
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      // Increase chunk size warning limit
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          // Enterprise-level code splitting strategy
          manualChunks: {
            // Core React ecosystem - most stable, rarely changes
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],

            // State management and data
            'vendor-state': ['zustand', 'dexie'],

            // Charts and visualization - large library, separate chunk
            'vendor-charts': ['recharts', 'lightweight-charts'],

            // UI components and animations
            'vendor-ui': ['framer-motion', 'lucide-react', '@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],

            // Form handling and validation
            'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],

            // Utilities and helpers
            'vendor-utils': ['date-fns', 'crypto-js'],

            // Document generation
            'vendor-docs': ['jspdf', 'jspdf-autotable'],

            // Google AI SDK - dynamic import already in code
            'vendor-ai': ['@google/genai'],
          },
        },
      },
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
