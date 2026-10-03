// ─────────────────────────────────────────────────────────────────────────────
// TanStack React Query — Client Configuration
// Aggressive caching, request deduplication, and zero stale-UI policy.
// ─────────────────────────────────────────────────────────────────────────────

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache pricing data for 60 seconds before considering stale
      staleTime: 60 * 1000,

      // Keep data in memory cache for 5 minutes after unmount
      gcTime: 5 * 60 * 1000,

      // Retry failed requests up to 2 times with exponential backoff
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10_000),

      // Refetch on window focus for live telemetry accuracy
      refetchOnWindowFocus: true,

      // Do NOT refetch on reconnect for bandwidth efficiency
      refetchOnReconnect: false,

      // No background interval polling by default — use WebSocket instead
      refetchInterval: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// ── Query Key Factory ─────────────────────────────────────────────────────────
// Centralized key management prevents cache collisions and simplifies
// invalidation across the app.

export const queryKeys = {
  // Products
  products: {
    all: () => ['products'] as const,
    list: (filters?: Record<string, unknown>) =>
      ['products', 'list', filters] as const,
    detail: (id: string) => ['products', 'detail', id] as const,
  },

  // Prices
  prices: {
    all: () => ['prices'] as const,
    forProduct: (productId: string) =>
      ['prices', 'product', productId] as const,
    history: (productId: string, retailerId: string) =>
      ['prices', 'history', productId, retailerId] as const,
    comparison: (productId: string) =>
      ['prices', 'comparison', productId] as const,
  },

  // Ghost Deal Analysis
  ghostAnalysis: {
    all: () => ['ghost-analysis'] as const,
    forDeal: (productId: string, retailerId: string) =>
      ['ghost-analysis', productId, retailerId] as const,
  },

  // Landed Cost
  landedCost: {
    all: () => ['landed-cost'] as const,
    calculate: (params: Record<string, unknown>) =>
      ['landed-cost', 'calculate', params] as const,
    fxRates: () => ['landed-cost', 'fx-rates'] as const,
  },

  // Telemetry
  telemetry: {
    status: () => ['telemetry', 'status'] as const,
  },

  // Auth
  auth: {
    session: () => ['auth', 'session'] as const,
  },
} as const;
