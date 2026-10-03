import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Trash2, Search, ArrowRight, RefreshCw, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import clsx from 'clsx';

type Tab = 'telemetry' | 'probe' | 'landed-cost';

interface TelemetryRow {
  id: string;
  timestamp: string;
  statusCode: number;
  statusText: string;
  retailer: string;
  sku: string;
  type: 'DROP' | 'SPIKE' | 'GHOST' | 'ARBITRAGE' | 'RESTOCK' | 'NORMAL';
  message: string;
  latencyMs: number;
}

const INITIAL_TELEMETRY_LOGS: TelemetryRow[] = [
  {
    id: 'tl-1',
    timestamp: '10:24:19.412',
    statusCode: 200,
    statusText: 'OK',
    retailer: 'AMZN_EG',
    sku: 'SKU#APL-15PM-256',
    type: 'DROP',
    message: 'iPhone 15 Pro Max 256GB Natural Titanium · EGP 61,490 (-4.2%) · True-Cost: 60,875 EGP with CIB 10% promo',
    latencyMs: 142,
  },
  {
    id: 'tl-2',
    timestamp: '10:24:18.890',
    statusCode: 200,
    statusText: 'GHOST_FLAG',
    retailer: 'NOON_EG',
    sku: 'SKU#SNY-PS5-SLM',
    type: 'GHOST',
    message: 'PS5 Slim Digital listed 24,999 EGP (marked "35% OFF from 38,499"). Synthetic baseline audit: 90d median was 26,000 EGP. Ghost deal score: 94/100.',
    latencyMs: 168,
  },
  {
    id: 'tl-3',
    timestamp: '10:24:17.204',
    statusCode: 200,
    statusText: 'ARB_SIGNAL',
    retailer: 'AMZN_US',
    sku: 'SKU#APL-MBP-M3P',
    type: 'ARBITRAGE',
    message: 'MacBook Pro 14" M3 Pro 18GB · USD 1,799 (Landed: 91,480 EGP all-inclusive vs Local EG: 108,000 EGP). Net arbitrage spread: +16,520 EGP.',
    latencyMs: 210,
  },
  {
    id: 'tl-4',
    timestamp: '10:24:16.031',
    statusCode: 304,
    statusText: 'NOT_MODIFIED',
    retailer: 'BTECH',
    sku: 'SKU#SNY-WH-1000XM5',
    type: 'NORMAL',
    message: 'Sony WH-1000XM5 ANC · EGP 18,900 · 0.0% variance over 24h · Stock: IN_STOCK (14 units)',
    latencyMs: 98,
  },
  {
    id: 'tl-5',
    timestamp: '10:24:14.770',
    statusCode: 200,
    statusText: 'OK',
    retailer: 'TRADELINE',
    sku: 'SKU#APL-MBA-M2',
    type: 'RESTOCK',
    message: 'MacBook Air 13" M2 8GB/256GB Space Gray · EGP 48,500 · Restocked (6 units confirmed)',
    latencyMs: 115,
  },
  {
    id: 'tl-6',
    timestamp: '10:24:13.112',
    statusCode: 200,
    statusText: 'SPIKE',
    retailer: '2B_EG',
    sku: 'SKU#NV-RTX4080-OC',
    type: 'SPIKE',
    message: 'ASUS ROG Strix RTX 4080 Super · EGP 67,200 (+8.4% overnight adjustment) · Supply allocation tight',
    latencyMs: 133,
  },
];

