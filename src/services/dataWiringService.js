/**
 * DATA WIRING SERVICE (CAWLIX)
 * Handles database operations for:
 * - user_watchlists: User target price tracking & alert subscriptions
 * - glitch_radar_events: Intercepted ghost markups and price crash anomalies
 * - tracked_products: Monitored catalog items with automated telemetry frequency
 */

import { supabase } from '../lib/supabaseClient.js';
import { SEEDED_MASTER_PRODUCTS } from './marketIntelligenceData.js';

/**
 * Ensures actively monitored products are mirrored into the `tracked_products` table
 * @param {Array} [products] - Optional list of products to mirror
 * @returns {Promise<Array>}
 */
export async function mirrorTrackedProducts(products = null) {
  const itemsToSync = products && products.length > 0 ? products : SEEDED_MASTER_PRODUCTS;

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;

    const rows = itemsToSync.map((item) => {
      const activeListings = (item.platform_listings || item.listings || []).filter(
        (l) => l.current_price > 0
      );
      const lowest = activeListings.sort((a, b) => a.current_price - b.current_price)[0];
      const currentPrice = lowest?.current_price || item.current_price_egp || 50000;
      const baselinePrice =
        item.specifications?.baseline_median || item.baseline_price_egp || Math.round(currentPrice * 1.05);
      const delta = baselinePrice > 0
        ? parseFloat((((currentPrice - baselinePrice) / baselinePrice) * 100).toFixed(1))
        : 0;

      return {
        sku: item.barcode || item.sku || item.id,
        title: item.title || item.name,
        retailer: lowest?.platform_id || item.node || 'AMZN_EG',
        node: lowest?.platform_id || item.node || 'AMZN_EG',
        domain: lowest?.domain || 'node.cawlix.com',
        current_price: currentPrice,
        current_price_egp: currentPrice,
        baseline_price: baselinePrice,
        baseline_price_egp: baselinePrice,
        delta_pct: delta,
        discount_status: delta < 0 ? `DEAL (${delta}%)` : `MARKUP (+${delta}%)`,
        status: delta > 5 ? 'FLAGGED' : 'Active',
        last_ping: 'just now',
        tracking_frequency: '15m',
        updated_at: new Date().toISOString(),
      };
    });

    // Upsert into tracked_products table
    const { data, error } = await supabase
      .from('tracked_products')
      .upsert(rows, { onConflict: 'sku' })
      .select();

    if (error) {
      console.warn('[Tracked Products Mirror Fallback]:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.warn('[Tracked Products Mirror Error]:', err);
    return [];
  }
}

/**
 * Adds an item to the user's watchlist with a target price
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.sku
 * @param {string} [params.productId]
 * @param {number} [params.targetPrice]
 * @returns {Promise<Object>}
 */
export async function addToUserWatchlist({ userId, sku, productId = null, targetPrice = null }) {
  if (!userId || !sku) {
    throw new Error('User ID and SKU are required to configure watchlist target.');
  }

  try {
    const { data, error } = await supabase
      .from('user_watchlists')
      .upsert(
        {
          user_id: userId,
          sku,
          product_id: productId || sku,
          target_price: targetPrice ? parseFloat(targetPrice) : null,
          target_alert_price: targetPrice ? parseFloat(targetPrice) : null,
          notify_on_glitch: true,
          glitch_radar_enabled: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,sku' }
      )
      .select()
      .single();

    if (error) {
      console.error('[User Watchlist Upsert Error]:', error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error('[User Watchlist Add Error]:', err);
    throw err;
  }
}

/**
 * Records a detected price glitch / anomaly to the `glitch_radar_events` table
 * @param {Object} eventData
 * @returns {Promise<Object|null>}
 */
export async function recordGlitchRadarEvent(eventData) {
  try {
    const payload = {
      sku: eventData.sku || eventData.id || 'caw_sku_glitch',
      title: eventData.title || eventData.productTitle || 'Price Anomaly Detected',
      retailer: eventData.retailer || eventData.node || 'AMZN_EG',
      current_price_egp: eventData.currentPrice ?? eventData.current_price_egp ?? 0,
      baseline_price_egp: eventData.baselinePrice ?? eventData.baseline_price_egp ?? 0,
      drop_pct: eventData.deltaPct ?? eventData.drop_pct ?? -15.0,
      status: 'FLAGGED',
      severity: eventData.severity || 'CRITICAL',
      anomaly_type: eventData.anomalyType || 'GHOST_MARKUP',
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('glitch_radar_events')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.warn('[Glitch Radar Event Insert Fallback]:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.warn('[Glitch Radar Event Error]:', err);
    return null;
  }
}

/**
 * Fetches all intercepted glitch radar events from Supabase
 * @returns {Promise<Array>}
 */
export async function fetchGlitchRadarEvents() {
  try {
    const { data, error } = await supabase
      .from('glitch_radar_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.warn('[Fetch Glitch Radar Events Error]:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.warn('[Fetch Glitch Radar Events Network Error]:', err);
    return [];
  }
}
