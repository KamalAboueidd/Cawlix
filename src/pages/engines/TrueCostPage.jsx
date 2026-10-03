import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/landing/Footer';

const PIPELINE_STAGES = [
  {
    step: '01',
    symbol: 'P_BASE',
    title: 'Base Price Probe',
    desc: 'Capturing the unmanipulated listed price across 12 stores simultaneously, neutralizing dynamic geolocated markups.',
    status: 'ACTIVE_PROBE',
  },
  {
    step: '02',
    symbol: '- Δ_VOUCHER',
    title: 'Verified Voucher Deduction',
    desc: 'Scraping and validating actual working promotional codes while mathematically rejecting expired or affiliate fake tags.',
    status: 'LIVE_VERIFIED',
  },
  {
    step: '03',
    symbol: '- Δ_BANK',
    title: 'Financial Tier Stacking',
    desc: 'Factoring in bank-specific cashback promotions and cardholder discounts (e.g. NBE Platinum, CIB Wealth, Banque Misr).',
    status: 'CARD_RECONCILED',
  },
  {
    step: '04',
    symbol: '+ Σ_FEES',
    title: 'Surcharge Neutralization',
    desc: 'Auditing mandatory shipping insurance, courier doorstep handling, and BNPL (ValU, Souhoola) administrative financing fees.',
    status: 'SURCHARGE_AUDITED',
  },
];

const RECEIPT_ROWS = [
  {
    label: 'Base Shelf Price (MacBook Pro 14" M3, 16GB, 512GB)',
    meta: 'Listed retail MSRP across Cairo flagships',
    amount: 'EGP 94,500',
    type: 'base',
  },
  {
    label: 'Verified Promo Voucher Code',
    meta: 'Store coupon validated at cart checkout (-4%)',
    amount: '-EGP 3,780',
    type: 'deduction',
  },
  {
    label: 'Card Cashback Tier',
    meta: 'Direct commercial credit rebate [CIB Wealth] (-5%)',
    amount: '-EGP 4,536',
    type: 'deduction',
  },
  {
    label: 'Insured Courier Surcharge',
    meta: 'Mandatory insured logistics delivery fee',
    amount: '+EGP 150',
    type: 'fee',
  },
  {
    label: 'BNPL Admin Surcharge',
    meta: 'Direct payment gateway financing fee',
    amount: 'EGP 0',
    type: 'neutral',
  },
];

