import { useEffect, useRef, useState } from 'react';
import { ShieldAlert, Crosshair, Radar as RadarIcon, CheckCircle2 } from 'lucide-react';

interface RadarTarget {
  id: string;
  sku: string;
  angle: number;
  distance: number;
  isAnomaly: boolean;
  store: string;
  basePrice: string;
  fakeMSRP: string;
  ghostMarkup: string;
  lastScanned: number;
}

const TARGETS: RadarTarget[] = [
  { id: 'T1', sku: 'iPhone 16 Pro 256GB', angle: 0.75, distance: 0.72, isAnomaly: true, store: 'B.TECH', basePrice: 'EGP 61,000', fakeMSRP: 'EGP 74,999', ghostMarkup: '+22.9%', lastScanned: 0 },
  { id: 'T2', sku: 'MacBook Pro 14" M3', angle: 2.1, distance: 0.58, isAnomaly: false, store: 'Tradeline', basePrice: 'EGP 98,500', fakeMSRP: 'EGP 102,000', ghostMarkup: 'Authentic', lastScanned: 0 },
  { id: 'T3', sku: 'Sony WH-1000XM5', angle: 3.4, distance: 0.42, isAnomaly: true, store: 'Dream 2000', basePrice: 'EGP 16,200', fakeMSRP: 'EGP 21,500', ghostMarkup: '+32.7%', lastScanned: 0 },
  { id: 'T4', sku: 'Dell XPS 15 OLED', angle: 4.8, distance: 0.81, isAnomaly: false, store: '2B Egypt', basePrice: 'EGP 84,000', fakeMSRP: 'EGP 85,200', ghostMarkup: 'Authentic', lastScanned: 0 },
  { id: 'T5', sku: 'Samsung Galaxy S24 Ultra', angle: 5.6, distance: 0.64, isAnomaly: true, store: 'Noon Egypt', basePrice: 'EGP 52,999', fakeMSRP: 'EGP 64,000', ghostMarkup: '+20.7%', lastScanned: 0 },
];

