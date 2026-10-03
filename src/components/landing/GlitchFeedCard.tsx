import { useState, useEffect } from 'react';
import { Terminal, Check, Copy } from 'lucide-react';

export default function GlitchFeedCard() {
  const [elapsedSeconds, setElapsedSeconds] = useState(14);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyWebhook = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        background: 'transparent',
        border: 'none',
        borderRadius: 0,
        fontFamily: 'var(--font-mono)',
        fontSize: '0.75rem',
        boxShadow: 'none',
        width: '100%',
      }}
    >
      {/* Alert Header */}
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
          <span style={{ color: '#EF4444', fontWeight: 500, fontSize: '0.75rem', letterSpacing: '0.02em' }}>
            Zero-Day Anomaly Detection
          </span>
          <span style={{ color: '#737373', fontSize: '0.6875rem' }}>
            · B.TECH Online
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#737373', fontSize: '0.6875rem' }}>
            Elapsed: {elapsedSeconds}s
          </span>
          <span
            style={{
              color: '#EF4444',
              fontSize: '0.6875rem',
              fontWeight: 500,
            }}
          >
            Active alert
          </span>
        </div>
      </div>

      {/* Primary Payload Body */}
      <div style={{ padding: '12px 0', background: 'transparent', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
          <div>
            <span style={{ color: '#737373', fontSize: '0.6875rem', display: 'block' }}>TARGET PRODUCT</span>
            <span style={{ color: '#FFFFFF', fontWeight: 500, fontSize: '0.875rem' }}>
              Dell Alienware M16 R2 Gaming Laptop (i9 / RTX 4080)
            </span>
          </div>
          <span style={{ color: '#737373', fontSize: '0.6875rem' }}>SKU: BT-DEL-M16</span>
        </div>

        {/* Pricing Disparity Display (Borderless Grid) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            padding: '10px 0',
            background: 'transparent',
            marginTop: '4px',
          }}
        >
          <div>
            <span style={{ color: '#737373', fontSize: '0.6875rem', display: 'block' }}>Market Baseline</span>
            <span style={{ color: '#888888', fontSize: '0.8125rem', textDecoration: 'line-through', fontVariantNumeric: 'tabular-nums' }}>
              EGP 115,000
            </span>
          </div>

          <div>
            <span style={{ color: '#EF4444', fontSize: '0.6875rem', display: 'block' }}>Glitch Price</span>
            <span style={{ color: '#EF4444', fontWeight: 600, fontSize: '0.9375rem', fontVariantNumeric: 'tabular-nums' }}>
              EGP 62,000
            </span>
          </div>

          <div>
            <span style={{ color: '#3ECF8E', fontSize: '0.6875rem', display: 'block' }}>Arbitrage Spread</span>
            <span style={{ color: '#3ECF8E', fontWeight: 600, fontSize: '0.9375rem', fontVariantNumeric: 'tabular-nums' }}>
              -46.1% (-53,000 EGP)
            </span>
          </div>
        </div>
      </div>

      {/* Terminal Dispatch Stream */}
      <div style={{ padding: '12px 0', background: 'transparent', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#737373', fontSize: '0.6875rem', marginBottom: '4px' }}>
          <Terminal size={12} />
          <span>Dispatch Pipeline Telemetry</span>
        </div>

        <div style={{ color: '#888888', fontSize: '0.6875rem' }}>
          <span style={{ color: '#3ECF8E' }}>10:14:02.108</span> Anomaly engine detected -46.1% deviation on SKU #BT-DEL-M16.
        </div>
        <div style={{ color: '#888888', fontSize: '0.6875rem' }}>
          <span style={{ color: '#3ECF8E' }}>10:14:02.390</span> Verification confirmed checkout endpoint active and inventory cartable.
        </div>
        <div style={{ color: '#888888', fontSize: '0.6875rem' }}>
          <span style={{ color: '#3ECF8E' }}>10:14:03.480</span> Telegram high-priority VIP hook broadcasted (latency: 1.37s).
        </div>
      </div>

      {/* Action Footer */}
      <div
        style={{
          padding: '12px 0',
          background: 'transparent',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ color: '#737373', fontSize: '0.6875rem' }}>
          Dispatch Route: Telegram VIP + Discord Webhook (&lt;1.8s)
        </span>

        <button
          onClick={handleCopyWebhook}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: copied ? '#3ECF8E' : '#FFFFFF',
            padding: '4px 10px',
            borderRadius: '4px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {copied ? <Check size={11} color="#3ECF8E" /> : <Copy size={11} />}
          {copied ? 'Copied' : 'Copy Webhook Payload'}
        </button>
      </div>
    </div>
  );
}
