/**
 * UNIVERSAL MULTI-PLATFORM RESOLVER ENGINE (CAWLIX)
 * Resolves, normalizes, and compares authentic tech products across 12 domestic Egyptian e-commerce platforms:
 * Amazon EG, Noon, Jumia, B.TECH, 2B, Raya Shop, El Araby, Dubai Phone, Dream 2000, Tradeline, Vodafone, Carrefour.
 * 
 * STRICT COMPLIANCE:
 * 1. Zero synthetic mock generators or dynamic price concoctions.
 * 2. Strictly searches verified domestic master catalog.
 * 3. Returns clean authentic empty state for non-existent items without generating fake fallback cards.
 */

import {
  PLATFORMS_REGISTRY,
  SEEDED_MASTER_PRODUCTS,
  getMarketIntelligenceProducts,
  evaluateDiscountIntegrity,
} from './marketIntelligenceData.js';
import { MASTER_CATALOG } from '../data/masterCatalog.js';
import { executeLiveFederatedSearch } from './liveSearchDispatcher.js';

// Filler and stop words in English & Arabic commonly present in e-commerce search queries
const FILLER_WORDS = new Set([
  'buy', 'online', 'price', 'in', 'egypt', 'eg', 'deal', 'deals', 'cheap', 'best', 'offer',
  'store', 'shop', 'original', 'official', 'new', 'latest', 'retail', 'cawlix',
  'سعر', 'في', 'مصر', 'شراء', 'ارخص', 'افضل', 'عروض', 'تخفيضات', 'اونلاين', 'اصلي', 'متاح'
]);

/**
 * Cleans and tokenizes search query strings
 * @param {string} query
 * @returns {string}
 */
export function cleanSearchQuery(query = '') {
  if (!query || typeof query !== 'string') return '';
  return query
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF]/gi, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 0 && !FILLER_WORDS.has(token))
    .join(' ')
    .trim();
}

/**
 * Extracts key product specifications (Brand, Model, Storage, Color, Barcode) from text
 * @param {string} rawQuery
 * @returns {Object}
 */
export function extractProductAttributes(rawQuery = '') {
  const text = String(rawQuery).trim();
  const lower = text.toLowerCase();

  // 1. Detect Barcode / EAN
  const barcodeMatch = text.match(/\b\d{8,14}\b/);
  const detectedBarcode = barcodeMatch ? barcodeMatch[0] : null;

  // 2. Detect Brand (Bilingual English & Arabic)
  let detectedBrand = 'Generic Tech';
  if (/apple|iphone|macbook|ipad|airpods|ايفون|ماك|ايربودز|ابل/i.test(lower)) detectedBrand = 'Apple';
  else if (/samsung|galaxy|سامسونج|جالكسي/i.test(lower)) detectedBrand = 'Samsung';
  else if (/sony|playstation|wh-1000|سوني|بلايستيشن/i.test(lower)) detectedBrand = 'Sony';
  else if (/dell|alienware|ديل/i.test(lower)) detectedBrand = 'Dell';
  else if (/lenovo|thinkpad|legion|ideapad|لينوفو|ثينك باد|ليجن/i.test(lower)) detectedBrand = 'Lenovo';
  else if (/honor|magic|هونر/i.test(lower)) detectedBrand = 'Honor';
  else if (/oppo|reno|find|اوبو|رينو/i.test(lower)) detectedBrand = 'Oppo';
  else if (/asus|rog|اسوس|روج/i.test(lower)) detectedBrand = 'ASUS';
  else if (/lg|ال جي/i.test(lower)) detectedBrand = 'LG';
  else if (/anker|انكر/i.test(lower)) detectedBrand = 'Anker';

  // 3. Detect Storage Capacity
  let storage = null;
  const storageMatch = lower.match(/\b(128gb|256gb|512gb|1tb|2tb|64gb|32gb|16gb|18gb|24gb|36gb)\b/i);
  if (storageMatch) {
    storage = storageMatch[0].toUpperCase();
  }

  // 4. Detect Colorway
  let color = null;
  if (/desert\s*titanium|صحراوي/i.test(lower)) color = 'Desert Titanium';
  else if (/natural\s*titanium|طبيعي/i.test(lower)) color = 'Natural Titanium';
  else if (/titanium\s*black|black\s*titanium/i.test(lower)) color = 'Black Titanium';
  else if (/space\s*black/i.test(lower)) color = 'Space Black';
  else if (/titanium\s*gray|رمادي/i.test(lower)) color = 'Titanium Gray';
  else if (/midnight/i.test(lower)) color = 'Midnight';
  else if (/starlight/i.test(lower)) color = 'Starlight';
  else if (/silver|فضي/i.test(lower)) color = 'Silver';
  else if (/black|اسود/i.test(lower)) color = 'Black';
  else if (/white|ابيض/i.test(lower)) color = 'White';
  else if (/blue|ازرق/i.test(lower)) color = 'Blue';

  const cleanQ = cleanSearchQuery(rawQuery);

  return {
    detectedBarcode,
    detectedBrand,
    storage,
    color,
    cleanQuery: cleanQ,
  };
}

