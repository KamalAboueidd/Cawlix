import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Search,
  Globe,
  Store,
  ShoppingBag,
  Play,
  Pause,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  TrendingDown,
  ShieldAlert,
  Zap,
} from 'lucide-react';

type Tab = 'telemetry' | 'probe' | 'landed-cost';

interface TelemetryRow {
  id: string;
  timestamp: string;
  store: string;
  sku: string;
  verdictType: 'DROP' | 'GHOST' | 'ARBITRAGE' | 'VERIFIED';
  verdictLabel: string;
  details: string;
  price: string;
  latencyMs: number;
}

const INITIAL_TELEMETRY_LOGS: TelemetryRow[] = [
  {
    id: 't-1',
    timestamp: '11:24:19.412',
    store: 'B.TECH',
    sku: 'MacBook Pro M3 Max 1TB',
    verdictType: 'GHOST',
    verdictLabel: 'GHOST_FLAGGED',
    details: 'Ghost markup rejected (-14% invalid baseline recalculated)',
    price: 'EGP 142,000',
    latencyMs: 112,
  },
  {
    id: 't-2',
    timestamp: '11:24:18.890',
    store: 'B&H_US',
    sku: 'Sony A7 IV Mirrorless',
    verdictType: 'ARBITRAGE',
    verdictLabel: 'ARBITRAGE_PARITY',
    details: 'Direct import arbitrage (+EGP 21,600 margin vs Cairo retail)',
    price: 'EGP 122,400',
    latencyMs: 210,
  },
  {
    id: 't-3',
    timestamp: '11:24:17.204',
    store: 'AMZN_EG',
    sku: 'iPhone 16 Pro 256GB',
    verdictType: 'DROP',
    verdictLabel: 'VOUCHER_DROP',
    details: 'Flash voucher applied via CIB card (-4.2% verified checkout)',
    price: 'EGP 64,899',
    latencyMs: 138,
  },
  {
    id: 't-4',
    timestamp: '11:24:16.031',
    store: 'NOON_EG',
    sku: 'Dell Alienware M16',
    verdictType: 'DROP',
    verdictLabel: 'GLITCH_DETECTED',
    details: 'Glitch discount verified (-38% below 90-day baseline)',
    price: 'EGP 74,500',
    latencyMs: 94,
  },
  {
    id: 't-5',
    timestamp: '11:24:14.770',
    store: 'TRADELINE',
    sku: 'PlayStation 5 Pro Digital',
    verdictType: 'VERIFIED',
    verdictLabel: 'AUTHENTIC_MSRP',
    details: 'Restock allocation confirmed at authentic Egyptian MSRP',
    price: 'EGP 46,900',
    latencyMs: 78,
  },
  {
    id: 't-6',
    timestamp: '11:24:13.112',
    store: '2B_EG',
    sku: 'iPad Pro 11" M4 OLED',
    verdictType: 'VERIFIED',
    verdictLabel: 'PRICE_VERIFIED',
    details: 'Pre-sale price velocity verified baseline with 0% inflation',
    price: 'EGP 54,200',
    latencyMs: 125,
  },
  {
    id: 't-7',
    timestamp: '11:24:11.984',
    store: 'SHARAF_DG',
    sku: 'Samsung S24 Ultra 512GB',
    verdictType: 'ARBITRAGE',
    verdictLabel: 'ARBITRAGE_PARITY',
    details: 'Parallel customs spread evaluated (-6.1% direct corridor)',
    price: 'EGP 52,499',
    latencyMs: 164,
  },
  {
    id: 't-8',
    timestamp: '11:24:10.552',
    store: 'AMZN_US',
    sku: 'Bose QC Ultra Headphones',
    verdictType: 'ARBITRAGE',
    verdictLabel: 'ARBITRAGE_PARITY',
    details: 'Direct US customs landed clearance parity (+EGP 4,200 spread)',
    price: 'EGP 18,750',
    latencyMs: 195,
  },
];

