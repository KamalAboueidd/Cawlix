/**
 * Resilient External Retailer URL Sanitizer & Deep-Link Resolver (CAWLIX)
 * Prevents client-side router trapping and guarantees authentic domestic store deep-linking.
 */

export const PLATFORM_REGISTRY_META = {
  AMZN_EG: {
    id: 'AMZN_EG',
    name: 'Amazon Egypt',
    domain: 'amazon.eg',
    baseUrl: 'https://www.amazon.eg',
    searchUrl: (q) => `https://www.amazon.eg/s?k=${encodeURIComponent(q)}`,
    productDeepLink: (sku) => `https://www.amazon.eg/dp/${sku.replace(/^caw_sku_|^caw_prod_/, 'B0')}`,
  },
  NOON_EG: {
    id: 'NOON_EG',
    name: 'Noon Egypt',
    domain: 'noon.com',
    baseUrl: 'https://www.noon.com/egypt-en',
    searchUrl: (q) => `https://www.noon.com/egypt-en/search?q=${encodeURIComponent(q)}`,
    productDeepLink: (sku) => `https://www.noon.com/egypt-en/p-${sku.replace(/^caw_sku_|^caw_prod_/, '')}/`,
  },
  JUMIA_EG: {
    id: 'JUMIA_EG',
    name: 'Jumia Egypt',
    domain: 'jumia.com.eg',
    baseUrl: 'https://www.jumia.com.eg',
    searchUrl: (q) => `https://www.jumia.com.eg/catalog/?q=${encodeURIComponent(q)}`,
    productDeepLink: (sku) => `https://www.jumia.com.eg/${sku}.html`,
  },
  BTECH_EG: {
    id: 'BTECH_EG',
    name: 'B.TECH',
    domain: 'btech.com',
    baseUrl: 'https://btech.com/en',
    searchUrl: (q) => `https://btech.com/en/catalogsearch/result/?q=${encodeURIComponent(q)}`,
    productDeepLink: (sku) => `https://btech.com/en/${sku}`,
  },
  '2B_EG': {
    id: '2B_EG',
    name: '2B Egypt',
    domain: '2b.com.eg',
    baseUrl: 'https://2b.com.eg/en',
    searchUrl: (q) => `https://2b.com.eg/en/catalogsearch/result/?q=${encodeURIComponent(q)}`,
    productDeepLink: (sku) => `https://2b.com.eg/en/${sku}`,
  },
  RAYA_EG: {
    id: 'RAYA_EG',
    name: 'Raya Shop',
    domain: 'rayashop.com',
    baseUrl: 'https://www.rayashop.com/en',
    searchUrl: (q) => `https://www.rayashop.com/en/search?q=${encodeURIComponent(q)}`,
    productDeepLink: (sku) => `https://www.rayashop.com/en/${sku}`,
  },
  ELARABY_EG: {
    id: 'ELARABY_EG',
    name: 'El Araby Group',
    domain: 'elarabygroup.com',
    baseUrl: 'https://www.elarabygroup.com/en',
    searchUrl: (q) => `https://www.elarabygroup.com/en/catalogsearch/result/?q=${encodeURIComponent(q)}`,
    productDeepLink: (sku) => `https://www.elarabygroup.com/en/${sku}`,
  },
  DUBAI_PHONE: {
    id: 'DUBAI_PHONE',
    name: 'Dubai Phone',
    domain: 'dubaiphone.net',
    baseUrl: 'https://dubaiphone.net/en',
    searchUrl: (q) => `https://dubaiphone.net/en/catalogsearch/result/?q=${encodeURIComponent(q)}`,
    productDeepLink: (sku) => `https://dubaiphone.net/en/${sku}`,
  },
  DREAM_2000: {
    id: 'DREAM_2000',
    name: 'Dream 2000',
    domain: 'dream2000.com',
    baseUrl: 'https://dream2000.com/en',
    searchUrl: (q) => `https://dream2000.com/en/catalogsearch/result/?q=${encodeURIComponent(q)}`,
    productDeepLink: (sku) => `https://dream2000.com/en/${sku}`,
  },
  TRADELINE: {
    id: 'TRADELINE',
    name: 'Tradeline Stores',
    domain: 'tradelinestores.com',
    baseUrl: 'https://tradelinestores.com',
    searchUrl: (q) => `https://tradelinestores.com/search?type=product&q=${encodeURIComponent(q)}`,
    productDeepLink: (sku) => `https://tradelinestores.com/products/${sku}`,
  },
  VODAFONE_EG: {
    id: 'VODAFONE_EG',
    name: 'Vodafone Shop Egypt',
    domain: 'eshop.vodafone.com.eg',
    baseUrl: 'https://eshop.vodafone.com.eg/en',
    searchUrl: (q) => `https://eshop.vodafone.com.eg/en/search?q=${encodeURIComponent(q)}`,
    productDeepLink: (sku) => `https://eshop.vodafone.com.eg/en/shop/products/${sku}`,
  },
  CARREFOUR_EG: {
    id: 'CARREFOUR_EG',
    name: 'Carrefour Egypt',
    domain: 'carrefouregypt.com',
    baseUrl: 'https://www.carrefouregypt.com/mafegy/en',
    searchUrl: (q) => `https://www.carrefouregypt.com/mafegy/en/search?q=${encodeURIComponent(q)}`,
    productDeepLink: (sku) => `https://www.carrefouregypt.com/mafegy/en/p/${sku}`,
  },
};

