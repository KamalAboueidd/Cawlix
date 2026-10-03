import { useEffect, useRef, useState } from 'react';
import createGlobe from 'cobe';
import { Plane, Radio, ShieldCheck, ArrowUpRight } from 'lucide-react';

interface CorridorData {
  origin: string;
  code: string;
  coords: [number, number];
  transitTime: string;
  freightRate: string;
  status: string;
}

const CORRIDORS: CorridorData[] = [
  { origin: 'JFK Air Cargo (NY)', code: 'JFK_AIR_FREIGHT', coords: [40.7128, -74.006], transitTime: '3.4d', freightRate: '$18.40/kg', status: 'DISPATCHING' },
  { origin: 'Wilmington Hub (DE)', code: 'DE_TAXFREE_PORT', coords: [39.7391, -75.5398], transitTime: '4.1d', freightRate: '$16.20/kg', status: 'IN_TRANSIT' },
  { origin: 'LAX Gateway (CA)', code: 'LAX_PACIFIC_DEPOT', coords: [34.0522, -118.2437], transitTime: '5.2d', freightRate: '$21.80/kg', status: 'QUEUED' },
];

export default function GlobalArbitrageGlobe() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const [activeCorridorIndex, setActiveCorridorIndex] = useState(0);
  const [liveFxFee, setLiveFxFee] = useState(50.48);

  useEffect(() => {
    const fxInterval = setInterval(() => {
      setLiveFxFee((prev) => +(prev + (Math.random() * 0.08 - 0.04)).toFixed(2));
    }, 2800);
    return () => clearInterval(fxInterval);
  }, []);

  useEffect(() => {
    let phi = 1.4;
    let width = 0;
    let animId: number;
    const currentCanvas = canvasRef.current;
    if (!currentCanvas) return;

    const onResize = () => {
      if (currentCanvas) {
        width = currentCanvas.offsetWidth;
      }
    };
    window.addEventListener('resize', onResize);
    onResize();

    const cairoCoords: [number, number] = [30.0444, 31.2357];

    const globe = createGlobe(currentCanvas, {
      devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      width: width * 2 || 600,
      height: width * 2 || 600,
      phi: 1.4,
      theta: 0.28,
      dark: 1,
      diffuse: 1.25,
      mapSamples: 16000,
      mapBrightness: 5.5,
      baseColor: [0.08, 0.08, 0.08],
      markerColor: [0.243, 0.812, 0.557], // #3ECF8E
      glowColor: [0.03, 0.12, 0.08],
      markers: [
        { location: [40.7128, -74.006], size: 0.06 }, // New York
        { location: [39.7391, -75.5398], size: 0.05 }, // Delaware
        { location: [34.0522, -118.2437], size: 0.05 }, // California
        { location: cairoCoords, size: 0.11 }, // Cairo (Terminal 2)
      ],
      arcs: [
        { from: [40.7128, -74.006], to: cairoCoords, id: 'jfk-cai' },
        { from: [39.7391, -75.5398], to: cairoCoords, id: 'de-cai' },
        { from: [34.0522, -118.2437], to: cairoCoords, id: 'lax-cai' },
      ],
      arcColor: [0.243, 0.812, 0.557], // #3ECF8E glowing laser arcs
      arcWidth: 1.2,
      arcHeight: 0.35,
    });

    const animate = () => {
      if (!pointerInteracting.current) {
        phi += 0.0035;
      }
      globe.update({
        phi: phi + pointerInteractionMovement.current,
        width: width * 2 || 600,
        height: width * 2 || 600,
      });
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      globe.destroy();
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const active = CORRIDORS[activeCorridorIndex];

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        background: '#0B0B0B',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        overflow: 'hidden',
        boxShadow: '0 20px 48px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      }}
    >
      {/* Top Telemetry Header Bar */}
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
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#3ECF8E',
              boxShadow: '0 0 10px #3ECF8E',
              display: 'inline-block',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#FFFFFF',
              letterSpacing: '0.04em',
            }}
          >
            GLOBAL_ARBITRAGE_CORRIDORS
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
            WEBGL WIREFRAME MATRIX
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              padding: '3px 8px',
              borderRadius: '4px',
              background: 'rgba(62, 207, 142, 0.1)',
              color: '#3ECF8E',
              border: '1px solid rgba(62, 207, 142, 0.2)',
            }}
          >
            LIVE RECONCILIATION: ACTIVE
          </span>
        </div>
      </div>

      {/* Main 3D Globe Visual Stage */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1 / 1',
          maxHeight: '480px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }}
        onPointerDown={(e) => {
          pointerInteracting.current = e.clientX - pointerInteractionMovement.current;
        }}
        onPointerUp={() => {
          pointerInteracting.current = null;
        }}
        onPointerOut={() => {
          pointerInteracting.current = null;
        }}
        onMouseMove={(e) => {
          if (pointerInteracting.current !== null) {
            const delta = e.clientX - pointerInteracting.current;
            pointerInteractionMovement.current = delta * 0.005;
          }
        }}
      >
        {/* Radar Ambient Radial Grid */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at 50% 50%, rgba(62, 207, 142, 0.05) 0%, transparent 65%)',
            pointerEvents: 'none',
          }}
        />

        {/* The Cobe 3D Canvas */}
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            maxWidth: '460px',
            maxHeight: '460px',
            aspectRatio: '1',
            cursor: 'grab',
            display: 'block',
          }}
        />

        {/* Floating Telemetry Badge 1: Top Left Corridor Status */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: 'rgba(10, 10, 10, 0.88)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.09)',
            borderRadius: '10px',
            padding: '12px 14px',
            maxWidth: '300px',
            pointerEvents: 'none',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Plane size={13} color="#3ECF8E" />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                color: '#3ECF8E',
                letterSpacing: '0.04em',
                fontWeight: 600,
              }}
            >
              JFK_AIR_FREIGHT -&gt; CAI_TERMINAL_2
            </span>
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              color: '#A3A3A3',
              lineHeight: 1.4,
            }}
          >
            [TRANSIT_CALCULATED] · 3.4d direct air freight
            <br />
            <span style={{ color: '#FFFFFF' }}>Statutory Customs: 8517.13 (0% Tariff + 14% VAT)</span>
          </div>
        </div>

        {/* Floating Telemetry Badge 2: Bottom Right FX Matrix */}
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            background: 'rgba(10, 10, 10, 0.88)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.09)',
            borderRadius: '10px',
            padding: '12px 14px',
            maxWidth: '280px',
            pointerEvents: 'none',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Radio size={12} color="#3ECF8E" />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                color: '#3ECF8E',
                letterSpacing: '0.04em',
                fontWeight: 600,
              }}
            >
              LIVE FX CORRIDOR
            </span>
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: '#FFFFFF',
              fontWeight: 500,
            }}
          >
            1 USD = {liveFxFee} EGP
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.625rem',
              color: '#737373',
              marginTop: '2px',
            }}
          >
            REAL-TIME RECONCILIATION · CIB COMMERCIAL SPREAD
          </div>
        </div>

        {/* Floating Telemetry Badge 3: Cairo Destination Anchor */}
        <div
          style={{
            position: 'absolute',
            top: '46%',
            right: '28%',
            transform: 'translate(50%, -50%)',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(62, 207, 142, 0.12)',
            border: '1px solid rgba(62, 207, 142, 0.4)',
            padding: '4px 8px',
            borderRadius: '6px',
            backdropFilter: 'blur(8px)',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#3ECF8E',
              boxShadow: '0 0 8px #3ECF8E',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.625rem',
              color: '#FFFFFF',
              letterSpacing: '0.03em',
            }}
          >
            CAI [30.04°N, 31.23°E]
          </span>
        </div>
      </div>

      {/* Corridor Selector Rail */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1px',
          background: 'rgba(255, 255, 255, 0.06)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {CORRIDORS.map((corridor, idx) => {
          const isSelected = idx === activeCorridorIndex;
          return (
            <button
              key={corridor.code}
              type="button"
              onClick={() => setActiveCorridorIndex(idx)}
              style={{
                background: isSelected ? 'rgba(62, 207, 142, 0.05)' : '#0E0E0E',
                border: 'none',
                padding: '14px 18px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                outline: 'none',
                position: 'relative',
              }}
            >
              {isSelected && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    backgroundColor: '#3ECF8E',
                  }}
                />
              )}
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  color: isSelected ? '#3ECF8E' : '#737373',
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>{corridor.code}</span>
                <span style={{ fontSize: '0.625rem', color: isSelected ? '#3ECF8E' : '#555555' }}>
                  {corridor.status}
                </span>
              </div>
              <div
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  color: isSelected ? '#FFFFFF' : '#A3A3A3',
                }}
              >
                {corridor.origin}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  color: '#737373',
                  marginTop: '4px',
                  display: 'flex',
                  gap: '12px',
                }}
              >
                <span>Transit: {corridor.transitTime}</span>
                <span>Freight: {corridor.freightRate}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
