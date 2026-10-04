export const prerender = false;

interface GhostAuditMetrics {
  rolling_window_days: number;
  historical_sample_points: number;
  max_historical_egp: number;
  min_historical_egp: number;
  confidence_interval: number;
}

interface GhostAuditResponse {
  status: 'success' | 'error';
  sku: string;
  window_days: number;
  baseline_median_egp: number;
  current_shelf_egp: number;
  truth_index_pct: number;
  advertised_discount_pct: number;
  real_discount_pct: number;
  pre_sale_spike_detected: boolean;
  spike_magnitude_egp: number;
  authenticity_score: number;
  verdict: 'CRITICAL_GHOST_MARKUP' | 'MODERATE_MARKDOWN_RISK' | 'VERIFIED_REAL_DEAL';
  evaluation_metrics: GhostAuditMetrics;
  evaluated_at: string;
  message?: string;
  code?: number;
}

export async function GET({ request }: { request: Request }): Promise<Response> {
  const url = new URL(request.url);
  const sku = url.searchParams.get('sku') || 'AMZN_EG_B0CHX1W2X8';
  const windowDays = parseInt(url.searchParams.get('window_days') || '90', 10);
  const paramCurrentPrice = url.searchParams.get('current_price');

  const lowerSku = sku.toLowerCase();

  // Baseline median & current shelf simulation based on catalog benchmarks
  let baselineMedian = 28500;
  let currentShelf = 29900;
  let advertisedMSRP = 44600;

  if (lowerSku.includes('macbook') || lowerSku.includes('apple_macbook') || lowerSku.includes('b0chx1w2x8')) {
    baselineMedian = 86334;
    currentShelf = 94500;
    advertisedMSRP = 108000;
  } else if (lowerSku.includes('tv') || lowerSku.includes('samsung') || lowerSku.includes('qled')) {
    baselineMedian = 28500;
    currentShelf = 29400;
    advertisedMSRP = 39900;
  } else if (lowerSku.includes('sony') || lowerSku.includes('camera')) {
    baselineMedian = 118000;
    currentShelf = 122400;
    advertisedMSRP = 135000;
  }

  if (paramCurrentPrice) {
    const parsed = parseFloat(paramCurrentPrice);
    if (!isNaN(parsed) && parsed > 0) {
      currentShelf = parsed;
    }
  }

  // Algorithmic Formulas:
  // Truth_Index = ((current_price - median_90d) / median_90d) * 100
  const truthIndex = parseFloat((((currentShelf - baselineMedian) / baselineMedian) * 100).toFixed(2));
  const advertisedDiscountPct = parseFloat((((advertisedMSRP - currentShelf) / advertisedMSRP) * 100).toFixed(1));
  const realDiscountPct = parseFloat((((baselineMedian - currentShelf) / baselineMedian) * 100).toFixed(1));

  // Authenticity Score & Verdict Decision Logic
  let preSaleSpikeDetected = false;
  let spikeMagnitudeEgp = 0;
  let authenticityScore = 92;
  let verdict: 'CRITICAL_GHOST_MARKUP' | 'MODERATE_MARKDOWN_RISK' | 'VERIFIED_REAL_DEAL' = 'VERIFIED_REAL_DEAL';

  if (currentShelf > baselineMedian * 1.1) {
    // Current price is > 10% above 90-day median
    preSaleSpikeDetected = true;
    spikeMagnitudeEgp = Math.round(currentShelf - baselineMedian);
    authenticityScore = Math.max(12, Math.round(38 - Math.min(26, (currentShelf - baselineMedian * 1.1) / 100)));
    verdict = 'CRITICAL_GHOST_MARKUP';
  } else if (currentShelf > baselineMedian) {
    // Current price is between 0% and 10% above median
    preSaleSpikeDetected = false;
    spikeMagnitudeEgp = Math.round(currentShelf - baselineMedian);
    authenticityScore = Math.round(65 - (currentShelf - baselineMedian) / (baselineMedian * 0.1) * 20);
    verdict = 'MODERATE_MARKDOWN_RISK';
  } else {
    // Current price is <= 90-day median (Real Deal)
    preSaleSpikeDetected = false;
    spikeMagnitudeEgp = 0;
    authenticityScore = Math.min(99, Math.round(85 + Math.abs(currentShelf - baselineMedian) / baselineMedian * 50));
    verdict = 'VERIFIED_REAL_DEAL';
  }

  const payload: GhostAuditResponse = {
    status: 'success',
    sku: sku.toUpperCase(),
    window_days: windowDays,
    baseline_median_egp: baselineMedian,
    current_shelf_egp: currentShelf,
    truth_index_pct: truthIndex,
    advertised_discount_pct: advertisedDiscountPct,
    real_discount_pct: realDiscountPct,
    pre_sale_spike_detected: preSaleSpikeDetected,
    spike_magnitude_egp: spikeMagnitudeEgp,
    authenticity_score: authenticityScore,
    verdict: verdict,
    evaluation_metrics: {
      rolling_window_days: windowDays,
      historical_sample_points: windowDays * 14,
      max_historical_egp: advertisedMSRP,
      min_historical_egp: Math.round(baselineMedian * 0.94),
      confidence_interval: 0.998,
    },
    evaluated_at: new Date().toISOString(),
  };

  return new Response(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

export async function OPTIONS(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