export default function TrueCostPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#FFFFFF', overflowX: 'hidden', width: '100%', maxWidth: '100vw' }}>
      <Navbar />

      <main className="engine-main">
        <div className="engine-container">
          {/* Section 1: Hero Header */}
          <header className="engine-hero">
            <div className="micro-metric-wrap">
              <span className="micro-metric-text">12 RETAILERS PARSED · ZERO CHECKOUT DISCREPANCY</span>
            </div>

            <h1 className="engine-title">
              Deterministic True-Cost <span className="engine-title-muted">Execution Engine.</span>
            </h1>

            <p className="engine-subtitle">
              Eliminating checkout ambiguity. We compute the exact out-of-pocket settlement price by continuously stacking verified store vouchers, banking cashback tiers, and hidden checkout surcharges.
            </p>

            {/* Live Mathematical Formula Bar */}
            <div className="formula-surface">
              <span className="formula-label">FORMULA</span>
              <span className="formula-code">
                P_NET = P_BASE - Δ_VOUCHER - Δ_BANK + Σ_SURCHARGES
              </span>
            </div>
          </header>

          {/* Section 2: Mathematical Pipeline Stages */}
          <section className="pipeline-section">
            <div className="section-meta-header">
              <span className="section-kicker">MATHEMATICAL EXECUTION PIPELINE</span>
              <h2 className="section-title">Four Open Surface Calculation Stages</h2>
            </div>

            <div className="pipeline-grid">
              {PIPELINE_STAGES.map((stage) => (
                <div key={stage.step} className="pipeline-stage-item">
                  <div className="stage-top-meta">
                    <span className="stage-step-num">{stage.step}</span>
                    <span className="stage-symbol">{stage.symbol}</span>
                    <span className="stage-status">{stage.status}</span>
                  </div>

                  <h3 className="stage-title">{stage.title}</h3>
                  <p className="stage-desc">{stage.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 3: Interactive Live Audit Example (Receipt Breakdown) */}
          <section className="receipt-section">
            <div className="section-meta-header">
              <span className="section-kicker">TERMINAL AUDIT BENCHMARK</span>
              <h2 className="section-title">Live Checkout Settlement Breakdown</h2>
              <p className="section-subtitle">
                Direct comparison between advertised shelf price and deterministic settlement execution for hardware SKU.
              </p>
            </div>

            <div className="receipt-surface">
              {/* Item Header Row */}
              <div className="receipt-header-row">
                <div className="receipt-item-info">
                  <span className="receipt-item-name">MacBook Pro 14" (Apple M3, 16GB Unified RAM, 512GB SSD)</span>
                  <span className="receipt-sku-meta">SKU: AAPL-MBP14-M3-16 · INDEXED TARGET: TRADE-LINE &amp; B.TECH</span>
                </div>
                <div className="receipt-audit-badge">AUDIT CONFIRMED</div>
              </div>

              {/* Line Items Table */}
              <div className="receipt-lines">
                {RECEIPT_ROWS.map((row, idx) => (
                  <div key={idx} className="receipt-row">
                    <div className="receipt-row-meta">
                      <span className="receipt-row-label">{row.label}</span>
                      <span className="receipt-row-desc">{row.meta}</span>
                    </div>
                    <div className="receipt-row-value">
                      <span
                        className={`receipt-num ${
                          row.type === 'deduction'
                            ? 'text-brand'
                            : row.type === 'fee'
                            ? 'text-fee'
                            : 'text-base'
                        }`}
                      >
                        {row.amount}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Settlement Row */}
              <div className="receipt-settlement-row">
                <div className="settlement-left">
                  <span className="settlement-label">NET OUT-OF-POCKET SETTLEMENT</span>
                  <span className="settlement-desc">Actual executed settlement price at payment gateway</span>
                </div>
                <div className="settlement-right">
                  <span className="settlement-amount">EGP 86,334</span>
                </div>
              </div>

              {/* Savings Summary Bar */}
              <div className="receipt-summary-bar">
                <span className="summary-label">NET SAVINGS CONFIRMED</span>
                <span className="summary-val">EGP 8,166</span>
                <span className="summary-bracket">(8.64% Below Shelf MSRP)</span>
              </div>
            </div>
          </section>

          {/* Section 4: Direct Action CTA */}
          <section className="engine-cta-section">
            <div className="cta-inner">
              <div className="cta-actions">
                <a href="/#showcase" className="cta-btn-brand">
                  Audit Any Product Link
                </a>
                <a href="/docs/api" className="cta-btn-ghost">
                  Read API Docs
                </a>
              </div>
              <span className="cta-note">Sub-180ms calculation latency across all 12 Egyptian retailers.</span>
            </div>
          </section>
        </div>
      </main>

      <Footer />

      <style>{`
        .engine-main {
          min-height: 100vh;
          background-color: #0A0A0A;
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

        .micro-metric-wrap {
          margin-bottom: 14px;
        }

        .micro-metric-text {
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
          max-width: 820px;
          margin: 0 0 28px 0;
        }

        .formula-surface {
          display: inline-flex;
          align-items: center;
          gap: 16px;
          padding: 10px 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          width: 100%;
          box-sizing: border-box;
        }

        .formula-label {
          font-family: var(--font-mono);
          font-size: 0.6875rem;
          font-weight: 600;
          color: #3ECF8E;
          letter-spacing: 0.08em;
        }

        .formula-code {
          font-family: var(--font-mono);
          font-size: 0.8125rem;
          color: #EDEDED;
          letter-spacing: 0.02em;
          white-space: nowrap;
          overflow-x: auto;
        }

        .pipeline-section {
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

        .pipeline-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .pipeline-stage-item {
          padding: 32px 24px;
          box-sizing: border-box;
        }

        .pipeline-stage-item:not(:last-child) {
          border-right: 1px solid rgba(255, 255, 255, 0.06);
        }

        .stage-top-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          gap: 8px;
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

        .stage-status {
          font-family: var(--font-mono);
          font-size: 0.5625rem;
          color: #737373;
          letter-spacing: 0.04em;
        }

        .stage-title {
          font-family: var(--font-sans);
          font-size: 1rem;
          font-weight: 600;
          color: #FFFFFF;
          margin: 0 0 10px 0;
          letter-spacing: -0.01em;
        }

        .stage-desc {
          font-size: 0.8125rem;
          color: #888888;
          line-height: 1.55;
          margin: 0;
        }

        .receipt-section {
          margin-bottom: 84px;
        }

        .receipt-surface {
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          width: 100%;
        }

        .receipt-header-row {
          padding: 20px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        .receipt-item-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .receipt-item-name {
          font-size: 1rem;
          font-weight: 600;
          color: #FFFFFF;
          letter-spacing: -0.01em;
        }

        .receipt-sku-meta {
          font-family: var(--font-mono);
          font-size: 0.6875rem;
          color: #737373;
          letter-spacing: 0.04em;
        }

        .receipt-audit-badge {
          font-family: var(--font-mono);
          font-size: 0.625rem;
          font-weight: 600;
          color: #3ECF8E;
          border: 1px solid rgba(62, 207, 142, 0.28);
          padding: 3px 8px;
          border-radius: 4px;
          letter-spacing: 0.06em;
          white-space: nowrap;
        }

        .receipt-lines {
          display: flex;
          flex-direction: column;
        }

        .receipt-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          gap: 16px;
        }

        .receipt-row-meta {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .receipt-row-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #EDEDED;
          letter-spacing: -0.01em;
        }

        .receipt-row-desc {
          font-size: 0.75rem;
          color: #737373;
        }

        .receipt-row-value {
          text-align: right;
          flex-shrink: 0;
        }

        .receipt-num {
          font-family: var(--font-mono);
          font-size: 0.875rem;
          font-weight: 500;
          font-variant-numeric: tabular-nums;
        }

        .text-base {
          color: #FFFFFF;
        }

        .text-brand {
          color: #3ECF8E;
        }

        .text-fee {
          color: #F59E0B;
        }

        .receipt-settlement-row {
          padding: 24px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          background: rgba(255, 255, 255, 0.015);
        }

        .settlement-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .settlement-label {
          font-family: var(--font-mono);
          font-size: 0.8125rem;
          font-weight: 700;
          color: #FFFFFF;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .settlement-desc {
          font-size: 0.75rem;
          color: #888888;
        }

        .settlement-right {
          text-align: right;
          flex-shrink: 0;
        }

        .settlement-amount {
          font-family: var(--font-mono);
          font-size: 1.75rem;
          font-weight: 700;
          color: #FFFFFF;
          letter-spacing: -0.02em;
          font-variant-numeric: tabular-nums;
        }

        .receipt-summary-bar {
          padding: 14px 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .summary-label {
          font-family: var(--font-mono);
          font-size: 0.6875rem;
          color: #737373;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .summary-val {
          font-family: var(--font-mono);
          font-size: 0.875rem;
          font-weight: 700;
          color: #3ECF8E;
        }

        .summary-bracket {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: #888888;
        }

        .engine-cta-section {
          padding: 32px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
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
            padding-top: 100px;
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

          .formula-surface {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
            padding: 8px 12px;
          }

          .formula-code {
            font-size: 0.6875rem;
          }

          .pipeline-grid {
            grid-template-columns: 1fr;
          }

          .pipeline-stage-item {
            padding: 24px 0;
          }

          .pipeline-stage-item:not(:last-child) {
            border-right: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          }

          .receipt-header-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }

          .receipt-item-name {
            font-size: 0.875rem;
          }

          .receipt-row {
            padding: 12px 0;
          }

          .receipt-row-label {
            font-size: 0.75rem;
          }

          .receipt-row-desc {
            font-size: 0.6875rem;
          }

          .receipt-num {
            font-size: 0.75rem;
          }

          .settlement-label {
            font-size: 0.75rem;
          }

          .settlement-amount {
            font-size: 1.375rem;
          }

          .receipt-summary-bar {
            flex-wrap: wrap;
            gap: 6px;
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
