import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/landing/Footer';
import { Eye, X, Activity, TrendingUp, ShieldAlert, CheckCircle2 } from 'lucide-react';

const PHASES = [
  {
    phase: 'PHASE 01',
    time: 'T = 0.00s',
    title: 'Telemetry Interception',
    desc: 'Automated merchant feed pushes an erratic price drop (e.g. accidental missing zero or rogue coupon stacking).',
    badge: 'RAW FEED PROBE',
    code: 'PROBE_INGEST',
  },
  {
    phase: 'PHASE 02',
    time: 'T + 0.14s',
    title: 'Algorithmic Confidence Verification',
    desc: 'Cawlix engine validates SKU identity, checks available stock units, and filters out known out-of-stock ghost links to prevent false positives.',
    badge: 'CART CHECKOUT VERIFIED',
    code: 'CONFIDENCE_PASS',
  },
  {
    phase: 'PHASE 03',
    time: 'T + 0.85s',
    title: 'Priority Broadcast',
    desc: 'Instant alerts dispatched via low-latency Webhooks, Telegram, and SMS directly to Pro subscribers before merchant revert.',
    badge: 'MULTI-CHANNEL DISPATCH',
    code: 'SUBSCRIBER_ALERT',
  },
];

const INCIDENTS = [
  {
    sku: 'LG C3 55" OLED 4K TV',
    spec: 'OLED55C36LC · 120HZ EVO · WEBOS',
    retailer: 'Noon Egypt',
    retailerCode: 'NOON_EG',
    baseline: 'EGP 42,000',
    glitchPrice: 'EGP 24,499',
    delta: '-41.6%',
    anomalyType: 'Anomaly',
    revertTime: '6 minutes, 14 seconds',
    revertTimeShort: '6m 14s',
    status: 'CONFIRMED EXECUTED',
    units: '3 units secured',
  },
  {
    sku: 'Sony WH-1000XM5 Wireless Headphones',
    spec: 'WH1000XM5/B · ANC · HI-RES AUDIO',
    retailer: 'Amazon Egypt',
    retailerCode: 'AMZN_EG',
    baseline: 'EGP 19,800',
    glitchPrice: 'EGP 8,250',
    delta: '-58.3%',
    anomalyType: 'Decimal Drop',
    revertTime: '2 minutes, 48 seconds',
    revertTimeShort: '2m 48s',
    status: 'CONFIRMED EXECUTED',
    units: '12 units secured',
  },
  {
    sku: 'Apple Watch Ultra 2 (Titanium)',
    spec: 'MRF83LL/A · 49MM CELLULAR · S9 SIP',
    retailer: 'B.TECH',
    retailerCode: 'BTECH_EG',
    baseline: 'EGP 45,900',
    glitchPrice: 'EGP 29,100',
    delta: '-36.6%',
    anomalyType: 'Coupon Stack Error',
    revertTime: '11 minutes, 02 seconds',
    revertTimeShort: '11m 02s',
    status: 'CONFIRMED EXECUTED',
    units: '5 units secured',
  },
];

