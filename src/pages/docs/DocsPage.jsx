import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/landing/Footer';

const SIDEBAR_NAV = [
  {
    category: '1. Core Specification',
    links: [
      { label: 'Architecture Overview', href: '#architecture' },
      { label: 'Authentication & Rate Limits', href: '#authentication' },
    ],
  },
  {
    category: '2. REST Engine Endpoints',
    links: [
      { label: 'GET /api/v1/telemetry/sku', href: '#get-telemetry-sku', method: 'GET' },
      { label: 'GET /api/v1/audit/ghost-discount', href: '#get-ghost-discount', method: 'GET', active: true },
      { label: 'GET /api/v1/arbitrage/landed-cost', href: '#get-landed-cost', method: 'GET' },
      { label: 'POST /api/v1/webhooks/glitch-radar', href: '#post-webhooks', method: 'POST' },
    ],
  },
  {
    category: '3. Technical Reference',
    links: [
      { label: 'HMAC-SHA256 Verification', href: '#hmac-verification' },
      { label: '12 Retailer Node Codes', href: '#retailer-nodes' },
      { label: 'Egyptian Customs HS Matrix', href: '#customs-matrix' },
      { label: 'Production SLA & Quotas', href: '#rate-limits' },
    ],
  },
];

const CURL_EXAMPLES = {
  auth: `curl -X GET "https://api.cawlix.com/api/v1/telemetry/sku?sku=AMZN_EG_B0CHX1W2X8" \\
  -H "Authorization: Bearer caw_live_89f3a9e018d4512b9044f128e08" \\
  -H "Accept: application/json"`,

  telemetry: `curl -X GET "https://api.cawlix.com/api/v1/telemetry/sku?sku=BTECH_EG_APPLE_MACBOOK_PRO_16&retailer_id=btech_eg" \\
  -H "Authorization: Bearer caw_live_89f3a9e018d4512b9044f128e08"`,

  ghost: `curl -X GET "https://api.cawlix.com/api/v1/audit/ghost-discount?sku=AMZN_EG_B0CHX1W2X8&window_days=90" \\
  -H "Authorization: Bearer caw_live_89f3a9e018d4512b9044f128e08"`,

  landed: `curl -X GET "https://api.cawlix.com/api/v1/arbitrage/landed-cost?origin_hub=JFK&weight_kg=1.5&cif_usd=1299&hs_code=8471.30" \\
  -H "Authorization: Bearer caw_live_89f3a9e018d4512b9044f128e08"`,

  webhook: `curl -X POST "https://api.cawlix.com/api/v1/webhooks/glitch-radar" \\
  -H "Authorization: Bearer caw_live_89f3a9e018d4512b9044f128e08" \\
  -H "Content-Type: application/json" \\
  -d '{
    "target_url": "https://consumer-api.internal/webhooks/cawlix",
    "threshold_pct": 35.0,
    "secret": "whsec_live_99d10e823b49910c2847aef9"
  }'`,
};

const GHOST_RESPONSE_JSON = `{
  "status": "success",
  "sku": "AMZN_EG_B0CHX1W2X8",
  "window_days": 90,
  "baseline_median_egp": 28500,
  "current_shelf_egp": 29900,
  "advertised_discount_pct": 35.0,
  "real_discount_pct": -4.9,
  "pre_sale_spike_detected": true,
  "spike_magnitude_egp": 16100,
  "authenticity_score": 18,
  "verdict": "CRITICAL_GHOST_MARKUP",
  "evaluation_metrics": {
    "rolling_window_days": 90,
    "historical_sample_points": 1296,
    "max_historical_egp": 44600,
    "min_historical_egp": 28200,
    "confidence_interval": 0.998
  },
  "evaluated_at": "2026-10-03T12:00:00Z"
}`;

const TELEMETRY_RESPONSE_JSON = `{
  "status": "success",
  "sku": "BTECH_EG_APPLE_MACBOOK_PRO_16",
  "retailer_id": "btech_eg",
  "retailer_name": "B.TECH",
  "listed_price_egp": 178000,
  "currency": "EGP",
  "in_stock": true,
  "stock_count": 8,
  "seller": {
    "name": "B.TECH Direct Official",
    "is_verified": true,
    "rating": 4.8
  },
  "probe_latency_ms": 142,
  "last_synced_at": "2026-10-03T15:10:04Z"
}`;