/**
 * Searches local Master Products catalog with strict verification and zero synthetic fallback
 * @param {string} query
 * @param {Array} [catalogOrLimit]
 * @param {number} [limit]
 * @returns {Array}
 */
export function searchLocalMasterProducts(query = '', catalogOrLimit = MASTER_CATALOG, limit = null) {
  if (!query || !query.trim()) return [];

  let catalog = MASTER_CATALOG;
  let maxLimit = typeof limit === 'number' ? limit : null;

  if (Array.isArray(catalogOrLimit)) {
    catalog = catalogOrLimit;
  } else if (typeof catalogOrLimit === 'number') {
    maxLimit = catalogOrLimit;
    catalog = MASTER_CATALOG;
  } else if (!catalogOrLimit) {
    catalog = MASTER_CATALOG;
  }

  const q = query.toLowerCase().trim();
  const cleanQ = cleanSearchQuery(query);
  const qTokens = cleanQ.split(/\s+/).filter(Boolean);

  if (qTokens.length === 0) return [];

  // Extract critical model identifiers and numbers (e.g. '13', '14', '15', '16', '17', '18', '24', '55')
  const modelIdentifiers = qTokens.filter((token) => /\d/.test(token));

  const matched = [];

  catalog.forEach((item) => {
    let score = 0;
    const title = (item.title || '').toLowerCase();
    const brand = (item.brand || '').toLowerCase();
    const model = (item.model || '').toLowerCase();
    const barcode = (item.barcode || '').toLowerCase();
    const category = (item.category || '').toLowerCase();
    const keywords = (item.search_keywords || []).map((k) => k.toLowerCase()).join(' ');
    const fullText = `${title} ${model} ${category} ${keywords}`.toLowerCase();

    // 1. Exact barcode match
    if (barcode && barcode === q) {
      score += 150;
    }

    // 2. Strict model/number constraint:
    // If the query contains numbers or model codes, EVERY SINGLE ONE must exist in the product text.
    // If user searched for '17' or '18' or '15' and item is 'iPhone 16', immediately REJECT (score 0).
    const modelMismatch = modelIdentifiers.some((code) => !fullText.includes(code));
    if (modelMismatch) {
      return;
    }

    // 3. Exact full title match or exact keyword match
    if (title === cleanQ || (item.search_keywords || []).some((k) => k.toLowerCase() === cleanQ)) {
      score += 120;
    } else if (title.includes(cleanQ) || model.includes(cleanQ)) {
      score += 75;
    }

    // 4. Token coverage check
    let matchingTokensCount = 0;
    qTokens.forEach((token) => {
      if (title.includes(token) || model.includes(token) || keywords.includes(token)) {
        score += 25;
        matchingTokensCount++;
      } else if (brand && (token === brand || brand.includes(token))) {
        score += 15;
        matchingTokensCount++;
      }
    });

    const coverageRatio = matchingTokensCount / qTokens.length;

    // Strict acceptance criteria: require >= 70% token coverage to eliminate false synthetic matches
    // (e.g. 'laptob iphone' -> 50% coverage -> rejected)
    const isAuthenticMatch =
      qTokens.length <= 2 ? coverageRatio >= 0.8 : coverageRatio >= 0.7 && score >= 45;

    if (isAuthenticMatch) {
      const validListings = (item.platform_listings || []).filter(
        (l) => l.current_price > 0 && l.stock_status !== 'OUT_OF_STOCK'
      );
      const lowestListing = validListings.length
        ? [...validListings].sort((a, b) => a.current_price - b.current_price)[0]
        : null;

      matched.push({
        ...item,
        searchScore: score,
        lowestPrice: lowestListing ? lowestListing.current_price : null,
        lowestPlatformId: lowestListing ? lowestListing.platform_id : null,
        lowestPlatformName: lowestListing
          ? PLATFORMS_REGISTRY.find((p) => p.id === lowestListing.platform_id)?.name
          : null,
      });
    }
  });

  const sorted = matched.sort((a, b) => b.searchScore - a.searchScore);
  return maxLimit ? sorted.slice(0, maxLimit) : sorted;
}

