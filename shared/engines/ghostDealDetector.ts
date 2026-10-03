// ─────────────────────────────────────────────────────────────────────────────
// Ghost Deal Detector
// Analyzes 90-day time-series price data to detect synthetic price spikes
// manufactured to inflate the apparent "discount" of a sale event.
//
// Algorithm:
//   1. Compute a rolling 90-day baseline median (excluding final 7 days).
//   2. Detect if a pre-sale price spike occurred (>10% above median within 72h
//      before the sale).
//   3. Calculate Deal Authenticity Score (0–100).
//   4. Classify as AUTHENTIC_BARGAIN | GHOST_MARKUP | INCONCLUSIVE.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  GhostDealInput,
  GhostDealResult,
  DealVerdict,
  PriceWindow,
} from '../types/index.js';

// ── Statistical helpers ───────────────────────────────────────────────────────

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

function daysBetween(a: string, b: string): number {
  return Math.abs(
    (new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24)
  );
}

function hoursBetween(a: string, b: string): number {
  return Math.abs(
    (new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60)
  );
}

// ── Core detector ────────────────────────────────────────────────────────────

/**
 * Analyzes a 90-day price time-series to detect ghost deals (artificial inflation).
 *
 * @param input - Price windows (chronological), sale info, and sale timestamp
 * @returns Full ghost deal analysis with authenticity score and verdict
 */
export function detectGhostDeal(input: GhostDealInput): GhostDealResult {
  const { windows, salePrice, saleTimestamp } = input;
  const flags: string[] = [];

  if (windows.length < 7) {
    return {
      verdict: 'INCONCLUSIVE',
      authenticityScore: 50,
      baselineMedian: salePrice,
      preSpikeMax: salePrice,
      inflationPct: 0,
      actualDiscount: 0,
      actualDiscountPct: 0,
      flags: ['INSUFFICIENT_DATA: fewer than 7 data points'],
    };
  }

  // ── Step 1: Partition windows ────────────────────────────────────────────

  // Baseline = all points more than 7 days before sale
  const baselineWindows: PriceWindow[] = [];
  // Pre-sale window = 1–7 days before sale
  const preSaleWindows: PriceWindow[] = [];
  // Short pre-sale window = 0–72h before sale (spike detection zone)
  const spikeZoneWindows: PriceWindow[] = [];

  for (const w of windows) {
    const hoursAgo = hoursBetween(w.timestamp, saleTimestamp);
    const daysAgo = hoursAgo / 24;

    if (daysAgo > 7) {
      baselineWindows.push(w);
    } else if (daysAgo <= 7 && daysAgo > (72 / 24)) {
      preSaleWindows.push(w);
    } else if (daysAgo <= 3) {
      spikeZoneWindows.push(w);
    }
  }

  // Fall back to all windows if not enough baseline data
  const effectiveBaseline =
    baselineWindows.length >= 5 ? baselineWindows : windows.slice(0, -7);

  const baselinePrices = effectiveBaseline.map((w) => w.price);
  const baselineMedian = median(baselinePrices);
  const baseline90thPct = percentile(baselinePrices, 90);

  // ── Step 2: Detect pre-spike ─────────────────────────────────────────────

  const preSpikeMax =
    spikeZoneWindows.length > 0
      ? Math.max(...spikeZoneWindows.map((w) => w.price))
      : baselineMedian;

  const inflationPct =
    baselineMedian > 0
      ? ((preSpikeMax - baselineMedian) / baselineMedian) * 100
      : 0;

  const spikeDetected = inflationPct > 10;

  if (spikeDetected) {
    flags.push(
      `SPIKE_DETECTED: price inflated ${inflationPct.toFixed(1)}% above 90-day median within 72h of sale`
    );
  }

  // ── Step 3: Actual discount vs real baseline ─────────────────────────────

  const actualDiscount = baselineMedian - salePrice;
  const actualDiscountPct =
    baselineMedian > 0 ? (actualDiscount / baselineMedian) * 100 : 0;

  const advertisedDiscount = preSpikeMax - salePrice;
  const advertisedDiscountPct =
    preSpikeMax > 0 ? (advertisedDiscount / preSpikeMax) * 100 : 0;

  const discountInflation = advertisedDiscountPct - actualDiscountPct;

  if (actualDiscountPct < 0) {
    flags.push(`ABOVE_BASELINE: sale price is ${Math.abs(actualDiscountPct).toFixed(1)}% ABOVE 90-day baseline`);
  }

  if (discountInflation > 15) {
    flags.push(
      `INFLATED_CLAIM: advertised discount is ${discountInflation.toFixed(1)}pp higher than real discount`
    );
  }

  // ── Step 4: Authenticity score (0–100) ──────────────────────────────────
  //
  // Scoring model:
  //   Start at 100. Deductions:
  //   - Spike detected (>10%):         -30
  //   - Inflation > 20%:               -20 additional
  //   - Sale price ≥ baseline:         -40
  //   - Discount inflation > 15pp:     -20
  //   - Very few baseline windows:     -10
  //   - Volatile baseline (std>20%):   -10

  let score = 100;

  if (spikeDetected) score -= 30;
  if (inflationPct > 20) score -= 20;
  if (actualDiscountPct <= 0) score -= 40;
  if (discountInflation > 15) score -= 20;
  if (effectiveBaseline.length < 10) {
    score -= 10;
    flags.push('LOW_BASELINE_CONFIDENCE: fewer than 10 baseline samples');
  }

  // Volatility penalty
  const mean = baselinePrices.reduce((a, b) => a + b, 0) / baselinePrices.length;
  const variance =
    baselinePrices.reduce((acc, p) => acc + Math.pow(p - mean, 2), 0) /
    baselinePrices.length;
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = mean > 0 ? stdDev / mean : 0;

  if (coefficientOfVariation > 0.2) {
    score -= 10;
    flags.push(`HIGH_VOLATILITY: price CV=${(coefficientOfVariation * 100).toFixed(1)}%`);
  }

  score = Math.max(0, Math.min(100, score));

  // ── Step 5: Verdict ──────────────────────────────────────────────────────

  let verdict: DealVerdict;
  if (score >= 70) {
    verdict = 'AUTHENTIC_BARGAIN';
  } else if (score < 40) {
    verdict = 'GHOST_MARKUP';
  } else {
    verdict = 'INCONCLUSIVE';
  }

  return {
    verdict,
    authenticityScore: score,
    baselineMedian,
    preSpikeMax,
    inflationPct,
    actualDiscount,
    actualDiscountPct,
    flags,
  };
}

/**
 * Returns a short human-readable summary of a ghost deal result.
 */
export function formatGhostDealSummary(result: GhostDealResult): string {
  const verdictLabel =
    result.verdict === 'AUTHENTIC_BARGAIN'
      ? '✓ AUTHENTIC BARGAIN'
      : result.verdict === 'GHOST_MARKUP'
      ? '✗ GHOST MARKUP'
      : '~ INCONCLUSIVE';

  return [
    `${verdictLabel} — Authenticity Score: ${result.authenticityScore}/100`,
    `90-Day Baseline Median: ${result.baselineMedian.toFixed(2)}`,
    `Pre-Sale Max (spike zone): ${result.preSpikeMax.toFixed(2)}`,
    `Inflation vs Baseline: ${result.inflationPct.toFixed(1)}%`,
    `Actual Discount vs Baseline: ${result.actualDiscountPct.toFixed(1)}%`,
    result.flags.length > 0 ? `Flags:\n  ${result.flags.join('\n  ')}` : 'No flags.',
  ].join('\n');
}