const TELEMETRY_SIMULATION_POOL: Array<Omit<TelemetryRow, 'id' | 'timestamp'>> = [
  {
    store: 'B.TECH',
    sku: 'MacBook Pro M3 Max 1TB',
    verdictType: 'GHOST',
    verdictLabel: 'GHOST_FLAGGED',
    details: 'Ghost markup rejected (-14% invalid baseline recalculated)',
    price: 'EGP 142,000',
    latencyMs: 112,
  },
  {
    store: 'B&H_US',
    sku: 'Sony A7 IV Mirrorless',
    verdictType: 'ARBITRAGE',
    verdictLabel: 'ARBITRAGE_PARITY',
    details: 'Direct import arbitrage (+EGP 21,600 margin vs local Cairo)',
    price: 'EGP 122,400',
    latencyMs: 210,
  },
  {
    store: 'AMZN_EG',
    sku: 'iPhone 16 Pro 256GB',
    verdictType: 'DROP',
    verdictLabel: 'VOUCHER_DROP',
    details: 'Flash voucher applied via CIB card (-4.2% verified checkout)',
    price: 'EGP 64,899',
    latencyMs: 138,
  },
  {
    store: 'NOON_EG',
    sku: 'Dell Alienware M16',
    verdictType: 'DROP',
    verdictLabel: 'GLITCH_DETECTED',
    details: 'Glitch discount verified (-38% below 90-day baseline)',
    price: 'EGP 74,500',
    latencyMs: 94,
  },
  {
    store: 'TRADELINE',
    sku: 'Apple Watch Ultra 2',
    verdictType: 'VERIFIED',
    verdictLabel: 'AUTHENTIC_MSRP',
    details: 'Official authorized channel stock confirmed with warranty',
    price: 'EGP 43,900',
    latencyMs: 82,
  },
  {
    store: 'DREAM_2000',
    sku: 'LG C3 55" OLED 4K',
    verdictType: 'GHOST',
    verdictLabel: 'GHOST_FLAGGED',
    details: 'Synthetic +22% pre-sale price spike rejected by Ghost Auditor',
    price: 'EGP 42,999',
    latencyMs: 156,
  },
  {
    store: 'COMPU_ME',
    sku: 'Asus ROG Zephyrus G16',
    verdictType: 'DROP',
    verdictLabel: 'VOUCHER_DROP',
    details: 'Zero-interest installment admin surcharge waived at checkout',
    price: 'EGP 89,900',
    latencyMs: 118,
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
  const [logs, setLogs] = useState<TelemetryRow[]>(INITIAL_TELEMETRY_LOGS);
  const [isPaused, setIsPaused] = useState(false);
  const [logFilter, setLogFilter] = useState<'ALL' | 'DROP' | 'GHOST' | 'ARBITRAGE'>('ALL');
  const poolIndexRef = useRef(0);

  // Probe Tab State
  const [probeIndex, setProbeIndex] = useState(0);
  const [probeInput, setProbeInput] = useState(PROBE_PRESETS[0].name);
  const currentProbe = PROBE_PRESETS[probeIndex];

  // Landed Cost Tab State
  const [usPrice, setUsPrice] = useState(1799);
  const [fxRate, setFxRate] = useState(50.48);
  const [category, setCategory] = useState<'phone' | 'laptop' | 'audio' | 'general'>('laptop');
  const [localPriceEGP, setLocalPriceEGP] = useState(122000);

  // Periodic Telemetry Simulator
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      const now = new Date();
      const ms = String(now.getMilliseconds()).padStart(3, '0');
      const timeStr = now.toTimeString().split(' ')[0] + '.' + ms;

      const template = TELEMETRY_SIMULATION_POOL[poolIndexRef.current % TELEMETRY_SIMULATION_POOL.length];
      poolIndexRef.current += 1;

      const newRow: TelemetryRow = {
        id: `row-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: timeStr,
        ...template,
        latencyMs: Math.max(58, Math.min(220, template.latencyMs + Math.floor(Math.random() * 15 - 7))),
      };

      setLogs((prev) => [newRow, ...prev.slice(0, 39)]);
    }, 2800);

    return () => clearInterval(interval);
  }, [isPaused]);

  // Landed Cost Calculations
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
  const clearanceAdminEGP = 1200;

  const totalLandedEGP = Math.round(cifEGP + customsDutyEGP + devFeeEGP + vatEGP + clearanceAdminEGP);
  const netArbitrageEGP = localPriceEGP - totalLandedEGP;
  const netArbitragePct = ((netArbitrageEGP / localPriceEGP) * 100).toFixed(1);

  const filteredLogs = logs.filter((l) => {
    if (logFilter === 'ALL') return true;
    return l.verdictType === logFilter;
  });

  return (
    <div
      id="showcase"
      style={{
        width: '100%',
        maxWidth: '1040px',
        margin: '0 auto',
        background: 'transparent',
        border: 'none',
      }}
    >
      {/* ── Header: Vercel-Style Segmented Tab Group & Minimal Status Indicator ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 0',
          background: 'transparent',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          userSelect: 'none',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Left: Clean Segmented Tabs (No dots, no cards) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'transparent',
              border: 'none',
              padding: 0,
              fontSize: '0.75rem',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('telemetry')}
              className="showcase-tab-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: activeTab === 'telemetry' ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                color: activeTab === 'telemetry' ? '#FFFFFF' : '#737373',
                fontWeight: activeTab === 'telemetry' ? 600 : 400,
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                boxShadow: 'none',
                cursor: 'pointer',
                transition: 'all 120ms ease',
                whiteSpace: 'nowrap',
              }}
            >
              <Activity size={12} strokeWidth={1.5} color={activeTab === 'telemetry' ? '#3ECF8E' : '#777777'} />
              <span>Live Feed</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('probe')}
              className="showcase-tab-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: activeTab === 'probe' ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                color: activeTab === 'probe' ? '#FFFFFF' : '#777777',
                fontWeight: activeTab === 'probe' ? 600 : 400,
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                boxShadow: 'none',
                cursor: 'pointer',
                transition: 'all 120ms ease',
                whiteSpace: 'nowrap',
              }}
            >
              <Search size={12} strokeWidth={1.5} color={activeTab === 'probe' ? '#3ECF8E' : '#777777'} />
              <span>Probes</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('landed-cost')}
              className="showcase-tab-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: activeTab === 'landed-cost' ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                color: activeTab === 'landed-cost' ? '#FFFFFF' : '#777777',
                fontWeight: activeTab === 'landed-cost' ? 600 : 400,
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                boxShadow: 'none',
                cursor: 'pointer',
                transition: 'all 120ms ease',
                whiteSpace: 'nowrap',
              }}
            >
              <Globe size={12} strokeWidth={1.5} color={activeTab === 'landed-cost' ? '#3ECF8E' : '#777777'} />
              <span>Arbitrage Matrix</span>
            </button>
          </div>
        </div>

        {/* Right Status Indicator: Clean static micro-text (no pulse, no fluff) */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              color: '#737373',
              letterSpacing: '0.02em',
            }}
          >
            142ms avg response
          </span>
        </div>
      </div>

      {/* ── Tab 1: Live Network Feed (Institutional Supabase / Vercel Data Grid) ── */}
      {activeTab === 'telemetry' && (
        <div style={{ display: 'flex', flexDirection: 'column', height: '360px', maxHeight: '360px', overflow: 'hidden' }}>
          {/* Subheader / Filter Controls Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 12px',
              background: '#0D0D0D',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
              <span className="hidden-mobile" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: '#666666', marginRight: '4px' }}>
                FILTER:
              </span>
              {(['ALL', 'DROP', 'GHOST', 'ARBITRAGE'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setLogFilter(mode)}
                  style={{
                    background: logFilter === mode ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                    border: 'none',
                    color: logFilter === mode ? '#FFFFFF' : '#777777',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.625rem',
                    cursor: 'pointer',
                    transition: 'all 120ms ease',
                  }}
                >
                  {mode === 'ARBITRAGE' ? 'ARB' : mode}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => setIsPaused((p) => !p)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: isPaused ? '#F59E0B' : '#888888',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.625rem',
                  cursor: 'pointer',
                }}
              >
                {isPaused ? <Play size={10} /> : <Pause size={10} />}
                {isPaused ? 'RESUME' : 'PAUSE'}
              </button>
              <button
                type="button"
                onClick={() => setLogs([])}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#888888',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.625rem',
                  cursor: 'pointer',
                }}
              >
                <Trash2 size={10} />
                CLEAR
              </button>
            </div>
          </div>

          {/* Table Header Row (Column Names) - Desktop only */}
          <div
            className="showcase-desktop-table"
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 16px',
              background: 'transparent',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              color: '#666666',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            <div style={{ width: '85px', flexShrink: 0 }}>TIME</div>
            <div style={{ width: '110px', flexShrink: 0 }}>ORIGIN</div>
            <div style={{ flex: 1, minWidth: 0, paddingRight: '16px' }}>SKU ITEM &amp; TELEMETRY</div>
            <div style={{ width: '150px', flexShrink: 0 }}>INTELLIGENCE VERDICT</div>
            <div style={{ width: '120px', flexShrink: 0, textAlign: 'right' }}>NET EXECUTED</div>
            <div style={{ width: '65px', flexShrink: 0, textAlign: 'right' }}>SPEED</div>
          </div>

          {/* Table Body: Smooth Vertical Stream without CLS */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              background: 'transparent',
            }}
          >
            {filteredLogs.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: '#555555', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                — Stream buffer empty —
              </div>
            ) : (
              filteredLogs.map((log) => {
                const isGhost = log.verdictType === 'GHOST';
                const isArb = log.verdictType === 'ARBITRAGE';
                const isDrop = log.verdictType === 'DROP';

                return (
                  <div key={log.id}>
                    {/* Desktop 6-col Row */}
                    <div
                      className="showcase-desktop-table"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '8px 16px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        transition: 'background-color 120ms ease',
                        background: 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.025)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {/* Col 1: Time */}
                      <div
                        style={{
                          width: '85px',
                          flexShrink: 0,
                          fontFamily: 'var(--font-mono)',
                          fontSize: '11px',
                          color: '#666666',
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {log.timestamp}
                      </div>

                      {/* Col 2: Store Origin */}
                      <div
                        style={{
                          width: '110px',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.6875rem',
                          color: '#A3A3A3',
                        }}
                      >
                        <Store size={12} strokeWidth={1.2} color="#737373" />
                        <span>{log.store}</span>
                      </div>

                      {/* Col 3: SKU Item */}
                      <div
                        style={{
                          flex: 1,
                          minWidth: 0,
                          paddingRight: '16px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <span style={{ color: '#EDEDED', fontWeight: 500, fontSize: '0.8125rem' }}>
                          {log.sku}
                        </span>
                        <span
                          style={{
                            color: '#737373',
                            fontSize: '0.75rem',
                            marginLeft: '8px',
                            fontFamily: 'var(--font-sans)',
                          }}
                        >
                          · {log.details}
                        </span>
                      </div>

                      {/* Col 4: Status */}
                      <div style={{ width: '150px', flexShrink: 0 }}>
                        <span
                          style={{
                            display: 'inline-block',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            letterSpacing: '0.02em',
                            color: isDrop
                              ? '#3ECF8E'
                              : isGhost
                              ? '#F87171'
                              : isArb
                              ? '#38BDF8'
                              : '#A3A3A3',
                            background: 'transparent',
                            border: 'none',
                            padding: 0,
                          }}
                        >
                          {log.verdictLabel}
                        </span>
                      </div>

                      {/* Col 5: Price */}
                      <div
                        style={{
                          width: '120px',
                          flexShrink: 0,
                          textAlign: 'right',
                          fontFamily: 'var(--font-mono)',
                          fontVariantNumeric: 'tabular-nums',
                          fontSize: '0.8125rem',
                          fontWeight: 700,
                          color: '#FFFFFF',
                        }}
                      >
                        {log.price}
                      </div>

                      {/* Col 6: Latency */}
                      <div
                        style={{
                          width: '65px',
                          flexShrink: 0,
                          textAlign: 'right',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.6875rem',
                          color: '#555555',
                        }}
                      >
                        {log.latencyMs}ms
                      </div>
                    </div>

                    {/* Mobile 3-part High-Density Row */}
                    <div
                      className="showcase-mobile-feed"
                      style={{
                        padding: '8px 12px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        background: 'transparent',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', width: '100%' }}>
                        {/* 1. Time + Store on left */}
                        <div style={{ flexShrink: 0, fontSize: '10px', color: '#737373', fontFamily: 'var(--font-mono)' }}>
                          {log.timestamp} · {log.store}
                        </div>

                        {/* 2. SKU Title in middle (truncated) */}
                        <div style={{ flex: 1, minWidth: 0, padding: '0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.75rem', color: '#FFFFFF', fontWeight: 500 }}>
                          {log.sku}
                        </div>

                        {/* 3. Signal & Price on right */}
                        <div style={{ flexShrink: 0, textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: isDrop ? '#3ECF8E' : isGhost ? '#EF4444' : '#3ECF8E' }}>
                          {log.price}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── Tab 2: On-Demand Probes ── */}
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
                type="button"
                onClick={() => {
                  setProbeIndex(idx);
                  setProbeInput(p.name);
                }}
                style={{
                  background: probeIndex === idx ? 'rgba(62, 207, 142, 0.12)' : '#141414',
                  border: 'none',
                  color: probeIndex === idx ? '#3ECF8E' : '#888888',
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
              background: 'transparent',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '6px 0',
              gap: '10px',
            }}
          >
            <Search size={14} color="#666666" />
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
              background: 'transparent',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
              <thead>
                <tr style={{ background: 'transparent', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', color: '#777777' }}>
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

      {/* ── Tab 3: US-EG Arbitrage Matrix ── */}
      {activeTab === 'landed-cost' && (
        <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {/* Controls Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#888888', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              US &rarr; Egypt Corridor Parameters
            </span>

            {/* US MSRP Input */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.8125rem', color: '#D4D4D4' }}>US Shelf Price (USD)</label>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: '#3ECF8E' }}>
                  ${usPrice.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={200}
                max={4000}
                step={50}
                value={usPrice}
                onChange={(e) => setUsPrice(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#3ECF8E' }}
              />
            </div>

            {/* Benchmark FX Rate */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.8125rem', color: '#D4D4D4' }}>Live Parallel FX Rate</label>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: '#FFFFFF' }}>
                  {fxRate.toFixed(2)} EGP / USD
                </span>
              </div>
              <input
                type="range"
                min={45}
                max={60}
                step={0.1}
                value={fxRate}
                onChange={(e) => setFxRate(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#3ECF8E' }}
              />
            </div>

            {/* Category Custom Tariff Selector */}
            <div>
              <label style={{ fontSize: '0.8125rem', color: '#D4D4D4', display: 'block', marginBottom: '6px' }}>
                Statutory Product Category
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {(['laptop', 'phone', 'audio', 'general'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    style={{
                      background: category === cat ? 'rgba(62, 207, 142, 0.12)' : '#141414',
                      border: 'none',
                      color: category === cat ? '#3ECF8E' : '#777777',
                      padding: '6px',
                      borderRadius: '6px',
                      fontSize: '0.6875rem',
                      fontFamily: 'var(--font-mono)',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div
            style={{
              background: 'transparent',
              border: 'none',
              borderRadius: 0,
              padding: '8px 0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '10px' }}>
                <span className="feature-group-label" style={{ marginBottom: 0 }}>
                  STATUTORY LANDED BREAKDOWN
                </span>
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
                  TARIFF: {tariffPct}% + 14% VAT
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888888' }}>
                  <span>Base CIF (Item + Cargo Air Freight)</span>
                  <span style={{ color: '#D4D4D4' }}>EGP {Math.round(cifEGP).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888888' }}>
                  <span>Customs &amp; Dev Fee ({tariffPct + devFeePct}%)</span>
                  <span style={{ color: '#D4D4D4' }}>+EGP {Math.round(customsDutyEGP + devFeeEGP).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888888' }}>
                  <span>Egyptian VAT (14%)</span>
                  <span style={{ color: '#D4D4D4' }}>+EGP {Math.round(vatEGP).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888888' }}>
                  <span>Brokerage &amp; Terminal Admin</span>
                  <span style={{ color: '#D4D4D4' }}>+EGP {clearanceAdminEGP.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: '18px',
                paddingTop: '14px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#888888' }}>
                  TOTAL EXECUTED LANDED COST:
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 700, color: '#3ECF8E' }}>
                  EGP {totalLandedEGP.toLocaleString()}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.6875rem', color: '#737373', fontFamily: 'var(--font-mono)' }}>
                <span>LOCAL CAIRO COMPARISON:</span>
                <span>EGP {localPriceEGP.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
