/**
 * Real-Time Audit Dispatcher & Supabase Sync Pipeline
 * Coordinates live scraping, data validation, Supabase synchronization,
 * and price history insertions.
 */

import { supabase } from '../lib/supabaseClient.js';
import { scrapeProductListing, resolvePlatformSlug } from './scrapers/index.js';

/**
 * Executes a live telemetry audit for a given product listing
 *
 * @param {string} listingId - Database ID (listing UUID, tracked_products ID, or SKU)
 * @param {string} productUrl - Live product URL on retailer store
 * @param {string} platformSlug - Retailer identifier (e.g. 'TRADELINE', 'BTECH_EG', '2B_EG')
 * @param {Object} [options]
 * @param {number} [options.previousPrice] - Optional baseline or prior shelf price for delta computation
 * @returns {Promise<Object>} Fresh telemetry audit result
 */
export async function auditProductListing(listingId, productUrl, platformSlug, options = {}) {
  const startTime = Date.now();
  const normalizedPlatformSlug = resolvePlatformSlug(productUrl, platformSlug);

  // 1. Trigger the respective platform adapter
  const scrapedData = await scrapeProductListing(productUrl, normalizedPlatformSlug);

  // 2. Validate extracted data (ensure currentPrice > 0 and clean numeric)
  if (!scrapedData || typeof scrapedData.currentPrice !== 'number' || scrapedData.currentPrice <= 0) {
    throw new Error(`Data validation failed: Invalid price (${scrapedData?.currentPrice}) extracted for listing ${listingId}`);
  }

  const {
    currentPrice,
    originalPrice,
    inStock,
    rating,
    reviewsCount,
    warrantyInfo,
    materialNotes,
    scrapedAt,
  } = scrapedData;

  const previousPrice = options.previousPrice || currentPrice;
  const priceDelta = currentPrice - previousPrice;
  const priceDeltaPct = previousPrice > 0 ? parseFloat((((currentPrice - previousPrice) / previousPrice) * 100).toFixed(1)) : 0;
  const probeLatencyMs = Date.now() - startTime;

  // 3. Update Supabase platform_listings (and tracked_products if referenced)
  try {
    if (listingId) {
      // A. Try updating platform_listings table
      await supabase
        .from('platform_listings')
        .update({
          current_price: currentPrice,
          original_price: originalPrice,
          stock_status: inStock ? 'IN_STOCK' : 'OUT_OF_STOCK',
          rating: rating,
          reviews_count: reviewsCount,
          warranty_info: warrantyInfo,
          material_notes: materialNotes,
          last_scraped_at: scrapedAt,
          updated_at: scrapedAt,
        })
        .eq('id', listingId);

      // B. Also update tracked_products table if this is a console SKU item
      await supabase
        .from('tracked_products')
        .update({
          current_price_egp: currentPrice,
          current_price: currentPrice,
          delta_pct: priceDeltaPct,
          last_ping: 'just now',
          status: inStock ? 'Active' : 'Out of Stock',
          updated_at: scrapedAt,
        })
        .or(`id.eq.${listingId},sku.eq.${listingId}`);
    }
  } catch (dbErr) {
    console.warn('[Audit Dispatcher] Supabase listing update notice (non-fatal):', dbErr?.message || dbErr);
  }

  // 4. Automatically insert a new record into price_history
  try {
    const isSpike = originalPrice && originalPrice > currentPrice * 1.15;
    await supabase.from('price_history').insert([
      {
        listing_id: listingId,
        platform_id: normalizedPlatformSlug,
        price: currentPrice,
        timestamp: scrapedAt,
        is_artificial_spike: Boolean(isSpike),
        created_at: scrapedAt,
      },
    ]);
  } catch (histErr) {
    console.warn('[Audit Dispatcher] Supabase price_history insert notice (non-fatal):', histErr?.message || histErr);
  }

  // 5. Return fresh telemetry object with verified delta metrics
  return {
    success: true,
    listingId,
    platformSlug: normalizedPlatformSlug,
    currentPrice,
    previousPrice,
    originalPrice,
    priceDelta,
    priceDeltaPct,
    inStock,
    rating,
    reviewsCount,
    warrantyInfo,
    materialNotes,
    scrapedAt,
    probeLatencyMs,
    isPriceDrop: priceDelta < 0,
    isPriceHike: priceDelta > 0,
    formattedCurrentPrice: `EGP ${currentPrice.toLocaleString()}`,
    statusText: inStock ? 'Active' : 'Out of Stock',
  };
}
