import React, { useState, useEffect } from 'react';
import { Zap, Terminal, Radio, Send, Clock, CheckCircle } from 'lucide-react';

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
        background: '#121212',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        overflow: 'hidden',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.75rem',
        boxShadow: '0 20px 48px rgba(0, 0, 0, 0.6)',
      }}
    >
      {/* Alert Header */}
      <div
        style={{
          padding: '12px 18px',
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
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} />
          <span style={{ color: '#EF4444', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.04em' }}>
            [ANOMALY_TRIGGERED: ZERO-DAY GLITCH]
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#888888', fontSize: '0.6875rem' }}>
            ELAPSED: {elapsedSeconds}s
          </span>
          <span
            style={{
              padding: '2px 6px',
              borderRadius: '4px',
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#EF4444',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              fontSize: '0.625rem',
            }}
          >
            ACTIVE EXPLOIT
          </span>
        </div>
      </div>

      {/* Primary Payload Body */}
      <div style={{ padding: '16px 18px', background: '#0E0E0E', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
          <div>
            <span style={{ color: '#666666', fontSize: '0.6875rem', display: 'block' }}>TARGET PRODUCT / SKU</span>
            <span style={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.875rem' }}>
              Dell Alienware M16 R2 Gaming Laptop (i9 / RTX 4080)
            </span>
          </div>
          <span style={{ color: '#888888', fontSize: '0.6875rem' }}>B.TECH (ONLINE)</span>
        </div>

        {/* Pricing Disparity Display */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '12px',
            padding: '12px 14px',
            background: '#141414',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            marginTop: '8px',
          }}
        >
          <div>
            <span style={{ color: '#777777', fontSize: '0.6875rem', display: 'block' }}>MARKET BASELINE</span>
            <span style={{ color: '#999999', fontSize: '0.8125rem', textDecoration: 'line-through' }}>
              EGP 115,000
            </span>
          </div>

          <div>
            <span style={{ color: '#EF4444', fontSize: '0.6875rem', display: 'block' }}>GLITCH PRICE</span>
            <span style={{ color: '#EF4444', fontWeight: 700, fontSize: '0.9375rem' }}>
              EGP 62,000
            </span>
          </div>

          <div>
            <span style={{ color: '#3ECF8E', fontSize: '0.6875rem', display: 'block' }}>ARBITRAGE SPREAD</span>
            <span style={{ color: '#3ECF8E', fontWeight: 700, fontSize: '0.9375rem' }}>
              -46.1% (-53,000 EGP)
            </span>
          </div>
        </div>
      </div>

      {/* Terminal Dispatch Stream */}
      <div style={{ padding: '14px 18px', background: '#0B0B0B', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666666', fontSize: '0.6875rem', marginBottom: '4px' }}>
          <Terminal size={12} />
          <span>DISPATCH PIPELINE LOGS</span>
        </div>

        <div style={{ color: '#888888', fontSize: '0.6875rem' }}>
          <span style={{ color: '#3ECF8E' }}>10:14:02.108</span> [ANOMALY_ENGINE] Poller detected -46.1% deviation on SKU #BT-DEL-M16.
        </div>
        <div style={{ color: '#888888', fontSize: '0.6875rem' }}>
          <span style={{ color: '#3ECF8E' }}>10:14:02.390</span> [VERIFICATION] Confirmed checkout endpoint active & inventory cartable.
        </div>
        <div style={{ color: '#888888', fontSize: '0.6875rem' }}>
          <span style={{ color: '#3ECF8E' }}>10:14:03.480</span> [WEBHOOK] Telegram High-Priority VIP Hook broadcasted (latency: 1.37s).
        </div>
      </div>

      {/* Action Footer */}
      <div
        style={{
          padding: '12px 18px',
          background: '#121212',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ color: '#777777', fontSize: '0.6875rem' }}>
          DISPATCH ROUTE: TELEGRAM VIP + DISCORD BOT (&lt; 1.8S)
        </span>

        <button
          onClick={handleCopyWebhook}
          style={{
            background: '#1C1C1C',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: copied ? '#3ECF8E' : '#FFFFFF',
            padding: '4px 10px',
            borderRadius: '6px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {copied ? <CheckCircle size={11} /> : <Send size={11} />}
          {copied ? 'PAYLOAD COPIED' : 'TEST WEBHOOK'}
        </button>
      </div>
    </div>
  );
}
