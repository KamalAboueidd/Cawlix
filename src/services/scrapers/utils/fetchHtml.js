/**
 * HTML / API Fetcher Utility for Distributed Scrapers (CAWLIX)
 *
 * Fetch routing priority (browser):
 *   1. /api/v1/scraper/fetch  — Vite dev middleware (Node.js, no CORS) ← WORKS IN DEV
 *   2. allorigins.win          — Public CORS proxy, JSON response ← PRODUCTION FALLBACK
 *   3. corsproxy.io            — Public CORS proxy, raw HTML ← LAST RESORT
 *
 * In Node.js (scripts / edge): direct fetch, no proxy needed.
 */

const VITE_PROXY_PATH = '/api/v1/scraper/fetch';

const BROWSER_HEADERS = {
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9,ar-EG;q=0.8',
};

const NODE_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9,ar-EG;q=0.8,ar;q=0.7',
};

/** Check if Vite dev proxy is reachable (only in localhost dev server) */
let _viteProxyAvailable = null;
async function isViteProxyAvailable() {
  if (_viteProxyAvailable !== null) return _viteProxyAvailable;
  try {
    const r = await fetch(`${VITE_PROXY_PATH}?url=${encodeURIComponent('https://www.example.com')}`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000),
    });
    _viteProxyAvailable = r.ok;
  } catch {
    _viteProxyAvailable = false;
  }
  return _viteProxyAvailable;
}

/**
 * Fetches raw HTML / text content from a given URL.
 *
 * @param {string} targetUrl - Full URL to fetch
 * @param {Object} [options]
 * @param {number} [options.timeout=10000] - Request timeout in milliseconds
 * @returns {Promise<string>} Raw HTML text
 */
export async function fetchProductHtml(targetUrl, options = {}) {
  const timeout = options.timeout || 10000;

  if (!targetUrl || typeof targetUrl !== 'string') {
    throw new Error('Invalid URL provided to scraper fetcher');
  }

  // ── BROWSER PATH ──────────────────────────────────────────────────────────
  if (typeof window !== 'undefined') {

    // 1. Vite dev proxy: /api/v1/scraper/fetch?url=<encoded>
    //    This runs in Node.js on the Vite dev server — no CORS restrictions.
    try {
      const proxyAvail = await isViteProxyAvailable();
      if (proxyAvail) {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), timeout);
        const res = await fetch(
          `${VITE_PROXY_PATH}?url=${encodeURIComponent(targetUrl)}`,
          { signal: ctrl.signal, headers: { Accept: 'application/json' } }
        );
        clearTimeout(timer);
        if (res.ok) {
          const json = await res.json();
          if (json?.html && json.html.length > 100) {
            console.log(`[CawlixProxy] ✓ Vite proxy → ${targetUrl.slice(0, 60)}`);
            return json.html;
          }
        }
      }
    } catch {
      // Vite proxy not available (production build), try public proxies
    }

    // 2. allorigins.win — returns JSON { contents: "<html>..." }
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), timeout);
      const res = await fetch(
        `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`,
        { signal: ctrl.signal, headers: { Accept: 'application/json' } }
      );
      clearTimeout(timer);
      if (res.ok) {
        const json = await res.json();
        if (json?.contents && json.contents.length > 200) {
          console.log(`[CawlixProxy] ✓ allorigins → ${targetUrl.slice(0, 60)}`);
          return json.contents;
        }
      }
    } catch {
      // allorigins failed
    }

    // 3. corsproxy.io — returns raw HTML
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), timeout);
      const res = await fetch(
        `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
        { signal: ctrl.signal, headers: BROWSER_HEADERS }
      );
      clearTimeout(timer);
      if (res.ok) {
        const text = await res.text();
        if (text.length > 200) {
          console.log(`[CawlixProxy] ✓ corsproxy.io → ${targetUrl.slice(0, 60)}`);
          return text;
        }
      }
    } catch {
      // corsproxy.io failed
    }

    console.warn(`[CawlixProxy] ✗ All proxy paths failed for: ${targetUrl}`);
    throw new Error(`All CORS proxy paths failed for: ${targetUrl}`);
  }

  // ── NODE.JS PATH: Direct fetch ────────────────────────────────────────────
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: NODE_HEADERS,
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
 * Parses an HTML string into a DOM Document.
 * @param {string} html
 * @returns {Document}
 */
export function parseHtmlToDoc(html) {
  if (typeof window !== 'undefined' && window.DOMParser) {
    return new DOMParser().parseFromString(html, 'text/html');
  }
  return {
    rawHtml: html,
    querySelector: () => null,
    querySelectorAll: () => [],
  };
}

/**
 * Extracts and parses all script[type="application/ld+json"] blocks from HTML.
 * @param {string|Document} htmlOrDoc
 * @returns {Array<Object>}
 */
export function extractJsonLdBlocks(htmlOrDoc) {
  const blocks = [];
  if (typeof htmlOrDoc === 'object' && htmlOrDoc?.querySelectorAll) {
    htmlOrDoc.querySelectorAll('script[type="application/ld+json"]').forEach((s) => {
      try {
        const p = JSON.parse(s.textContent || '{}');
        Array.isArray(p) ? blocks.push(...p) : blocks.push(p);
      } catch { /* ignore */ }
    });
    return blocks;
  }
  const raw = typeof htmlOrDoc === 'string' ? htmlOrDoc : '';
  const re = /<script\s+[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(raw)) !== null) {
    try {
      const p = JSON.parse(m[1]);
      Array.isArray(p) ? blocks.push(...p) : blocks.push(p);
    } catch { /* ignore */ }
  }
  return blocks;
}