const PROBE_PRESETS = [
  {
    name: 'Apple iPhone 15 Pro Max 256GB',
    sku: 'APL-15PM-256',
    egMedian: 62500,
    usMSRP: 1199,
    results: [
      { retailer: 'Amazon Egypt', listed: 61490, trueCost: 60875, diff: -1.6, stock: 'In Stock', ghostScore: 0, tag: 'Lowest Local' },
      { retailer: 'Noon Egypt', listed: 63999, trueCost: 63999, diff: +2.4, stock: 'In Stock', ghostScore: 78, tag: 'Ghost Flag' },
      { retailer: 'TradeLine', listed: 65900, trueCost: 64582, diff: +5.4, stock: 'In Stock', ghostScore: 0, tag: 'Authorized' },
      { retailer: 'B.TECH', listed: 64200, trueCost: 62916, diff: +2.7, stock: 'Low Stock', ghostScore: 12, tag: '0% Interest' },
      { retailer: 'Amazon US (Direct Landed)', listed: 59840, trueCost: 59840, diff: -4.3, stock: 'Available', ghostScore: 0, tag: 'Arbitrage Best' },
    ],
  },
  {
    name: 'MacBook Pro 14" M3 Pro 18GB/512GB',
    sku: 'APL-MBP-M3P',
    egMedian: 108000,
    usMSRP: 1799,
    results: [
      { retailer: 'Amazon US (Direct Landed)', listed: 91480, trueCost: 91480, diff: -15.3, stock: 'Available', ghostScore: 0, tag: 'Save 16,520 EGP' },
      { retailer: 'Amazon Egypt', listed: 104500, trueCost: 102410, diff: -3.2, stock: 'In Stock', ghostScore: 0, tag: 'Prime Next-Day' },
      { retailer: 'TradeLine', listed: 109900, trueCost: 109900, diff: +1.8, stock: 'In Stock', ghostScore: 0, tag: 'Authorized' },
      { retailer: '2B Egypt', listed: 107500, trueCost: 107500, diff: -0.5, stock: 'Low Stock', ghostScore: 5, tag: 'Official Warranty' },
    ],
  },
  {
    name: 'Sony WH-1000XM5 Wireless ANC',
    sku: 'SNY-WH-1000XM5',
    egMedian: 19500,
    usMSRP: 399,
    results: [
      { retailer: 'B.TECH', listed: 18900, trueCost: 18522, diff: -3.1, stock: 'In Stock', ghostScore: 0, tag: 'Best Local Deal' },
      { retailer: 'Amazon Egypt', listed: 19200, trueCost: 19200, diff: -1.5, stock: 'In Stock', ghostScore: 0, tag: 'Prime' },
      { retailer: 'Noon Egypt', listed: 20499, trueCost: 20499, diff: +5.1, stock: 'In Stock', ghostScore: 45, tag: 'Inflated' },
      { retailer: 'Amazon US (Direct Landed)', listed: 20850, trueCost: 20850, diff: +6.9, stock: 'Available', ghostScore: 0, tag: 'Local Cheaper' },
    ],
  },
];