export default function AnomalyRadarPage() {
  const [selectedIncident, setSelectedIncident] = useState(null);
  return (
    <div className="engine-wrapper">
      <Navbar />

      <main className="engine-main">
        <div className="engine-container">
          {/* Hero Header */}
          <header className="engine-hero">
            <div className="metrics-strip">
              <span className="metrics-strip-text">
                142MS AVERAGE PROBE LATENCY · WEBHOOK DISPATCH &lt; 1.2S · ZERO SYNTHETIC DELAY
              </span>
            </div>

            <h1 className="engine-title">
              Sub-Second Anomaly &amp; <span className="engine-title-muted">Glitch Radar.</span>
            </h1>

            <p className="engine-subtitle">
              Capitalizing on algorithmic pricing blunders. We monitor headless inventory feeds and API endpoints across 12 retailers 24/7 to flag decimal errors, coupon misconfigurations, and sudden price collapses before merchants correct them.
            </p>
          </header>

          {/* The Mechanics of a Pricing Glitch: Open 3-Phase Timeline */}
          <section className="timeline-section">
            <div className="section-meta-header">
              <span className="section-kicker">AUTONOMOUS DETECTION LIFECYCLE</span>
              <h2 className="section-title">The Mechanics of an Algorithmic Pricing Glitch</h2>
              <p className="section-subtitle">
                Sub-second execution sequence: from raw headless feed ingestion to verified subscriber broadcast before merchant engineering teams can intervene.
              </p>
            </div>

            <div className="timeline-grid">
              {PHASES.map((phase) => (
                <div key={phase.phase} className="timeline-col">
                  <div className="timeline-top-meta">
                    <div className="timeline-step-badge">
                      <span className="step-num">{phase.phase}</span>
                      <span className="step-timestamp">{phase.time}</span>
                    </div>
                    <span className="step-code">{phase.code}</span>
                  </div>
                  <h3 className="timeline-col-title">{phase.title}</h3>
                  <p className="timeline-col-desc">{phase.desc}</p>
                  <div className="timeline-col-footer">
                    <span className="step-badge-clean">{phase.badge}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Historical Glitch Incident Archive: High-Density Audit Ledger */}
          <section className="archive-section">
            <div className="section-meta-header">
              <span className="section-kicker">EMPIRICAL MARKET TELEMETRY</span>
              <h2 className="section-title">Historical Glitch Incident Archive</h2>
              <p className="section-subtitle">
                Audited market anomalies captured in real-time, detailing baseline valuations, erroneous settlement prices, and subscriber capture windows.
              </p>
            </div>

            {/* Desktop Ledger View */}
            <div className="ledger-desktop-wrap">
              <table className="ledger-table">
                <thead>
                  <tr>
                    <th className="col-sku">HARDWARE SKU &amp; SPECIFICATION</th>
                    <th className="col-retailer">RETAILER FEED</th>
                    <th className="col-baseline">BASELINE SHELF</th>
                    <th className="col-glitch">GLITCH PRICE</th>
                    <th className="col-revert">REVERT WINDOW</th>
                    <th className="col-status">AUDIT VERDICT</th>
                    <th className="col-action" style={{ textAlign: 'right' }}>CURVE TELEMETRY</th>
                  </tr>
                </thead>
                <tbody>
                  {INCIDENTS.map((item) => (
                    <tr key={item.sku} className="ledger-row">
                      <td className="col-sku">
                        <div className="sku-cell">
                          <span className="sku-name">{item.sku}</span>
                          <span className="sku-spec">{item.spec}</span>
                        </div>
                      </td>
                      <td className="col-retailer">
                        <div className="retailer-cell">
                          <span className="retailer-name">{item.retailer}</span>
                          <span className="retailer-code">{item.retailerCode}</span>
                        </div>
                      </td>
                      <td className="col-baseline">
                        <span className="price-baseline">{item.baseline}</span>
                      </td>
                      <td className="col-glitch">
                        <div className="glitch-cell">
                          <span className="price-glitch">{item.glitchPrice}</span>
                          <span className="anomaly-delta">
                            {item.delta} {item.anomalyType}
                          </span>
                        </div>
                      </td>
                      <td className="col-revert">
                        <div className="revert-cell">
                          <span className="revert-time">{item.revertTime}</span>
                          <span className="revert-note">Time to Merchant Revert</span>
                        </div>
                      </td>
                      <td className="col-status">
                        <div className="status-cell">
                          <span className="status-confirmed">{item.status}</span>
                          <span className="status-units">{item.units}</span>
                        </div>
                      </td>
                      <td className="col-action" style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedIncident(item)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 14px',
                            background: '#EDEDED',
                            border: '1px solid #FFFFFF',
                            borderRadius: '4px',
                            color: '#000000',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'background-color 0.15s ease, box-shadow 0.15s ease',
                            boxSizing: 'border-box',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#FFFFFF';
                            e.currentTarget.style.boxShadow = '0 0 12px rgba(255, 255, 255, 0.25)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#EDEDED';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <Eye size={12} color="#000000" style={{ background: 'transparent' }} />
                          <span>Inspect Curve</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile High-Density Ledger View (< 768px) */}
            <div className="ledger-mobile-wrap">
              {INCIDENTS.map((item) => (
                <div key={item.sku} className="ledger-mobile-card">
                  <div className="mobile-card-header">
                    <div className="mobile-sku-wrap">
                      <span className="mobile-sku-name">{item.sku}</span>
                      <span className="mobile-sku-spec">{item.spec} · {item.retailer}</span>
                    </div>
                    <div className="mobile-status-wrap">
                      <span className="mobile-status-tag">{item.status}</span>
                      <span className="mobile-units-tag">{item.units}</span>
                    </div>
                  </div>

                  <div className="mobile-card-grid">
                    <div className="mobile-stat-block">
                      <span className="mobile-stat-label">BASELINE</span>
                      <span className="mobile-stat-val mobile-stat-muted">{item.baseline}</span>
                    </div>
                    <div className="mobile-stat-block">
                      <span className="mobile-stat-label">GLITCH SETTLEMENT</span>
                      <span className="mobile-stat-val mobile-stat-brand">{item.glitchPrice}</span>
                      <span className="mobile-stat-sub">{item.delta} {item.anomalyType}</span>
                    </div>
                    <div className="mobile-stat-block mobile-stat-wide">
                      <span className="mobile-stat-label">REVERT TIMELINE</span>
                      <span className="mobile-stat-val mobile-stat-mono">{item.revertTime}</span>
                    </div>
                  </div>

                  <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <button
                      onClick={() => setSelectedIncident(item)}
                      style={{
                        width: '100%',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '8px 14px',
                        background: '#EDEDED',
                        border: '1px solid #FFFFFF',
                        borderRadius: '4px',
                        color: '#000000',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease, box-shadow 0.15s ease',
                        boxSizing: 'border-box',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#FFFFFF';
                        e.currentTarget.style.boxShadow = '0 0 12px rgba(255, 255, 255, 0.25)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#EDEDED';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <Eye size={12} color="#000000" style={{ background: 'transparent' }} />
                      <span>Inspect Price Curve &amp; Telemetry</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Bottom Action Bar */}
          <section className="engine-cta-section">
            <div className="cta-inner">
              <div className="cta-actions">
                <a href="/pricing" className="cta-btn-brand">
                  Subscribe to Instant Alerts
                </a>
                <a href="/" className="cta-btn-ghost">
                  Explore Coverage Map
                </a>
              </div>
              <span className="cta-disclaimer">
                INCIDENT PROBE CADENCE: CONTINUOUS WEBSOCKET STREAM · 12 ACTIVE DOMESTIC RETAILERS · SUBSCRIBER PRIORITY ROUTING
              </span>
            </div>
          </section>
        </div>
      </main>

      {/* Incident Forensic Price Curve Modal */}
      {selectedIncident && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            boxSizing: 'border-box',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedIncident(null);
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '820px',
              maxHeight: '92vh',
              backgroundColor: '#050505',
              border: '1px solid #222222',
              borderRadius: '10px',
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.9)',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
              color: '#EDEDED',
              fontFamily: 'var(--font-sans)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #1A1A1A',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '16px',
                backgroundColor: '#0A0A0A',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      color: '#FB7185',
                      backgroundColor: 'rgba(251, 113, 133, 0.1)',
                      border: '1px solid rgba(251, 113, 133, 0.25)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    <Activity size={12} color="#FB7185" style={{ background: 'transparent' }} />
                    {selectedIncident.anomalyType}
                  </span>
                  <span
                    style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      color: '#EDEDED',
                      backgroundColor: '#161616',
                      border: '1px solid #2A2A2A',
                    }}
                  >
                    {selectedIncident.retailer}
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: '#10B981', fontFamily: 'var(--font-mono)' }}>
                    {selectedIncident.status}
                  </span>
                </div>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', fontWeight: 600, color: '#FFFFFF' }}>
                  {selectedIncident.sku}
                </h2>
                <div style={{ fontSize: '0.75rem', color: '#888888', fontFamily: 'var(--font-mono)' }}>
                  {selectedIncident.spec}
                </div>
              </div>

              <button
                onClick={() => setSelectedIncident(null)}
                aria-label="Close Modal"
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '6px',
                  color: '#888888',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#888888';
                }}
              >
                <X size={18} color="currentColor" style={{ background: 'transparent' }} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Telemetry Visual Graph */}
              <div
                style={{
                  backgroundColor: '#000000',
                  border: '1px solid #1F1F1F',
                  borderRadius: '8px',
                  padding: '18px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp size={15} color="#10B981" style={{ background: 'transparent' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#EDEDED', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      Price Collapse &amp; Revert Curve Telemetry
                    </span>
                  </div>
                  <span style={{ fontSize: '0.6875rem', color: '#FB7185', fontFamily: 'var(--font-mono)' }}>
                    COLLAPSE DELTA: {selectedIncident.delta}
                  </span>
                </div>

                <div
                  style={{
                    width: '100%',
                    backgroundColor: '#040404',
                    border: '1px solid #141414',
                    borderRadius: '6px',
                    padding: '12px 8px',
                  }}
                >
                  <svg viewBox="0 0 700 200" style={{ width: '100%', height: 'auto', display: 'block' }}>
                    <defs>
                      <linearGradient id="incidentDropGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.2" />
                        <stop offset="80%" stopColor="#FB7185" stopOpacity="0.1" />
                        <stop offset="100%" stopColor="#FB7185" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    {/* Baseline Guide */}
                    <line x1="50" y1="45" x2="650" y2="45" stroke="#10B981" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
                    <text x="56" y="38" fill="#10B981" fontSize="10" fontFamily="var(--font-mono)">
                      Baseline Shelf: {selectedIncident.baseline}
                    </text>

                    {/* Crash Area */}
                    <polygon points="50,45 250,45 280,150 420,150 450,45 650,45 650,180 50,180" fill="url(#incidentDropGrad)" />

                    {/* Curve Path */}
                    <polyline
                      points="50,45 250,45 280,150 420,150 450,45 650,45"
                      fill="none"
                      stroke="#EDEDED"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {/* Glitch Settlement Point */}
                    <circle cx="350" cy="150" r="6" fill="#050505" stroke="#FB7185" strokeWidth="3" />
                    <text x="350" y="176" textAnchor="middle" fill="#FB7185" fontSize="11" fontFamily="var(--font-mono)" fontWeight="700">
                      Glitch Price: {selectedIncident.glitchPrice} ({selectedIncident.delta})
                    </text>

                    {/* Revert Timeline Label */}
                    <text x="350" y="130" textAnchor="middle" fill="#AAAAAA" fontSize="10" fontFamily="var(--font-mono)">
                      Revert Window: {selectedIncident.revertTime}
                    </text>

                    {/* T=0 and T=End Markers */}
                    <circle cx="280" cy="150" r="4" fill="#38BDF8" />
                    <circle cx="450" cy="45" r="4" fill="#10B981" />
                    <text x="280" y="192" textAnchor="middle" fill="#777777" fontSize="9" fontFamily="var(--font-mono)">T=0s (Drop)</text>
                    <text x="450" y="28" textAnchor="middle" fill="#777777" fontSize="9" fontFamily="var(--font-mono)">Merchant Revert</text>
                  </svg>
                </div>
              </div>

              {/* Metrics Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px',
                }}
              >
                <div style={{ backgroundColor: '#000', border: '1px solid #1F1F1F', borderRadius: '6px', padding: '14px 16px' }}>
                  <div style={{ fontSize: '0.6875rem', color: '#10B981', marginBottom: '4px' }}>BASELINE SHELF PRICE</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#10B981', fontFamily: 'var(--font-mono)' }}>
                    {selectedIncident.baseline}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#666666' }}>Standard Domestic Value</div>
                </div>

                <div style={{ backgroundColor: '#000', border: '1px solid #1F1F1F', borderRadius: '6px', padding: '14px 16px' }}>
                  <div style={{ fontSize: '0.6875rem', color: '#FB7185', marginBottom: '4px' }}>GLITCH SETTLEMENT</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#FB7185', fontFamily: 'var(--font-mono)' }}>
                    {selectedIncident.glitchPrice}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#FB7185' }}>{selectedIncident.delta} Collapse</div>
                </div>

                <div style={{ backgroundColor: '#000', border: '1px solid #1F1F1F', borderRadius: '6px', padding: '14px 16px' }}>
                  <div style={{ fontSize: '0.6875rem', color: '#888888', marginBottom: '4px' }}>REVERT TIMELINE</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#EDEDED', fontFamily: 'var(--font-mono)' }}>
                    {selectedIncident.revertTime}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#666666' }}>Automated Merchant Patch</div>
                </div>

                <div style={{ backgroundColor: '#000', border: '1px solid #1F1F1F', borderRadius: '6px', padding: '14px 16px' }}>
                  <div style={{ fontSize: '0.6875rem', color: '#10B981', marginBottom: '4px' }}>VERIFIED CAPTURES</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#10B981', fontFamily: 'var(--font-mono)' }}>
                    {selectedIncident.units}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#10B981' }}>Secured by Pro Subscribers</div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #1A1A1A',
                backgroundColor: '#0A0A0A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '12px',
              }}
            >
              <a
                href="/pricing"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  background: '#EDEDED',
                  border: '1px solid #FFFFFF',
                  borderRadius: '4px',
                  color: '#000000',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'background-color 0.15s ease, box-shadow 0.15s ease',
                  boxSizing: 'border-box',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.boxShadow = '0 0 14px rgba(255, 255, 255, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#EDEDED';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span>Subscribe to Realtime Radar</span>
              </a>

              <button
                onClick={() => setSelectedIncident(null)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '8px 16px',
                  background: '#161616',
                  border: '1px solid #2A2A2A',
                  borderRadius: '4px',
                  color: '#AAAAAA',
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease, color 0.15s ease',
                  boxSizing: 'border-box',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#444444';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#2A2A2A';
                  e.currentTarget.style.color = '#AAAAAA';
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />

      <style>{`
        /* ── Canvas & Core Architecture ────────────────────────────────────────────── */
        .engine-wrapper {
          min-height: 100vh;
          background-color: #000000;
          color: #EDEDED;
        }

        .engine-main {
          min-height: 100vh;
          background-color: #000000;
          padding-top: 130px;
          padding-bottom: 96px;
          overflow-x: hidden;
        }

        .engine-container {
          max-width: 1040px;
          margin: 0 auto;
          padding: 0 24px;
          box-sizing: border-box;
        }

        /* ── Hero Header ───────────────────────────────────────────────────────────── */
        .engine-hero {
          margin-bottom: 72px;
          padding-bottom: 48px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .metrics-strip {
          margin-bottom: 20px;
        }

        .metrics-strip-text {
          font-family: var(--font-mono);
          font-size: 0.6875rem;
          font-weight: 500;
          letter-spacing: 0.08em;
          color: #737373;
          text-transform: uppercase;
        }

        .engine-title {
          font-family: var(--font-sans);
          font-size: clamp(2.25rem, 5vw, 3.25rem);
          font-weight: 600;
          line-height: 1.1;
          letter-spacing: -0.04em;
          color: #EDEDED;
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

        /* ── Section Meta Header ──────────────────────────────────────────────────── */
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
          max-width: 780px;
        }

        /* ── 3-Phase Timeline ──────────────────────────────────────────────────────── */
        .timeline-section {
          margin-bottom: 84px;
        }

        .timeline-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .timeline-col {
          padding: 32px 24px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
        }

        .timeline-col:not(:last-child) {
          border-right: 1px solid rgba(255, 255, 255, 0.05);
        }

        .timeline-top-meta {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 16px;
          gap: 8px;
        }

        .timeline-step-badge {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }

        .step-num {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          font-weight: 700;
          color: #3ECF8E;
          letter-spacing: 0.04em;
        }

        .step-timestamp {
          font-family: var(--font-mono);
          font-size: 0.6875rem;
          font-weight: 600;
          color: #EDEDED;
          letter-spacing: 0.02em;
        }

        .step-code {
          font-family: var(--font-mono);
          font-size: 0.625rem;
          color: #525252;
          letter-spacing: 0.06em;
        }

        .timeline-col-title {
          font-family: var(--font-sans);
          font-size: 1.0625rem;
          font-weight: 600;
          color: #FFFFFF;
          margin: 0 0 10px 0;
          letter-spacing: -0.01em;
        }

        .timeline-col-desc {
          font-size: 0.8125rem;
          color: #888888;
          line-height: 1.6;
          margin: 0 0 20px 0;
          flex-grow: 1;
        }

        .timeline-col-footer {
          margin-top: auto;
        }

        .step-badge-clean {
          font-family: var(--font-mono);
          font-size: 0.625rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          color: #3ECF8E;
          border: none;
          background: transparent;
          padding: 0;
        }

        /* ── Historical Glitch Incident Archive (Desktop Ledger) ───────────────────── */
        .archive-section {
          margin-bottom: 84px;
        }

        .ledger-desktop-wrap {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .ledger-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.8125rem;
        }

        .ledger-table th {
          padding: 16px 20px;
          font-family: var(--font-mono);
          font-size: 0.6875rem;
          font-weight: 600;
          color: #737373;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          text-align: left;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          background: #0A0A0A;
          white-space: nowrap;
        }

        .ledger-table th.col-baseline,
        .ledger-table th.col-glitch,
        .ledger-table th.col-revert,
        .ledger-table th.col-status {
          text-align: right;
        }

        .ledger-row {
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          transition: background-color 120ms ease;
        }

        .ledger-row:last-child {
          border-bottom: none;
        }

        .ledger-row:hover {
          background-color: rgba(255, 255, 255, 0.015);
        }

        .ledger-table td {
          padding: 22px 20px;
          vertical-align: middle;
        }

        .col-sku {
          width: 32%;
        }

        .sku-cell {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sku-name {
          font-size: 0.9375rem;
          font-weight: 600;
          color: #FFFFFF;
          letter-spacing: -0.01em;
        }

        .sku-spec {
          font-family: var(--font-mono);
          font-size: 0.6875rem;
          color: #737373;
          letter-spacing: 0.02em;
        }

        .col-retailer {
          width: 18%;
        }

        .retailer-cell {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .retailer-name {
          font-size: 0.8125rem;
          color: #D4D4D8;
          font-weight: 500;
        }

        .retailer-code {
          font-family: var(--font-mono);
          font-size: 0.625rem;
          color: #525252;
          letter-spacing: 0.04em;
        }

        .col-baseline {
          width: 13%;
          text-align: right;
        }

        .price-baseline {
          font-family: var(--font-mono);
          font-size: 0.8125rem;
          color: #737373;
          text-decoration: line-through;
          font-variant-numeric: tabular-nums;
        }

        .col-glitch {
          width: 16%;
          text-align: right;
        }

        .glitch-cell {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 3px;
        }

        .price-glitch {
          font-family: var(--font-mono);
          font-size: 1.0625rem;
          font-weight: 700;
          color: #3ECF8E;
          letter-spacing: -0.01em;
          font-variant-numeric: tabular-nums;
        }

        .anomaly-delta {
          font-family: var(--font-mono);
          font-size: 0.6875rem;
          font-weight: 600;
          color: #F59E0B;
          letter-spacing: 0.02em;
        }

        .col-revert {
          width: 15%;
          text-align: right;
        }

        .revert-cell {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 3px;
        }

        .revert-time {
          font-family: var(--font-mono);
          font-size: 0.8125rem;
          font-weight: 600;
          color: #EDEDED;
          font-variant-numeric: tabular-nums;
        }

        .revert-note {
          font-size: 0.625rem;
          color: #525252;
        }

        .col-status {
          width: 16%;
          text-align: right;
        }

        .status-cell {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 3px;
        }

        .status-confirmed {
          font-family: var(--font-mono);
          font-size: 0.6875rem;
          font-weight: 700;
          color: #3ECF8E;
          letter-spacing: 0.04em;
          white-space: nowrap;
          border: none;
          background: transparent;
          padding: 0;
        }

        .status-units {
          font-family: var(--font-mono);
          font-size: 0.625rem;
          color: #737373;
        }

        /* ── Mobile Ledger Cards (< 768px) ─────────────────────────────────────────── */
        .ledger-mobile-wrap {
          display: none;
          flex-direction: column;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .ledger-mobile-card {
          padding: 20px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .ledger-mobile-card:last-child {
          border-bottom: none;
        }

        .mobile-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .mobile-sku-wrap {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .mobile-sku-name {
          font-size: 0.9375rem;
          font-weight: 600;
          color: #FFFFFF;
          letter-spacing: -0.01em;
        }

        .mobile-sku-spec {
          font-family: var(--font-mono);
          font-size: 0.6875rem;
          color: #737373;
        }

        .mobile-status-wrap {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
          flex-shrink: 0;
        }

        .mobile-status-tag {
          font-family: var(--font-mono);
          font-size: 0.6875rem;
          font-weight: 700;
          color: #3ECF8E;
          border: none;
          background: transparent;
          padding: 0;
        }

        .mobile-units-tag {
          font-family: var(--font-mono);
          font-size: 0.625rem;
          color: #737373;
        }

        .mobile-card-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          padding-top: 10px;
          border-top: 1px solid rgba(255, 255, 255, 0.03);
        }

        .mobile-stat-block {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .mobile-stat-wide {
          grid-column: span 2;
        }

        .mobile-stat-label {
          font-family: var(--font-mono);
          font-size: 0.5625rem;
          font-weight: 600;
          color: #525252;
          letter-spacing: 0.06em;
        }

        .mobile-stat-val {
          font-family: var(--font-mono);
          font-size: 0.875rem;
          font-weight: 600;
          font-variant-numeric: tabular-nums;
        }

        .mobile-stat-muted {
          color: #737373;
          text-decoration: line-through;
        }

        .mobile-stat-brand {
          color: #3ECF8E;
          font-size: 1rem;
          font-weight: 700;
        }

        .mobile-stat-mono {
          color: #EDEDED;
        }

        .mobile-stat-sub {
          font-family: var(--font-mono);
          font-size: 0.625rem;
          color: #F59E0B;
        }

        /* ── Bottom Action Bar ─────────────────────────────────────────────────────── */
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

        .cta-disclaimer {
          font-family: var(--font-mono);
          font-size: 0.625rem;
          color: #525252;
          letter-spacing: 0.05em;
        }

        /* ── Responsive Queries ────────────────────────────────────────────────────── */
        @media (max-width: 900px) {
          .timeline-grid {
            grid-template-columns: 1fr;
          }

          .timeline-col:not(:last-child) {
            border-right: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          }
        }

        @media (max-width: 768px) {
          .engine-main {
            padding-top: 145px !important;
            padding-bottom: 64px;
          }

          .ledger-desktop-wrap {
            display: none;
          }

          .ledger-mobile-wrap {
            display: flex;
          }

          .cta-actions {
            width: 100%;
            flex-direction: column;
            align-items: stretch;
          }

          .cta-btn-brand,
          .cta-btn-ghost {
            width: 100%;
            box-sizing: border-box;
          }
        }
      `}</style>
    </div>
  );
}
