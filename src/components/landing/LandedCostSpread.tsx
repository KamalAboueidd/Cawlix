import React, { useState } from 'react';
import { ArrowUpRight, Globe, Layers, CheckCircle2 } from 'lucide-react';

interface SKUComparison {
  name: string;
  sku: string;
  usPriceUsd: number;
  fxRate: number;
  freightEgp: number;
  customsPct: number;
  customsEgp: number;
  vatEgp: number;
  totalLandedEgp: number;
  localPriceEgp: number;
  spreadEgp: number;
}

const COMPARISONS: SKUComparison[] = [
  {
    name: 'Sony Alpha A7 IV Mirrorless Camera',
    sku: 'SNY-ILCE-7M4',
    usPriceUsd: 2298,
    fxRate: 49.00,
    freightEgp: 1850,
    customsPct: 5, // 0% tariff + 5% dev fee
    customsEgp: 5630,
    vatEgp: 16812,
    totalLandedEgp: 136894,
    localPriceEgp: 164000,
    spreadEgp: 27106,
  },
  {
    name: 'Apple MacBook Pro 14" M3 Pro 18GB',
    sku: 'APL-MBP-14-M3P',
    usPriceUsd: 1799,
    fxRate: 49.00,
    freightEgp: 2100,
    customsPct: 0, // IT agreement
    customsEgp: 0,
    vatEgp: 12635,
    totalLandedEgp: 102886,
    localPriceEgp: 122000,
    spreadEgp: 19114,
  },
];

export default function LandedCostSpread() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const item = COMPARISONS[selectedIdx];
  const convertedItemCost = Math.round(item.usPriceUsd * item.fxRate);
  const spreadPct = ((item.spreadEgp / item.localPriceEgp) * 100).toFixed(1);

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
      {/* Table Header */}
      <div
        style={{
          padding: '14px 18px',
          background: '#161616',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Globe size={15} color="#3ECF8E" />
          <span style={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.8125rem' }}>
            CROSS-BORDER PARITY RECONCILIATION
          </span>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {COMPARISONS.map((c, i) => (
            <button
              key={c.sku}
              onClick={() => setSelectedIdx(i)}
              style={{
                background: selectedIdx === i ? '#222222' : 'transparent',
                border: '1px solid',
                borderColor: selectedIdx === i ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.06)',
                color: selectedIdx === i ? '#FFFFFF' : '#777777',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '0.6875rem',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
              }}
            >
              {c.name.split(' ')[0]} {c.name.split(' ')[1]}
            </button>
          ))}
        </div>
      </div>

      {/* Target Item Details */}
      <div style={{ padding: '12px 18px', background: '#0E0E0E', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div style={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.875rem' }}>{item.name}</div>
        <div style={{ color: '#777777', fontSize: '0.6875rem', marginTop: '2px' }}>
          SKU: {item.sku} · Benchmark FX Rate: 1 USD = {item.fxRate.toFixed(2)} EGP
        </div>
      </div>

      {/* Breakdown Ledger Table */}
      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888888' }}>
          <span>US MSRP (${item.usPriceUsd.toLocaleString()})</span>
          <span style={{ color: '#D4D4D4' }}>EGP {convertedItemCost.toLocaleString()}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888888' }}>
          <span>Air Freight & Cargo Handling (Insured)</span>
          <span style={{ color: '#D4D4D4' }}>+EGP {item.freightEgp.toLocaleString()}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888888' }}>
          <span>Statutory Customs & Development Tariff ({item.customsPct}%)</span>
          <span style={{ color: '#D4D4D4' }}>+EGP {item.customsEgp.toLocaleString()}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888888' }}>
          <span>Egyptian Value Added Tax (14% VAT)</span>
          <span style={{ color: '#D4D4D4' }}>+EGP {item.vatEgp.toLocaleString()}</span>
        </div>

        <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.06)', margin: '4px 0' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#FFFFFF', fontWeight: 600 }}>
          <span>Total Executed Landed Cost</span>
          <span>EGP {item.totalLandedEgp.toLocaleString()}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888888' }}>
          <span>Egyptian Local Shelf Price (Cairo Retail)</span>
          <span style={{ textDecoration: 'line-through', color: '#777777' }}>
            EGP {item.localPriceEgp.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Spread Advantage Callout Footer */}
      <div
        style={{
          padding: '14px 18px',
          background: 'rgba(62, 207, 142, 0.06)',
          borderTop: '1px solid rgba(62, 207, 142, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <span style={{ color: '#3ECF8E', fontWeight: 600, fontSize: '0.6875rem', display: 'block', textTransform: 'uppercase' }}>
            Direct Import Arbitrage Advantage
          </span>
          <span style={{ color: '#3ECF8E', fontWeight: 700, fontSize: '1.0625rem' }}>
            +EGP {item.spreadEgp.toLocaleString()} ({spreadPct}% Spread)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#3ECF8E', fontSize: '0.6875rem' }}>
          <CheckCircle2 size={13} />
          CUSTOMS RECONCILED
        </div>
      </div>
    </div>
  );
}
