import Navbar from '../../components/Navbar';
import Footer from '../../components/landing/Footer';

const SCENARIOS = [
  {
    index: '01',
    category: 'MOBILE HARDWARE',
    title: 'Flagship Smartphone Upgrades',
    problem: 'Misleading installment calculations and artificial retail list prices designed to disguise hidden interest rates and inflated baselines.',
    solution: 'True-Cost execution stacks verified coupon codes with commercial banking cashback programs (NBE, CIB, Banque Misr) and calculates true net out-of-pocket fees.',
    impact: 'Average 12% - 19% Net Fee Reduction',
    telemetry: 'BANK CASHBACK STACKING · ZERO-INTEREST RECONCILIATION',
  },
  {
    index: '02',
    category: 'COMPUTING & WORKSTATIONS',
    title: 'PC Hardware & Computing',
    problem: 'Outrageous domestic markups on graphics cards, laptops, and processors fueled by local distributor scarcity premiums.',
    solution: 'Real-time landed-cost arbitrage compares local retail vs direct US/EU personal air import tariffs (HS 8471.30) with automated customs duty clearance.',
    impact: 'Up to EGP 14,000+ Arbitrage Margin',
    telemetry: 'HS 8471.30 CUSTOMS ENGINE · LIVE CBE FX VALUATION',
  },
  {
    index: '03',
    category: 'CONSUMER ELECTRONICS',
    title: 'Television & Display Seasonal Sales',
    problem: 'Deceptive 40% White Friday discount claims following silent pre-sale price hikes executed during October baseline preparation.',
    solution: 'The 90-Day Truth Index flags fake markdowns instantly, computing the actual historical median baseline across all primary Egyptian storefronts.',
    impact: '100% Deceptive Sale Protection',
    telemetry: 'TIME-SERIES MEDIAN FILTER · 90-DAY TRAJECTORY AUDIT',
  },
  {
    index: '04',
    category: 'FLASH ANOMALIES',
    title: 'Flash Price Glitches',
    problem: 'Decimal errors and coupon misconfigurations sell out in minutes before manual shoppers or deal forums discover them.',
    solution: 'Sub-second Telegram and webhook telemetry alerts notify you before the retailer patches the price, enabling deterministic checkouts.',
    impact: 'Sub-500ms Signal Latency',
    telemetry: 'HEADLESS API PROBING · WEBSOCKET PUSH TELEMETRY',
  },
];

const AUDIT_ITEMS = [
  {
    item: 'Storefront Listed Retail Price',
    traditional: 'EGP 94,500',
    optimized: 'EGP 94,500',
    note: 'Identical Apple Authorised Reseller base catalog price',
    highlight: false,
  },
  {
    item: 'Verified Promo Voucher Applied',
    traditional: 'EGP 0 (No Code)',
    optimized: '-EGP 3,780 (-4%)',
    note: 'Automated headless voucher crawl and validation',
    highlight: true,
  },
  {
    item: 'Banking Card Cashback Tier',
    traditional: 'EGP 0 (Standard Debit)',
    optimized: '-EGP 4,536 (-5%)',
    note: 'Audited tier cashback via participating commercial issuer',
    highlight: true,
  },
  {
    item: 'Insured Logistics & Courier',
    traditional: 'EGP 0 (Bundled)',
    optimized: '+EGP 150',
    note: 'Direct expedited insured fulfillment to door',
    highlight: false,
  },
  {
    item: 'Net Out-of-Pocket Executed Cost',
    traditional: 'EGP 94,500',
    optimized: 'EGP 86,334',
    note: 'Deterministic true acquisition cost confirmed at settlement',
    highlight: 'total',
  },
];

