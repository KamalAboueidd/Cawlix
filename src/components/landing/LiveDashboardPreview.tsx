import { useEffect, useRef, useState } from 'react';
import { ShieldCheck, AlertTriangle, TrendingDown, ArrowDownRight, RefreshCw, Terminal } from 'lucide-react';

export default function LiveDashboardPreview() {
  const sparklineCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [badgeState, setBadgeState] = useState<'SYNCING' | 'GLITCH_DETECTED'>('GLITCH_DETECTED');
  const [countdown, setCountdown] = useState(14.8);
  const [livePrice, setLivePrice] = useState(24499);
  const [baselinePrice] = useState(42000);

  // Sparkline drawing loop
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
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      [0.25, 0.5, 0.75].forEach((ratio) => {
        ctx.beginPath();
        ctx.moveTo(0, h * ratio);
        ctx.lineTo(w, h * ratio);
        ctx.stroke();
      });

      // Gradient Fill under curve
      const gradient = ctx.createLinearGradient(0, 0, 0, h);
      gradient.addColorStop(0, 'rgba(62, 207, 142, 0.25)');
      gradient.addColorStop(1, 'rgba(62, 207, 142, 0.0)');

      ctx.beginPath();
      dataPoints.forEach((val, i) => {
        const x = i * stepX;
        let y = h - ((val - min) / (max - min)) * (h - 20) - 10;
        // animate the drop for the last point
        if (i === dataPoints.length - 1) {
          const wobble = Math.sin(t * 0.05) * 4;
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

      // Line path
      ctx.beginPath();
      dataPoints.forEach((val, i) => {
        const x = i * stepX;
        let y = h - ((val - min) / (max - min)) * (h - 20) - 10;
        if (i === dataPoints.length - 1) {
          y += Math.sin(t * 0.05) * 4;
        }
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = '#3ECF8E';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#3ECF8E';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Drop point marker
      const lastX = (dataPoints.length - 1) * stepX;
      const lastY = h - ((dataPoints[dataPoints.length - 1] - min) / (max - min)) * (h - 20) - 10 + Math.sin(t * 0.05) * 4;
      ctx.beginPath();
      ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#EF4444';
      ctx.shadowColor = '#EF4444';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;

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
        perspective: '1200px',
        padding: '24px 0',
      }}
    >
      {/* 3D Perspective Angled Stage */}
      <div
        style={{
          transform: 'rotateX(10deg) rotateY(-4deg) rotateZ(0.5deg)',
          transformStyle: 'preserve-3d',
          transition: 'transform 300ms ease',
          background: '#0B0B0B',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.95), 0 0 40px rgba(62, 207, 142, 0.06)',
          overflow: 'hidden',
        }}
      >
        {/* Terminal Title Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 18px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EAB308', display: 'inline-block' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3ECF8E', display: 'inline-block' }} />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                color: '#737373',
                marginLeft: '10px',
              }}
            >
              CAWLIX_CORE_TELEMETRY // DISPATCH_ENGINE_v4
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {badgeState === 'GLITCH_DETECTED' ? (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: '#EF4444',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <AlertTriangle size={12} color="#EF4444" />
                GLITCH_DETECTED (-41.7%)
              </span>
            ) : (
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: '#3ECF8E',
                  background: 'rgba(62, 207, 142, 0.12)',
                  border: '1px solid rgba(62, 207, 142, 0.3)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <RefreshCw size={12} color="#3ECF8E" className="animate-spin" />
                SYNCING_12_NODES...
              </span>
            )}
          </div>
        </div>

        {/* Dashboard Body Grid */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Top Metric Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
            }}
          >
            {/* Card 1: Deal Target */}
            <div
              style={{
                background: '#121212',
                borderRadius: '10px',
                padding: '14px 16px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <span className="feature-group-label" style={{ marginBottom: '6px' }}>
                TARGET_SKU // NOON_EG
              </span>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FFFFFF' }}>
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
                HASH: 8f4c91a0 · STOCK: 4 UNITS
              </div>
            </div>

            {/* Card 2: Flash Price Drop */}
            <div
              style={{
                background: 'rgba(62, 207, 142, 0.04)',
                borderRadius: '10px',
                padding: '14px 16px',
                border: '1px solid rgba(62, 207, 142, 0.2)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="feature-group-label" style={{ marginBottom: '6px', color: '#3ECF8E' }}>
                  ANOMALOUS_PRICE
                </span>
                <TrendingDown size={14} color="#3ECF8E" />
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
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
                NET ARBITRAGE SAVINGS: EGP 17,501
              </div>
            </div>

            {/* Card 3: Anomaly Lifespan Countdown */}
            <div
              style={{
                background: '#121212',
                borderRadius: '10px',
                padding: '14px 16px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <span className="feature-group-label" style={{ marginBottom: '6px' }}>
                RETAILER_REVERT_ESTIMATE
              </span>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: countdown < 5 ? '#EF4444' : '#FFFFFF',
                  letterSpacing: '-0.02em',
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
                CONFIDENCE SCORE: 97.4% (WEBHOOK DISPATCHED)
              </div>
            </div>
          </div>

          {/* Sparkline Canvas Area */}
          <div
            style={{
              background: '#0D0D0D',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              padding: '16px',
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
                    fontWeight: 600,
                  }}
                >
                  LIVE_PRICE_ADJUSTMENT_TELEMETRY (90-DAY_HISTORICAL_VS_CURRENT)
                </span>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.625rem',
                  color: '#3ECF8E',
                }}
              >
                PROBE LATENCY: 142MS
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
