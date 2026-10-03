import { useEffect, useRef, useState } from 'react';
import { ShieldAlert, Crosshair, Radar as RadarIcon, CheckCircle2 } from 'lucide-react';

interface RadarTarget {
  id: string;
  sku: string;
  angle: number; // in radians
  distance: number; // 0 to 1
  isAnomaly: boolean;
  store: string;
  basePrice: string;
  fakeMSRP: string;
  ghostMarkup: string;
  lastScanned: number;
}

const TARGETS: RadarTarget[] = [
  { id: 'T1', sku: 'IPHONE-16-PRO-256G', angle: 0.75, distance: 0.72, isAnomaly: true, store: 'B.TECH', basePrice: 'EGP 61,000', fakeMSRP: 'EGP 74,999', ghostMarkup: '+22.9%', lastScanned: 0 },
  { id: 'T2', sku: 'MBP-M3-PRO-18G-512G', angle: 2.1, distance: 0.58, isAnomaly: false, store: 'Tradeline', basePrice: 'EGP 98,500', fakeMSRP: 'EGP 102,000', ghostMarkup: 'AUTHENTIC', lastScanned: 0 },
  { id: 'T3', sku: 'SONY-WH-1000XM5', angle: 3.4, distance: 0.42, isAnomaly: true, store: 'Dream 2000', basePrice: 'EGP 16,200', fakeMSRP: 'EGP 21,500', ghostMarkup: '+32.7%', lastScanned: 0 },
  { id: 'T4', sku: 'DELL-XPS-15-OLED', angle: 4.8, distance: 0.81, isAnomaly: false, store: '2B Egypt', basePrice: 'EGP 84,000', fakeMSRP: 'EGP 85,200', ghostMarkup: 'AUTHENTIC', lastScanned: 0 },
  { id: 'T5', sku: 'SAMSUNG-S24-ULTRA', angle: 5.6, distance: 0.64, isAnomaly: true, store: 'Noon EG', basePrice: 'EGP 52,999', fakeMSRP: 'EGP 64,000', ghostMarkup: '+20.7%', lastScanned: 0 },
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
      const ringLabels = ['30D', '60D', '90D_BUFFER'];
      [0.33, 0.66, 1.0].forEach((ratio, idx) => {
        ctx.beginPath();
        ctx.arc(cx, cy, radius * ratio, 0, Math.PI * 2);
        ctx.strokeStyle = idx === 2 ? 'rgba(62, 207, 142, 0.25)' : 'rgba(255, 255, 255, 0.06)';
        ctx.lineWidth = 1;
        ctx.setLineDash(idx === 2 ? [] : [4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label
        ctx.font = '10px Geist Mono, JetBrains Mono, monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillText(ringLabels[idx], cx + 6, cy - radius * ratio + 12);
      });

      // Crosshairs
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.moveTo(cx, cy - radius);
      ctx.lineTo(cx, cy + radius);
      ctx.moveTo(cx - radius, cy);
      ctx.lineTo(cx + radius, cy);
      ctx.stroke();

      // Rotating Radar Beam with gradient trail
      const sweepAngle = 0.5; // arc trail length
      const gradient = ctx.createConicGradient(angle - Math.PI / 2, cx, cy);
      gradient.addColorStop(0, 'rgba(62, 207, 142, 0.35)');
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
      ctx.shadowColor = '#3ECF8E';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Plot and update targets
      TARGETS.forEach((t) => {
        const tx = cx + Math.cos(t.angle) * (t.distance * radius);
        const ty = cy + Math.sin(t.angle) * (t.distance * radius);

        // Check if radar sweep just passed target
        const diff = Math.abs((angle % (Math.PI * 2)) - (t.angle % (Math.PI * 2)));
        const isSwept = diff < 0.15;
        if (isSwept) {
          t.lastScanned = Date.now();
        }

        const timeSinceScan = Date.now() - t.lastScanned;
        const opacity = Math.max(0.2, 1 - timeSinceScan / 2500);

        ctx.beginPath();
        ctx.arc(tx, ty, t.isAnomaly ? 6 : 4, 0, Math.PI * 2);
        ctx.fillStyle = t.isAnomaly ? `rgba(239, 68, 68, ${opacity})` : `rgba(62, 207, 142, ${opacity})`;
        ctx.shadowColor = t.isAnomaly ? '#EF4444' : '#3ECF8E';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Target bounding indicator
        if (t.isAnomaly) {
          ctx.strokeStyle = `rgba(239, 68, 68, ${opacity * 0.7})`;
          ctx.strokeRect(tx - 10, ty - 10, 20, 20);
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
        background: '#0B0B0B',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        overflow: 'hidden',
        boxShadow: '0 20px 48px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          background: 'rgba(255, 255, 255, 0.015)',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <RadarIcon size={14} color="#3ECF8E" />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#FFFFFF',
              letterSpacing: '0.04em',
            }}
          >
            90-DAY_HISTORICAL_RADAR_CORE
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              color: '#737373',
              borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
              paddingLeft: '10px',
            }}
          >
            SYNTHETIC MARKUP DETECTOR
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem' }}>
          <span style={{ color: '#737373' }}>AZIMUTH: <span style={{ color: '#3ECF8E' }}>{azimuthDeg}°</span></span>
          <span style={{ color: '#737373' }}>RANGE: <span style={{ color: '#FFFFFF' }}>90_DAYS</span></span>
        </div>
      </div>

      {/* Main Grid: Radar Canvas + Target Intercept Breakdown */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1px',
          background: 'rgba(255, 255, 255, 0.06)',
        }}
      >
        {/* Radar Screen */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '1 / 1',
            maxHeight: '380px',
            background: '#070707',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <canvas
            ref={canvasRef}
            style={{ width: '100%', height: '100%', maxWidth: '340px', maxHeight: '340px', display: 'block' }}
          />

          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '16px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.625rem',
              color: '#737373',
              background: 'rgba(10, 10, 10, 0.8)',
              padding: '3px 8px',
              borderRadius: '4px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            SCANNER: CONTINUOUS 90D POLLING MESH
          </div>
        </div>

        {/* Live Detected Targets Intercept List */}
        <div style={{ background: '#0D0D0D', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="feature-group-label" style={{ marginBottom: 0 }}>
              // INTERCEPTED_SKU_NODES
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.625rem',
                color: '#EF4444',
                background: 'rgba(239, 68, 68, 0.1)',
                padding: '2px 8px',
                borderRadius: '4px',
                border: '1px solid rgba(239, 68, 68, 0.25)',
              }}
            >
              3 SYNTHETIC SPIKES ACTIVE
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {TARGETS.map((t) => {
              const isSelected = t.id === activeTarget.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setActiveTarget(t)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: isSelected ? 'rgba(255, 255, 255, 0.04)' : '#111111',
                    border: isSelected
                      ? t.isAnomaly
                        ? '1px solid rgba(239, 68, 68, 0.4)'
                        : '1px solid rgba(62, 207, 142, 0.4)'
                      : '1px solid rgba(255, 255, 255, 0.06)',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {t.isAnomaly ? (
                        <ShieldAlert size={14} color="#EF4444" />
                      ) : (
                        <CheckCircle2 size={14} color="#3ECF8E" />
                      )}
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#FFFFFF', fontWeight: 600 }}>
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
                      marginTop: '6px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.6875rem',
                      color: '#737373',
                    }}
                  >
                    <span>Store: <strong style={{ color: '#D4D4D4' }}>{t.store}</strong></span>
                    <span>
                      True Baseline: <strong style={{ color: '#3ECF8E' }}>{t.basePrice}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Anomaly Diagnostic Inspection */}
          <div
            style={{
              marginTop: 'auto',
              background: activeTarget.isAnomaly ? 'rgba(239, 68, 68, 0.05)' : 'rgba(62, 207, 142, 0.05)',
              border: activeTarget.isAnomaly ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(62, 207, 142, 0.2)',
              borderRadius: '8px',
              padding: '12px 14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Crosshair size={14} color={activeTarget.isAnomaly ? '#EF4444' : '#3ECF8E'} />
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: activeTarget.isAnomaly ? '#EF4444' : '#3ECF8E',
                }}
              >
                {activeTarget.isAnomaly ? 'DIAGNOSTIC: PRE-SALE INFLATION INTERCEPTED' : 'DIAGNOSTIC: AUTHENTIC PRICE CURVE'}
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#A3A3A3', lineHeight: 1.45, margin: 0 }}>
              {activeTarget.isAnomaly
                ? `Retailer artificially hiked price to ${activeTarget.fakeMSRP} 4 days before markdown campaign. Cawlix forces true baseline of ${activeTarget.basePrice}. Authenticity score: 28/100 (FLAGGED).`
                : `Pricing history verified across 90-day time-series window. Authenticity score: 99/100 (CONFIRMED).`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
