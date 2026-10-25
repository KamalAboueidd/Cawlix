import React, { useState } from 'react';
import TrueCostSimulator from './TrueCostSimulator';
import GhostDiscountVisualizer from './GhostDiscountVisualizer';
import LandedCostSpread from './LandedCostSpread';
import GlitchFeedCard from './GlitchFeedCard';
import GlobalArbitrageGlobe from './GlobalArbitrageGlobe';
import PriceStreamMatrix from './PriceStreamMatrix';
import RadarScanCore from './RadarScanCore';
import LiveDashboardPreview from './LiveDashboardPreview';

interface EngineRowProps {
  label: string;
  leadHeading: string;
  tailHeading: string;
  body: string;
  specs: string[];
  primaryView: React.ReactNode;
  secondaryView?: React.ReactNode;
  secondaryLabel?: string;
  primaryLabel?: string;
  reversed?: boolean;
}

function EngineRow({
  label,
  leadHeading,
  tailHeading,
  body,
  specs,
  primaryView,
  secondaryView,
  primaryLabel = 'Execution View',
  secondaryLabel = 'Telemetry Stream',
  reversed = false,
}: EngineRowProps) {
  const [activeTab, setActiveTab] = useState<'primary' | 'secondary'>('primary');

  return (
    <div
      className="engine-row-grid"
      style={{
        width: '100%',
        maxWidth: '100%',
        overflowX: 'hidden',
      }}
    >
      {/* Text Breakdown Column */}
      <div
        className="engine-text-col"
        style={{
          order: reversed ? 2 : 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          textAlign: 'left',
        }}
      >
        <span className="feature-group-label" style={{ color: '#3ECF8E', marginBottom: '4px' }}>
          {label}
        </span>

        {/* Vercel Display Heading with Multi-tone Narrative Contrast */}
        <h3
          className="text-display"
          style={{
            fontSize: 'clamp(1.5rem, 3.2vw, 2.5rem)',
            fontWeight: 500,
            letterSpacing: '-0.04em',
            lineHeight: 1.15,
            margin: 0,
          }}
        >
          <span style={{ color: '#FFFFFF', fontWeight: 500 }}>{leadHeading} </span>
          <span className="text-contrast-tail">{tailHeading}</span>
        </h3>

        <p
          style={{
            fontSize: '0.875rem',
            color: '#888888',
            lineHeight: 1.6,
            letterSpacing: '-0.01em',
            margin: 0,
          }}
        >
          {body}
        </p>

        {/* Technical Metadata & Feature Stacks */}
        <div style={{ marginTop: '4px' }}>
          <span className="feature-group-label" style={{ marginBottom: '6px' }}>
            Specifications & Verification
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {specs.map((spec) => (
              <div key={spec} className="feature-item-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem' }}>
                <span style={{ color: '#666666', fontSize: '0.75rem', fontFamily: 'monospace' }}>–</span>
                <span>{spec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* View Switcher if secondary visual is provided */}
        {secondaryView && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setActiveTab('primary')}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                padding: '4px 10px',
                borderRadius: '4px',
                border: 'none',
                background: activeTab === 'primary' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                color: activeTab === 'primary' ? '#FFFFFF' : '#737373',
                cursor: 'pointer',
                transition: 'all 120ms ease',
              }}
            >
              {primaryLabel}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('secondary')}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                padding: '4px 10px',
                borderRadius: '4px',
                border: 'none',
                background: activeTab === 'secondary' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                color: activeTab === 'secondary' ? '#FFFFFF' : '#737373',
                cursor: 'pointer',
                transition: 'all 120ms ease',
              }}
            >
              {secondaryLabel}
            </button>
          </div>
        )}
      </div>

      {/* Interactive Visual Stage Column */}
      <div
        className="engine-visual-col"
        style={{
          order: reversed ? 1 : 2,
          width: '100%',
          maxWidth: '100%',
          overflowX: 'hidden',
        }}
      >
        {activeTab === 'primary' ? primaryView : secondaryView}
      </div>
    </div>
  );
}

