/**
 * BACKGROUND TELEMETRY SCHEDULER & FLEET WORKER (CAWLIX)
 * Orchestrates automated, staggered shelf price audits across 12 domestic Egyptian retailers.
 * Resilient against rate limits, socket congestion, and network timeouts.
 * Syncs mutated price telemetry to Supabase and feeds the real-time Alert Engine.
 */

import { auditProductListing } from './auditDispatcher.js';
import { evaluatePriceUpdate } from './alertEngine.js';
import { getMarketIntelligenceProducts } from './marketIntelligenceData.js';
import { supabase } from '../lib/supabaseClient.js';

let workerIntervalId = null;
let isFleetAuditRunning = false;

/**
 * Utility delay with jitter to prevent harmonic platform throttling
 * @param {number} ms
 * @returns {Promise<void>}
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Runs a fleet-wide telemetry audit across monitored listings
 *
 * @param {Object} options
 * @param {Function} [options.onProgress] - Callback: ({ current, total, activeListing, percent, status }) => void
 * @param {number} [options.staggerDelayMs] - Delay between platform probes (default 650ms)
 * @param {string} [options.userEmail] - Optional target email for price alerts
 * @returns {Promise<Object>} Summary of audited listings
 */
export async function runFleetAudit({
  onProgress = null,
  staggerDelayMs = 650,
  userEmail = null,
} = {}) {
  if (isFleetAuditRunning) {
    return { status: 'ALREADY_RUNNING', message: 'Fleet audit is currently in progress.' };
  }

  isFleetAuditRunning = true;
  const startTime = Date.now();
  const results = [];
  const errors = [];

  try {
    // 1. Fetch products and their platform listings
    const products = await getMarketIntelligenceProducts();
    const tasks = [];

    products.forEach((product) => {
      (product.platform_listings || []).forEach((listing) => {
        if (listing.current_price > 0 && listing.listing_url) {
          tasks.push({
            product,
            listing,
          });
        }
      });
    });

    const total = tasks.length;
    let completed = 0;

    // 2. Iterate through tasks sequentially with staggered delays
    for (const task of tasks) {
      const { product, listing } = task;
      completed++;

      if (onProgress) {
        onProgress({
          current: completed,
          total,
          percent: Math.round((completed / total) * 100),
          activeNode: listing.platform_id,
          activeProduct: product.title,
          status: 'PROBING',
        });
      }

      try {
        // Execute probe with resilient try/catch
        const priorPrice = listing.current_price;
        const telemetry = await auditProductListing(
          listing.id || `${product.id}_${listing.platform_id}`,
          listing.listing_url,
          listing.platform_id,
          { previousPrice: priorPrice }
        );

        // Check for price drop / arbitrage alert
        const historicalPoints = (product.price_history || []).map(
          (h) => h[listing.platform_id] || h.baseline || priorPrice
        );

        const alert = evaluatePriceUpdate({
          product,
          platformId: listing.platform_id,
          currentPrice: telemetry.currentPrice,
          previousPrice: priorPrice,
          historicalPrices: historicalPoints,
          baselineMedian: product.specifications?.baseline_median || priorPrice,
          listingUrl: listing.listing_url,
          userEmail,
        });

        results.push({
          productId: product.id,
          platformId: listing.platform_id,
          currentPrice: telemetry.currentPrice,
          previousPrice: priorPrice,
          status: 'SYNCED',
          alertTriggered: Boolean(alert),
        });
      } catch (err) {
        console.warn(
          `[Fleet Worker Resilient Skip] Node ${listing.platform_id} on ${product.id} timed out:`,
          err.message
        );

        // Graceful degradation: cache last verified price and flag status
        try {
          if (listing.id) {
            await supabase
              .from('platform_listings')
              .update({
                stock_status: 'sync_delayed',
                last_scraped_at: new Date().toISOString(),
              })
              .eq('id', listing.id);
          }
        } catch {
          // Keep worker resilient
        }

        errors.push({
          productId: product.id,
          platformId: listing.platform_id,
          error: err.message,
          status: 'SYNC_DELAYED',
        });
      }

      // Stagger next call with slight randomization (500ms - 1500ms)
      const randomizedDelay = Math.round(staggerDelayMs + Math.random() * 350);
      await delay(randomizedDelay);
    }

    if (onProgress) {
      onProgress({
        current: total,
        total,
        percent: 100,
        activeNode: 'ALL_COMPLETE',
        activeProduct: 'Completed',
        status: 'COMPLETE',
      });
    }

    return {
      status: 'SUCCESS',
      totalAudited: tasks.length,
      syncedCount: results.length,
      delayedCount: errors.length,
      durationMs: Date.now() - startTime,
      results,
      errors,
    };
  } catch (globalErr) {
    console.error('[Fleet Worker Fatal Error]:', globalErr);
    return {
      status: 'FAILED',
      error: globalErr.message,
    };
  } finally {
    isFleetAuditRunning = false;
  }
}

/**
 * Starts background interval timer for automated telemetry polling
 * @param {number} intervalMs - Poll period (default 5 minutes)
 * @param {Object} [options]
 */
export function startBackgroundWorker(intervalMs = 300000, options = {}) {
  if (workerIntervalId) {
    clearInterval(workerIntervalId);
  }

  console.info(`[Cawlix Telemetry Worker] Scheduled background runner every ${Math.round(intervalMs / 1000)}s`);

  workerIntervalId = setInterval(() => {
    runFleetAudit(options).catch((err) => {
      console.warn('[Scheduled Fleet Audit Background Error]:', err);
    });
  }, intervalMs);

  return workerIntervalId;
}

/**
 * Stops background scheduler
 */
export function stopBackgroundWorker() {
  if (workerIntervalId) {
    clearInterval(workerIntervalId);
    workerIntervalId = null;
    console.info('[Cawlix Telemetry Worker] Background scheduler halted.');
  }
}

/**
 * Returns current fleet worker status
 */
export function getFleetWorkerStatus() {
  return {
    isRunning: isFleetAuditRunning,
    isScheduled: Boolean(workerIntervalId),
  };
}
