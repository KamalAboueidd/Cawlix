import Navbar from '../../components/Navbar';
import Footer from '../../components/landing/Footer';

const WORKFLOWS = [
  {
    index: '01',
    category: 'HEADLESS AUTOMATION',
    title: 'Headless Competitor Catalog Sync',
    desc: 'Automated continuous ingestion of competitor price changes without manual scraping or unreliable browser automation.',
    execution: 'Immediate signed webhook payload dispatch upon any SKU discount or markup execution across 12 domestic platforms.',
    latency: '< 142ms Hook Latency',
    telemetry: 'REAL-TIME PROBE STREAM · 12 RETAILER NODES',
  },
  {
    index: '02',
    category: 'INVENTORY LIQUIDITY',
    title: 'Stock-Out Depletion Arbitrage',
    desc: 'Identify the exact second primary authorized distributors exhaust inventory on flagship electronics and computing components.',
    execution: 'Automatically recalibrate catalog margins and dynamic pricing rules during temporary market supply crunches to maximize yield.',
    latency: 'Sub-Second Detection',
    telemetry: 'DEEP CART VALIDATION · INVENTORY STOCK RADAR',
  },
  {
    index: '03',
    category: 'CROSS-BORDER INTELLIGENCE',
    title: 'Cross-Border Import Benchmark',
    desc: 'Track real-time landed-cost parity curves from US/EU hubs to calibrate domestic pricing against parallel grey-market imports.',
    execution: 'Calculate exact local price elasticity factoring in statutory customs tariffs (HS Code classification), CBE clearing FX rates, and local 14% VAT.',
    latency: 'Daily CBE Clearing Index',
    telemetry: 'HS 8471.30 CUSTOMS ENGINE · AIR CARGO CIF PARITY',
  },
  {
    index: '04',
    category: 'MARGIN PRESERVATION',
    title: 'Historical Margin Protection',
    desc: 'Audit 90-day pricing baselines across all domestic marketplaces to identify market-wide clearance cycles and distributor dumping.',
    execution: 'Mathematical geometric filter flags artificial retail price hikes and predicts seasonal price collapse points before markdown windows execute.',
    latency: '90-Day Rolling Window',
    telemetry: 'GEOMETRIC TIME-SERIES · SPIKE DETECTION SCORE',
  },
];

const INTEGRATION_LAYERS = [
  {
    layer: 'Price Stream',
    protocol: 'WebSocket / JSON',
    latency: 'Real-time (< 200ms)',
    granularity: 'SKU, Base Price, Surcharges, In-Stock Verification',
    highlight: true,
  },
  {
    layer: 'ERP Sync Hook',
    protocol: 'HTTPS REST / Webhook',
    latency: 'Sub-second (< 1.2s)',
    granularity: 'Stock Availability, Automated Price Drop Triggers',
    highlight: false,
  },
  {
    layer: 'Bulk Auditing Engine',
    protocol: 'Batched Async API',
    latency: '50,000 SKUs / Hour',
    granularity: '90-Day Baseline, Hike Flags, Authenticity Verdict',
    highlight: false,
  },
  {
    layer: 'Customs HS Index',
    protocol: 'REST Endpoint',
    latency: 'Daily CBE Clearing',
    granularity: 'Statutory HS Duty %, CIF Base, Compounding 14% VAT',
    highlight: false,
  },
];

