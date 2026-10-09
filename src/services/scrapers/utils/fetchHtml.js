/**
 * HTML / API Fetcher Utility for Distributed Scrapers
 * Routes through a public CORS proxy chain since this is a browser-only Vite app
 * (no backend server available).
 *
 * Proxy chain (browser path):
 *   1. allorigins.win  — returns JSON { contents: "<html>…" }
 *   2. corsproxy.io    — returns raw HTML directly
 *   3. Direct fetch    — only succeeds if the target sends permissive CORS headers
 */

const DEFAULT_HEADERS = {
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9,ar-EG;q=0.8',
};

/** allorigins.win proxy — returns JSON { contents, status } */
function allOriginsUrl(targetUrl) {
  return `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
}

/** corsproxy.io proxy — returns raw HTML */
function corsProxyIoUrl(targetUrl) {
  return `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
}

/**
 * Fetches raw HTML / text content from a given URL.
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

  // ── BROWSER PATH: Route through CORS proxy chain ─────────────────────────
  if (typeof window !== 'undefined') {
    // 1. allorigins.win
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), timeout);
      const res = await fetch(allOriginsUrl(targetUrl), {
        signal: ctrl.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timer);
      if (res.ok) {
        const json = await res.json();
        if (json?.contents && json.contents.length > 200) {
          return json.contents;
        }
      }
    } catch {
      // allorigins failed → try next
    }

    // 2. corsproxy.io
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), timeout);
      const res = await fetch(corsProxyIoUrl(targetUrl), {
        signal: ctrl.signal,
        headers: DEFAULT_HEADERS,
      });
      clearTimeout(timer);
      if (res.ok) {
        const text = await res.text();
        if (text.length > 200) return text;
      }
    } catch {
      // corsproxy.io failed → try direct
    }

    // 3. Direct fetch (only works if site allows it via CORS headers)
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), timeout);
      const res = await fetch(targetUrl, {
        signal: ctrl.signal,
        headers: DEFAULT_HEADERS,
        mode: 'cors',
      });
      clearTimeout(timer);
      if (res.ok) return await res.text();
    } catch {
      // All browser paths exhausted
    }

    throw new Error(`All CORS proxy paths failed for: ${targetUrl}`);
  }

  // ── NODE PATH: Direct fetch ───────────────────────────────────────────────
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: DEFAULT_HEADERS,
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status} from ${targetUrl}`);
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

  // Basic abstraction for Node environment
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

  if (typeof htmlOrDoc === 'object' && htmlOrDoc?.querySelectorAll) {
    const scripts = htmlOrDoc.querySelectorAll('script[type="application/ld+json"]');
    scripts.forEach((script) => {
      try {
        const parsed = JSON.parse(script.textContent || '{}');
        if (Array.isArray(parsed)) blocks.push(...parsed);
        else blocks.push(parsed);
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
      if (Array.isArray(parsed)) blocks.push(...parsed);
      else blocks.push(parsed);
    } catch {
      // Ignore
    }
  }

  return blocks;
}