export default function RadarScanCore() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeTarget, setActiveTarget] = useState<RadarTarget>(TARGETS[0]);
  const [azimuthDeg, setAzimuthDeg] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angle = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', resize);
    resize();

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(cx, cy) - 16;

      ctx.clearRect(0, 0, w, h);

      // Radar Concentric Circles (30d, 60d, 90d buffers)
      const ringLabels = ['30d', '60d', '90d baseline'];
      [0.33, 0.66, 1.0].forEach((ratio, idx) => {
        ctx.beginPath();
        ctx.arc(cx, cy, radius * ratio, 0, Math.PI * 2);
        ctx.strokeStyle = idx === 2 ? 'rgba(62, 207, 142, 0.25)' : 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        ctx.setLineDash(idx === 2 ? [] : [4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Clean label
        ctx.font = '10px Geist Mono, monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.fillText(ringLabels[idx], cx + 6, cy - radius * ratio + 12);
      });

      // Crosshairs
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.moveTo(cx, cy - radius);
      ctx.lineTo(cx, cy + radius);
      ctx.moveTo(cx - radius, cy);
      ctx.lineTo(cx + radius, cy);
      ctx.stroke();

      // Rotating Radar Beam with gradient trail (no blurry drop-shadow glow)
      const gradient = ctx.createConicGradient(angle - Math.PI / 2, cx, cy);
      gradient.addColorStop(0, 'rgba(62, 207, 142, 0.25)');
      gradient.addColorStop(0.12, 'rgba(62, 207, 142, 0.0)');
      gradient.addColorStop(1, 'rgba(62, 207, 142, 0.0)');

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Sharp sweep leading line
      const lx = cx + Math.cos(angle) * radius;
      const ly = cy + Math.sin(angle) * radius;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(lx, ly);
      ctx.strokeStyle = '#3ECF8E';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Plot targets cleanly without drop-shadow glow
      TARGETS.forEach((t) => {
        const tx = cx + Math.cos(t.angle) * (t.distance * radius);
        const ty = cy + Math.sin(t.angle) * (t.distance * radius);

        const diff = Math.abs((angle % (Math.PI * 2)) - (t.angle % (Math.PI * 2)));
        const isSwept = diff < 0.15;
        if (isSwept) {
          t.lastScanned = Date.now();
        }

        const timeSinceScan = Date.now() - t.lastScanned;
        const opacity = Math.max(0.2, 1 - timeSinceScan / 2500);

        ctx.beginPath();
        ctx.arc(tx, ty, t.isAnomaly ? 5 : 3.5, 0, Math.PI * 2);
        ctx.fillStyle = t.isAnomaly ? `rgba(239, 68, 68, ${opacity})` : `rgba(62, 207, 142, ${opacity})`;
        ctx.fill();

        if (t.isAnomaly) {
          ctx.strokeStyle = `rgba(239, 68, 68, ${opacity * 0.6})`;
          ctx.strokeRect(tx - 8, ty - 8, 16, 16);
        }
      });

      angle += 0.024;
      if (angle >= Math.PI * 2) angle = 0;

      setAzimuthDeg(Math.round((angle * 180) / Math.PI));
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div
      style={{
        background: 'transparent',
        borderRadius: 0,
        border: 'none',
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
          background: 'transparent',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RadarIcon size={14} color="#3ECF8E" />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 500,
              color: '#FFFFFF',
              letterSpacing: '0.02em',
            }}
          >
            90-Day Historical Radar Core
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              color: '#737373',
              borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
              paddingLeft: '8px',
            }}
          >
            Synthetic markup detector
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem' }}>
          <span style={{ color: '#737373' }}>Azimuth: <strong style={{ color: '#3ECF8E', fontWeight: 500 }}>{azimuthDeg}°</strong></span>
          <span style={{ color: '#737373' }}>Range: <strong style={{ color: '#FFFFFF', fontWeight: 500 }}>90 days</strong></span>
          <span style={{ color: '#737373' }}>142ms avg response</span>
        </div>
      </div>

      {/* Main Grid: Borderless Canvas + Target Intercept Breakdown */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          background: 'transparent',
          padding: '16px 0',
        }}
      >
        {/* Radar Screen on canvas background */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '1 / 1',
            maxHeight: '360px',
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <canvas
            ref={canvasRef}
            style={{ width: '100%', height: '100%', maxWidth: '340px', maxHeight: '340px', display: 'block' }}
          />

          <div
            style={{
              position: 'absolute',
              bottom: '4px',
              left: '0',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.625rem',
              color: '#737373',
            }}
          >
            Continuous 90-day polling mesh
          </div>
        </div>

        {/* Live Detected Targets Intercept List */}
        <div style={{ background: 'transparent', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '8px' }}>
            <span className="feature-group-label" style={{ marginBottom: 0 }}>
              Intercepted SKU Nodes
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                color: '#EF4444',
                fontWeight: 500,
              }}
            >
              3 synthetic spikes active
            </span>
          </div>

          {/* Borderless targets list directly on screen surface */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {TARGETS.map((t) => {
              const isSelected = t.id === activeTarget.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setActiveTarget(t)}
                  style={{
                    padding: '8px 0',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    background: 'transparent',
                    cursor: 'pointer',
                    transition: 'opacity 120ms ease',
                    opacity: isSelected ? 1 : 0.75,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {t.isAnomaly ? (
                        <ShieldAlert size={13} color="#EF4444" />
                      ) : (
                        <CheckCircle2 size={13} color="#3ECF8E" />
                      )}
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: isSelected ? '#FFFFFF' : '#D4D4D4', fontWeight: isSelected ? 600 : 400 }}>
                        {t.sku}
                      </span>
                    </div>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        color: t.isAnomaly ? '#EF4444' : '#3ECF8E',
                      }}
                    >
                      {t.ghostMarkup}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: '4px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6875rem',
                      color: '#737373',
                    }}
                  >
                    <span>Store: <strong style={{ color: '#A3A3A3', fontWeight: 400 }}>{t.store}</strong></span>
                    <span>
                      True Baseline: <strong style={{ color: '#3ECF8E', fontWeight: 500 }}>{t.basePrice}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Anomaly Diagnostic Inspection - Borderless Typographic Note */}
          <div
            style={{
              marginTop: '8px',
              paddingTop: '10px',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <Crosshair size={13} color={activeTarget.isAnomaly ? '#EF4444' : '#3ECF8E'} />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: activeTarget.isAnomaly ? '#EF4444' : '#3ECF8E',
                }}
              >
                {activeTarget.isAnomaly ? 'Diagnostic: Pre-sale inflation intercepted' : 'Diagnostic: Authentic price curve'}
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#888888', lineHeight: 1.5, margin: 0 }}>
              {activeTarget.isAnomaly
                ? `Retailer artificially hiked price to ${activeTarget.fakeMSRP} 4 days before markdown campaign. Cawlix forces true baseline of ${activeTarget.basePrice}. Authenticity score: 28/100.`
                : `Pricing history verified across 90-day time-series window. Authenticity score: 99/100.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