export default function MerchantsPage() {
  return (
    <div className="solution-page-wrap">
      <Navbar />

      <main className="solution-main">
        <div className="solution-container">
          {/* Hero Header */}
          <header className="hero-header">
            <div className="hero-category-tag">
              SOLUTIONS // ENTERPRISE MERCHANTS &amp; ARBITRAGE RESELLERS
            </div>

            <h1 className="hero-title">
              Real-Time Competitor Price Telemetry
            </h1>

            <p className="hero-subtitle">
              Maintain algorithmic price superiority. Continuously monitor retail catalog repricing across 12 domestic platforms, audit competitor stock-out levels, and protect margin velocity with sub-second API pipelines.
            </p>

            <div className="hero-metric-indicator">
              <span className="metric-dot"></span>
              <span>142MS REPRICING STREAM · 99.98% PIPELINE UPTIME · AUTOMATED ERP EXPORT</span>
            </div>
          </header>

          {/* 4 High-Volume Merchant Workflows (Open Typographical Rows) */}
          <section className="workflows-section">
            <div className="section-head-wrap">
              <span className="section-kicker">ENTERPRISE RUNBOOKS</span>
              <h2 className="section-heading">High-Volume Merchant Workflows</h2>
            </div>

            <div className="workflows-list">
              {WORKFLOWS.map((workflow) => (
                <div key={workflow.index} className="workflow-row">
                  {/* Left meta column */}
                  <div className="workflow-meta">
                    <div className="workflow-tag-row">
                      <span className="workflow-index">{workflow.index}</span>
                      <span className="workflow-category">{workflow.category}</span>
                    </div>
                    <h3 className="workflow-title">{workflow.title}</h3>
                    <div className="workflow-telemetry">{workflow.telemetry}</div>
                  </div>

                  {/* Middle capabilities column */}
                  <div className="workflow-body">
                    <div className="workflow-block">
                      <span className="workflow-block-label label-neutral">Catalog Monitoring Trigger</span>
                      <p className="workflow-desc-neutral">{workflow.desc}</p>
                    </div>

                    <div className="workflow-block">
                      <span className="workflow-block-label label-success">Algorithmic Execution</span>
                      <p className="workflow-desc-success">{workflow.execution}</p>
                    </div>
                  </div>

                  {/* Right latency / SLA column */}
                  <div className="workflow-latency">
                    <span className="latency-label">PIPELINE SLA</span>
                    <span className="latency-value">{workflow.latency}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Enterprise Integration Architecture (Tabular Specification) */}
          <section className="integration-section">
            <div className="section-head-wrap">
              <span className="section-kicker kicker-brand">DEVELOPER SPECIFICATION</span>
              <h2 className="section-heading">Enterprise Integration Architecture</h2>
              <p className="integration-lead-text">
                Deterministic data pipelines designed for low-latency ingest into enterprise ERPs, inventory management systems, and automated dynamic repricing engines.
              </p>
            </div>

            <div className="integration-table-wrap">
              <table className="integration-table">
                <thead>
                  <tr>
                    <th>Integration Layer</th>
                    <th>Protocol</th>
                    <th>Refresh Latency</th>
                    <th>Data Granularity</th>
                  </tr>
                </thead>
                <tbody>
                  {INTEGRATION_LAYERS.map((row, idx) => (
                    <tr key={idx}>
                      <td className="td-layer">
                        <span className={row.highlight ? 'text-brand' : ''}>{row.layer}</span>
                      </td>
                      <td className="td-protocol">{row.protocol}</td>
                      <td className="td-latency">{row.latency}</td>
                      <td className="td-granularity">{row.granularity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Telemetry Pipeline Assurance Bar */}
            <div className="assurance-bar">
              <div className="assurance-meta">
                <span className="assurance-label">CORE INFRASTRUCTURE SLA</span>
                <span className="assurance-subtext">HMAC-SHA256 authenticated payloads with 99.98% mission-critical availability guarantee.</span>
              </div>
              <div className="assurance-metric">
                <span className="assurance-metric-label">PIPELINE LATENCY</span>
                <span className="assurance-metric-val">&lt; 142ms</span>
              </div>
            </div>
          </section>

          {/* Bottom Call-to-Action */}
          <section className="cta-section">
            <div className="cta-content">
              <span className="section-kicker kicker-brand">ENTERPRISE TELEMETRY ACCREDITATION</span>
              <h2 className="cta-title">
                Equip your merchandising engine with real-time market truth.
              </h2>
              <p className="cta-desc">
                Deploy dedicated private telemetry nodes, obtain custom rate limits up to 10,000 req/min, and interface directly with our engineering team for bespoke ERP integration.
              </p>

              <div className="cta-actions">
                <a href="mailto:enterprise@cawlix.com" className="btn-primary">
                  Contact Enterprise Sales
                </a>
                <a href="/docs" className="btn-secondary">
                  Read Developer Docs
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
          background-color: #0A0A0A;
          color: #EDEDED;
          font-family: var(--font-sans, system-ui, -apple-system, sans-serif);
          overflow-x: hidden;
        }

        .solution-main {
          min-height: 100vh;
          background-color: #0A0A0A;
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
          max-width: 840px;
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

        /* ── Workflows Section ───────────────────────────────────────────────────── */
        .workflows-section {
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

        .workflows-list {
          display: flex;
          flex-direction: column;
        }

        .workflow-row {
          display: grid;
          grid-template-columns: 320px 1fr 200px;
          gap: 40px;
          padding: 40px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          align-items: flex-start;
        }

        .workflow-row:first-child {
          padding-top: 10px;
        }

        .workflow-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .workflow-meta {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .workflow-tag-row {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-mono, monospace);
        }

        .workflow-index {
          color: #3ECF8E;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .workflow-category {
          color: #737373;
          font-size: 0.6875rem;
          letter-spacing: 0.08em;
        }

        .workflow-title {
          font-family: var(--font-sans, system-ui, sans-serif);
          font-size: 1.25rem;
          font-weight: 700;
          color: #FFFFFF;
          margin: 0;
          letter-spacing: -0.015em;
          line-height: 1.35;
        }

        .workflow-telemetry {
          font-family: var(--font-mono, monospace);
          font-size: 0.6875rem;
          color: #737373;
          margin-top: 4px;
          letter-spacing: 0.04em;
        }

        .workflow-body {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .workflow-block {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .workflow-block-label {
          font-family: var(--font-mono, monospace);
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .label-neutral {
          color: #737373;
        }

        .label-success {
          color: #3ECF8E;
        }

        .workflow-desc-neutral {
          font-size: 0.875rem;
          color: #888888;
          line-height: 1.6;
          margin: 0;
        }

        .workflow-desc-success {
          font-size: 0.875rem;
          color: #D4D4D4;
          line-height: 1.6;
          margin: 0;
        }

        .workflow-latency {
          text-align: right;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .latency-label {
          font-family: var(--font-mono, monospace);
          font-size: 0.625rem;
          color: #737373;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .latency-value {
          font-family: var(--font-mono, monospace);
          font-size: 0.9375rem;
          font-weight: 700;
          color: #3ECF8E;
        }

        /* ── Integration Architecture ────────────────────────────────────────────── */
        .integration-section {
          padding: 64px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .integration-lead-text {
          font-size: 0.9375rem;
          color: #888888;
          line-height: 1.6;
          max-width: 780px;
          margin: 0;
        }

        .integration-table-wrap {
          width: 100%;
          overflow-x: auto;
          margin-top: 32px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .integration-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
          text-align: left;
        }

        .integration-table th {
          padding: 16px 20px;
          font-family: var(--font-mono, monospace);
          font-size: 0.6875rem;
          font-weight: 600;
          color: #737373;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .integration-table td {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }

        .td-layer {
          font-family: var(--font-mono, monospace);
          font-weight: 600;
          color: #FFFFFF;
        }

        .text-brand {
          color: #3ECF8E;
        }

        .td-protocol {
          font-family: var(--font-mono, monospace);
          color: #A3A3A3;
        }

        .td-latency {
          font-family: var(--font-mono, monospace);
          color: #3ECF8E;
          font-weight: 600;
        }

        .td-granularity {
          font-size: 0.8125rem;
          color: #888888;
        }

        .assurance-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          gap: 20px;
        }

        .assurance-meta {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .assurance-label {
          font-family: var(--font-mono, monospace);
          font-size: 0.6875rem;
          color: #737373;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .assurance-subtext {
          font-size: 0.875rem;
          color: #A3A3A3;
        }

        .assurance-metric {
          text-align: right;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .assurance-metric-label {
          font-family: var(--font-mono, monospace);
          font-size: 0.6875rem;
          color: #737373;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .assurance-metric-val {
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
          max-width: 740px;
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
          .workflow-row {
            grid-template-columns: 240px 1fr 160px;
            gap: 24px;
          }
        }

        @media (max-width: 768px) {
          .solution-main {
            padding-top: 84px;
            padding-bottom: 64px;
          }

          .workflow-row {
            grid-template-columns: 1fr;
            gap: 20px;
            padding: 28px 0;
          }

          .workflow-latency {
            text-align: left;
            margin-top: 8px;
          }

          .assurance-bar {
            flex-direction: column;
            align-items: flex-start;
          }

          .assurance-metric {
            text-align: left;
          }

          .assurance-metric-val {
            font-size: 1.875rem;
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
