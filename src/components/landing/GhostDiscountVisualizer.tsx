import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { AlertOctagon, TrendingUp, Info, Activity, Database } from 'lucide-react';

interface DataPoint {
  day: string;
  price: number;
  baseline: number;
  event?: string;
}

const AUDIT_DATA: DataPoint[] = [
  { day: 'Day -90', price: 24000, baseline: 24000 },
  { day: 'Day -75', price: 24100, baseline: 24000 },
  { day: 'Day -60', price: 23900, baseline: 24000 },
  { day: 'Day -45', price: 24050, baseline: 24000 },
  { day: 'Day -30', price: 24000, baseline: 24000 },
  { day: 'Day -15', price: 24200, baseline: 24000 },
  { day: 'Day -7',  price: 24000, baseline: 24000 },
  { day: 'Day -3',  price: 28320, baseline: 24000, event: 'Artificial +18% Pump' },
  { day: 'Day -2',  price: 28320, baseline: 24000 },
  { day: 'Day -1',  price: 28320, baseline: 24000 },
  { day: 'Sale Day', price: 22656, baseline: 24000, event: 'Advertised -20%' },
];

export default function GhostDiscountVisualizer() {
  return (
    <div
      style={{
        width: '100%',
        background: 'transparent',
        border: 'none',
        borderRadius: 0,
        boxShadow: 'none',
      }}
    >
      {/* Clean Horizontal Layout: Telemetry Visual + Price Spike Auditor */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          alignItems: 'stretch',
          width: '100%',
          maxWidth: '100%',
          overflowX: 'hidden',
          gap: '24px',
        }}
      >
        {/* Left Column: Telemetry Radar Scan / 3D Stream Visualization */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRight: 'none',
            background: 'transparent',
          }}
        >
          {/* Top Status Bar */}
          <div
            style={{
              padding: '10px 0',
              background: 'transparent',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={14} color="#3ECF8E" />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  fontWeight: 500,
                  color: '#FFFFFF',
                  letterSpacing: '0.02em',
                }}
              >
                Telemetry Velocity Stream · 90-Day Buffer
              </span>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.625rem',
                color: '#3ECF8E',
              }}
            >
              Realtime Ingestion
            </span>
          </div>

          {/* 3D Telemetry Visual (.webp) with Zero CLS */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              flex: 1,
              minHeight: '220px',
              overflow: 'hidden',
              background: '#000000',
              borderRadius: '4px',
              marginTop: '10px',
              marginBottom: '10px',
            }}
          >
            <img
              src="/landing/dynamic-data-visualization-3d.webp"
              alt="Dynamic 3D Telemetry Price Stream & Velocity Network"
              width={4096}
              height={2800}
              loading="lazy"
              decoding="async"
              style={{
                width: '100%',
                height: '100%',
                aspectRatio: '4096 / 2800',
                objectFit: 'cover',
                objectPosition: 'center 40%',
                display: 'block',
              }}
            />
            {/* Subtle Gradient Vignette into #000000 */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, transparent 60%)',
                pointerEvents: 'none',
              }}
            />
            {/* Telemetry Caption Bar */}
            <div
              style={{
                position: 'absolute',
                bottom: '8px',
                left: '8px',
                right: '8px',
                background: 'transparent',
                padding: '4px 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.625rem',
              }}
            >
              <span style={{ color: '#D4D4D4' }}>Scan: 90d rolling buffer</span>
              <span style={{ color: '#3ECF8E' }}>&lt;120ms latency</span>
            </div>
          </div>

          {/* Bottom Stream Caption */}
          <div
            style={{
              padding: '8px 0',
              background: 'transparent',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              color: '#737373',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>Continuous Polling Mesh</span>
            <span style={{ color: '#3ECF8E' }}>Verified Baseline</span>
          </div>
        </div>

        {/* Right Column: Price Spike Detection Logic & 90-Day Audit */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'transparent',
          }}
        >
          {/* Audit Banner Header with Authenticity Score */}
          <div
            style={{
              padding: '10px 0',
              background: 'transparent',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertOctagon size={16} color="#EF4444" />
              <span style={{ color: '#FFFFFF', fontWeight: 500, fontSize: '0.8125rem', fontFamily: 'var(--font-mono)' }}>
                SKU Audit: Sony WH-1000XM5
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  color: '#EF4444',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono)',
                }}
              >
                22/100 Artificial · Fraud Detected
              </span>
            </div>
          </div>

          {/* Interactive Recharts LineChart */}
          <div style={{ padding: '16px 10px 8px 0', height: '220px', background: 'transparent' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={AUDIT_DATA} margin={{ top: 12, right: 16, left: 10, bottom: 0 }}>
                <XAxis
                  dataKey="day"
                  stroke="#555555"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255, 255, 255, 0.08)' }}
                />
                <YAxis
                  stroke="#555555"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(255, 255, 255, 0.08)' }}
                  domain={[20000, 30000]}
                  tickFormatter={(v) => `${v / 1000}k`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as DataPoint;
                      return (
                        <div
                          style={{
                            background: '#1A1A1A',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            fontSize: '0.6875rem',
                            color: '#FFFFFF',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          <div style={{ color: '#888888', marginBottom: '2px' }}>{data.day}</div>
                          <div style={{ fontWeight: 600 }}>EGP {data.price.toLocaleString()}</div>
                          {data.event && (
                            <div style={{ color: '#EF4444', marginTop: '4px', fontWeight: 600 }}>
                              {data.event}
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine
                  y={24000}
                  stroke="#888888"
                  strokeDasharray="4 4"
                  label={{
                    value: '90D True Baseline (24,000 EGP)',
                    fill: '#888888',
                    fontSize: 10,
                    position: 'insideBottomRight',
                  }}
                />
                <Line
                  type="stepAfter"
                  dataKey="price"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#EF4444' }}
                  activeDot={{ r: 5, fill: '#FFFFFF' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Forensic Breakdown Footer */}
          <div
            style={{
              padding: '12px 0',
              background: 'transparent',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              textAlign: 'left',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <div>
              <span style={{ color: '#737373', fontSize: '0.6875rem', display: 'block' }}>72H PRE-SALE HIKE</span>
              <span style={{ color: '#EF4444', fontWeight: 600, fontSize: '0.8125rem' }}>+18.0% (EGP 28,320)</span>
            </div>
            <div>
              <span style={{ color: '#737373', fontSize: '0.6875rem', display: 'block' }}>ADVERTISED MARKDOWN</span>
              <span style={{ color: '#F59E0B', fontWeight: 600, fontSize: '0.8125rem' }}>-20% FROM SPIKE</span>
            </div>
            <div>
              <span style={{ color: '#737373', fontSize: '0.6875rem', display: 'block' }}>ACTUAL NET BENEFIT</span>
              <span style={{ color: '#888888', fontWeight: 600, fontSize: '0.8125rem' }}>ONLY -5.6% REAL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
