import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, TrendingDown, Terminal } from 'lucide-react';

export default function LiveDashboardPreview() {
  const sparklineCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [badgeState, setBadgeState] = useState<'SYNCING' | 'GLITCH_DETECTED'>('GLITCH_DETECTED');
  const [countdown, setCountdown] = useState(14.8);
  const [livePrice] = useState(24499);
  const [baselinePrice] = useState(42000);

  // Sparkline drawing loop without decorative glows
  useEffect(() => {
    const canvas = sparklineCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;
    const dataPoints = [42000, 42000, 41800, 42500, 42000, 43200, 42900, 42000, 24499];

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const max = 45000;
      const min = 22000;
      const stepX = w / (dataPoints.length - 1);

      // Draw background horizontal gridlines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      [0.25, 0.5, 0.75].forEach((ratio) => {
        ctx.beginPath();
        ctx.moveTo(0, h * ratio);
        ctx.lineTo(w, h * ratio);
        ctx.stroke();
      });

      // Subtle gradient fill under curve
      const gradient = ctx.createLinearGradient(0, 0, 0, h);
      gradient.addColorStop(0, 'rgba(62, 207, 142, 0.15)');
      gradient.addColorStop(1, 'rgba(62, 207, 142, 0.0)');

      ctx.beginPath();
      dataPoints.forEach((val, i) => {
        const x = i * stepX;
        let y = h - ((val - min) / (max - min)) * (h - 20) - 10;
        if (i === dataPoints.length - 1) {
          const wobble = Math.sin(t * 0.05) * 3;
          y += wobble;
        }
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Clean crisp line path (no blurry glow)
      ctx.beginPath();
      dataPoints.forEach((val, i) => {
        const x = i * stepX;
        let y = h - ((val - min) / (max - min)) * (h - 20) - 10;
        if (i === dataPoints.length - 1) {
          y += Math.sin(t * 0.05) * 3;
        }
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = '#3ECF8E';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Drop point marker
      const lastX = (dataPoints.length - 1) * stepX;
      const lastY = h - ((dataPoints[dataPoints.length - 1] - min) / (max - min)) * (h - 20) - 10 + Math.sin(t * 0.05) * 3;
      ctx.beginPath();
      ctx.arc(lastX, lastY, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#EF4444';
      ctx.fill();

      t += 1;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  // Status badge flipping & countdown timers
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 0.1) return 15.0;
        return +(prev - 0.1).toFixed(1);
      });
    }, 100);

    const badgeInterval = setInterval(() => {
      setBadgeState((prev) => (prev === 'SYNCING' ? 'GLITCH_DETECTED' : 'SYNCING'));
    }, 6000);

    return () => {
      clearInterval(timerInterval);
      clearInterval(badgeInterval);
    };
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        background: 'transparent',
      }}
    >
      <div
        style={{
          background: 'transparent',
          border: 'none',
          boxShadow: 'none',
          overflow: 'hidden',
          width: '100%',
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 0',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            background: 'transparent',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                color: '#737373',
                letterSpacing: '0.02em',
              }}
            >
              Telemetry Dispatch Engine · Realtime Feed
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {badgeState === 'GLITCH_DETECTED' ? (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  fontWeight: 500,
                  color: '#EF4444',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <AlertTriangle size={12} color="#EF4444" />
                Glitch detected (-41.7%)
              </span>
            ) : (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  fontWeight: 500,
                  color: '#3ECF8E',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                12 nodes synced
              </span>
            )}
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                color: '#737373',
              }}
            >
              142ms avg response
            </span>
          </div>
        </div>

        {/* Dashboard Body Grid - Completely Borderless Surface */}
        <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Top Metrics Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              paddingBottom: '16px',
            }}
          >
            {/* Metric 1: Deal Target */}
            <div>
              <span className="feature-group-label" style={{ marginBottom: '6px' }}>
                Target SKU · Noon Egypt
              </span>
              <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#FFFFFF' }}>
                LG C3 55" OLED 4K TV
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  color: '#737373',
                  marginTop: '4px',
                }}
              >
                Hash: 8f4c91a0 · Stock: 4 units
              </div>
            </div>

            {/* Metric 2: Flash Price Drop */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="feature-group-label" style={{ marginBottom: '6px', color: '#3ECF8E' }}>
                  Anomalous Price Drop
                </span>
                <TrendingDown size={14} color="#3ECF8E" />
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#FFFFFF', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                EGP {livePrice.toLocaleString()}{' '}
                <span
                  style={{
                    fontSize: '0.8125rem',
                    color: '#737373',
                    textDecoration: 'line-through',
                    fontWeight: 400,
                  }}
                >
                  EGP {baselinePrice.toLocaleString()}
                </span>
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  color: '#3ECF8E',
                  marginTop: '4px',
                }}
              >
                Net arbitrage savings: EGP 17,501
              </div>
            </div>

            {/* Metric 3: Anomaly Lifespan Countdown */}
            <div>
              <span className="feature-group-label" style={{ marginBottom: '6px' }}>
                Estimated Revert Window
              </span>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: countdown < 5 ? '#EF4444' : '#FFFFFF',
                  letterSpacing: '-0.02em',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                00:{countdown < 10 ? `0${countdown}` : countdown}s
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  color: '#737373',
                  marginTop: '4px',
                }}
              >
                Confidence score: 97.4% (Webhook dispatched)
              </div>
            </div>
          </div>

          {/* Sparkline Canvas Area */}
          <div
            style={{
              background: 'transparent',
              border: 'none',
              padding: '0',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal size={13} color="#3ECF8E" />
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    color: '#FFFFFF',
                    fontWeight: 500,
                  }}
                >
                  Price Adjustment Telemetry · 90-Day Benchmark
                </span>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.625rem',
                  color: '#737373',
                }}
              >
                Sub-3s notification webhook
              </span>
            </div>

            <canvas
              ref={sparklineCanvasRef}
              width={720}
              height={120}
              style={{ width: '100%', height: '110px', display: 'block' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
