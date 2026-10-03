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
import { AlertOctagon, TrendingUp, Info } from 'lucide-react';

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
        background: '#121212',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        overflow: 'hidden',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.75rem',
        boxShadow: '0 20px 48px rgba(0, 0, 0, 0.6)',
      }}
    >
      {/* Audit Banner Header */}
      <div
        style={{
          padding: '14px 18px',
          background: '#161616',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertOctagon size={16} color="#EF4444" />
          <span style={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.8125rem' }}>
            SKU AUDIT: SONY-WH-1000XM5
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#EF4444',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              fontSize: '0.6875rem',
              fontWeight: 600,
            }}
          >
            FRAUD DETECTED
          </span>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              background: 'rgba(255, 255, 255, 0.06)',
              color: '#D4D4D4',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.6875rem',
            }}
          >
            SCORE: 22/100
          </span>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              background: 'rgba(245, 158, 11, 0.1)',
              color: '#F59E0B',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              fontSize: '0.6875rem',
            }}
          >
            ARTIFICIAL_BASELINE
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div style={{ padding: '20px 18px 10px 10px', height: '240px', background: '#0E0E0E' }}>
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
              domain={[22000, 30000]}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.08)' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as DataPoint;
                  return (
                    <div
                      style={{
                        background: '#161616',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '0.6875rem',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      <div style={{ color: '#888888' }}>{data.day}</div>
                      <div style={{ color: '#FFFFFF', fontWeight: 600 }}>
                        EGP {data.price.toLocaleString()}
                      </div>
                      {data.event && (
                        <div style={{ color: data.price > 25000 ? '#EF4444' : '#F59E0B', marginTop: '2px' }}>
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
          padding: '12px 18px',
          background: '#0B0B0B',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          textAlign: 'left',
        }}
      >
        <div>
          <span style={{ color: '#666666', fontSize: '0.6875rem', display: 'block' }}>72H PRE-SALE HIKE</span>
          <span style={{ color: '#EF4444', fontWeight: 600, fontSize: '0.8125rem' }}>+18.0% (EGP 28,320)</span>
        </div>
        <div>
          <span style={{ color: '#666666', fontSize: '0.6875rem', display: 'block' }}>ADVERTISED MARKDOWN</span>
          <span style={{ color: '#F59E0B', fontWeight: 600, fontSize: '0.8125rem' }}>-20% FROM SPIKE</span>
        </div>
        <div>
          <span style={{ color: '#666666', fontSize: '0.6875rem', display: 'block' }}>ACTUAL NET BENEFIT</span>
          <span style={{ color: '#888888', fontWeight: 600, fontSize: '0.8125rem' }}>ONLY -5.6% REAL</span>
        </div>
      </div>
    </div>
  );
}
