import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/landing/Footer';
import { Check } from 'lucide-react';

const TIERS = [
  {
    id: 'community',
    name: 'COMMUNITY',
    tag: 'FREE',
    purpose: 'Casual buyers monitoring single items across local stores.',
    price: 'EGP 0',
    period: '/ month',
    billingNote: 'Free forever for individual shoppers',
    highlight: false,
    specs: [
      'Up to 3 Real-time SKU monitors',
      'Standard 6-hour probe refresh cadence',
      'Baseline price history (last 30 days)',
      'Standard Telegram/Email alerts',
    ],
    cta: 'Get Started Free',
    ctaHref: '/sign-in',
    ctaStyle: 'ghost',
  },
  {
    id: 'pro',
    name: 'PRO INTELLIGENCE',
    tag: 'FLAGSHIP',
    purpose: 'Power shoppers, hardware enthusiasts & deal hunters.',
    price: 'EGP 249',
    period: '/ month',
    billingNote: 'or EGP 2,400 billed annually (Save 20%)',
    highlight: true,
    specs: [
      'Unlimited SKU monitors across all 12 Egyptian retailers',
      'Sub-second Realtime Flash Glitch alerts (Webhook / SMS / WhatsApp)',
      'Full 90-Day Ghost-Discount Audit Engine & Price Manipulation Scores',
      'US-to-Egypt Landed Cost & Customs Arbitrage calculator',
      'Automated Coupon & Bank Card Cashback stacking rules',
    ],
    cta: 'Upgrade to Pro',
    ctaHref: '/sign-in',
    ctaStyle: 'solid',
  },
  {
    id: 'enterprise',
    name: 'ENTERPRISE & RETAILERS',
    tag: 'CUSTOM SCALE',
    purpose: 'Merchants, distributors, and arbitrage resellers.',
    price: 'Custom',
    period: '/ Invoiced',
    billingNote: 'Annual commitments & bespoke SLA guarantees',
    highlight: false,
    specs: [
      'Full REST / WebSocket API Access (142ms telemetry stream)',
      'Direct ERP/Inventory integration & competitor price scraping',
      'Dedicated proxy network & zero-rate-limit querying',
      'SLA: 99.98% uptime guarantee',
    ],
    cta: 'Contact Engineering',
    ctaHref: 'mailto:enterprise@cawlix.com',
    ctaStyle: 'ghost',
  },
];

const MATRIX_SECTIONS = [
  {
    category: 'TELEMETRY & CADENCE',
    rows: [
      {
        name: 'Realtime Cadence',
        desc: 'Scraper probe frequency across index targets',
        free: '6-hour probe refresh',
        pro: 'Sub-second real-time',
        ent: '142ms telemetry stream',
      },
      {
        name: 'Retailer Coverage',
        desc: 'Indexed Egyptian & international retail stores',
        free: '12 Egyptian retailers',
        pro: '12 Stores + US Corridors',
        ent: 'All Stores + Custom Scrapers',
      },
      {
        name: 'Active SKU Monitors',
        desc: 'Concurrent price-watch slots per account',
        free: 'Up to 3 items',
        pro: 'Unlimited monitors',
        ent: 'Unlimited / Fleet wide',
      },
    ],
  },
  {
    category: 'INTELLIGENCE & AUDITING ENGINES',
    rows: [
      {
        name: 'Anomaly Scoring & Glitch Radar',
        desc: 'Sub-second pricing glitch detection & broadcast',
        free: null,
        pro: true,
        ent: true,
      },
      {
        name: 'Landed-Cost Simulator',
        desc: 'US-to-Egypt customs tariff & FX arbitrage engine',
        free: null,
        pro: true,
        ent: true,
      },
      {
        name: 'Ghost-Discount Audit Engine',
        desc: 'Pre-sale price hike detection & manipulation scores',
        free: '30-day baseline history',
        pro: '90-Day Full Audit Engine',
        ent: 'Full 90-Day & Tick Data',
      },
      {
        name: 'Cashback & Coupon Stacking',
        desc: 'Automated bank promotions & promo code reconciliation',
        free: null,
        pro: true,
        ent: true,
      },
    ],
  },
  {
    category: 'INFRASTRUCTURE & INTEGRATIONS',
    rows: [
      {
        name: 'Alert Dispatch Channels',
        desc: 'Multi-channel low-latency notification vectors',
        free: 'Telegram & Email',
        pro: 'Webhook, SMS, WhatsApp',
        ent: 'Dedicated Stream & Pipes',
      },
      {
        name: 'API Access (REST / WebSocket)',
        desc: 'Programmatic programmatic querying & stream feeds',
        free: null,
        pro: 'Rate-limited REST',
        ent: 'Zero-Rate-Limit Stream',
      },
      {
        name: 'Dedicated Proxy Mesh',
        desc: 'Residential scraping nodes & anti-bot bypass',
        free: null,
        pro: 'Shared Pool',
        ent: 'Dedicated Residential Mesh',
      },
      {
        name: 'Service Level Agreement',
        desc: 'Guaranteed platform & scraper network uptime',
        free: 'Community SLA',
        pro: '99.9% Uptime',
        ent: '99.98% Guaranteed SLA',
      },
    ],
  },
];

