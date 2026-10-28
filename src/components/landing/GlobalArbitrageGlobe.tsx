import { useEffect, useRef, useState } from 'react';
import createGlobe from 'cobe';
import { Plane, Radio, CheckCircle2 } from 'lucide-react';

interface CorridorData {
  origin: string;
  code: string;
  coords: [number, number];
  transitTime: string;
  freightRate: string;
  status: string;
}

const CORRIDORS: CorridorData[] = [
  { origin: 'JFK Air Cargo (NY)', code: 'JFK Air Freight', coords: [40.7128, -74.006], transitTime: '3.4d', freightRate: '$18.40/kg', status: 'Active' },
  { origin: 'Wilmington Hub (DE)', code: 'Delaware Port', coords: [39.7391, -75.5398], transitTime: '4.1d', freightRate: '$16.20/kg', status: 'In Transit' },
  { origin: 'LAX Gateway (CA)', code: 'LAX Depot', coords: [34.0522, -118.2437], transitTime: '5.2d', freightRate: '$21.80/kg', status: 'Queued' },
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
      glowColor: [0.03, 0.08, 0.05],
      markers: [
        { location: [40.7128, -74.006], size: 0.06 }, // New York
        { location: [39.7391, -75.5398], size: 0.05 }, // Delaware
        { location: [34.0522, -118.2437], size: 0.05 }, // California
        { location: cairoCoords, size: 0.11 }, // Cairo
      ],
      arcs: [
        { from: [40.7128, -74.006], to: cairoCoords, id: 'jfk-cai' },
        { from: [39.7391, -75.5398], to: cairoCoords, id: 'de-cai' },
        { from: [34.0522, -118.2437], to: cairoCoords, id: 'lax-cai' },
      ],
      arcColor: [0.243, 0.812, 0.557],
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
        background: 'transparent',
        border: 'none',
        borderRadius: 0,
        boxShadow: 'none',
      }}
    >
      {/* Top Status & Controls Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 0',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          background: 'transparent',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 500,
              color: '#FFFFFF',
              letterSpacing: '0.02em',
            }}
          >
            Global Arbitrage Corridors
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
            US to Cairo freight &amp; tariff reconciliation
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.58rem',
              color: '#737373',
            }}
          >
            142ms avg response
          </span>
        </div>
      </div>

      {/* Main 3D Globe Visual Stage */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1 / 1',
          maxHeight: '440px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px 0',
          background: 'transparent',
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
        {/* Subtle WebP Texture Underlay */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        >
          <img
            src="/landing/digital-earth-globe-with-illuminated-city-networks-night.webp"
            alt=""
            width={8736}
            height={4896}
            loading="lazy"
            decoding="async"
            style={{
              width: '100%',
              height: '100%',
              aspectRatio: '16 / 9',
              objectFit: 'cover',
              opacity: 0.12,
              display: 'block',
              WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black 20%, transparent 70%)',
              maskImage: 'radial-gradient(circle at 50% 50%, black 20%, transparent 70%)',
            }}
          />
        </div>

        {/* The Cobe 3D Canvas */}
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            maxWidth: '420px',
            maxHeight: '420px',
            aspectRatio: '1',
            cursor: 'grab',
            display: 'block',
            position: 'relative',
            zIndex: 1,
          }}
        />
      </div>

      {/* Corridor Selector Rail - Zero-Box Borderless Surface */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          padding: '14px 0',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
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
                background: isSelected ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                border: 'none',
                borderBottom: isSelected ? '2px solid #3ECF8E' : '2px solid transparent',
                padding: '10px 12px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 120ms ease',
                outline: 'none',
              }}
            >
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
                <span>Transit: <strong style={{ color: '#D4D4D4', fontWeight: 500 }}>{corridor.transitTime}</strong></span>
                <span>Freight: <strong style={{ color: '#D4D4D4', fontWeight: 500 }}>{corridor.freightRate}</strong></span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Corridor Benchmark Specs Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 0',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.6875rem',
          color: '#737373',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plane size={13} color="#3ECF8E" />
          <span>Active Route: {active.origin} &rarr; Cairo Terminal 2</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>Benchmark FX: <strong style={{ color: '#FFFFFF', fontWeight: 500 }}>1 USD = {liveFxFee} EGP</strong></span>
          <span>Tariff Code: <strong style={{ color: '#3ECF8E', fontWeight: 500 }}>8517.13 (0% Tariff + 14% VAT)</strong></span>
        </div>
      </div>
    </div>
  );
}
