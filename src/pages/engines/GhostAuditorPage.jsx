import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/landing/Footer';

const ILLARS = [
  {
    num: '01',
    title: 'Historical Baseline Computation',
    desc: 'Establishing the authentic rolling median price over 90 consecutive days, mathematically filtering out short-lived algorithmic spikes and isolated flash pricing.',
    metric: '90-Day Geometric Median',
  },
  {
    num: '02',
    title: 'The Pre-Sale Spike Detector',
    desc: 'Continuous hourly telemetry flagging items whose listed MSRP was artificially inflated within 72 hours prior to major commercial promotions (e.g. White Friday, Ramadan sales).',
    metric: '72-Hour Pre-Sale Window',
  },
  {
    num: '03',
    title: 'Authenticity Rating Score (0 - 100)',
    desc: 'Automated statistical verification categorizing discounts into three discrete credibility tiers based on historical variance from authentic procurement cost.',
    metric: '3 Discrete Severity Tiers',
  },
];

const SCORE_TIERS = [
  {
    range: '85 - 100',
    grade: 'VERIFIED REAL DEAL',
    desc: 'Authentic price reduction sitting measurably below the rolling 90-day baseline with zero pre-sale manipulation.',
    type: 'success',
  },
  {
    range: '40 - 84',
    grade: 'QUESTIONABLE FLAT PRICING',
    desc: 'Cosmetic discount claim. The promotional price matches the historical everyday shelf price with trivial variation.',
    type: 'warn',
  },
  {
    range: '0 - 39',
    grade: 'CRITICAL GHOST MARKUP',
    desc: 'Artificial price surge immediately followed by a fabricated discount badge. Net cost is higher than historical median.',
    type: 'danger',
  },
];

