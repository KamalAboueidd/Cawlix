import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/landing/Footer';

const STAGES = [
  {
    step: '01',
    symbol: 'FX_CLEAR',
    title: 'Source Shelf Acquisition',
    desc: 'US/Global retail checkout baseline (USD/EUR) ingested and converted via live commercial bank parallel/clearing FX rates.',
    rate: 'Live Commercial FX',
  },
  {
    step: '02',
    symbol: 'CARGO_KG',
    title: 'Weight & Volumetric Air Cargo',
    desc: 'Dimensional weight calculation rating air freight in 0.5kg increments across JFK and Frankfurt logistics dispatch corridors.',
    rate: 'JFK / DE Conduits',
  },
  {
    step: '03',
    symbol: 'HS_TARIFF',
    title: 'Statutory Customs Classification',
    desc: 'Accredited Egyptian Customs codes applied strictly (e.g. Laptops: 0% customs, Smartphones: 10% customs + 5% dev fee).',
    rate: 'Accredited HS Codes',
  },
  {
    step: '04',
    symbol: 'VAT_14%',
    title: 'Egyptian Statutory VAT',
    desc: 'Compounding standard 14% statutory Value Added Tax levied on the cumulative declared CIF (Cost, Insurance, Freight) base.',
    rate: '14.0% Statutory CIF',
  },
  {
    step: '05',
    symbol: 'BANK_SPREAD',
    title: 'Banking Markup Neutralization',
    desc: 'Auditing and stacking mandatory credit card international payment fees, currency conversion markup, and dynamic margin spreads.',
    rate: '3.0% - 5.0% Bank Fee',
  },
];

const MACBOOK_BREAKDOWN = [
  { label: 'US Shelf Retail Price ($3,499)', meta: 'Converted at official commercial clearing spread', value: 'EGP 169,700', type: 'base' },
  { label: 'JFK Air Freight & Insured Transit', meta: 'Volumetric air cargo delivery to Cairo International', value: 'EGP 2,450', type: 'fee' },
  { label: 'Egyptian Customs Tariff', meta: 'HS Code 8471.30 (Portable Data Processing / Laptop: 0% Duty)', value: 'EGP 0', type: 'neutral' },
  { label: 'Statutory Egyptian VAT (14%)', meta: 'Compounded on CIF import valuation (Cost + Freight)', value: 'EGP 24,101', type: 'tax' },
  { label: 'Banking FX Settlement Commission (3%)', meta: 'Commercial credit issuer cross-border currency markup', value: 'EGP 5,091', type: 'fee' },
];

const SONY_BREAKDOWN = [
  { label: 'US Shelf Retail Price ($2,498)', meta: 'Converted at official commercial clearing spread', value: 'EGP 121,153', type: 'base' },
  { label: 'DE Cargo Conduit & Insurance', meta: 'Secured optical instrument freight transit', value: 'EGP 1,920', type: 'fee' },
  { label: 'Customs Duty & Camera Tariff (5%)', meta: 'HS Code 8525.80 (Digital Still Cameras)', value: 'EGP 6,154', type: 'fee' },
  { label: 'Statutory Egyptian VAT (14%)', meta: 'Compounded on CIF import valuation', value: 'EGP 18,092', type: 'tax' },
  { label: 'Merchant Export Rebate & Stacking', meta: 'Verified B&H / Amazon US business tax credit deduction', value: '-EGP 34,919', type: 'rebate' },
];