/**
 * Resolves an item across all 12 Egyptian platforms strictly using the verified catalog.
 * Zero synthetic generators.
 * @param {string} query
 * @returns {Promise<Object>} Consolidated Master Entity View or NO_MATCHING_PRODUCTS
 */
export async function resolveProductAcrossPlatforms(query = '') {
  if (!query || !query.trim()) {
    throw new Error('Query string is required for multi-platform resolution');
  }

  const rawQuery = query.trim();
  const cleanQ = cleanSearchQuery(rawQuery);

  // 1. Check verified local catalog first
  let liveProducts = [];
  try {
    liveProducts = await getMarketIntelligenceProducts();
  } catch {
    liveProducts = MASTER_CATALOG;
  }

  const localMatches = searchLocalMasterProducts(rawQuery, liveProducts);
  let resolvedMaster = null;
  let source = 'LOCAL_CATALOG';

  if (localMatches.length > 0) {
    resolvedMaster = localMatches[0];
  } else {
    // 2. Execute on-demand live federated search across domestic retail nodes
    const liveResult = await executeLiveFederatedSearch(rawQuery);

    if (liveResult && liveResult.found && liveResult.masterProduct) {
      resolvedMaster = liveResult.masterProduct;
      source = 'LIVE_FEDERATED';
    } else {
      // 3. Clean authentic empty state without generating fake fallback cards
      return {
        status: 'NO_MATCHING_PRODUCTS',
        query: rawQuery,
        cleanQuery: cleanQ,
        masterProduct: null,
        message: 'عفواً، هذا المنتج غير مدرج في كتالوج الأجهزة المعتمدة حالياً.',
      };
    }
  }

  // 4. Compute consolidated platform listings
  const listingsMap = new Map();
  (resolvedMaster.platform_listings || []).forEach((l) => {
    listingsMap.set(l.platform_id, l);
  });

  const completeListings = PLATFORMS_REGISTRY.map((platform) => {
    const listing = listingsMap.get(platform.id) || {
      platform_id: platform.id,
      current_price: 0,
      original_price: 0,
      discount_pct: 0,
      stock_status: 'OUT_OF_STOCK',
      rating: 0,
      reviews_count: 0,
      warranty_info: 'Platform status unavailable',
      material_notes: 'Listing not currently indexed',
      listing_url: platform.url,
    };

    return {
      ...platform,
      ...listing,
      hasListing: listing.current_price > 0,
    };
  });

  // 5. Calculate Master Metrics
  const inStockListings = completeListings.filter(
    (l) => (l.stock_status === 'IN_STOCK' || l.stock_status === 'LOW_STOCK') && l.current_price > 0
  );

  const prices = inStockListings.map((l) => l.current_price);
  const sortedListingsByPrice = [...inStockListings].sort((a, b) => a.current_price - b.current_price);

  let medianPrice = 0;
  if (prices.length > 0) {
    const sortedPrices = [...prices].sort((a, b) => a - b);
    const mid = Math.floor(sortedPrices.length / 2);
    medianPrice = sortedPrices.length % 2 !== 0
      ? sortedPrices[mid]
      : Math.round((sortedPrices[mid - 1] + sortedPrices[mid]) / 2);
  }

  // Cheapest Node
  const cheapestListing = sortedListingsByPrice.length > 0 ? sortedListingsByPrice[0] : null;
  const cheapestNode = cheapestListing
    ? {
        platformId: cheapestListing.id,
        platformName: cheapestListing.name,
        price: cheapestListing.current_price,
        originalPrice: cheapestListing.original_price,
        discountPct: cheapestListing.discount_pct,
        deltaSavings: Math.max(0, medianPrice - cheapestListing.current_price),
        deltaSavingsPct: medianPrice > 0
          ? parseFloat((((medianPrice - cheapestListing.current_price) / medianPrice) * 100).toFixed(1))
          : 0,
        badge: cheapestListing.badge || 'Best Price',
        url: cheapestListing.listing_url,
      }
    : null;

  // Highest Rated Node
  const ratedListings = completeListings.filter((l) => l.rating > 0);
  const highestRatedListing = ratedListings.length > 0
    ? [...ratedListings].sort((a, b) => {
        const scoreA = a.rating * Math.log10((a.reviews_count || 1) + 10);
        const scoreB = b.rating * Math.log10((b.reviews_count || 1) + 10);
        return scoreB - scoreA;
      })[0]
    : null;

  const highestRatedNode = highestRatedListing
    ? {
        platformId: highestRatedListing.id,
        platformName: highestRatedListing.name,
        rating: highestRatedListing.rating,
        reviewsCount: highestRatedListing.reviews_count,
        badge: `${highestRatedListing.rating.toFixed(1)} ★ (${highestRatedListing.reviews_count.toLocaleString()} reviews)`,
        url: highestRatedListing.listing_url,
      }
    : null;

  // Domestic Guarantee Leader
  const guaranteePriority = ['TRADELINE', 'RAYA_EG', 'BTECH_EG', 'AMZN_EG', 'NOON_EG', 'ELARABY_EG'];
  let guaranteeListing = null;
  for (const pid of guaranteePriority) {
    const candidate = inStockListings.find((l) => l.id === pid && l.warranty_info && !l.warranty_info.includes('unavailable'));
    if (candidate) {
      guaranteeListing = candidate;
      break;
    }
  }
  if (!guaranteeListing && inStockListings.length > 0) {
    guaranteeListing = inStockListings[0];
  }

  const domesticGuaranteeLeader = guaranteeListing
    ? {
        platformId: guaranteeListing.id,
        platformName: guaranteeListing.name,
        warrantyInfo: guaranteeListing.warranty_info,
        badge: guaranteeListing.badge || 'Official Agent',
        url: guaranteeListing.listing_url,
      }
    : null;

  // Truth Index Analysis
  const truthIndex = evaluateDiscountIntegrity(resolvedMaster, cheapestListing);

  // Market Spread (Arbitrage Gap)
  const highestListing = sortedListingsByPrice.length > 0
    ? sortedListingsByPrice[sortedListingsByPrice.length - 1]
    : null;
  const marketSpread = cheapestListing && highestListing
    ? Math.max(0, highestListing.current_price - cheapestListing.current_price)
    : 0;

  return {
    query: rawQuery,
    cleanQuery: cleanQ,
    resolvedAt: new Date().toISOString(),
    source,
    masterProduct: {
      ...resolvedMaster,
      platform_listings: completeListings,
    },
    metrics: {
      cheapestNode,
      highestRatedNode,
      domesticGuaranteeLeader,
      truthIndex,
      marketSpread,
      medianPrice,
      totalListingsIndexed: completeListings.filter((l) => l.hasListing).length,
      inStockCount: inStockListings.length,
    },
  };
}

/**
 * Named alias explicitly wired to UI live search handlers
 */
export const executeLiveRetailerSearch = resolveProductAcrossPlatforms;