export default function ConsumersPage() {
  return (
    <div className="solution-page-wrap">
      <Navbar />

      <main className="solution-main">
        <div className="solution-container">
          {/* Hero Header */}
          <header className="hero-header">
            <div className="hero-category-tag">
              SOLUTIONS · HARDWARE ENTHUSIASTS &amp; POWER CONSUMERS
            </div>

            <h1 className="hero-title">
              Deterministic Savings on Flagship Electronics
            </h1>

            <p className="hero-subtitle">
              Bypass artificial retail markdowns. Cawlix continuously monitors 12 major retailers, validates banking cashback tiers, and verifies 90-day price trajectories so you never overpay for hardware.
            </p>

            <div className="hero-metric-indicator">
              <span className="metric-dot"></span>
              <span>14,200+ DAILY PRICE PROBES · AVERAGE 18.4% NET SAVINGS</span>
            </div>
          </header>

          {/* 4 High-Impact Consumer Scenarios (Open Typographical Rows) */}
          <section className="scenarios-section">
            <div className="section-head-wrap">
              <span className="section-kicker">OPERATIONAL RUNBOOKS</span>
              <h2 className="section-heading">High-Impact Hardware Acquisition Scenarios</h2>
            </div>

            <div className="scenarios-list">
              {SCENARIOS.map((scenario) => (
                <div key={scenario.index} className="scenario-row">
                  {/* Left meta column */}
                  <div className="scenario-meta">
                    <div className="scenario-tag-row">
                      <span className="scenario-index">{scenario.index}</span>
                      <span className="scenario-category">{scenario.category}</span>
                    </div>
                    <h3 className="scenario-title">{scenario.title}</h3>
                    <div className="scenario-telemetry">{scenario.telemetry}</div>
                  </div>

                  {/* Middle problem / solution column */}
                  <div className="scenario-body">
                    <div className="scenario-block">
                      <span className="scenario-block-label label-danger">Retail Pitfall</span>
                      <p className="scenario-desc-danger">{scenario.problem}</p>
                    </div>

                    <div className="scenario-block">
                      <span className="scenario-block-label label-success">Cawlix Algorithmic Execution</span>
                      <p className="scenario-desc-success">{scenario.solution}</p>
                    </div>
                  </div>

                  {/* Right impact column */}
                  <div className="scenario-impact">
                    <span className="impact-label">MEASURED OUTCOME</span>
                    <span className="impact-value">{scenario.impact}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Real-World Purchase Audit (High-Density Comparison Table) */}
          <section className="audit-section">
            <div className="section-head-wrap">
              <span className="section-kicker kicker-brand">REAL-WORLD TRANSACTION DISSECTION</span>
              <h2 className="section-heading">Apple MacBook Pro 16" (M3 Max / 36GB / 1TB)</h2>
              <p className="audit-lead-text">
                Side-by-side settlement audit contrasting standard e-commerce retail checkout against Cawlix multi-layer optimization with verified promotion stacking.
              </p>
            </div>

            <div className="audit-table-wrap">
              <table className="audit-table">
                <thead>
                  <tr>
                    <th>Settlement Vector</th>
                    <th>Traditional Purchase</th>
                    <th className="th-brand">Cawlix True-Cost</th>
                    <th className="th-note">Verification Audit Note</th>
                  </tr>
                </thead>
                <tbody>
                  {AUDIT_ITEMS.map((item, idx) => (
                    <tr key={idx} className={item.highlight === 'total' ? 'tr-total' : ''}>
                      <td className="td-item">{item.item}</td>
                      <td className="td-trad">{item.traditional}</td>
                      <td className={`td-opt ${item.highlight === 'total' ? 'td-total-val' : item.highlight ? 'td-opt-highlight' : ''}`}>
                        {item.optimized}
                      </td>
                      <td className="td-note">{item.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Net Savings Callout Bar */}
            <div className="audit-savings-bar">
              <div className="savings-meta">
                <span className="savings-label">TOTAL CERTIFIED VALUE PRESERVATION</span>
                <span className="savings-subtext">No credit card points wasted. Zero unapplied merchant promotional credits.</span>
              </div>
              <div className="savings-callout">
                <span className="savings-callout-label">NET SAVINGS CONFIRMED</span>
                <span className="savings-callout-val">EGP 8,166</span>
              </div>
            </div>
          </section>

          {/* Bottom Call-to-Action */}
          <section className="cta-section">
            <div className="cta-content">
              <span className="section-kicker kicker-brand">READY TO AUDIT YOUR NEXT PURCHASE?</span>
              <h2 className="cta-title">
                Stop paying the opacity penalty. Run a real-time price audit today.
              </h2>
              <p className="cta-desc">
                Paste any product URL from Amazon Egypt, Noon, B.TECH, or 2B to receive a sub-second forensic breakdown of historical markdowns, coupon codes, and bank cashbacks.
              </p>

              <div className="cta-actions">
                <a href="/#showcase" className="btn-primary">
                  Audit a Product Link
                </a>
                <a href="/pricing" className="btn-secondary">
                  Inspect Pricing Plans
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />

      <style>{`
        .solution-page-wrap {
          min-height: 100vh;
          background-color: #000000;
          color: #EDEDED;
          font-family: var(--font-sans, system-ui, -apple-system, sans-serif);
          overflow-x: hidden;
        }

        .solution-main {
          min-height: 100vh;
          background-color: #000000;
          padding-top: 130px;
          padding-bottom: 96px;
        }

        .solution-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          box-sizing: border-box;
        }

        /* ── Hero Header ─────────────────────────────────────────────────────────── */
        .hero-header {
          padding-bottom: 48px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .hero-category-tag {
          font-family: var(--font-mono, monospace);
          font-size: 0.75rem;
          color: #3ECF8E;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 16px;
          font-weight: 600;
        }

        .hero-title {
          font-family: var(--font-sans, system-ui, sans-serif);
          font-size: clamp(2.25rem, 4.5vw, 3.5rem);
          font-weight: 800;
          line-height: 1.12;
          letter-spacing: -0.035em;
          color: #FFFFFF;
          margin: 0 0 18px 0;
        }

        .hero-subtitle {
          font-size: 1.125rem;
          color: #A3A3A3;
          line-height: 1.6;
          max-width: 820px;
          margin: 0 0 24px 0;
        }

        .hero-metric-indicator {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-mono, monospace);
          font-size: 0.6875rem;
          color: #737373;
          letter-spacing: 0.06em;
        }

        .metric-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #3ECF8E;
          flex-shrink: 0;
        }

        /* ── Scenarios Section ───────────────────────────────────────────────────── */
        .scenarios-section {
          padding: 64px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .section-head-wrap {
          margin-bottom: 40px;
        }

        .section-kicker {
          display: block;
          font-family: var(--font-mono, monospace);
          font-size: 0.6875rem;
          font-weight: 600;
          color: #737373;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .kicker-brand {
          color: #3ECF8E;
        }

        .section-heading {
          font-family: var(--font-sans, system-ui, sans-serif);
          font-size: clamp(1.625rem, 3vw, 2.25rem);
          font-weight: 700;
          color: #FFFFFF;
          letter-spacing: -0.025em;
          margin: 0 0 10px 0;
        }

        .scenarios-list {
          display: flex;
          flex-direction: column;
        }

        .scenario-row {
          display: grid;
          grid-template-columns: 300px 1fr 220px;
          gap: 40px;
          padding: 40px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          align-items: flex-start;
        }

        .scenario-row:first-child {
          padding-top: 10px;
        }

        .scenario-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .scenario-meta {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .scenario-tag-row {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-mono, monospace);
        }

        .scenario-index {
          color: #3ECF8E;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .scenario-category {
          color: #737373;
          font-size: 0.6875rem;
          letter-spacing: 0.08em;
        }

        .scenario-title {
          font-family: var(--font-sans, system-ui, sans-serif);
          font-size: 1.25rem;
          font-weight: 700;
          color: #FFFFFF;
          margin: 0;
          letter-spacing: -0.015em;
          line-height: 1.35;
        }

        .scenario-telemetry {
          font-family: var(--font-mono, monospace);
          font-size: 0.6875rem;
          color: #737373;
          margin-top: 4px;
          letter-spacing: 0.04em;
        }

        .scenario-body {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .scenario-block {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .scenario-block-label {
          font-family: var(--font-mono, monospace);
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .label-danger {
          color: #EF4444;
        }

        .label-success {
          color: #3ECF8E;
        }

        .scenario-desc-danger {
          font-size: 0.875rem;
          color: #888888;
          line-height: 1.6;
          margin: 0;
        }

        .scenario-desc-success {
          font-size: 0.875rem;
          color: #D4D4D4;
          line-height: 1.6;
          margin: 0;
        }

        .scenario-impact {
          text-align: right;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .impact-label {
          font-family: var(--font-mono, monospace);
          font-size: 0.625rem;
          color: #737373;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .impact-value {
          font-family: var(--font-mono, monospace);
          font-size: 1rem;
          font-weight: 700;
          color: #FFFFFF;
        }

        /* ── Real-World Purchase Audit ───────────────────────────────────────────── */
        .audit-section {
          padding: 64px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .audit-lead-text {
          font-size: 0.9375rem;
          color: #888888;
          line-height: 1.6;
          max-width: 760px;
          margin: 0;
        }

        .audit-table-wrap {
          width: 100%;
          overflow-x: auto;
          margin-top: 32px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .audit-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
          text-align: left;
        }

        .audit-table th {
          padding: 16px 20px;
          font-family: var(--font-mono, monospace);
          font-size: 0.6875rem;
          font-weight: 600;
          color: #737373;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .audit-table th.th-brand {
          color: #3ECF8E;
        }

        .audit-table td {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }

        .td-item {
          color: #D4D4D4;
          font-weight: 500;
        }

        .td-trad {
          font-family: var(--font-mono, monospace);
          color: #737373;
        }

        .td-opt {
          font-family: var(--font-mono, monospace);
          font-weight: 700;
          color: #FFFFFF;
        }

        .td-opt-highlight {
          color: #3ECF8E;
        }

        .td-note {
          font-size: 0.8125rem;
          color: #737373;
        }

        .tr-total {
          background: rgba(255, 255, 255, 0.02);
        }

        .tr-total .td-item {
          color: #FFFFFF;
          font-weight: 700;
        }

        .td-total-val {
          color: #3ECF8E !important;
          font-size: 1.0625rem !important;
        }

        .audit-savings-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          gap: 20px;
        }

        .savings-meta {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .savings-label {
          font-family: var(--font-mono, monospace);
          font-size: 0.6875rem;
          color: #737373;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .savings-subtext {
          font-size: 0.875rem;
          color: #A3A3A3;
        }

        .savings-callout {
          text-align: right;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .savings-callout-label {
          font-family: var(--font-mono, monospace);
          font-size: 0.6875rem;
          color: #737373;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .savings-callout-val {
          font-family: var(--font-mono, monospace);
          font-size: 2.25rem;
          font-weight: 800;
          color: #3ECF8E;
          letter-spacing: -0.02em;
        }

        /* ── Bottom Call-to-Action ───────────────────────────────────────────────── */
        .cta-section {
          padding: 80px 0;
        }

        .cta-content {
          max-width: 720px;
        }

        .cta-title {
          font-family: var(--font-sans, system-ui, sans-serif);
          font-size: clamp(1.875rem, 3.5vw, 2.625rem);
          font-weight: 700;
          color: #FFFFFF;
          letter-spacing: -0.03em;
          line-height: 1.2;
          margin: 12px 0 16px 0;
        }

        .cta-desc {
          font-size: 1rem;
          color: #888888;
          line-height: 1.65;
          margin: 0 0 28px 0;
        }

        .cta-actions {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background-color: #3ECF8E;
          color: #0A0A0A;
          font-family: var(--font-sans, system-ui, sans-serif);
          font-size: 0.875rem;
          font-weight: 700;
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          transition: background-color 150ms ease;
        }

        .btn-primary:hover {
          background-color: #34B27B;
        }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #EDEDED;
          font-family: var(--font-sans, system-ui, sans-serif);
          font-size: 0.875rem;
          font-weight: 700;
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          transition: background-color 150ms ease, border-color 150ms ease;
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.25);
        }

        /* ── Responsive Mobile Adjustments ───────────────────────────────────────── */
        @media (max-width: 900px) {
          .scenario-row {
            grid-template-columns: 240px 1fr 180px;
            gap: 24px;
          }
        }

        @media (max-width: 768px) {
          .solution-main {
            padding-top: 145px !important;
            padding-bottom: 64px;
          }

          .scenario-row {
            grid-template-columns: 1fr;
            gap: 20px;
            padding: 28px 0;
          }

          .scenario-impact {
            text-align: left;
            margin-top: 8px;
          }

          .audit-savings-bar {
            flex-direction: column;
            align-items: flex-start;
          }

          .savings-callout {
            text-align: left;
          }

          .savings-callout-val {
            font-size: 1.875rem;
          }

          .th-note, .td-note {
            display: none;
          }

          .cta-actions {
            flex-direction: column;
            align-items: stretch;
            width: 100%;
          }

          .btn-primary, .btn-secondary {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
