import React, { useState } from 'react';
import { ArrowUpRight, Globe, Layers, CheckCircle2, Plane, ShieldCheck } from 'lucide-react';
import globalNetworkImg from '../../assets/Landing/digital-earth-globe-with-illuminated-city-networks-night.jpg';

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
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
          alignItems: 'stretch',
        }}
      >
        {/* Left Column: Visual 2 - High-Resolution Global Network Corridor */}
        <div
          style={{
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            overflow: 'hidden',
            background: '#111111',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            boxShadow: '0 20px 48px rgba(0, 0, 0, 0.7)',
          }}
        >
          {/* Top Visual Status Bar */}
          <div
            style={{
              padding: '12px 16px',
              background: '#161616',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
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
                  fontWeight: 600,
                  color: '#FFFFFF',
                  letterSpacing: '0.04em',
                }}
              >
                US_EG_IMPORT_CORRIDOR
              </span>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.625rem',
                color: '#3ECF8E',
                background: 'rgba(62, 207, 142, 0.1)',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
            >
              DIRECT_AIR_FREIGHT
            </span>
          </div>

          {/* High-Resolution Illuminated Network Visual */}
          <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', overflow: 'hidden' }}>
            <img
              src={globalNetworkImg}
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
                filter: 'brightness(0.9) contrast(1.1)',
              }}
            />
            {/* Gradient Overlay */}
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(17, 17, 17, 0.9) 0%, transparent 60%)',
                pointerEvents: 'none',
              }}
            />

            {/* Floating Freight Metric Ticker */}
            <div
              style={{
                position: 'absolute',
                bottom: '12px',
                left: '14px',
                right: '14px',
                background: 'rgba(10, 10, 10, 0.85)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '8px 12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.625rem',
              }}
            >
              <span style={{ color: '#D4D4D4' }}>TRANSIT: 3.4d (JFK &rarr; CAI)</span>
              <span style={{ color: '#3ECF8E' }}>CUSTOMS: 8517.13 RECONCILED</span>
            </div>
          </div>

          {/* Bottom Corridor Specs Bar */}
          <div
            style={{
              padding: '12px 16px',
              background: '#0E0E0E',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              color: '#888888',
            }}
          >
            <span>LIVE FX: 1 USD = {item.fxRate.toFixed(2)} EGP</span>
            <span style={{ color: '#FFFFFF' }}>VAT: 14% STATUTORY</span>
          </div>
        </div>

        {/* Right Column: Calculations & Breakdown Ledger */}
        <div
          style={{
            background: '#121212',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            overflow: 'hidden',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            boxShadow: '0 20px 48px rgba(0, 0, 0, 0.6)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
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
      </div>
    </div>
  );
}
