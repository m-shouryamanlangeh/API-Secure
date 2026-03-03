import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Spline 3D is inherently large (~4.5MB) but is lazy-loaded
    chunkSizeWarningLimit: 5000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // React core - keep together to avoid initialization issues
            if (id.includes('/react-dom/') || id.includes('/react/') || id.includes('/scheduler')) {
              return 'vendor-react';
            }
            // React Router - separate from core React
            if (id.includes('/react-router')) {
              return 'vendor-router';
            }
            // Firebase (large) - matches all firebase submodules
            if (id.includes('/firebase/') || id.includes('/@firebase/')) {
              return 'vendor-firebase';
            }
            // Spline 3D (large)
            if (id.includes('@splinetool')) {
              return 'vendor-spline';
            }
            // Animation libraries
            if (id.includes('framer-motion')) {
              return 'vendor-animation';
            }
            // Charts
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'vendor-charts';
            }
            // Supabase
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            // DO NOT manually chunk Radix UI - let Vite handle it
            // This prevents circular dependency issues
          }
        },
      },
    },
  },
  server: {
    proxy: {
      '/webhook': {
        target: env.VITE_N8N_WEBHOOK_BASE_URL || 'http://localhost:5678',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/webhook/, '/webhook'),
      },
    },
  },
};
});