const LANDED_RESPONSE_JSON = `{
  "status": "success",
  "calculation_parameters": {
    "origin_hub": "JFK",
    "source_price_usd": 1299,
    "weight_kg": 1.5,
    "hs_code": "8471.30",
    "effective_fx_rate": 48.5
  },
  "cost_breakdown_egp": {
    "source_price_shelf": 63002,
    "air_freight_cargo": 1200,
    "declared_cif_subtotal": 64202,
    "customs_duty": 0,
    "statutory_development_fee": 0,
    "statutory_vat_14pct": 8988,
    "banking_fx_commission_3pct": 1890,
    "total_landed_settlement": 75080
  },
  "currency": "EGP",
  "calculated_at": "2026-10-03T15:15:20Z"
}`;

const WEBHOOK_REGISTRATION_JSON = `{
  "status": "active",
  "subscription_id": "sub_wh_091823fa",
  "target_url": "https://consumer-api.internal/webhooks/cawlix",
  "threshold_pct": 35.0,
  "signing_secret": "whsec_live_99d10e823b49910c2847aef9",
  "signature_header": "X-Cawlix-Signature",
  "algorithm": "HMAC-SHA256",
  "active_channels": ["LOW_LATENCY_WEBHOOK", "TELEGRAM_GATEWAY"],
  "created_at": "2026-10-03T15:20:00Z"
}`;

const NODEJS_VERIFY_SAMPLE = `import crypto from 'crypto';

export function verifyCawlixWebhook(rawPayload, headerSignature, secret) {
  const computedHash = crypto
    .createHmac('sha256', secret)
    .update(rawPayload)
    .digest('hex');

  const trusted = Buffer.from(computedHash, 'utf8');
  const untrusted = Buffer.from(headerSignature, 'utf8');

  return trusted.length === untrusted.length && crypto.timingSafeEqual(trusted, untrusted);
}`;

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`copy-curl-btn ${copied ? 'copy-success' : ''}`}
    >
      {copied ? 'Copied!' : 'Copy cURL'}
    </button>
  );
}