export default function ShowcaseConsole() {
  const [activeTab, setActiveTab] = useState<Tab>('telemetry');

  // Telemetry Stream State
  const [logs, setLogs] = useState<TelemetryRow[]>(INITIAL_TELEMETRY_LOGS);
  const [isPaused, setIsPaused] = useState(false);
  const [logFilter, setLogFilter] = useState<'ALL' | 'DROP' | 'GHOST' | 'ARBITRAGE'>('ALL');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Probe State
  const [probeIndex, setProbeIndex] = useState(0);
  const [probeInput, setProbeInput] = useState(PROBE_PRESETS[0].name);
  const [isProbing, setIsProbing] = useState(false);
  const currentProbe = PROBE_PRESETS[probeIndex];

  // Landed Cost State
  const [usPrice, setUsPrice] = useState(1199);
  const [fxRate, setFxRate] = useState(49.20);
  const [category, setCategory] = useState<'phone' | 'laptop' | 'audio' | 'general'>('phone');
  const [localPriceEGP, setLocalPriceEGP] = useState(65000);

  // Periodic Telemetry Simulator
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const now = new Date();
      const ms = String(now.getMilliseconds()).padStart(3, '0');
      const timeStr = now.toTimeString().split(' ')[0] + '.' + ms;

      const randomEvents: Array<Omit<TelemetryRow, 'id' | 'timestamp'>> = [
        {
          statusCode: 200,
          statusText: 'OK',
          retailer: 'AMZN_EG',
          sku: 'SKU#APL-15P-128',
          type: 'DROP',
          message: 'iPhone 15 Pro 128GB Black Titanium · EGP 52,999 (-3.8%) · In stock (8 units)',
          latencyMs: 138,
        },
        {
          statusCode: 200,
          statusText: 'GHOST_ALERT',
          retailer: 'NOON_EG',
          sku: 'SKU#SAM-S24U-512',
          type: 'GHOST',
          message: 'Galaxy S24 Ultra artificial markdown detected. Original price marked up 18% 3 hours prior to promo start.',
          latencyMs: 154,
        },
        {
          statusCode: 200,
          statusText: 'ARB_SIGNAL',
          retailer: 'AMZN_US',
          sku: 'SKU#SNY-A7IV',
          type: 'ARBITRAGE',
          message: 'Sony Alpha 7 IV Mirrorless · USD 2,298 Landed: 122,400 EGP vs Local: 144,000 EGP · Arbitrage margin: +21,600 EGP',
          latencyMs: 220,
        },
        {
          statusCode: 304,
          statusText: 'NOT_MODIFIED',
          retailer: 'CARREFOUR',
          sku: 'SKU#LG-C3-55',
          type: 'NORMAL',
          message: 'LG OLED 55" C3 4K HDR · EGP 49,999 · Probe confirmed identical parity with yesterday',
          latencyMs: 105,
        },
      ];

      const pick = randomEvents[Math.floor(Math.random() * randomEvents.length)];
      const newEntry: TelemetryRow = {
        id: `tl-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        timestamp: timeStr,
        ...pick,
      };

      setLogs((prev) => [newEntry, ...prev.slice(0, 49)]);
    }, 2800);

    return () => clearInterval(interval);
  }, [isPaused]);

  // Landed Cost Deterministic Calculation
  const tariffPct = category === 'laptop' ? 0 : category === 'phone' ? 10 : category === 'audio' ? 20 : 15;
  const devFeePct = category === 'phone' ? 5 : 0;
  const vatPct = 14;
  const freightUsd = category === 'laptop' ? 45 : category === 'phone' ? 25 : 30;

  const itemCostEGP = usPrice * fxRate;
  const freightEGP = freightUsd * fxRate;
  const cifEGP = itemCostEGP + freightEGP;
  const customsDutyEGP = (cifEGP * tariffPct) / 100;
  const devFeeEGP = (cifEGP * devFeePct) / 100;
  const vatEGP = ((cifEGP + customsDutyEGP + devFeeEGP) * vatPct) / 100;
  const clearanceAdminEGP = 1100;

  const totalLandedEGP = Math.round(cifEGP + customsDutyEGP + devFeeEGP + vatEGP + clearanceAdminEGP);
  const netArbitrageEGP = localPriceEGP - totalLandedEGP;
  const netArbitragePct = ((netArbitrageEGP / localPriceEGP) * 100).toFixed(1);

  const filteredLogs = logs.filter((l) => {
    if (logFilter === 'ALL') return true;
    return l.type === logFilter;
  });

  const handlePresetClick = (idx: number) => {
    setIsProbing(true);
    setProbeIndex(idx);
    setProbeInput(PROBE_PRESETS[idx].name);
    setTimeout(() => setIsProbing(false), 350);
  };

  return (
    <div
      id="showcase"
      style={{
        width: '100%',
        maxWidth: '1040px',
        margin: '0 auto',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        background: '#0E0E0E',
        overflow: 'hidden',
        boxShadow: '0 24px 64px -12px rgba(0, 0, 0, 0.85)',
      }}
    >
      {/* ── Console Header Bar & Mock Tabs ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          height: '46px',
          background: '#121212',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          userSelect: 'none',
        }}
      >
        {/* Left: Window Dots & Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.15)' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.15)' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.15)' }} />
          </div>

          <div style={{ display: 'flex', gap: '2px', marginLeft: '6px' }}>
            <button
              onClick={() => setActiveTab('telemetry')}
              style={{
                background: activeTab === 'telemetry' ? '#181818' : 'transparent',
                border: '1px solid',
                borderColor: activeTab === 'telemetry' ? 'rgba(255, 255, 255, 0.10)' : 'transparent',
                color: activeTab === 'telemetry' ? '#FFFFFF' : '#777777',
                padding: '5px 12px',
                borderRadius: '6px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 120ms ease',
              }}
            >
              [Live Telemetry Feed]
            </button>
            <button
              onClick={() => setActiveTab('probe')}
              style={{
                background: activeTab === 'probe' ? '#181818' : 'transparent',
                border: '1px solid',
                borderColor: activeTab === 'probe' ? 'rgba(255, 255, 255, 0.10)' : 'transparent',
                color: activeTab === 'probe' ? '#FFFFFF' : '#777777',
                padding: '5px 12px',
                borderRadius: '6px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 120ms ease',
              }}
            >
              [On-Demand Probe]
            </button>
            <button
              onClick={() => setActiveTab('landed-cost')}
              style={{
                background: activeTab === 'landed-cost' ? '#181818' : 'transparent',
                border: '1px solid',
                borderColor: activeTab === 'landed-cost' ? 'rgba(255, 255, 255, 0.10)' : 'transparent',
                color: activeTab === 'landed-cost' ? '#FFFFFF' : '#777777',
                padding: '5px 12px',
                borderRadius: '6px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 120ms ease',
              }}
            >
              [Landed-Cost Calculator]
            </button>
          </div>
        </div>

        {/* Right Status Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3ECF8E' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: '#888888', letterSpacing: '0.04em' }}>
              ONLINE · 142MS
            </span>
          </div>
        </div>
      </div>

      {/* ── Tab 1: Live Telemetry Feed ── */}
      {activeTab === 'telemetry' && (
        <div style={{ display: 'flex', flexDirection: 'column', height: '440px' }}>
          {/* Subheader / Filter Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 16px',
              background: '#0B0B0B',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: '#666666', textTransform: 'uppercase' }}>
                Filter:
              </span>
              {(['ALL', 'DROP', 'GHOST', 'ARBITRAGE'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setLogFilter(mode)}
                  style={{
                    background: logFilter === mode ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                    border: '1px solid',
                    borderColor: logFilter === mode ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                    color: logFilter === mode ? '#FFFFFF' : '#777777',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    cursor: 'pointer',
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setIsPaused((p) => !p)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: isPaused ? '#F59E0B' : '#888888',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  cursor: 'pointer',
                }}
              >
                {isPaused ? <Play size={10} /> : <Pause size={10} />}
                {isPaused ? 'RESUME' : 'PAUSE'}
              </button>
              <button
                onClick={() => setLogs([])}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#888888',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  cursor: 'pointer',
                }}
              >
                <Trash2 size={10} />
                CLEAR
              </button>
            </div>
          </div>

          {/* Log Stream */}
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '8px 0',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              lineHeight: 1.6,
            }}
          >
            {filteredLogs.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#555555' }}>
                — Stream buffer empty —
              </div>
            ) : (
              filteredLogs.map((log) => {
                const isGhost = log.type === 'GHOST';
                const isArb = log.type === 'ARBITRAGE';
                const isDrop = log.type === 'DROP';
                const isSpike = log.type === 'SPIKE';

                return (
                  <div
                    key={log.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '100px 70px 84px 1fr 58px',
                      alignItems: 'baseline',
                      gap: '12px',
                      padding: '4px 16px',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                      background: isGhost
                        ? 'rgba(239, 68, 68, 0.04)'
                        : isArb
                        ? 'rgba(62, 207, 142, 0.04)'
                        : 'transparent',
                    }}
                  >
                    {/* Timestamp */}
                    <span style={{ color: '#555555', letterSpacing: '-0.02em' }}>
                      {log.timestamp}
                    </span>

                    {/* HTTP Status Code */}
                    <span
                      style={{
                        color: isGhost ? '#EF4444' : isArb ? '#3ECF8E' : isDrop ? '#3ECF8E' : isSpike ? '#F59E0B' : '#777777',
                        fontWeight: 500,
                      }}
                    >
                      [{log.statusCode}]
                    </span>

                    {/* Retailer Name */}
                    <span style={{ color: '#AAAAAA', fontWeight: 500 }}>
                      {log.retailer}
                    </span>

                    {/* Structured Message */}
                    <span style={{ color: isGhost ? '#FFA2A2' : isArb ? '#D1FAE5' : '#D4D4D4', wordBreak: 'break-word' }}>
                      {log.message}
                    </span>

                    {/* Latency */}
                    <span style={{ color: '#555555', textAlign: 'right' }}>
                      {log.latencyMs}ms
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── Tab 2: On-Demand Probe ── */}
      {activeTab === 'probe' && (
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Preset Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: '#666666', textTransform: 'uppercase' }}>
              Indexed SKUs:
            </span>
            {PROBE_PRESETS.map((p, idx) => (
              <button
                key={p.sku}
                onClick={() => handlePresetClick(idx)}
                style={{
                  background: probeIndex === idx ? 'rgba(62, 207, 142, 0.10)' : '#161616',
                  border: '1px solid',
                  borderColor: probeIndex === idx ? 'rgba(62, 207, 142, 0.35)' : 'rgba(255, 255, 255, 0.08)',
                  color: probeIndex === idx ? '#3ECF8E' : '#999999',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 120ms ease',
                }}
              >
                {p.name.split(' ')[0]} {p.name.split(' ')[1]}
              </button>
            ))}
          </div>

          {/* Search Bar Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#141414',
              border: '1px solid rgba(255, 255, 255, 0.10)',
              borderRadius: '8px',
              padding: '4px 12px',
              gap: '10px',
            }}
          >
            <Search size={15} color="#666666" />
            <input
              type="text"
              value={probeInput}
              onChange={(e) => setProbeInput(e.target.value)}
              placeholder="Query product SKU or name..."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#FFFFFF',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8125rem',
                padding: '8px 0',
              }}
            />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: '#666666' }}>
              PROBE TIMEOUT: 180MS
            </span>
          </div>

          {/* Probe Results Table */}
          <div
            style={{
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              background: '#0B0B0B',
              overflow: 'hidden',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
              <thead>
                <tr style={{ background: '#141414', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#777777' }}>
                  <th style={{ padding: '10px 14px', fontWeight: 500 }}>RETAILER / CHANNEL</th>
                  <th style={{ padding: '10px 14px', fontWeight: 500 }}>LISTED PRICE</th>
                  <th style={{ padding: '10px 14px', fontWeight: 500 }}>TRUE NET COST</th>
                  <th style={{ padding: '10px 14px', fontWeight: 500 }}>VARIANCE</th>
                  <th style={{ padding: '10px 14px', fontWeight: 500 }}>GHOST AUDIT</th>
                  <th style={{ padding: '10px 14px', fontWeight: 500 }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {currentProbe.results.map((row, i) => (
                  <tr
                    key={row.retailer}
                    style={{
                      borderBottom: i < currentProbe.results.length - 1 ? '1px solid rgba(255, 255, 255, 0.04)' : 'none',
                      background: row.ghostScore > 50 ? 'rgba(239, 68, 68, 0.04)' : row.diff < -5 ? 'rgba(62, 207, 142, 0.03)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '10px 14px', color: '#EDEDED', fontWeight: 500 }}>
                      {row.retailer}
                      <span style={{ display: 'block', fontSize: '0.6875rem', color: '#666666', marginTop: '2px' }}>
                        {row.tag}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', color: '#D4D4D4' }}>
                      EGP {row.listed.toLocaleString()}
                    </td>
                    <td style={{ padding: '10px 14px', color: '#FFFFFF', fontWeight: 600 }}>
                      EGP {row.trueCost.toLocaleString()}
                    </td>
                    <td
                      style={{
                        padding: '10px 14px',
                        color: row.diff < 0 ? '#3ECF8E' : row.diff > 3 ? '#EF4444' : '#888888',
                        fontWeight: 500,
                      }}
                    >
                      {row.diff > 0 ? `+${row.diff}%` : `${row.diff}%`}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      {row.ghostScore > 50 ? (
                        <span style={{ color: '#EF4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <AlertTriangle size={12} />
                          {row.ghostScore}% ARTIFICIAL
                        </span>
                      ) : (
                        <span style={{ color: '#3ECF8E', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={12} />
                          CLEAN BASELINE
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '10px 14px', color: row.stock === 'In Stock' || row.stock === 'Available' ? '#888888' : '#F59E0B' }}>
                      {row.stock}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tab 3: Landed-Cost Calculator ── */}
      {activeTab === 'landed-cost' && (
        <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Controls Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#888888', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              US → Egypt Corridor Parameters
            </span>

            {/* US MSRP Input */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#888888', marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>
                US RETAIL PRICE (USD $)
              </label>
              <input
                type="number"
                value={usPrice}
                onChange={(e) => setUsPrice(Number(e.target.value) || 0)}
                style={{
                  width: '100%',
                  background: '#141414',
                  border: '1px solid rgba(255, 255, 255, 0.10)',
                  borderRadius: '6px',
                  padding: '9px 12px',
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* Category Select */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#888888', marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>
                HS TARIFF CLASSIFICATION
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                style={{
                  width: '100%',
                  background: '#141414',
                  border: '1px solid rgba(255, 255, 255, 0.10)',
                  borderRadius: '6px',
                  padding: '9px 12px',
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              >
                <option value="phone">Smartphones (10% Customs + 5% Dev Fee + 14% VAT)</option>
                <option value="laptop">Laptops & Compute (0% Customs IT Agreement + 14% VAT)</option>
                <option value="audio">Audio & ANC (20% Customs + 14% VAT)</option>
                <option value="general">Consumer Electronics (15% Customs + 14% VAT)</option>
              </select>
            </div>

            {/* Egypt Domestic Benchmark */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#888888', marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>
                DOMESTIC EGYPTIAN RETAIL PRICE (EGP)
              </label>
              <input
                type="number"
                value={localPriceEGP}
                onChange={(e) => setLocalPriceEGP(Number(e.target.value) || 0)}
                style={{
                  width: '100%',
                  background: '#141414',
                  border: '1px solid rgba(255, 255, 255, 0.10)',
                  borderRadius: '6px',
                  padding: '9px 12px',
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Breakdown Ledger Column */}
          <div
            style={{
              background: '#0B0B0B',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '10px' }}>
                <span style={{ color: '#888888' }}>FX Benchmark</span>
                <span style={{ color: '#EDEDED' }}>1 USD = {fxRate.toFixed(2)} EGP</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '6px 0', color: '#A1A1A1' }}>
                <span>Converted Item Cost</span>
                <span>EGP {Math.round(itemCostEGP).toLocaleString()}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '6px 0', color: '#A1A1A1' }}>
                <span>Air Freight & Courier (${freightUsd})</span>
                <span>EGP {Math.round(freightEGP).toLocaleString()}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '6px 0', color: '#A1A1A1' }}>
                <span>Customs Tariff ({tariffPct}%)</span>
                <span>EGP {Math.round(customsDutyEGP).toLocaleString()}</span>
              </div>

              {devFeePct > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '6px 0', color: '#A1A1A1' }}>
                  <span>State Dev Fee ({devFeePct}%)</span>
                  <span>EGP {Math.round(devFeeEGP).toLocaleString()}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '6px 0', color: '#A1A1A1' }}>
                <span>Statutory VAT (14%)</span>
                <span>EGP {Math.round(vatEGP).toLocaleString()}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '6px 0', color: '#A1A1A1' }}>
                <span>Clearance Administration</span>
                <span>EGP {clearanceAdminEGP.toLocaleString()}</span>
              </div>
            </div>

            {/* Total Landed & Net Spread */}
            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#FFFFFF', fontWeight: 600 }}>DETERMINISTIC LANDED COST</span>
                <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.9375rem' }}>
                  EGP {totalLandedEGP.toLocaleString()}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: netArbitrageEGP > 0 ? 'rgba(62, 207, 142, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid',
                  borderColor: netArbitrageEGP > 0 ? 'rgba(62, 207, 142, 0.25)' : 'rgba(239, 68, 68, 0.25)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  marginTop: '10px',
                }}
              >
                <span style={{ color: netArbitrageEGP > 0 ? '#3ECF8E' : '#EF4444', fontWeight: 500 }}>
                  {netArbitrageEGP > 0 ? 'NET IMPORT ARBITRAGE' : 'DOMESTIC PURCHASE ADVANTAGE'}
                </span>
                <span style={{ color: netArbitrageEGP > 0 ? '#3ECF8E' : '#EF4444', fontWeight: 700 }}>
                  {netArbitrageEGP > 0 ? `+EGP ${netArbitrageEGP.toLocaleString()} (${netArbitragePct}%)` : `-EGP ${Math.abs(netArbitrageEGP).toLocaleString()}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