export default function CoreEnginesDeepDive() {
  return (
    <section
      id="engines"
      className="page-container"
      style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        paddingTop: '60px',
        paddingBottom: '80px',
        background: '#0A0A0A',
        overflowX: 'hidden',
      }}
    >
      {/* Section Header with Vercel Display Grade Typography */}
      <div
        style={{
          textAlign: 'center',
          maxWidth: '820px',
          margin: '0 auto 56px auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          alignItems: 'center',
        }}
      >
        <span className="feature-group-label" style={{ color: '#3ECF8E' }}>
          Core Architecture
        </span>

        <h2
          className="text-display"
          style={{
            fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)',
            fontWeight: 500,
            letterSpacing: '-0.04em',
            lineHeight: 1.08,
            margin: 0,
          }}
        >
          <span style={{ color: '#FFFFFF', fontWeight: 500 }}>Four Deterministic Engines </span>
          <span className="text-contrast-tail">built for zero false-positives.</span>
        </h2>

        <p
          style={{
            fontSize: '1.0625rem',
            color: '#888888',
            lineHeight: 1.6,
            letterSpacing: '-0.01em',
            maxWidth: '660px',
            margin: '0 auto',
          }}
        >
          Sub-200ms Egyptian retail telemetry, mathematical price-velocity verification,
          direct US-to-Cairo statutory customs reconciliation, and zero-day anomaly pipelines.
        </p>
      </div>

      {/* ── Engine 01: True-Cost Execution Matrix & Price Stream Matrix ── */}
      <EngineRow
        label="Engine 01 · True-Cost Execution"
        leadHeading="Unmask the exact out-of-pocket figure"
        tailHeading="before checkout."
        body="MSRPs lie. Retailers layer checkout fees, hidden shipping tiers, and promo coupon exclusions. Cawlix calculates deterministic net cost across all 12 Egyptian retailers, factoring in active bank cashback and zero-interest installment penalties."
        specs={[
          'Sub-200ms Deterministic Execution Engine',
          '12 Store Rulesets & Gateway Surcharge Mapping',
          'Live Price Stream Fiber Wave Mesh',
        ]}
        primaryLabel="Calculator Console"
        secondaryLabel="Price Stream Mesh"
        primaryView={<TrueCostSimulator />}
        secondaryView={<PriceStreamMatrix />}
      />

      {/* ── Engine 02: Ghost-Discount Auditor & 90-Day Radar Core ── */}
      <EngineRow
        reversed
        label="Engine 02 · Time-Series Audit"
        leadHeading="Eliminate fake discounts"
        tailHeading="with 90-day price velocity."
        body="Our scrapers poll SKU pricing multiple times daily. If a retailer spikes a price before announcing a 'mega markdown', Cawlix tags the listing, recalculates the true baseline, and assigns a mathematical authenticity score."
        specs={[
          'Time-Series Velocity Analysis Engine',
          '360° Geometric Radar Scanning Nodes',
          'Zero-Tolerance for Pre-Sale Price Inflation',
        ]}
        primaryLabel="Radar Scanner"
        secondaryLabel="Time-Series Chart"
        primaryView={<RadarScanCore />}
        secondaryView={<GhostDiscountVisualizer />}
      />

      {/* ── Engine 03: Landed-Cost Matrix & 3D Wireframe Globe ── */}
      <EngineRow
        label="Engine 03 · Global Arbitrage Corridor"
        leadHeading="Calculate exact US-to-Egypt"
        tailHeading="import landed parity."
        body="Compare Egyptian shelf prices against Amazon US, Newegg, and B&H in real-time. Automated reconciliation of live parallel exchange rates, freight tariffs, Egyptian Customs codes, 14% VAT, and bank clearance margins."
        specs={[
          'Customs Code 8517.13 (0% Tariff + 14% VAT)',
          'Lightweight WebGL Wireframe Earth (Cobe)',
          'JFK, DE & LAX Direct Freight Corridors',
        ]}
        primaryLabel="Arbitrage Globe"
        secondaryLabel="Parity Comparison"
        primaryView={<GlobalArbitrageGlobe />}
        secondaryView={<LandedCostSpread />}
      />

      {/* ── Engine 04: Flash Glitch & Anomaly Radar ── */}
      <EngineRow
        reversed
        label="Engine 04 · Anomaly Detection Radar"
        leadHeading="Catch pricing errors"
        tailHeading="before retailers fix their databases."
        body="When scrapers detect statistically anomalous price deviations (>35% below rolling market baseline), our anomaly engine fires webhook alerts directly to subscribers within milliseconds."
        specs={[
          '3D Perspective Angled Telemetry Viewport',
          'Dynamic Status Flipping & Real-Time Sparkline',
          'Sub-3s Push Notification & Webhook Pipeline',
        ]}
        primaryLabel="Telemetry Viewport"
        secondaryLabel="Live Feed Alerts"
        primaryView={<LiveDashboardPreview />}
        secondaryView={<GlitchFeedCard />}
      />
    </section>
  );
}
