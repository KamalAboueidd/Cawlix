/**
 * REAL-TIME PRICE DROP & ARBITRAGE ALERT ENGINE (CAWLIX)
 * Detects All-Time Lows (ATL), Median Arbitrage Advantages, and Rapid Price Crashes.
 * Manages in-app notifications and coordinates Brevo SMTP email alerts.
 */

import { sendBrevoAlertEmail } from './emailService.js';
import { PLATFORMS_REGISTRY } from './marketIntelligenceData.js';
import { recordGlitchRadarEvent } from './dataWiringService.js';

const ALERTS_STORAGE_KEY = 'cawlix_in_app_alerts';

// Initial high-fidelity seed alerts for realistic telemetry presentation
const SEED_ALERTS = [
  {
    id: 'alt_seed_1',
    type: 'ALL_TIME_LOW',
    severity: 'CRITICAL',
    productId: 'mp_macbook_pro_m3',
    productTitle: 'Apple MacBook Pro 14" M3 Pro 18GB/512GB (Space Black)',
    retailer: 'AMZN_EG',
    retailerName: 'Amazon Egypt',
    oldPrice: 94500,
    newPrice: 86999,
    savingsEgp: 7501,
    savingsPct: 7.9,
    timestamp: '5m ago',
    read: false,
    listingUrl: 'https://www.amazon.eg/dp/B0CHX1W2X8',
  },
  {
    id: 'alt_seed_2',
    type: 'MEDIAN_ARBITRAGE',
    severity: 'OPPORTUNITY',
    productId: 'mp_iphone16_pro_max',
    productTitle: 'Apple iPhone 16 Pro Max 256GB Desert Titanium',
    retailer: 'NOON_EG',
    retailerName: 'Noon Egypt',
    oldPrice: 68900,
    newPrice: 63999,
    savingsEgp: 4901,
    savingsPct: 7.1,
    timestamp: '18m ago',
    read: false,
    listingUrl: 'https://www.noon.com/egypt-en/iphone-16-pro-max-256gb',
  },
  {
    id: 'alt_seed_3',
    type: 'PRICE_CRASH',
    severity: 'CRITICAL',
    productId: 'mp_sony_wh1000xm5',
    productTitle: 'Sony WH-1000XM5 Wireless Noise-Canceling (Black)',
    retailer: 'BTECH_EG',
    retailerName: 'B.TECH',
    oldPrice: 18900,
    newPrice: 15499,
    savingsEgp: 3401,
    savingsPct: 18.0,
    timestamp: '1h ago',
    read: true,
    listingUrl: 'https://btech.com/en/sony-wh-1000xm5-wireless-noise-canceling-headphones.html',
  },
];

let alertsState = (() => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(ALERTS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // Fallback
    }
  }
  return SEED_ALERTS;
})();

const listeners = new Set();

function persistAlerts() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alertsState));
    } catch {
      // Storage quota or sandboxed
    }
  }
  listeners.forEach((listener) => {
    try {
      listener([...alertsState]);
    } catch (e) {
      console.error('[Alert Listener Error]:', e);
    }
  });
}

/**
 * Subscribes a callback to reactive alert changes
 * @param {Function} callback
 * @returns {Function} unsubscribe
 */
export function subscribeToAlerts(callback) {
  listeners.add(callback);
  callback([...alertsState]);
  return () => listeners.delete(callback);
}

/**
 * Returns current in-app alerts list
 * @returns {Array}
 */
export function getAlerts() {
  return [...alertsState];
}

/**
 * Marks a specific alert as read
 * @param {string} alertId
 */
export function markAlertRead(alertId) {
  alertsState = alertsState.map((a) => (a.id === alertId ? { ...a, read: true } : a));
  persistAlerts();
}

/**
 * Marks all alerts as read
 */
export function markAllAlertsRead() {
  alertsState = alertsState.map((a) => ({ ...a, read: true }));
  persistAlerts();
}

/**
 * Clears all alerts
 */
export function clearAllAlerts() {
  alertsState = [];
  persistAlerts();
}