/**
 * Normalizes platform ID from strings like 'Amazon Egypt', 'amazon.eg', 'AMZN_EG', etc.
 */
export function resolvePlatformId(platformIdentifier) {
  if (!platformIdentifier) return 'AMZN_EG';
  const str = String(platformIdentifier).toUpperCase();
  if (str.includes('AMZN') || str.includes('AMAZON')) return 'AMZN_EG';
  if (str.includes('NOON')) return 'NOON_EG';
  if (str.includes('JUMIA')) return 'JUMIA_EG';
  if (str.includes('BTECH') || str.includes('B.TECH')) return 'BTECH_EG';
  if (str.includes('2B')) return '2B_EG';
  if (str.includes('RAYA')) return 'RAYA_EG';
  if (str.includes('ELARABY') || str.includes('ARABY')) return 'ELARABY_EG';
  if (str.includes('DUBAI')) return 'DUBAI_PHONE';
  if (str.includes('DREAM')) return 'DREAM_2000';
  if (str.includes('TRADE')) return 'TRADELINE';
  if (str.includes('VODA')) return 'VODAFONE_EG';
  if (str.includes('CARREFOUR')) return 'CARREFOUR_EG';
  return 'AMZN_EG';
}

/**
 * Validates whether a URL is an authentic, non-internal HTTP/HTTPS external URL.
 */
export function isAuthenticExternalUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed || trimmed === '#' || trimmed.startsWith('javascript:')) return false;
  if (trimmed.includes('localhost') || trimmed.includes('127.0.0.1') || trimmed.includes('node.cawlix.com')) {
    return false;
  }
  return trimmed.startsWith('http://') || trimmed.startsWith('https://');
}

/**
 * Sanitizes and guarantees an absolute, valid external retailer URL.
 * Automatically handles:
 * - Missing protocol (adds https://)
 * - Relative paths (prepends platform base URL)
 * - Unlisted/internal dummy URLs (generates fallback search query)
 */
export function sanitizeRetailerUrl({
  url = '',
  platformId = null,
  productTitle = '',
  sku = '',
} = {}) {
  const resolvedId = resolvePlatformId(platformId);
  const meta = PLATFORM_REGISTRY_META[resolvedId] || PLATFORM_REGISTRY_META.AMZN_EG;

  const raw = typeof url === 'string' ? url.trim() : '';

  // 1. If valid absolute external URL that doesn't point to placeholder domains
  if (isAuthenticExternalUrl(raw)) {
    return raw;
  }

  // 2. If it's a protocol-relative URL: //amazon.eg/dp/...
  if (raw.startsWith('//')) {
    return `https:${raw}`;
  }

  // 3. If it looks like a domain without protocol: amazon.eg/dp/...
  if (raw.match(/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/)) {
    return `https://${raw}`;
  }

  // 4. If it's a relative path on the retailer's site: /dp/B0..., /p-1234/
  if (raw.startsWith('/')) {
    return `${meta.baseUrl}${raw}`;
  }

  // 5. If it's a valid SKU code and we have a deep-link pattern
  if (sku && typeof sku === 'string' && sku.trim()) {
    const cleanSku = sku.trim();
    if (cleanSku.length >= 4 && !cleanSku.startsWith('item-')) {
      return meta.productDeepLink(cleanSku);
    }
  }

  // 6. Resilient Fallback: Real domestic retailer search query
  const query = productTitle || sku || 'electronics';
  return meta.searchUrl(query);
}

/**
 * Programmatic handler that safely launches external retailer URLs.
 * Guarantees zero client-side routing interceptions and opens in a new tab with noopener,noreferrer.
 */
export function openExternalStore(params, event) {
  if (event) {
    if (typeof event.preventDefault === 'function') event.preventDefault();
    if (typeof event.stopPropagation === 'function') event.stopPropagation();
  }

  const safeUrl = sanitizeRetailerUrl(params);
  if (typeof window !== 'undefined' && safeUrl) {
    window.open(safeUrl, '_blank', 'noopener,noreferrer');
  }
  return safeUrl;
}