export default function DocsPage() {
  return (
    <div className="docs-wrapper">
      <Navbar />

      <main className="docs-main">
        <div className="docs-container">
          {/* 2-Column Split: Sticky Sidebar + Main Documentation Body */}
          <div className="docs-layout">
            {/* Sticky Sidebar Navigation (Left) */}
            <aside className="docs-sidebar">
              <nav className="sidebar-nav">
                {SIDEBAR_NAV.map((group) => (
                  <div key={group.category} className="nav-group">
                    <span className="nav-group-title">{group.category}</span>
                    <ul className="nav-link-list">
                      {group.links.map((link) => (
                        <li key={link.label} className="nav-link-item">
                          <a
                            href={link.href}
                            className={`nav-link ${link.active ? 'nav-link-active' : ''}`}
                          >
                            {link.method && (
                              <span className={`method-prefix ${link.method === 'GET' ? 'method-get' : 'method-post'}`}>
                                {link.method}
                              </span>
                            )}
                            <span className="nav-link-text">{link.label.replace(/^(GET|POST)\s+/, '')}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </nav>
            </aside>

            {/* Main Documentation Body (Right) */}
            <div className="docs-content">
              {/* Documentation Header */}
              <header className="docs-header">
                <div className="docs-metrics-strip">
                  <span className="docs-metrics-text">
                    SUB-200MS EGRESS · END-TO-END SIGNED PAYLOADS · REAL API LINKAGE
                  </span>
                </div>

                <h1 className="docs-title">
                  Cawlix Engine <span className="docs-title-muted">Developer Documentation.</span>
                </h1>

                <p className="docs-subtitle">
                  Low-latency REST and WebSocket endpoints for querying verified market prices, arbitrage margins, and 90-day time-series telemetry across 12 retailers.
                </p>
              </header>

              {/* Section 1: Architecture Overview & Authentication */}
              <section id="architecture" className="doc-section">
                <div className="section-meta-kicker">SECTION 01</div>
                <h2 className="section-heading">Platform Architecture &amp; Authentication</h2>
                <p className="section-body">
                  The Cawlix Telemetry Engine bypasses volatile web caches by evaluating real-time DOM states and cart payload simulations across 12 domestic and transatlantic retailers. All endpoints are versioned under <code className="inline-code">/api/v1/</code> and return deterministically structured JSON responses.
                </p>

                <div className="meta-stats-row">
                  <div className="meta-stat-item">
                    <span className="stat-label">PRODUCTION BASE URL</span>
                    <span className="stat-code">https://api.cawlix.com/api/v1</span>
                  </div>
                  <div className="meta-stat-item">
                    <span className="stat-label">AUTHENTICATION SCHEME</span>
                    <span className="stat-code">HTTP Bearer Token</span>
                  </div>
                  <div className="meta-stat-item">
                    <span className="stat-label">TARGET PROBE LATENCY</span>
                    <span className="stat-code">&lt; 142ms Egress</span>
                  </div>
                </div>

                <div id="authentication" className="auth-box-wrap">
                  <h3 className="subsection-title">Authentication &amp; Production Rate Limits</h3>
                  <p className="section-body">
                    Pass your API key in the <code className="inline-code">Authorization</code> header with the <code className="inline-code">Bearer</code> prefix. Pro tier keys are allocated <strong>60 requests per minute</strong> with sub-150ms priority egress. Enterprise clusters utilize dedicated WebSocket socket pipes with zero synthetic rate throttling.
                  </p>

                  <div className="code-preview-block">
                    <div className="code-header">
                      <span className="code-label">RUNNABLE cURL SPECIFICATION</span>
                      <CopyButton text={CURL_EXAMPLES.auth} />
                    </div>
                    <pre className="code-snippet"><code>{CURL_EXAMPLES.auth}</code></pre>
                  </div>
                </div>
              </section>

              {/* Section 2: Core Price Telemetry Engine (GET /api/v1/telemetry/sku) */}
              <section id="get-telemetry-sku" className="doc-section">
                <div className="section-meta-kicker">SECTION 02</div>
                <div className="endpoint-header">
                  <div className="method-route-row">
                    <span className="http-method-text method-get">GET</span>
                    <span className="route-path-text">/api/v1/telemetry/sku</span>
                  </div>
                  <span className="endpoint-scope-meta">REAL-TIME SKU PROBE</span>
                </div>

                <p className="section-body">
                  Queries the real-time listed shelf price, in-stock status, and seller accreditation for an individual SKU. Dispatches a high-velocity probe directly against the merchant's checkout API if local cache age exceeds 30 seconds.
                </p>

                <div className="params-block">
                  <h3 className="params-heading">QUERY PARAMETERS</h3>
                  <div className="params-list">
                    <div className="param-row">
                      <div className="param-meta">
                        <span className="param-name">sku</span>
                        <span className="param-type">string</span>
                        <span className="param-required">required</span>
                      </div>
                      <span className="param-desc">Canonical internal SKU identifier or merchant listing link (e.g. <code className="inline-code">AMZN_EG_B0CHX1W2X8</code>).</span>
                    </div>
                    <div className="param-row">
                      <div className="param-meta">
                        <span className="param-name">retailer_id</span>
                        <span className="param-type">string</span>
                        <span className="param-optional">optional · default: amzn_eg</span>
                      </div>
                      <span className="param-desc">Target retailer node: <code className="inline-code">amzn_eg</code>, <code className="inline-code">noon_eg</code>, <code className="inline-code">btech_eg</code>, <code className="inline-code">raya_eg</code>, <code className="inline-code">2b_eg</code>, <code className="inline-code">trade_eg</code>.</span>
                    </div>
                  </div>
                </div>

                <div className="code-preview-block">
                  <div className="code-header">
                    <span className="code-label">REQUEST EXAMPLE</span>
                    <CopyButton text={CURL_EXAMPLES.telemetry} />
                  </div>
                  <pre className="code-snippet"><code>{CURL_EXAMPLES.telemetry}</code></pre>
                </div>

                <div className="code-preview-block">
                  <div className="code-header">
                    <span className="code-label">RESPONSE SCHEMA (200 OK)</span>
                    <span className="code-badge">APPLICATION/JSON</span>
                  </div>
                  <pre className="code-snippet"><code>{TELEMETRY_RESPONSE_JSON}</code></pre>
                </div>
              </section>

              {/* Section 3: 90-Day Ghost-Discount Engine (GET /api/v1/audit/ghost-discount) */}
              <section id="get-ghost-discount" className="doc-section doc-section-highlight">
                <div className="section-meta-kicker">SECTION 03</div>
                <div className="endpoint-header">
                  <div className="method-route-row">
                    <span className="http-method-text method-get">GET</span>
                    <span className="route-path-text">/api/v1/audit/ghost-discount</span>
                  </div>
                  <span className="endpoint-scope-meta">FORENSIC MARKDOWN AUDITOR</span>
                </div>

                <p className="section-body">
                  Executes a rolling 90-day time-series forensic audit on an advertised promotional markdown. Evaluates rolling baseline medians, detects artificial pre-sale price inflation spikes, and computes a mathematical Authenticity Score between 0 and 100.
                </p>

                <div className="formula-box">
                  <h4 className="formula-title">QUANTITATIVE EVALUATION ALGORITHM</h4>
                  <ul className="formula-list">
                    <li><strong>Rolling 90-Day Median:</strong> Median shelf price computed across 1,296 discrete probe intervals to eliminate flash volatility.</li>
                    <li><strong>Pre-Sale Spike Flag:</strong> Triggered when price increases &gt; 15% within the 14 days preceding an advertised promotional campaign.</li>
                    <li><strong>Authenticity Score (0 - 100):</strong> Inversely proportional to pre-sale markup magnitude. Scores &lt; 40 indicate critical artificial markdown deception.</li>
                  </ul>
                </div>

                <div className="params-block">
                  <h3 className="params-heading">QUERY PARAMETERS</h3>
                  <div className="params-list">
                    <div className="param-row">
                      <div className="param-meta">
                        <span className="param-name">sku</span>
                        <span className="param-type">string</span>
                        <span className="param-required">required</span>
                      </div>
                      <span className="param-desc">Canonical product identifier or supported merchant product URL.</span>
                    </div>
                    <div className="param-row">
                      <div className="param-meta">
                        <span className="param-name">window_days</span>
                        <span className="param-type">integer</span>
                        <span className="param-optional">optional · default: 90</span>
                      </div>
                      <span className="param-desc">Historical evaluation interval in days (supports <code className="inline-code">30</code>, <code className="inline-code">60</code>, or <code className="inline-code">90</code>).</span>
                    </div>
                  </div>
                </div>

                <div className="code-preview-block">
                  <div className="code-header">
                    <span className="code-label">REQUEST EXAMPLE</span>
                    <CopyButton text={CURL_EXAMPLES.ghost} />
                  </div>
                  <pre className="code-snippet"><code>{CURL_EXAMPLES.ghost}</code></pre>
                </div>

                <div className="code-preview-block">
                  <div className="code-header">
                    <span className="code-label">RESPONSE SCHEMA (200 OK)</span>
                    <span className="code-badge">APPLICATION/JSON</span>
                  </div>
                  <pre className="code-snippet"><code>{GHOST_RESPONSE_JSON}</code></pre>
                </div>

                {/* Field-by-field definitions table */}
                <div className="schema-table-wrap">
                  <h4 className="schema-heading">FIELD DEFINITIONS</h4>
                  <table className="schema-table">
                    <thead>
                      <tr>
                        <th>FIELD</th>
                        <th>TYPE</th>
                        <th>DESCRIPTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="font-mono text-brand">baseline_median_egp</td>
                        <td className="font-mono">integer</td>
                        <td>Statistically normalized rolling median price over the audit interval.</td>
                      </tr>
                      <tr>
                        <td className="font-mono text-brand">pre_sale_spike_detected</td>
                        <td className="font-mono">boolean</td>
                        <td>True if an artificial baseline inflation was executed prior to the sale.</td>
                      </tr>
                      <tr>
                        <td className="font-mono text-brand">spike_magnitude_egp</td>
                        <td className="font-mono">integer</td>
                        <td>Absolute difference between pre-sale peak and authentic rolling median.</td>
                      </tr>
                      <tr>
                        <td className="font-mono text-brand">authenticity_score</td>
                        <td className="font-mono">integer (0-100)</td>
                        <td>Algorithmic integrity index. Scores under 40 indicate fraudulent deals.</td>
                      </tr>
                      <tr>
                        <td className="font-mono text-brand">verdict</td>
                        <td className="font-mono">string</td>
                        <td>Forensic classification: <code className="inline-code">GENUINE_DEAL</code>, <code className="inline-code">NEUTRAL_PROMO</code>, or <code className="inline-code">CRITICAL_GHOST_MARKUP</code>.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Section 4: Cross-Border Landed-Cost Engine (GET /api/v1/arbitrage/landed-cost) */}
              <section id="get-landed-cost" class="doc-section">
                <div className="section-meta-kicker">SECTION 04</div>
                <div className="endpoint-header">
                  <div className="method-route-row">
                    <span className="http-method-text method-get">GET</span>
                    <span className="route-path-text">/api/v1/arbitrage/landed-cost</span>
                  </div>
                  <span className="endpoint-scope-meta">CROSS-BORDER CLEARING ENGINE</span>
                </div>

                <p className="section-body">
                  Computes comprehensive landed cost models from US/EU hubs to Egypt, stacking source shelf prices, volumetric air freight, accredited HS-Code tariffs, statutory 14% VAT, and credit card FX settlement spreads.
                </p>

                <div className="formula-box">
                  <h4 className="formula-title">STATUTORY EGYPTIAN CLEARING FORMULA</h4>
                  <ul className="formula-list">
                    <li><code className="inline-code">Declared CIF = (Shelf USD + Volumetric Freight) * Live CBE FX Rate</code></li>
                    <li><code className="inline-code">Customs Tariff = Declared CIF * Statutory HS Duty (e.g. 0% Laptops, 10% Phones)</code></li>
                    <li><code className="inline-code">Statutory VAT (14%) = (Declared CIF + Customs Tariff + Dev Fee) * 0.14</code></li>
                    <li><code className="inline-code">Banking Markup (3%) = Shelf Price EGP * 0.03 (Credit Card Foreign Currency Fee)</code></li>
                  </ul>
                </div>

                <div className="params-block">
                  <h3 className="params-heading">QUERY PARAMETERS</h3>
                  <div className="params-list">
                    <div className="param-row">
                      <div className="param-meta">
                        <span className="param-name">cif_usd</span>
                        <span className="param-type">number</span>
                        <span className="param-required">required</span>
                      </div>
                      <span className="param-desc">Shelf retail checkout price in USD or EUR at source hub.</span>
                    </div>
                    <div className="param-row">
                      <div className="param-meta">
                        <span className="param-name">hs_code</span>
                        <span className="param-type">string</span>
                        <span className="param-required">required</span>
                      </div>
                      <span className="param-desc">Egyptian Customs classification: <code className="inline-code">8471.30</code> (0% Laptops), <code className="inline-code">8517.13</code> (10% + 5% Phones), <code className="inline-code">8525.80</code> (Cameras).</span>
                    </div>
                    <div className="param-row">
                      <div className="param-meta">
                        <span className="param-name">origin_hub</span>
                        <span className="param-type">string</span>
                        <span className="param-optional">optional · default: JFK</span>
                      </div>
                      <span className="param-desc">Logistics air cargo gateway: <code className="inline-code">JFK</code> (New York) or <code className="inline-code">DE</code> (Frankfurt).</span>
                    </div>
                    <div className="param-row">
                      <div className="param-meta">
                        <span className="param-name">weight_kg</span>
                        <span className="param-type">number</span>
                        <span className="param-optional">optional · default: 1.5</span>
                      </div>
                      <span className="param-desc">Gross dimensional parcel weight in kilograms.</span>
                    </div>
                  </div>
                </div>

                <div className="code-preview-block">
                  <div className="code-header">
                    <span className="code-label">REQUEST EXAMPLE</span>
                    <CopyButton text={CURL_EXAMPLES.landed} />
                  </div>
                  <pre className="code-snippet"><code>{CURL_EXAMPLES.landed}</code></pre>
                </div>

                <div className="code-preview-block">
                  <div className="code-header">
                    <span className="code-label">RESPONSE SCHEMA (200 OK)</span>
                    <span className="code-badge">APPLICATION/JSON</span>
                  </div>
                  <pre className="code-snippet"><code>{LANDED_RESPONSE_JSON}</code></pre>
                </div>
              </section>

              {/* Section 5: Flash-Glitch Webhooks (POST /api/v1/webhooks/glitch-radar) */}
              <section id="post-webhooks" class="doc-section">
                <div className="section-meta-kicker">SECTION 05</div>
                <div className="endpoint-header">
                  <div className="method-route-row">
                    <span className="http-method-text method-post">POST</span>
                    <span className="route-path-text">/api/v1/webhooks/glitch-radar</span>
                  </div>
                  <span className="endpoint-scope-meta">ANOMALY WEBHOOK REGISTRATION</span>
                </div>

                <p className="section-body">
                  Registers an HTTPS webhook consumer endpoint to receive instantaneous notifications when pricing glitches, coupon stacking errors, or decimal blunders exceeding your threshold are confirmed by automated cart verification workers.
                </p>

                <div className="code-preview-block">
                  <div className="code-header">
                    <span className="code-label">REGISTER WEBHOOK LISTENER</span>
                    <CopyButton text={CURL_EXAMPLES.webhook} />
                  </div>
                  <pre className="code-snippet"><code>{CURL_EXAMPLES.webhook}</code></pre>
                </div>

                <div className="code-preview-block">
                  <div className="code-header">
                    <span className="code-label">REGISTRATION CONFIRMATION (201 CREATED)</span>
                    <span className="code-badge">APPLICATION/JSON</span>
                  </div>
                  <pre className="code-snippet"><code>{WEBHOOK_REGISTRATION_JSON}</code></pre>
                </div>

                <div id="hmac-verification" className="webhook-verify-wrap">
                  <h3 className="subsection-title">Webhook Signature Verification (HMAC-SHA256)</h3>
                  <p className="section-body">
                    Every incoming webhook request contains an <code className="inline-code">X-Cawlix-Signature</code> header. Calculate the HMAC-SHA256 hex digest of the raw request payload using your assigned <code className="inline-code">signing_secret</code> and perform a constant-time comparison to verify authenticity.
                  </p>

                  <div className="code-preview-block">
                    <div className="code-header">
                      <span className="code-label">NODE.JS VERIFICATION HANDLER</span>
                      <span className="code-badge">ESM / CRYPTO</span>
                    </div>
                    <pre className="code-snippet"><code>{NODEJS_VERIFY_SAMPLE}</code></pre>
                  </div>
                </div>
              </section>

              {/* Section 6: Reference & Indices */}
              <section id="retailer-nodes" class="doc-section">
                <div className="section-meta-kicker">APPENDIX</div>
                <h2 className="section-heading">Retailer Node Code Matrix</h2>
                <div className="ref-table-wrap">
                  <table className="ref-table">
                    <thead>
                      <tr>
                        <th>NODE CODE</th>
                        <th>RETAILER ENTITY</th>
                        <th>SCOPE</th>
                        <th>POLL CADENCE</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="font-mono text-brand">AMZN_EG</td>
                        <td>Amazon Egypt</td>
                        <td>Domestic Electronics</td>
                        <td>Continuous (30s)</td>
                      </tr>
                      <tr>
                        <td className="font-mono text-brand">NOON_EG</td>
                        <td>Noon Egypt</td>
                        <td>Consumer Tech &amp; Appliances</td>
                        <td>Continuous (45s)</td>
                      </tr>
                      <tr>
                        <td className="font-mono text-brand">BTECH_EG</td>
                        <td>B.TECH</td>
                        <td>Installments &amp; Handhelds</td>
                        <td>2 Minutes</td>
                      </tr>
                      <tr>
                        <td className="font-mono text-brand">RAYA_EG</td>
                        <td>RayaShop</td>
                        <td>Mobile &amp; Computing</td>
                        <td>3 Minutes</td>
                      </tr>
                      <tr>
                        <td className="font-mono text-brand">2B_EG</td>
                        <td>2B Egypt</td>
                        <td>PC Hardware &amp; Gaming</td>
                        <td>5 Minutes</td>
                      </tr>
                      <tr>
                        <td className="font-mono text-brand">TRADE_EG</td>
                        <td>Tradeline</td>
                        <td>Apple Authorized Reseller</td>
                        <td>15 Minutes</td>
                      </tr>
                      <tr>
                        <td className="font-mono text-brand">AMZN_US</td>
                        <td>Amazon US (Air Cargo Conduit)</td>
                        <td>Cross-Border USD / JFK</td>
                        <td>30 Minutes</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <style>{`
        /* ── Canvas & Layout Architecture ────────────────────────────────────────── */
        .docs-wrapper {
          min-height: 100vh;
          background-color: #0A0A0A;
          color: #EDEDED;
        }

        .docs-main {
          min-height: 100vh;
          background-color: #0A0A0A;
          padding-top: 130px;
          padding-bottom: 96px;
          overflow-x: hidden;
        }

        .docs-container {
          max-width: 1140px;
          margin: 0 auto;
          padding: 0 24px;
          box-sizing: border-box;
        }

        .docs-layout {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 48px;
          align-items: flex-start;
        }

        /* ── Sticky Sidebar Navigation ───────────────────────────────────────────── */
        .docs-sidebar {
          position: sticky;
          top: 120px;
          height: calc(100vh - 140px);
          overflow-y: auto;
          padding-right: 16px;
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          -webkit-overflow-scrolling: touch;
        }

        .docs-sidebar::-webkit-scrollbar {
          width: 3px;
        }
        .docs-sidebar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .nav-group-title {
          font-family: var(--font-mono);
          font-size: 0.6875rem;
          font-weight: 600;
          color: #737373;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          display: block;
          margin-bottom: 12px;
        }

        .nav-link-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .nav-link {
          display: flex;
          align-items: baseline;
          gap: 8px;
          font-size: 0.8125rem;
          color: #888888;
          text-decoration: none;
          line-height: 1.4;
          transition: color 140ms ease;
        }

        .nav-link:hover {
          color: #FFFFFF;
        }

        .nav-link-active {
          color: #3ECF8E;
          font-weight: 600;
        }

        .method-prefix {
          font-family: var(--font-mono);
          font-size: 0.625rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          border: none;
          background: transparent;
          padding: 0;
        }

        .method-get {
          color: #3ECF8E;
        }

        .method-post {
          color: #60A5FA;
        }

        /* ── Content Surface ─────────────────────────────────────────────────────── */
        .docs-content {
          min-width: 0;
        }

        .docs-header {
          margin-bottom: 48px;
          padding-bottom: 36px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .docs-metrics-strip {
          margin-bottom: 16px;
        }

        .docs-metrics-text {
          font-family: var(--font-mono);
          font-size: 0.6875rem;
          font-weight: 500;
          letter-spacing: 0.08em;
          color: #737373;
          text-transform: uppercase;
        }

        .docs-title {
          font-family: var(--font-sans);
          font-size: clamp(2rem, 4vw, 2.75rem);
          font-weight: 600;
          line-height: 1.15;
          letter-spacing: -0.035em;
          color: #EDEDED;
          margin: 0 0 14px 0;
        }

        .docs-title-muted {
          color: #737373;
          font-weight: 400;
        }

        .docs-subtitle {
          font-size: 1rem;
          color: #888888;
          line-height: 1.6;
          margin: 0;
          max-width: 760px;
        }

        /* ── Doc Sections ────────────────────────────────────────────────────────── */
        .doc-section {
          padding: 40px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .doc-section-highlight {
          padding-top: 44px;
          padding-bottom: 44px;
        }

        .section-meta-kicker {
          font-family: var(--font-mono);
          font-size: 0.6875rem;
          font-weight: 600;
          color: #3ECF8E;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        .section-heading {
          font-family: var(--font-sans);
          font-size: 1.625rem;
          font-weight: 600;
          color: #FFFFFF;
          letter-spacing: -0.02em;
          margin: 0 0 12px 0;
        }

        .subsection-title {
          font-family: var(--font-sans);
          font-size: 1.125rem;
          font-weight: 600;
          color: #FFFFFF;
          margin: 24px 0 10px 0;
          letter-spacing: -0.01em;
        }

        .section-body {
          font-size: 0.9375rem;
          color: #888888;
          line-height: 1.65;
          margin: 0 0 20px 0;
          max-width: 760px;
        }

        .inline-code {
          font-family: var(--font-mono);
          font-size: 0.8125rem;
          color: #EDEDED;
          background: rgba(255, 255, 255, 0.05);
          padding: 1px 5px;
          border-radius: 3px;
        }

        /* ── Formula Box ─────────────────────────────────────────────────────────── */
        .formula-box {
          background: rgba(255, 255, 255, 0.015);
          border-left: 2px solid #3ECF8E;
          padding: 16px 20px;
          margin: 20px 0 24px 0;
        }

        .formula-title {
          font-family: var(--font-mono);
          font-size: 0.6875rem;
          font-weight: 600;
          color: #3ECF8E;
          letter-spacing: 0.06em;
          margin: 0 0 10px 0;
        }

        .formula-list {
          margin: 0;
          padding-left: 18px;
          font-size: 0.8125rem;
          color: #A1A1AA;
          line-height: 1.65;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        /* ── Endpoint Headers ────────────────────────────────────────────────────── */
        .endpoint-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 14px;
          gap: 16px;
          flex-wrap: wrap;
        }

        .method-route-row {
          display: flex;
          align-items: baseline;
          gap: 10px;
        }

        .http-method-text {
          font-family: var(--font-mono);
          font-size: 0.9375rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          border: none;
          background: transparent;
          padding: 0;
        }

        .route-path-text {
          font-family: var(--font-mono);
          font-size: 1.125rem;
          font-weight: 600;
          color: #FFFFFF;
          letter-spacing: -0.01em;
        }

        .endpoint-scope-meta {
          font-family: var(--font-mono);
          font-size: 0.625rem;
          color: #737373;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        /* ── Parameters Block ────────────────────────────────────────────────────── */
        .params-block {
          margin-bottom: 24px;
        }

        .params-heading {
          font-family: var(--font-mono);
          font-size: 0.6875rem;
          font-weight: 600;
          color: #737373;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin: 0 0 12px 0;
        }

        .params-list {
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .param-row {
          padding: 12px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .param-meta {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }

        .param-name {
          font-family: var(--font-mono);
          font-size: 0.8125rem;
          font-weight: 600;
          color: #EDEDED;
        }

        .param-type {
          font-family: var(--font-mono);
          font-size: 0.6875rem;
          color: #737373;
        }

        .param-required {
          font-family: var(--font-mono);
          font-size: 0.625rem;
          color: #EF4444;
          text-transform: uppercase;
        }

        .param-optional {
          font-family: var(--font-mono);
          font-size: 0.625rem;
          color: #525252;
        }

        .param-desc {
          font-size: 0.8125rem;
          color: #888888;
          line-height: 1.5;
        }

        /* ── Code Preview Blocks ─────────────────────────────────────────────────── */
        .code-preview-block {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          padding: 16px 20px;
          margin: 18px 0;
        }

        .code-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .code-label {
          font-family: var(--font-mono);
          font-size: 0.625rem;
          font-weight: 600;
          color: #737373;
          letter-spacing: 0.06em;
        }

        .code-badge {
          font-family: var(--font-mono);
          font-size: 0.625rem;
          color: #525252;
          letter-spacing: 0.04em;
        }

        .copy-curl-btn {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #A1A1AA;
          font-family: var(--font-mono);
          font-size: 0.625rem;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 140ms ease, border-color 140ms ease, color 140ms ease;
        }

        .copy-curl-btn:hover {
          background: rgba(255, 255, 255, 0.06);
          color: #FFFFFF;
          border-color: rgba(255, 255, 255, 0.25);
        }

        .copy-success {
          color: #3ECF8E !important;
          border-color: #3ECF8E !important;
        }

        .code-snippet {
          margin: 0;
          padding: 0;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          line-height: 1.55;
          color: #EDEDED;
          overflow-x: auto;
        }

        /* ── Field Schema Table ──────────────────────────────────────────────────── */
        .schema-table-wrap {
          margin-top: 24px;
        }

        .schema-heading {
          font-family: var(--font-mono);
          font-size: 0.6875rem;
          font-weight: 600;
          color: #737373;
          letter-spacing: 0.06em;
          margin: 0 0 10px 0;
        }

        .schema-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.8125rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .schema-table th {
          padding: 10px 14px;
          font-family: var(--font-mono);
          font-size: 0.625rem;
          font-weight: 600;
          color: #737373;
          text-align: left;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .schema-table td {
          padding: 10px 14px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          color: #888888;
        }

        /* ── Meta Stats Row ──────────────────────────────────────────────────────── */
        .meta-stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          padding: 16px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
        }

        .meta-stat-item {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .stat-label {
          font-family: var(--font-mono);
          font-size: 0.625rem;
          color: #525252;
          letter-spacing: 0.06em;
        }

        .stat-code {
          font-family: var(--font-mono);
          font-size: 0.8125rem;
          font-weight: 600;
          color: #EDEDED;
        }

        /* ── Reference Table ─────────────────────────────────────────────────────── */
        .ref-table-wrap {
          width: 100%;
          overflow-x: auto;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .ref-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.8125rem;
          text-align: left;
        }

        .ref-table th {
          padding: 12px 16px;
          font-family: var(--font-mono);
          font-size: 0.6875rem;
          font-weight: 600;
          color: #737373;
          letter-spacing: 0.06em;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .ref-table td {
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          color: #888888;
        }

        .text-brand {
          color: #3ECF8E;
        }

        /* ── Responsive Adjustments ──────────────────────────────────────────────── */
        @media (max-width: 900px) {
          .docs-layout {
            grid-template-columns: 1fr;
            gap: 32px;
          }

          .docs-sidebar {
            position: static;
            height: auto;
            border-right: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            padding-bottom: 24px;
            padding-right: 0;
          }

          .sidebar-nav {
            flex-direction: row;
            flex-wrap: wrap;
            gap: 20px;
          }

          .nav-group {
            flex: 1 1 200px;
          }
        }

        @media (max-width: 768px) {
          .docs-main {
            padding-top: 100px;
            padding-bottom: 64px;
          }

          .sidebar-nav {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