/**
 * Evaluates an audited shelf price point and dispatches alerts if an anomaly is detected
 *
 * @param {Object} params
 * @param {Object} params.product - Master Product object
 * @param {string} params.platformId - e.g. 'AMZN_EG', 'BTECH_EG'
 * @param {number} params.currentPrice - New verified price
 * @param {number} [params.previousPrice] - Prior shelf price
 * @param {Array<number>} [params.historicalPrices] - Historical price array
 * @param {number} [params.baselineMedian] - 90-day baseline median price
 * @param {string} [params.listingUrl] - Store direct URL
 * @param {string} [params.userEmail] - Optional target user email for Brevo alerts
 * @returns {Object|null} Triggered alert if any
 */
export function evaluatePriceUpdate({
  product,
  platformId,
  currentPrice,
  previousPrice = null,
  historicalPrices = [],
  baselineMedian = null,
  listingUrl = '',
  userEmail = null,
}) {
  if (!product || !currentPrice || currentPrice <= 0) return null;

  const platformMeta = PLATFORMS_REGISTRY.find((p) => p.id === platformId) || {
    name: platformId,
  };

  const oldP = previousPrice || (baselineMedian ? baselineMedian : currentPrice);
  const deltaEgp = oldP - currentPrice;
  const deltaPct = oldP > 0 ? parseFloat(((deltaEgp / oldP) * 100).toFixed(1)) : 0;

  // 1. Check: All-Time Low (ATL)
  let isATL = false;
  if (historicalPrices && historicalPrices.length > 0) {
    const minHistorical = Math.min(...historicalPrices);
    if (currentPrice < minHistorical) {
      isATL = true;
    }
  }

  // 2. Check: Median Arbitrage Advantage (>10% below 90D baseline median)
  let isMedianArbitrage = false;
  if (baselineMedian && baselineMedian > 0) {
    if (currentPrice <= baselineMedian * 0.9) {
      isMedianArbitrage = true;
    }
  }

  // 3. Check: Price Crash / Flash Deal (>15% drop from previous shelf price)
  let isPriceCrash = false;
  if (previousPrice && previousPrice > currentPrice && deltaPct >= 15.0) {
    isPriceCrash = true;
  }

  // Trigger highest-severity alert if conditions met
  let triggeredType = null;
  let severity = 'OPPORTUNITY';

  if (isATL) {
    triggeredType = 'ALL_TIME_LOW';
    severity = 'CRITICAL';
  } else if (isPriceCrash) {
    triggeredType = 'PRICE_CRASH';
    severity = 'CRITICAL';
  } else if (isMedianArbitrage) {
    triggeredType = 'MEDIAN_ARBITRAGE';
    severity = 'OPPORTUNITY';
  }

  if (!triggeredType) {
    return null;
  }

  const newAlert = {
    id: `alt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    type: triggeredType,
    severity,
    productId: product.id,
    productTitle: product.title,
    retailer: platformId,
    retailerName: platformMeta.name,
    oldPrice: oldP,
    newPrice: currentPrice,
    savingsEgp: Math.max(0, deltaEgp),
    savingsPct: Math.max(0, deltaPct),
    timestamp: 'just now',
    read: false,
    listingUrl: listingUrl || platformMeta.url,
  };

  // Add to in-app notification center
  alertsState = [newAlert, ...alertsState.slice(0, 49)];
  persistAlerts();

  // Wire to glitch_radar_events table
  if (triggeredType === 'PRICE_CRASH' || deltaPct >= 10.0 || isATL) {
    recordGlitchRadarEvent({
      sku: product.barcode || product.sku || product.id,
      title: product.title,
      retailer: platformId,
      currentPrice,
      baselinePrice: baselineMedian || oldP,
      deltaPct,
      anomalyType: triggeredType === 'PRICE_CRASH' ? 'FLASH_CRASH' : 'GHOST_MARKUP',
      severity,
    }).catch(() => {});
  }

  // Dispatch Brevo email if recipient email is available
  if (userEmail) {
    sendBrevoAlertEmail({
      toEmail: userEmail,
      alert: newAlert,
    }).catch((err) => {
      console.warn('[Brevo Dispatch Deferred]:', err);
    });
  }

  return newAlert;
}