export default function PricingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#FFFFFF', overflowX: 'hidden', width: '100%', maxWidth: '100vw' }}>
      <Navbar />

      <main className="pricing-main">
        <div className="pricing-container">
          {/* Institutional Page Header */}
          <header className="pricing-header">
            <span className="pricing-kicker">// INSTITUTIONAL_PRICING_MATRIX</span>
            <h1 className="pricing-title">
              Deterministic Intelligence. <span className="pricing-title-muted">Transparent Access.</span>
            </h1>
            <p className="pricing-subtitle">
              Eliminate artificial retail markdowns and cross-border import spreads. Direct pricing surfaces with zero hidden fees.
            </p>
          </header>

          {/* Borderless 3-Column Comparative Surface Layout */}
          <section className="pricing-surface-wrapper">
            <div className="pricing-surface">
              {TIERS.map((tier) => (
                <div key={tier.id} className={`tier-col ${tier.highlight ? 'tier-col-highlight' : ''}`}>
                  {/* Top Tier Block */}
                  <div className="tier-top">
                    {/* Header Meta */}
                    <div className="tier-header-meta">
                      <span className={`tier-name ${tier.highlight ? 'text-highlight' : ''}`}>
                        {tier.name}
                      </span>
                      <span className={`tier-tag ${tier.highlight ? 'tier-tag-highlight' : ''}`}>
                        {tier.tag}
                      </span>
                    </div>

                    {/* Price Row */}
                    <div className="tier-price-row">
                      <span className="tier-price-amount">{tier.price}</span>
                      <span className="tier-price-period">{tier.period}</span>
                    </div>

                    <p className="tier-billing-note">{tier.billingNote}</p>

                    {/* Purpose Statement */}
                    <p className="tier-purpose">{tier.purpose}</p>

                    {/* Specs List */}
                    <div className="tier-specs-list">
                      {tier.specs.map((spec, idx) => (
                        <div key={idx} className="tier-spec-item">
                          <Check
                            size={15}
                            strokeWidth={1.5}
                            className={`tier-spec-icon ${tier.highlight ? 'stroke-brand' : 'stroke-muted-brand'}`}
                          />
                          <span className="tier-spec-text">{spec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Bottom Block */}
                  <div className="tier-cta-block">
                    <a
                      href={tier.ctaHref}
                      className={`tier-cta-btn ${tier.ctaStyle === 'solid' ? 'btn-solid-brand' : 'btn-ghost-border'}`}
                    >
                      {tier.cta}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* High-Density Feature Breakdown Matrix */}
          <section className="matrix-section">
            <header className="matrix-header">
              <span className="pricing-kicker">// CAPABILITY_MATRIX</span>
              <h2 className="matrix-title">Feature Breakdown &amp; Metric Verification</h2>
              <p className="matrix-subtitle">
                Comprehensive tabular audit of telemetry cadences, scraping limits, and programmatic endpoints.
              </p>
            </header>

            {/* Responsive Table Container */}
            <div className="matrix-table-card">
              <div className="matrix-table-scroll">
                <table className="matrix-table">
                  <thead>
                    <tr className="matrix-thead-row">
                      <th className="matrix-th matrix-th-metric">Capability / Metric</th>
                      <th className="matrix-th matrix-th-col">Community</th>
                      <th className="matrix-th matrix-th-col matrix-th-pro">
                        <div className="pro-th-wrap">
                          <span>Pro Intelligence</span>
                          <span className="pro-th-accent">FLAGSHIP</span>
                        </div>
                      </th>
                      <th className="matrix-th matrix-th-col">Enterprise &amp; Retailers</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MATRIX_SECTIONS.map((section, sIdx) => (
                      <React.Fragment key={sIdx}>
                        <tr className="matrix-section-divider">
                          <td colSpan={4} className="matrix-section-header">
                            {section.category}
                          </td>
                        </tr>
                        {section.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="matrix-row">
                            <td className="matrix-td matrix-td-name">
                              <div className="metric-name-wrap">
                                <span className="metric-title">{row.name}</span>
                                <span className="metric-desc">{row.desc}</span>
                              </div>
                            </td>

                            {/* Community Column */}
                            <td className="matrix-td matrix-td-val">
                              {row.free === true ? (
                                <Check size={16} strokeWidth={1.5} color="#3ECF8E" className="check-svg" />
                              ) : row.free === null ? (
                                <span className="dash-omitted" aria-label="Not included">—</span>
                              ) : (
                                <span className="val-text">{row.free}</span>
                              )}
                            </td>

                            {/* Pro Intelligence Column */}
                            <td className="matrix-td matrix-td-val matrix-td-pro">
                              {row.pro === true ? (
                                <Check size={16} strokeWidth={1.5} color="#3ECF8E" className="check-svg" />
                              ) : row.pro === null ? (
                                <span className="dash-omitted" aria-label="Not included">—</span>
                              ) : (
                                <span className="val-text val-pro">{row.pro}</span>
                              )}
                            </td>

                            {/* Enterprise Column */}
                            <td className="matrix-td matrix-td-val">
                              {row.ent === true ? (
                                <Check size={16} strokeWidth={1.5} color="#3ECF8E" className="check-svg" />
                              ) : row.ent === null ? (
                                <span className="dash-omitted" aria-label="Not included">—</span>
                              ) : (
                                <span className="val-text">{row.ent}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />

      <style>{`
        .pricing-main {
          min-height: 100vh;
          background-color: #0A0A0A;
          padding-top: 130px;
          padding-bottom: 120px;
          width: 100%;
          overflow-x: hidden;
        }

        .pricing-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          width: 100%;
          box-sizing: border-box;
        }

        .pricing-header {
          text-align: center;
          max-width: 760px;
          margin: 0 auto 64px auto;
        }

        .pricing-kicker {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          font-weight: 500;
          color: #3ECF8E;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          display: inline-block;
          margin-bottom: 14px;
        }

        .pricing-title {
          font-family: var(--font-sans);
          font-size: clamp(2.125rem, 4.5vw, 3.25rem);
          font-weight: 500;
          letter-spacing: -0.04em;
          line-height: 1.12;
          color: #FFFFFF;
          margin: 0 0 16px 0;
        }

        .pricing-title-muted {
          color: #737373;
          font-weight: 400;
        }

        .pricing-subtitle {
          font-size: 1.0625rem;
          color: #888888;
          line-height: 1.6;
          margin: 0;
        }

        .pricing-surface-wrapper {
          width: 100%;
          margin-bottom: 96px;
        }

        .pricing-surface {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          background: transparent;
          width: 100%;
          position: relative;
        }

        .tier-col {
          padding: 44px 36px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: transparent;
          position: relative;
          box-sizing: border-box;
        }

        .tier-col:not(:last-child) {
          border-right: 1px solid rgba(255, 255, 255, 0.06);
        }

        .tier-col-highlight {
          background: rgba(255, 255, 255, 0.015);
        }

        .tier-top {
          display: flex;
          flex-direction: column;
        }

        .tier-header-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
          gap: 12px;
        }

        .tier-name {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          font-weight: 600;
          color: #FFFFFF;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .text-highlight {
          color: #FFFFFF;
        }

        .tier-tag {
          font-family: var(--font-mono);
          font-size: 0.625rem;
          font-weight: 500;
          letter-spacing: 0.06em;
          color: #737373;
          border: none;
          padding: 0;
          text-transform: uppercase;
        }

        .tier-tag-highlight {
          color: #3ECF8E;
          border: none;
          background: transparent;
        }

        .tier-price-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 6px;
        }

        .tier-price-amount {
          font-size: 2.5rem;
          font-weight: 600;
          color: #FFFFFF;
          letter-spacing: -0.04em;
          font-variant-numeric: tabular-nums;
          line-height: 1;
        }

        .tier-price-period {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: #737373;
        }

        .tier-billing-note {
          font-family: var(--font-mono);
          font-size: 0.6875rem;
          color: #888888;
          margin: 0 0 20px 0;
          letter-spacing: 0.01em;
        }

        .tier-purpose {
          font-size: 0.875rem;
          color: #888888;
          line-height: 1.55;
          margin: 0 0 32px 0;
          min-height: 42px;
        }

        .tier-specs-list {
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          padding-top: 24px;
          display: flex;
          flex-direction: column;
          gap: 13px;
          margin-bottom: 36px;
        }

        .tier-spec-item {
          display: flex;
          align-items: flex-start;
          gap: 11px;
        }

        .tier-spec-icon {
          flex-shrink: 0;
          margin-top: 3px;
        }

        .stroke-brand {
          color: #3ECF8E;
        }

        .stroke-muted-brand {
          color: #3ECF8E;
          opacity: 0.85;
        }

        .tier-spec-text {
          font-size: 0.84375rem;
          color: #D4D4D4;
          line-height: 1.5;
        }

        .tier-cta-block {
          margin-top: auto;
        }

        .tier-cta-btn {
          display: block;
          width: 100%;
          box-sizing: border-box;
          font-family: var(--font-sans);
          font-size: 0.875rem;
          font-weight: 700;
          padding: 10px 18px;
          border-radius: 8px;
          text-align: center;
          text-decoration: none;
          line-height: 1.25;
          cursor: pointer;
          transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease;
        }

        .btn-ghost-border {
          background: transparent;
          color: #EDEDED;
          border: 1px solid rgba(255, 255, 255, 0.12);
        }

        .btn-ghost-border:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.24);
          color: #FFFFFF;
        }

        .btn-solid-brand {
          background: #3ECF8E;
          color: #0A0A0A;
          border: 1px solid #3ECF8E;
        }

        .btn-solid-brand:hover {
          background: #34B27B;
          border-color: #34B27B;
        }

        .matrix-section {
          width: 100%;
        }

        .matrix-header {
          text-align: left;
          margin-bottom: 32px;
        }

        .matrix-title {
          font-family: var(--font-sans);
          font-size: 1.5rem;
          font-weight: 500;
          letter-spacing: -0.03em;
          color: #FFFFFF;
          margin: 4px 0 8px 0;
        }

        .matrix-subtitle {
          font-size: 0.9375rem;
          color: #888888;
          line-height: 1.55;
          margin: 0;
        }

        .matrix-table-card {
          width: 100%;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          background: transparent;
        }

        .matrix-table-scroll {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .matrix-table {
          width: 100%;
          min-width: 780px;
          border-collapse: collapse;
          font-family: var(--font-sans);
          text-align: left;
        }

        .matrix-thead-row {
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .matrix-th {
          padding: 16px 20px;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          color: #FFFFFF;
          vertical-align: middle;
        }

        .matrix-th-metric {
          width: 40%;
          padding-left: 12px;
          color: #888888;
        }

        .matrix-th-col {
          width: 20%;
          text-align: left;
        }

        .matrix-th-pro {
          background: rgba(255, 255, 255, 0.015);
        }

        .pro-th-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pro-th-accent {
          font-size: 0.5625rem;
          color: #3ECF8E;
          border: none;
          padding: 0;
          letter-spacing: 0.06em;
        }

        .matrix-section-divider {
          background: rgba(255, 255, 255, 0.02);
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }

        .matrix-section-header {
          padding: 10px 12px;
          font-family: var(--font-mono);
          font-size: 0.6875rem;
          font-weight: 600;
          color: #737373;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .matrix-row {
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          transition: background-color 120ms ease;
        }

        .matrix-row:hover {
          background-color: rgba(255, 255, 255, 0.018);
        }

        .matrix-td {
          padding: 16px 20px;
          vertical-align: middle;
        }

        .matrix-td-name {
          padding-left: 12px;
        }

        .metric-name-wrap {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .metric-title {
          font-size: 0.84375rem;
          font-weight: 500;
          color: #EDEDED;
          letter-spacing: -0.01em;
        }

        .metric-desc {
          font-size: 0.75rem;
          color: #737373;
          line-height: 1.4;
        }

        .matrix-td-val {
          font-size: 0.8125rem;
          color: #888888;
          font-variant-numeric: tabular-nums;
        }

        .matrix-td-pro {
          background: rgba(255, 255, 255, 0.012);
        }

        .val-text {
          font-size: 0.8125rem;
          color: #D4D4D4;
          font-weight: 400;
          line-height: 1.4;
          display: inline-block;
        }

        .val-pro {
          color: #FFFFFF;
          font-weight: 500;
        }

        .check-svg {
          display: block;
        }

        .dash-omitted {
          color: #4A4A4A;
          font-size: 1rem;
          user-select: none;
        }

        @media (max-width: 860px) {
          .pricing-main {
            padding-top: 100px;
            padding-bottom: 80px;
          }

          .pricing-container {
            padding: 0 16px;
          }

          .pricing-header {
            margin-bottom: 40px;
            text-align: left;
          }

          .pricing-title {
            font-size: 1.75rem;
            letter-spacing: -0.03em;
          }

          .pricing-subtitle {
            font-size: 0.9375rem;
          }

          .pricing-surface {
            grid-template-columns: 1fr;
          }

          .tier-col {
            padding: 32px 18px;
          }

          .tier-col:not(:last-child) {
            border-right: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          }

          .tier-purpose {
            min-height: auto;
            margin-bottom: 24px;
          }

          .tier-specs-list {
            margin-bottom: 28px;
          }

          .matrix-section {
            margin-top: 56px;
          }

          .matrix-title {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
}