export default function LandedCostPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#000000', color: '#FFFFFF', overflowX: 'hidden', width: '100%', maxWidth: '100vw' }}>
      <Navbar />

      <main className="engine-main">
        <div className="engine-container">
          {/* Hero Header */}
          <header className="engine-hero">
            <div className="metrics-strip">
              <span className="metrics-strip-text">
                JFK -&gt; CAI ROUTE INDEXED · REAL-TIME CBE FX CLEARING · ACCREDITED HS-CODE TAXATION
              </span>
            </div>

            <h1 className="engine-title">
              Landed-Cost Cross-Border <span className="engine-title-muted">Arbitrage Engine.</span>
            </h1>

            <p className="engine-subtitle">
              Eliminating local markup opacity. We calculate the exact end-to-end import cost from US/EU hubs to Egypt, computing live FX bank rates, air-cargo volumetric freight, statutory customs tariffs, and local VAT.
            </p>
          </header>

          {/* The 5-Stage Import Dissection */}
          <section className="stages-section">
            <div className="section-meta-header">
              <span className="section-kicker">IMPORT DISSECTION PIPELINE</span>
              <h2 className="section-title">The Five Sequential Clearing Stages</h2>
            </div>

            <div className="stages-grid">
              {STAGES.map((stage) => (
                <div key={stage.step} className="stage-col">
                  <div className="stage-top-meta">
                    <span className="stage-step-num">{stage.step}</span>
                    <span className="stage-symbol">{stage.symbol}</span>
                    <span className="stage-rate">{stage.rate}</span>
                  </div>
                  <h3 className="stage-title">{stage.title}</h3>
                  <p className="stage-desc">{stage.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Live Case Studies: Local vs Direct-Import Arbitrage */}
          <section className="arbitrage-section">
            <div className="section-meta-header">
              <span className="section-kicker">CROSS-BORDER TELEMETRY AUDIT</span>
              <h2 className="section-title">Local Shelf Retail vs. Direct Import Parity</h2>
              <p className="section-subtitle">
                Unboxed forensic ledgers demonstrating when to purchase domestically and when cross-border arbitrage unlocks massive capital savings.
              </p>
            </div>

            {/* Case Study 1: Buy Local Preferred */}
            <div className="arbitrage-ledger-block">
              <div className="ledger-header-row">
                <div className="ledger-item-info">
                  <span className="ledger-item-title">Apple MacBook Pro 16" (M3 Max, 36GB Unified RAM, 1TB SSD)</span>
                  <span className="ledger-sku-meta">HS TARIFF: 8471.30 (0% DUTY) · OFFICIAL RETAIL INDEX: CAIRO AUTHORIZED DISTRIBUTORS</span>
                </div>
                <div className="verdict-tag verdict-local">
                  BUY LOCAL PREFERRED · SAVES EGP 23,342
                </div>
              </div>

              <div className="ledger-content-grid">
                {/* Local Domestic Retail */}
                <div className="ledger-col">
                  <div className="col-head">
                    <span className="col-head-title">LOCAL DOMESTIC RETAIL</span>
                    <span className="col-badge badge-neutral">AUTHORIZED AGENT SHELF</span>
                  </div>
                  <div className="col-body-single">
                    <span className="single-price-label">Cairo Shelf Retail Out-of-Pocket</span>
                    <span className="single-price-val">EGP 178,000</span>
                    <span className="single-price-desc">Immediate collection with 2-year statutory domestic Egyptian warranty.</span>
                  </div>
                </div>

                {/* Direct US Import Ledger */}
                <div className="ledger-col ledger-col-import">
                  <div className="col-head">
                    <span className="col-head-title">DIRECT US IMPORT BREAKDOWN</span>
                    <span className="col-badge badge-import">JFK FREIGHT CONDUIT</span>
                  </div>
                  <div className="line-items">
                    {MACBOOK_BREAKDOWN.map((line, idx) => (
                      <div key={idx} className="line-item-row">
                        <div className="line-meta">
                          <span className="line-label">{line.label}</span>
                          <span className="line-sub">{line.meta}</span>
                        </div>
                        <span className="line-num">{line.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Settlement Summary */}
                  <div className="settlement-summary-row">
                    <div className="settlement-titles">
                      <span className="settlement-primary">TOTAL LANDED IMPORT SETTLEMENT</span>
                      <span className="settlement-sub">Inclusive of FX clearance, insured air transit &amp; 14% VAT</span>
                    </div>
                    <span className="settlement-total-val text-warn">EGP 201,342</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Case Study 2: Import Highly Recommended */}
            <div className="arbitrage-ledger-block">
              <div className="ledger-header-row">
                <div className="ledger-item-info">
                  <span className="ledger-item-title">Sony Alpha A7 IV Full-Frame Mirrorless Camera (Body Only)</span>
                  <span className="ledger-sku-meta">HS TARIFF: 8525.80 (5% DUTY) · SPREAD DELTA: UNJUSTIFIED DOMESTIC MARKUP INDEXED</span>
                </div>
                <div className="verdict-tag verdict-import">
                  IMPORT HIGHLY RECOMMENDED · SAVES EGP 32,600
                </div>
              </div>

              <div className="ledger-content-grid">
                {/* Local Domestic Retail */}
                <div className="ledger-col">
                  <div className="col-head">
                    <span className="col-head-title">LOCAL DOMESTIC RETAIL</span>
                    <span className="col-badge badge-neutral">INFLATED LOCAL SHELF</span>
                  </div>
                  <div className="col-body-single">
                    <span className="single-price-label">Cairo Shelf Retail Out-of-Pocket</span>
                    <span className="single-price-val text-danger">EGP 145,000</span>
                    <span className="single-price-desc">Subject to excessive parallel currency hedge markups by local distributors.</span>
                  </div>
                </div>

                {/* Direct US Import Ledger */}
                <div className="ledger-col ledger-col-import">
                  <div className="col-head">
                    <span className="col-head-title">DIRECT IMPORT BREAKDOWN</span>
                    <span className="col-badge badge-brand">US/DE CLEARING PARITY</span>
                  </div>
                  <div className="line-items">
                    {SONY_BREAKDOWN.map((line, idx) => (
                      <div key={idx} className="line-item-row">
                        <div className="line-meta">
                          <span className="line-label">{line.label}</span>
                          <span className="line-sub">{line.meta}</span>
                        </div>
                        <span className={`line-num ${line.type === 'rebate' ? 'text-brand' : ''}`}>{line.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Settlement Summary */}
                  <div className="settlement-summary-row">
                    <div className="settlement-titles">
                      <span className="settlement-primary">TOTAL LANDED IMPORT SETTLEMENT</span>
                      <span className="settlement-sub">Net arbitrage savings confirmed against Cairo retail</span>
                    </div>
                    <span className="settlement-total-val text-brand">EGP 112,400</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Bottom Action Bar */}
          <section className="engine-cta-section">
            <div className="cta-inner">
              <div className="cta-actions">
                <a href="/#showcase" className="cta-btn-brand">
                  Calculate Import SKU
                </a>
                <a href="/pricing" className="cta-btn-ghost">
                  Inspect Pricing Engine
                </a>
              </div>
              <span className="cta-note">Continuous statutory Egyptian Customs tariff feeds &amp; parallel CBE FX tracking.</span>
            </div>
          </section>
        </div>
      </main>

      <Footer />

      <style>{`
        .engine-main {
          min-height: 100vh;
          background-color: #000000;
          padding-top: 130px;
          padding-bottom: 120px;
          width: 100%;
          overflow-x: hidden;
        }

        .engine-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 24px;
          width: 100%;
          box-sizing: border-box;
        }

        .engine-hero {
          margin-bottom: 72px;
        }

        .metrics-strip {
          margin-bottom: 14px;
        }

        .metrics-strip-text {
          font-family: var(--font-mono);
          font-size: 11px;
          color: #737373;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 500;
        }

        .engine-title {
          font-family: var(--font-sans);
          font-size: clamp(2.25rem, 5vw, 3.5rem);
          font-weight: 500;
          letter-spacing: -0.04em;
          line-height: 1.1;
          color: #FFFFFF;
          margin: 0 0 16px 0;
        }

        .engine-title-muted {
          color: #737373;
          font-weight: 400;
        }

        .engine-subtitle {
          font-size: 1.0625rem;
          color: #888888;
          line-height: 1.6;
          max-width: 840px;
          margin: 0;
        }

        .stages-section {
          margin-bottom: 84px;
        }

        .section-meta-header {
          margin-bottom: 28px;
        }

        .section-kicker {
          font-family: var(--font-mono);
          font-size: 0.6875rem;
          font-weight: 600;
          color: #3ECF8E;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          display: block;
          margin-bottom: 8px;
        }

        .section-title {
          font-family: var(--font-sans);
          font-size: 1.625rem;
          font-weight: 500;
          letter-spacing: -0.03em;
          color: #FFFFFF;
          margin: 0 0 8px 0;
        }

        .section-subtitle {
          font-size: 0.9375rem;
          color: #888888;
          line-height: 1.55;
          margin: 0;
        }

        .stages-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .stage-col {
          padding: 32px 20px;
          box-sizing: border-box;
        }

        .stage-col:not(:last-child) {
          border-right: 1px solid rgba(255, 255, 255, 0.05);
        }

        .stage-top-meta {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 14px;
        }

        .stage-step-num {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          font-weight: 600;
          color: #3ECF8E;
        }

        .stage-symbol {
          font-family: var(--font-mono);
          font-size: 0.6875rem;
          color: #D4D4D4;
          letter-spacing: 0.04em;
        }

        .stage-rate {
          font-family: var(--font-mono);
          font-size: 0.5625rem;
          color: #737373;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .stage-title {
          font-family: var(--font-sans);
          font-size: 0.9375rem;
          font-weight: 600;
          color: #FFFFFF;
          margin: 0 0 8px 0;
          letter-spacing: -0.01em;
        }

        .stage-desc {
          font-size: 0.75rem;
          color: #888888;
          line-height: 1.5;
          margin: 0;
        }

        .arbitrage-section {
          margin-bottom: 84px;
        }

        .arbitrage-ledger-block {
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          margin-bottom: 48px;
          width: 100%;
        }

        .ledger-header-row {
          padding: 20px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        .ledger-item-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .ledger-item-title {
          font-size: 1rem;
          font-weight: 600;
          color: #FFFFFF;
          letter-spacing: -0.01em;
        }

        .ledger-sku-meta {
          font-family: var(--font-mono);
          font-size: 0.6875rem;
          color: #737373;
          letter-spacing: 0.04em;
        }

        .verdict-tag {
          font-family: var(--font-mono);
          font-size: 0.6875rem;
          font-weight: 700;
          padding: 0;
          letter-spacing: 0.06em;
          white-space: nowrap;
          border: none;
          background: transparent;
        }

        .verdict-local {
          color: #F59E0B;
          border: none;
          background: transparent;
        }

        .verdict-import {
          color: #3ECF8E;
          border: none;
          background: transparent;
        }

        .ledger-content-grid {
          display: grid;
          grid-template-columns: 320px 1fr;
        }

        .ledger-col {
          padding: 28px 24px;
          box-sizing: border-box;
        }

        .ledger-col:first-child {
          border-right: 1px solid rgba(255, 255, 255, 0.05);
        }

        .col-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          gap: 8px;
        }

        .col-head-title {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          font-weight: 600;
          color: #FFFFFF;
          letter-spacing: 0.04em;
        }

        .col-badge {
          font-family: var(--font-mono);
          font-size: 0.5625rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          padding: 0;
          border: none;
          background: transparent;
        }

        .badge-neutral {
          color: #888888;
          border: none;
          background: transparent;
        }

        .badge-import {
          color: #F59E0B;
          border: none;
          background: transparent;
        }

        .badge-brand {
          color: #3ECF8E;
          border: none;
          background: transparent;
        }

        .col-body-single {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .single-price-label {
          font-size: 0.8125rem;
          color: #888888;
        }

        .single-price-val {
          font-family: var(--font-mono);
          font-size: 2rem;
          font-weight: 700;
          color: #FFFFFF;
          letter-spacing: -0.02em;
          font-variant-numeric: tabular-nums;
        }

        .single-price-desc {
          font-size: 0.75rem;
          color: #737373;
          line-height: 1.5;
        }

        .line-items {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .line-item-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          gap: 12px;
        }

        .line-meta {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .line-label {
          font-size: 0.8125rem;
          color: #EDEDED;
        }

        .line-sub {
          font-size: 0.6875rem;
          color: #737373;
        }

        .line-num {
          font-family: var(--font-mono);
          font-size: 0.8125rem;
          font-weight: 600;
          color: #EDEDED;
          font-variant-numeric: tabular-nums;
          flex-shrink: 0;
        }

        .settlement-summary-row {
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          background: rgba(255, 255, 255, 0.015);
          padding-left: 12px;
          padding-right: 12px;
          padding-bottom: 12px;
        }

        .settlement-titles {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .settlement-primary {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          font-weight: 700;
          color: #FFFFFF;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .settlement-sub {
          font-size: 0.6875rem;
          color: #888888;
        }

        .settlement-total-val {
          font-family: var(--font-mono);
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          font-variant-numeric: tabular-nums;
          flex-shrink: 0;
        }

        .text-brand { color: #3ECF8E; }
        .text-warn { color: #F59E0B; }
        .text-danger { color: #EF4444; }

        .engine-cta-section {
          padding: 32px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .cta-inner {
          display: flex;
          flex-direction: column;
          gap: 14px;
          align-items: flex-start;
        }

        .cta-actions {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .cta-btn-brand {
          background-color: #3ECF8E;
          color: #0A0A0A;
          font-family: var(--font-sans);
          font-size: 0.875rem;
          font-weight: 700;
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          line-height: 1;
          transition: background-color 150ms ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .cta-btn-brand:hover {
          background-color: #34B27B;
        }

        .cta-btn-ghost {
          background: transparent;
          color: #EDEDED;
          border: 1px solid rgba(255, 255, 255, 0.12);
          font-family: var(--font-sans);
          font-size: 0.875rem;
          font-weight: 700;
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          line-height: 1;
          transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .cta-btn-ghost:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.24);
          color: #FFFFFF;
        }

        .cta-note {
          font-size: 0.75rem;
          color: #737373;
          font-family: var(--font-mono);
        }

        @media (max-width: 860px) {
          .engine-main {
            padding-top: 145px !important;
            padding-bottom: 80px;
          }

          .engine-container {
            padding: 0 16px;
          }

          .engine-hero {
            margin-bottom: 48px;
          }

          .engine-title {
            font-size: 1.875rem;
            letter-spacing: -0.03em;
          }

          .engine-subtitle {
            font-size: 0.9375rem;
          }

          .metrics-strip-text {
            font-size: 9.5px;
            letter-spacing: 0.04em;
          }

          .stages-grid {
            grid-template-columns: 1fr;
          }

          .stage-col {
            padding: 20px 0;
          }

          .stage-col:not(:last-child) {
            border-right: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          }

          .ledger-header-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }

          .ledger-content-grid {
            grid-template-columns: 1fr;
          }

          .ledger-col:first-child {
            border-right: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          }

          .ledger-col {
            padding: 20px 0;
          }

          .line-item-row {
            align-items: center;
          }

          .line-label {
            font-size: 0.75rem;
          }

          .line-sub {
            font-size: 0.625rem;
          }

          .line-num {
            font-size: 0.75rem;
          }

          .settlement-summary-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
            padding: 10px 8px;
          }

          .settlement-total-val {
            font-size: 1.25rem;
          }

          .cta-actions {
            width: 100%;
            flex-direction: column;
          }

          .cta-btn-brand,
          .cta-btn-ghost {
            width: 100%;
            box-sizing: border-box;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
