import React, { useState } from 'react';
import { ArrowUpRight, Globe, Layers, CheckCircle2, Plane, ShieldCheck } from 'lucide-react';

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
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        width: '100%',
      }}
    >
      {/* Balanced Split-View Container */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
          alignItems: 'stretch',
          width: '100%',
          maxWidth: '100%',
          overflowX: 'hidden',
        }}
      >
        {/* Left Column: Visual 2 - High-Resolution Global Network Corridor */}
        <div
          style={{
            border: 'none',
            borderRadius: 0,
            background: 'transparent',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            boxShadow: 'none',
          }}
        >
          {/* Top Visual Status Bar */}
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
              <Plane size={14} color="#3ECF8E" />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  fontWeight: 500,
                  color: '#FFFFFF',
                  letterSpacing: '0.02em',
                }}
              >
                US-Egypt Import Corridor
              </span>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.625rem',
                color: '#3ECF8E',
              }}
            >
              Direct Air Freight
            </span>
          </div>

          {/* High-Resolution Illuminated Network Visual (.webp) */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16 / 9',
              overflow: 'hidden',
              background: '#0A0A0A',
              borderRadius: '4px',
              marginTop: '10px',
              marginBottom: '10px',
            }}
          >
            <img
              src="/landing/digital-earth-globe-with-illuminated-city-networks-night.webp"
              alt="Global Freight Corridor & Arbitrage Network"
              width={8736}
              height={4896}
              loading="lazy"
              decoding="async"
              style={{
                width: '100%',
                height: '100%',
                aspectRatio: '16 / 9',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            {/* Smooth Edge Blend Scrim into #0A0A0A canvas */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, #0A0A0A 0%, rgba(10, 10, 10, 0.4) 45%, transparent 100%)',
                pointerEvents: 'none',
              }}
            />

            {/* Freight Metric Ticker Caption */}
            <div
              style={{
                position: 'absolute',
                bottom: '8px',
                left: '8px',
                right: '8px',
                background: 'rgba(10, 10, 10, 0.75)',
                padding: '4px 8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.625rem',
                flexWrap: 'wrap',
                gap: '6px',
              }}
            >
              <span style={{ color: '#3ECF8E' }}>
                Amazon US &rarr; Cairo Freight Transit
              </span>
              <span style={{ color: '#D4D4D4' }}>Customs: 8517.13 statutory</span>
            </div>
          </div>

          {/* Bottom Corridor Specs Bar */}
          <div
            style={{
              padding: '8px 0',
              background: 'transparent',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              color: '#737373',
            }}
          >
            <span>Live FX: 1 USD = {item.fxRate.toFixed(2)} EGP</span>
            <span style={{ color: '#D4D4D4' }}>VAT: 14% Statutory</span>
          </div>
        </div>

        {/* Right Column: Calculations & Breakdown Ledger */}
        <div
          style={{
            background: 'transparent',
            border: 'none',
            borderRadius: 0,
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            boxShadow: 'none',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {/* Table Header */}
          <div
            style={{
              padding: '10px 0',
              background: 'transparent',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={15} color="#3ECF8E" />
              <span style={{ color: '#FFFFFF', fontWeight: 500, fontSize: '0.8125rem' }}>
                Cross-Border Parity Reconciliation
              </span>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              {COMPARISONS.map((c, i) => (
                <button
                  key={c.sku}
                  onClick={() => setSelectedIdx(i)}
                  style={{
                    background: selectedIdx === i ? '#1A1A1A' : 'transparent',
                    border: '1px solid',
                    borderColor: selectedIdx === i ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.06)',
                    color: selectedIdx === i ? '#FFFFFF' : '#737373',
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
          <div style={{ padding: '10px 0', background: 'transparent', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ color: '#FFFFFF', fontWeight: 500, fontSize: '0.875rem' }}>{item.name}</div>
            <div style={{ color: '#737373', fontSize: '0.6875rem', marginTop: '2px' }}>
              SKU: {item.sku} · Benchmark FX Rate: 1 USD = {item.fxRate.toFixed(2)} EGP
            </div>
          </div>

          {/* Breakdown Ledger Table */}
          <div style={{ padding: '14px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#737373' }}>
              <span>US MSRP (${item.usPriceUsd.toLocaleString()})</span>
              <span style={{ color: '#D4D4D4' }}>EGP {convertedItemCost.toLocaleString()}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#737373' }}>
              <span>Air Freight & Cargo Handling (Insured)</span>
              <span style={{ color: '#D4D4D4' }}>+EGP {item.freightEgp.toLocaleString()}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#737373' }}>
              <span>Statutory Customs & Development Tariff ({item.customsPct}%)</span>
              <span style={{ color: '#D4D4D4' }}>+EGP {item.customsEgp.toLocaleString()}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#737373' }}>
              <span>Egyptian Value Added Tax (14% VAT)</span>
              <span style={{ color: '#D4D4D4' }}>+EGP {item.vatEgp.toLocaleString()}</span>
            </div>

            <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.05)', margin: '4px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#FFFFFF', fontWeight: 600 }}>
              <span>Total Executed Landed Cost</span>
              <span>EGP {item.totalLandedEgp.toLocaleString()}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#737373' }}>
              <span>Egyptian Local Shelf Price (Cairo Retail)</span>
              <span style={{ textDecoration: 'line-through', color: '#737373' }}>
                EGP {item.localPriceEgp.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Spread Advantage Callout Footer */}
          <div
            style={{
              padding: '12px 0',
              background: 'transparent',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
            }}
          >
            <div>
              <span style={{ color: '#737373', fontSize: '0.6875rem', display: 'block', textTransform: 'uppercase' }}>
                Direct Import Arbitrage Advantage
              </span>
              <span style={{ color: '#3ECF8E', fontWeight: 600, fontSize: '1.125rem' }}>
                +EGP {item.spreadEgp.toLocaleString()} ({spreadPct}% Spread)
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#3ECF8E', fontSize: '0.6875rem' }}>
              <CheckCircle2 size={13} />
              Customs Reconciled
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
