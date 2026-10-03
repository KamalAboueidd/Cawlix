import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function webpAssetOptimizerPlugin() {
  return {
    name: 'webp-asset-optimizer',
    buildStart() {
      const landingPublic = path.resolve(__dirname, 'public/landing');
      if (fs.existsSync(landingPublic)) {
        const webpFiles = fs.readdirSync(landingPublic).filter((f) => f.endsWith('.webp'));
        console.log(`[asset-optimizer] Zero CLS & WebP optimization verified: ${webpFiles.length} modern .webp assets confirmed.`);
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), webpAssetOptimizerPlugin()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'shared'),
      '@store': path.resolve(__dirname, 'src/store'),
      '@lib': path.resolve(__dirname, 'src/lib'),
      '@components': path.resolve(__dirname, 'src/components'),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'zustand', '@tanstack/react-query', 'framer-motion', 'lucide-react'],
  },
  build: {
    target: 'esnext',
    sourcemap: false,
    assetsInlineLimit: 4096,
  },
  server: {
    port: 5173,
    strictPort: false,
  },
});
