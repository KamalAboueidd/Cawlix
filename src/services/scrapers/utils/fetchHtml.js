/**
 * HTML / API Fetcher Utility for Distributed Scrapers
 * Handles CORS avoidance in the browser by routing through the local Cawlix telemetry proxy,
 * with direct fetch fallback when in Node or CORS-enabled environments.
 */

const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9,ar-EG;q=0.8,ar;q=0.7',
};

/**
 * Fetches raw HTML / text content from a given URL
 *
 * @param {string} targetUrl - Full URL to fetch
 * @param {Object} [options]
 * @param {number} [options.timeout=10000] - Request timeout in milliseconds
 * @returns {Promise<string>} Raw HTML or JSON text
 */
export async function fetchProductHtml(targetUrl, options = {}) {
  const timeout = options.timeout || 10000;
  if (!targetUrl || typeof targetUrl !== 'string') {
    throw new Error('Invalid URL provided to scraper fetcher');
  }

  // 1. If running in browser, use the local Cawlix proxy to bypass CORS
  if (typeof window !== 'undefined') {
    try {
      const proxyUrl = `/api/v1/scraper/fetch?url=${encodeURIComponent(targetUrl)}`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);

      const proxyRes = await fetch(proxyUrl, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      });
      clearTimeout(timer);

      if (proxyRes.ok) {
        const json = await proxyRes.json();
        if (json?.html) {
          return json.html;
        }
      }
    } catch {
      // Proxy failed or not available, fall through to direct fetch
    }
  }

  // 2. Direct fetch (works in Node.js or if CORS headers allow)
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: DEFAULT_HEADERS,
    });
    clearTimeout(timer);

    if (!res.ok) {
      throw new Error(`Upstream returned HTTP ${res.status} for ${targetUrl}`);
    }

    return await res.text();
  } catch (err) {
    clearTimeout(timer);
    throw new Error(`Network error probing target URL: ${err.message}`);
  }
}

/**
 * Parses an HTML string into a DOM Document
 * Works in both browser (DOMParser) and graceful mock if in Node
 *
 * @param {string} html
 * @returns {Document}
 */
export function parseHtmlToDoc(html) {
  if (typeof window !== 'undefined' && window.DOMParser) {
    const parser = new DOMParser();
    return parser.parseFromString(html, 'text/html');
  }

  // Basic regex-based document abstraction for Node environment if DOMParser is absent
  return {
    rawHtml: html,
    querySelector: () => null,
    querySelectorAll: () => [],
  };
}

/**
 * Extracts and parses all script[type="application/ld+json"] blocks from HTML
 *
 * @param {string|Document} htmlOrDoc
 * @returns {Array<Object>} List of parsed JSON-LD objects
 */
export function extractJsonLdBlocks(htmlOrDoc) {
  const blocks = [];

  // If DOM document
  if (typeof htmlOrDoc === 'object' && htmlOrDoc?.querySelectorAll) {
    const scripts = htmlOrDoc.querySelectorAll('script[type="application/ld+json"]');
    scripts.forEach((script) => {
      try {
        const parsed = JSON.parse(script.textContent || '{}');
        if (Array.isArray(parsed)) {
          blocks.push(...parsed);
        } else {
          blocks.push(parsed);
        }
      } catch {
        // Ignore malformed JSON-LD
      }
    });
    return blocks;
  }

  // Regex fallback for raw HTML string
  const raw = typeof htmlOrDoc === 'string' ? htmlOrDoc : '';
  const regex = /<script\s+[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = regex.exec(raw)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);
      if (Array.isArray(parsed)) {
        blocks.push(...parsed);
      } else {
        blocks.push(parsed);
      }
    } catch {
      // Ignore
    }
  }

  return blocks;
}
