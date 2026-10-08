/**
 * Modular Distributed Scraper Subsystem for Cawlix
 * Dispatches URLs to platform-specific adapters with zero tolerance for inaccuracies.
 */

import { fetchProductHtml } from './utils/fetchHtml.js';
import { parseTradelineHtml, TRADELINE_PLATFORM_SLUG } from './adapters/tradelineAdapter.js';
import { parseBtechHtml, BTECH_PLATFORM_SLUG } from './adapters/btechAdapter.js';
import { parseTwoBHtml, TWOB_PLATFORM_SLUG } from './adapters/twoBAdapter.js';
import { parseAmazonHtml, AMAZON_PLATFORM_SLUG } from './adapters/amazonAdapter.js';
import { parseNoonHtml, NOON_PLATFORM_SLUG } from './adapters/noonAdapter.js';
import { parseGenericHtml } from './adapters/genericAdapter.js';
import { PLATFORM_SLUGS } from './types.js';

export * from './types.js';
export * from './utils/normalizePrice.js';
export * from './utils/fetchHtml.js';

/**
 * Detects the platform slug from URL or provided hint
 * @param {string} url
 * @param {string} [slugHint]
 * @returns {string}
 */
export function resolvePlatformSlug(url = '', slugHint = '') {
  if (slugHint && Object.values(PLATFORM_SLUGS).includes(slugHint.toUpperCase())) {
    return slugHint.toUpperCase();
  }

  const u = String(url).toLowerCase();
  if (u.includes('tradelinestores.com') || u.includes('tradeline')) return PLATFORM_SLUGS.TRADELINE;
  if (u.includes('btech.com') || u.includes('btech')) return PLATFORM_SLUGS.BTECH;
  if (u.includes('2b.com.eg') || u.includes('2b')) return PLATFORM_SLUGS.TWOB;
  if (u.includes('amazon.eg') || u.includes('amazon')) return PLATFORM_SLUGS.AMAZON;
  if (u.includes('noon.com') || u.includes('noon')) return PLATFORM_SLUGS.NOON;
  if (u.includes('jumia.com.eg') || u.includes('jumia')) return PLATFORM_SLUGS.JUMIA;
  if (u.includes('rayashop.com') || u.includes('raya')) return PLATFORM_SLUGS.RAYA;
  if (u.includes('elarabygroup.com') || u.includes('elaraby')) return PLATFORM_SLUGS.ELARABY;
  if (u.includes('dubaiphone.net') || u.includes('dubai_phone')) return PLATFORM_SLUGS.DUBAI_PHONE;
  if (u.includes('dream2000.com') || u.includes('dream2000')) return PLATFORM_SLUGS.DREAM_2000;
  if (u.includes('vodafone.com.eg') || u.includes('vodafone')) return PLATFORM_SLUGS.VODAFONE;
  if (u.includes('carrefouregypt.com') || u.includes('carrefour')) return PLATFORM_SLUGS.CARREFOUR;

  return slugHint ? slugHint.toUpperCase() : 'DOMESTIC_NODE';
}

/**
 * Scrapes and extracts normalized product telemetry from a live retailer URL
 *
 * @param {string} productUrl - URL of product on retailer website
 * @param {string} [platformSlug] - Optional explicit platform identifier
 * @param {Object} [options]
 * @returns {Promise<import('./types').NormalizedListingData>}
 */
export async function scrapeProductListing(productUrl, platformSlug = '', options = {}) {
  if (!productUrl || typeof productUrl !== 'string') {
    throw new Error('Valid product URL is required for scraping');
  }

  const resolvedSlug = resolvePlatformSlug(productUrl, platformSlug);
  let html = '';

  try {
    html = await fetchProductHtml(productUrl, options);
  } catch (err) {
    console.warn(`[Cawlix Scraper] Live fetch issue for ${productUrl}:`, err.message);
    // Proceed with empty HTML to allow adapter baseline handling
    html = '';
  }

  let result;

  switch (resolvedSlug) {
    case TRADELINE_PLATFORM_SLUG:
      result = parseTradelineHtml(html, productUrl);
      break;

    case BTECH_PLATFORM_SLUG:
      result = parseBtechHtml(html, productUrl);
      break;

    case TWOB_PLATFORM_SLUG:
      result = parseTwoBHtml(html, productUrl);
      break;

    case AMAZON_PLATFORM_SLUG:
      result = parseAmazonHtml(html, productUrl);
      break;

    case NOON_PLATFORM_SLUG:
      result = parseNoonHtml(html, productUrl);
      break;

    default:
      result = parseGenericHtml(html, productUrl, resolvedSlug);
      break;
  }

  // Final contract validation
  if (!result || typeof result.currentPrice !== 'number' || result.currentPrice <= 0) {
    throw new Error(`Scraper failed to extract a valid non-zero price for ${productUrl}`);
  }

  return result;
}