export default function GhostAuditorPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#FFFFFF', overflowX: 'hidden', width: '100%', maxWidth: '100vw' }}>
      <Navbar />

      <main className="engine-main">
        <div className="engine-container">
          {/* Hero Header */}
          <header className="engine-hero">
            <div className="metrics-strip">
              <span className="metrics-strip-text">
                14,200+ DAILY HIKE CHECKS · 90-DAY TIME-SERIES BASELINE · REJECTED PROMOS LOGGED
              </span>
            </div>

            <h1 className="engine-title">
              90-Day Ghost-Discount <span className="engine-title-muted">&amp; Markdown Auditor.</span>
            </h1>

            <p className="engine-subtitle">
              Uncovering artificial retail markdowns. We continuously track 90-day historical price trajectories across 12 retailers to verify whether an advertised discount is genuine or an orchestrated pre-sale price hike.
            </p>
          </header>

          {/* The 3 Pillars of Fraud Detection */}
          <section className="pillars-section">
            <div className="section-meta-header">
              <span className="section-kicker">AUDIT METHODOLOGY</span>
              <h2 className="section-title">The Three Pillars of Manipulation Detection</h2>
            </div>

            <div className="pillars-grid">
              {PILLARS.map((pillar) => (
                <div key={pillar.num} className="pillar-col">
                  <div className="pillar-top-meta">
                    <span className="pillar-num">{pillar.num}</span>
                    <span className="pillar-metric">{pillar.metric}</span>
                  </div>
                  <h3 className="pillar-title">{pillar.title}</h3>
                  <p className="pillar-desc">{pillar.desc}</p>
                </div>
              ))}
            </div>

            {/* Authenticity Rating Score Breakdown */}
            <div className="score-tiers-surface">
              <div className="score-tiers-header">
                <span className="score-tiers-title">AUTHENTICITY RATING INDEX (0 - 100)</span>
                <span className="score-tiers-meta">STANDARDIZED STATISTICAL CLASSIFICATION</span>
              </div>

              <div className="score-tiers-grid">
                {SCORE_TIERS.map((tier) => (
                  <div key={tier.range} className="score-tier-item">
                    <div className="tier-range-row">
                      <span className={`tier-range ${tier.type === 'danger' ? 'text-danger' : tier.type === 'warn' ? 'text-warn' : 'text-brand'}`}>
                        {tier.range}
                      </span>
                      <span className={`tier-grade ${tier.type === 'danger' ? 'badge-danger-clean' : tier.type === 'warn' ? 'badge-warn-clean' : 'badge-brand-clean'}`}>
                        {tier.grade}
                      </span>
                    </div>
                    <p className="tier-desc">{tier.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Live Audit Breakdown: Real Case Study */}
          <section className="case-study-section">
            <div className="section-meta-header">
              <span className="section-kicker">TELEMETRY BENCHMARK AUDIT</span>
              <h2 className="section-title">Live Merchant Claim vs. Verified Reality</h2>
              <p className="section-subtitle">
                Direct forensic breakdown comparing merchant promotional marketing against 90-day time-series telemetry.
              </p>
            </div>

            <div className="case-study-surface">
              {/* Item Banner */}
              <div className="case-header-row">
                <div className="case-item-info">
                  <span className="case-item-name">Samsung 65" QLED 4K Smart TV (Q70D Series)</span>
                  <span className="case-sku-meta">INDEXED TARGET: MAJOR CAIRO ELECTRONICS RETAILER · LOGGED 48H BEFORE WHITE FRIDAY</span>
                </div>
                <div className="case-verdict-tag">
                  ARTIFICIAL HIKE DETECTED · SCORE: 18/100
                </div>
              </div>

              {/* Comparison Columns */}
              <div className="comparison-cols">
                {/* Merchant Claim */}
                <div className={clsx('comp-col', 'comp-col-merchant')}>
                  <div className="comp-col-header">
                    <span className="comp-col-title">MERCHANT PROMOTIONAL CLAIM</span>
                    <span className={clsx('comp-col-badge', 'badge-claim')}>ADVERTISED BADGE: 35% OFF FLASH SALE</span>
                  </div>
                  <div className="comp-lines">
                    <div className="comp-line">
                      <span className="comp-label">Claimed Original Price</span>
                      <span className={clsx('comp-val', 'val-strikethrough')}>EGP 46,000</span>
                    </div>
                    <div className="comp-line">
                      <span className="comp-label">Advertised Sale Price</span>
                      <span className="comp-val">EGP 29,900</span>
                    </div>
                    <div className="comp-line">
                      <span className="comp-label">Advertised Savings</span>
                      <span className={clsx('comp-val', 'text-brand-dim')}>EGP 16,100 (35.0%)</span>
                    </div>
                  </div>
                </div>

                {/* Cawlix Telemetry Audit */}
                <div className={clsx('comp-col', 'comp-col-audit')}>
                  <div className="comp-col-header">
                    <span className="comp-col-title">CAWLIX ENGINE TELEMETRY</span>
                    <span className={clsx('comp-col-badge', 'badge-audit')}>VERDICT: MANIPULATED MARKDOWN</span>
                  </div>
                  <div className="comp-lines">
                    <div className="comp-line">
                      <span className="comp-label">90-Day Rolling Median Price</span>
                      <span className={clsx('comp-val', 'text-neutral-bright')}>EGP 28,500</span>
                    </div>
                    <div className="comp-line">
                      <span className="comp-label">Pre-Sale Spike Identified</span>
                      <span className={clsx('comp-val', 'text-danger')}>+EGP 16,100 (+56.5% 48h prior)</span>
                    </div>
                    <div className="comp-line">
                      <span className="comp-label">Real Price Delta vs Baseline</span>
                      <span className={clsx('comp-val', 'text-danger')}>+EGP 1,400 ABOVE Median</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Minimalist Forensic SVG Chart */}
              <div className="chart-wrapper">
                <div className="chart-header">
                  <span className="chart-title">90-DAY PRICE VELOCITY TIMELINE (EGP)</span>
                  <span className="chart-legend">
                    <span className="legend-item"><span className={clsx('legend-line', 'line-gray')}></span> 90d Median (28,500)</span>
                    <span className="legend-item"><span className={clsx('legend-line', 'line-red')}></span> Artificial Pre-Sale Spike (46,000)</span>
                    <span className="legend-item"><span className={clsx('legend-line', 'line-amber')}></span> "Sale" Execution (29,900)</span>
                  </span>
                </div>

                <div className="svg-container">
                  <svg viewBox="0 0 800 220" className="velocity-svg" preserveAspectRatio="xMidYMid meet">
                    {/* Hairline Grid Lines */}
                    <line x1="40" y1="30" x2="780" y2="30" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
                    <line x1="40" y1="85" x2="780" y2="85" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
                    <line x1="40" y1="140" x2="780" y2="140" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
                    <line x1="40" y1="195" x2="780" y2="195" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />

                    {/* Price Axis Labels */}
                    <text x="32" y="34" fill="#555555" fontSize="10" fontFamily="var(--font-mono)" textAnchor="end">46K</text>
                    <text x="32" y="125" fill="#555555" fontSize="10" fontFamily="var(--font-mono)" textAnchor="end">30K</text>
                    <text x="32" y="144" fill="#3ECF8E" fontSize="10" fontFamily="var(--font-mono)" textAnchor="end">28.5K</text>

                    {/* Rolling 90-Day Baseline (Dashed) */}
                    <line x1="40" y1="140" x2="780" y2="140" stroke="rgba(62, 207, 142, 0.4)" strokeWidth="1" strokeDasharray="4 4" />

                    {/* The Actual Price Trajectory Curve */}
                    <path
                      d="M 50 140 L 120 138 L 200 142 L 280 139 L 360 140 L 440 141 L 520 138 L 600 140 L 640 140 L 690 32 L 720 32 L 760 126 L 780 126"
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Stable Range Segment (Muted) */}
                    <path
                      d="M 50 140 L 120 138 L 200 142 L 280 139 L 360 140 L 440 141 L 520 138 L 600 140 L 640 140"
                      fill="none"
                      stroke="#737373"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Point: 48h Artificial Hike */}
                    <circle cx="690" cy="32" r="3.5" fill="#EF4444" />
                    <text x="690" y="20" fill="#EF4444" fontSize="10" fontFamily="var(--font-mono)" fontWeight="600" textAnchor="middle">
                      +EGP 16,100 (48h Pre-Sale)
                    </text>

                    {/* Point: Fake Discount Price */}
                    <circle cx="760" cy="126" r="3.5" fill="#F59E0B" />
                    <text x="760" y="114" fill="#F59E0B" fontSize="10" fontFamily="var(--font-mono)" fontWeight="600" textAnchor="middle">
                      EGP 29,900 (+1,400 Over Median)
                    </text>

                    {/* Time Axis Labels */}
                    <text x="50" y="212" fill="#555555" fontSize="10" fontFamily="var(--font-mono)">T-90 Days</text>
                    <text x="380" y="212" fill="#555555" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">T-45 Days</text>
                    <text x="690" y="212" fill="#EF4444" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">T-48h Spike</text>
                    <text x="780" y="212" fill="#555555" fontSize="10" fontFamily="var(--font-mono)" textAnchor="end">Sale Launch</text>
                  </svg>
                </div>
              </div>
            </div>
          </section>

          {/* Bottom Action Bar */}
          <section className="engine-cta-section">
            <div className="cta-inner">
              <div className="cta-actions">
                <a href="/#showcase" className="cta-btn-brand">
                  Inspect Product Link
                </a>
                <a href="/engines/true-cost" className="cta-btn-ghost">
                  View True-Cost Engine
                </a>
              </div>
              <span className="cta-note">Continuous 90-day time-series telemetry across 12 Egyptian retail giants.</span>
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
          max-width: 820px;
          margin: 0;
        }

        .pillars-section {
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

        .pillars-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .pillar-col {
          padding: 36px 28px;
          box-sizing: border-box;
        }

        .pillar-col:not(:last-child) {
          border-right: 1px solid rgba(255, 255, 255, 0.06);
        }

        .pillar-top-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          gap: 8px;
        }

        .pillar-num {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          font-weight: 600;
          color: #3ECF8E;
        }

        .pillar-metric {
          font-family: var(--font-mono);
          font-size: 0.625rem;
          color: #737373;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .pillar-title {
          font-family: var(--font-sans);
          font-size: 1.0625rem;
          font-weight: 600;
          color: #FFFFFF;
          margin: 0 0 10px 0;
          letter-spacing: -0.01em;
        }

        .pillar-desc {
          font-size: 0.8125rem;
          color: #888888;
          line-height: 1.55;
          margin: 0;
        }

        .score-tiers-surface {
          margin-top: 36px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          padding: 24px 0;
        }

        .score-tiers-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          gap: 12px;
        }

        .score-tiers-title {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          font-weight: 600;
          color: #FFFFFF;
          letter-spacing: 0.06em;
        }

        .score-tiers-meta {
          font-family: var(--font-mono);
          font-size: 0.625rem;
          color: #737373;
          letter-spacing: 0.04em;
        }

        .score-tiers-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
        }

        .score-tier-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-right: 12px;
        }

        .score-tier-item:not(:last-child) {
          border-right: 1px solid rgba(255, 255, 255, 0.06);
        }

        .tier-range-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .tier-range {
          font-family: var(--font-mono);
          font-size: 1.125rem;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
        }

        .tier-grade {
          font-family: var(--font-mono);
          font-size: 0.5625rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .badge-brand-clean {
          color: #3ECF8E;
          border: 1px solid rgba(62, 207, 142, 0.28);
          background: rgba(62, 207, 142, 0.04);
        }

        .badge-warn-clean {
          color: #F59E0B;
          border: 1px solid rgba(245, 158, 11, 0.28);
          background: rgba(245, 158, 11, 0.04);
        }

        .badge-danger-clean {
          color: #EF4444;
          border: 1px solid rgba(239, 68, 68, 0.28);
          background: rgba(239, 68, 68, 0.04);
        }

        .text-brand { color: #3ECF8E; }
        .text-warn { color: #F59E0B; }
        .text-danger { color: #EF4444; }

        .tier-desc {
          font-size: 0.75rem;
          color: #888888;
          line-height: 1.5;
          margin: 0;
        }

        .case-study-section {
          margin-bottom: 84px;
        }

        .case-study-surface {
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          width: 100%;
        }

        .case-header-row {
          padding: 20px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        .case-item-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .case-item-name {
          font-size: 1rem;
          font-weight: 600;
          color: #FFFFFF;
          letter-spacing: -0.01em;
        }

        .case-sku-meta {
          font-family: var(--font-mono);
          font-size: 0.6875rem;
          color: #737373;
          letter-spacing: 0.04em;
        }

        .case-verdict-tag {
          font-family: var(--font-mono);
          font-size: 0.6875rem;
          font-weight: 700;
          color: #EF4444;
          border: 1px solid rgba(239, 68, 68, 0.32);
          padding: 4px 10px;
          border-radius: 4px;
          letter-spacing: 0.06em;
          white-space: nowrap;
          background: rgba(239, 68, 68, 0.05);
        }

        .comparison-cols {
          display: grid;
          grid-template-columns: 1fr 1fr;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .comp-col {
          padding: 28px 24px;
          box-sizing: border-box;
        }

        .comp-col:first-child {
          border-right: 1px solid rgba(255, 255, 255, 0.06);
        }

        .comp-col-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          gap: 8px;
        }

        .comp-col-title {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          font-weight: 600;
          color: #FFFFFF;
          letter-spacing: 0.04em;
        }

        .comp-col-badge {
          font-family: var(--font-mono);
          font-size: 0.5625rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .badge-claim {
          color: #888888;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .badge-audit {
          color: #EF4444;
          border: 1px solid rgba(239, 68, 68, 0.28);
        }

        .comp-lines {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .comp-line {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          gap: 12px;
        }

        .comp-label {
          font-size: 0.8125rem;
          color: #888888;
        }

        .comp-val {
          font-family: var(--font-mono);
          font-size: 0.875rem;
          font-weight: 600;
          color: #EDEDED;
          font-variant-numeric: tabular-nums;
        }

        .val-strikethrough {
          text-decoration: line-through;
          color: #737373;
        }

        .text-brand-dim {
          color: #3ECF8E;
        }

        .text-neutral-bright {
          color: #FFFFFF;
        }

        .chart-wrapper {
          padding: 28px 0;
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          gap: 16px;
          flex-wrap: wrap;
        }

        .chart-title {
          font-family: var(--font-mono);
          font-size: 0.6875rem;
          font-weight: 600;
          color: #737373;
          letter-spacing: 0.06em;
        }

        .chart-legend {
          display: flex;
          align-items: center;
          gap: 18px;
          font-family: var(--font-mono);
          font-size: 0.6875rem;
          color: #888888;
        }

        .legend-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .legend-line {
          display: inline-block;
          width: 16px;
          height: 2px;
        }

        .line-gray { background: rgba(62, 207, 142, 0.6); }
        .line-red { background: #EF4444; }
        .line-amber { background: #F59E0B; }

        .svg-container {
          width: 100%;
          overflow-x: auto;
        }

        .velocity-svg {
          width: 100%;
          height: auto;
          display: block;
          min-width: 600px;
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

          .metrics-strip-text {
            font-size: 9.5px;
            letter-spacing: 0.05em;
          }

          .pillars-grid {
            grid-template-columns: 1fr;
          }

          .pillar-col {
            padding: 24px 0;
          }

          .pillar-col:not(:last-child) {
            border-right: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          }

          .score-tiers-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .score-tier-item:not(:last-child) {
            border-right: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.04);
            padding-bottom: 16px;
          }

          .case-header-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }

          .comparison-cols {
            grid-template-columns: 1fr;
          }

          .comp-col:first-child {
            border-right: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          }

          .comp-col {
            padding: 20px 0;
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
      
