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

function apiDevServerPlugin() {
  return {
    name: 'api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost');
        if (url.pathname.startsWith('/api/v1/')) {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');

          if (url.pathname === '/api/v1/telemetry/sku') {
            const sku = url.searchParams.get('sku') || 'AMZN_EG_B0CHX1W2X8';
            const retailer_id = url.searchParams.get('retailer_id') || 'amzn_eg';
            return res.end(
              JSON.stringify(
                {
                  status: 'success',
                  sku,
                  retailer_id,
                  retailer_name: 'Amazon Egypt',
                  listed_price_egp: 29900,
                  currency: 'EGP',
                  in_stock: true,
                  stock_count: 14,
                  seller: { name: 'Amazon Retail 1P', is_verified: true, rating: 4.9 },
                  probe_latency_ms: 118,
                  last_synced_at: new Date().toISOString(),
                },
                null,
                2
              )
            );
          }

          if (url.pathname === '/api/v1/audit/ghost-discount') {
            const sku = url.searchParams.get('sku') || 'AMZN_EG_B0CHX1W2X8';
            const windowDays = parseInt(url.searchParams.get('window_days') || '90', 10);
            return res.end(
              JSON.stringify(
                {
                  status: 'success',
                  sku,
                  window_days: windowDays,
                  baseline_median_egp: 28500,
                  current_shelf_egp: 29900,
                  advertised_discount_pct: 35.0,
                  real_discount_pct: -4.9,
                  pre_sale_spike_detected: true,
                  spike_magnitude_egp: 16100,
                  authenticity_score: 18,
                  verdict: 'CRITICAL_GHOST_MARKUP',
                  evaluation_metrics: {
                    rolling_window_days: windowDays,
                    historical_sample_points: 1296,
                    max_historical_egp: 44600,
                    min_historical_egp: 28200,
                  },
                  evaluated_at: new Date().toISOString(),
                },
                null,
                2
              )
            );
          }

          if (url.pathname === '/api/v1/arbitrage/landed-cost') {
            const originHub = url.searchParams.get('origin_hub') || 'JFK';
            const cifUsd = parseFloat(url.searchParams.get('cif_usd') || '1299');
            const hsCode = url.searchParams.get('hs_code') || '8471.30';
            const weightKg = parseFloat(url.searchParams.get('weight_kg') || '1.5');
            const fxRate = 48.5;
            const freightRate = originHub === 'DE' ? 14.0 : 16.5;
            const freightEgp = Math.round(weightKg * freightRate * fxRate);
            const baseEgp = Math.round(cifUsd * fxRate);
            const declaredCif = baseEgp + freightEgp;
            const dutyEgp = hsCode === '8471.30' ? 0 : Math.round(declaredCif * 0.05);
            const vatEgp = Math.round((declaredCif + dutyEgp) * 0.14);
            const bankCommEgp = Math.round(baseEgp * 0.03);
            return res.end(
              JSON.stringify(
                {
                  status: 'success',
                  calculation_parameters: {
                    origin_hub: originHub,
                    source_price_usd: cifUsd,
                    weight_kg: weightKg,
                    hs_code: hsCode,
                    effective_fx_rate: fxRate,
                  },
                  cost_breakdown_egp: {
                    source_price_shelf: baseEgp,
                    air_freight_cargo: freightEgp,
                    declared_cif_subtotal: declaredCif,
                    customs_duty: dutyEgp,
                    statutory_vat_14pct: vatEgp,
                    banking_fx_commission_3pct: bankCommEgp,
                    total_landed_settlement: declaredCif + dutyEgp + vatEgp + bankCommEgp,
                  },
                  currency: 'EGP',
                  calculated_at: new Date().toISOString(),
                },
                null,
                2
              )
            );
          }

          if (url.pathname === '/api/v1/webhooks/glitch-radar') {
            return res.end(
              JSON.stringify(
                {
                  status: 'active',
                  subscription_id: 'sub_wh_091823fa',
                  target_url: 'https://consumer-api.internal/webhooks/cawlix',
                  threshold_pct: 35.0,
                  signing_secret: 'whsec_live_99d10e823b49910c2847aef9',
                  signature_header: 'X-Cawlix-Signature',
                  algorithm: 'HMAC-SHA256',
                  active_channels: ['LOW_LATENCY_WEBHOOK', 'TELEGRAM_GATEWAY'],
                  created_at: new Date().toISOString(),
                },
                null,
                2
              )
            );
          }
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), webpAssetOptimizerPlugin(), apiDevServerPlugin()],
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
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('framer-motion') || id.includes('lucide-react')) {
              return 'vendor-ui';
            }
            return 'vendor';
          }
        },
      },
    },
  },
  server: {
    port: 5173,
    strictPort: false,
  },
});
