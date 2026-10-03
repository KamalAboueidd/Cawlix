import React, { useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function NotFoundPage() {
  const socketRef = useRef(null);
  const pupilRef = useRef(null);

  useEffect(() => {
    const socket = socketRef.current;
    const pupil = pupilRef.current;
    if (!socket || !pupil) return;

    let hasInteracted = false;

    const handleMouseMove = (e) => {
      if (!hasInteracted) {
        hasInteracted = true;
        pupil.style.animation = 'none';
      }

      const rect = socket.getBoundingClientRect();
      const socketCenterX = rect.left + rect.width / 2;
      const socketCenterY = rect.top + rect.height / 2;

      const distX = e.clientX - socketCenterX;
      const distY = e.clientY - socketCenterY;

      const angle = Math.atan2(distY, distX);
      const rawDist = Math.hypot(distX, distY);

      const maxRadius = (rect.width - pupil.offsetWidth) / 2 - 4;
      const clampedDist = Math.min(rawDist * 0.12, maxRadius);

      const dx = Math.cos(angle) * clampedDist;
      const dy = Math.sin(angle) * clampedDist;

      pupil.style.transform = `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px)`;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div style={{ backgroundColor: '#0A0A0A', minHeight: '100vh', color: '#FFFFFF', overflowX: 'hidden' }}>
      <Navbar />

      <main style={{
        minHeight: 'calc(100vh - 60px)',
        backgroundColor: '#0A0A0A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '120px 24px 80px 24px',
        boxSizing: 'border-box',
        overflowX: 'hidden',
      }}>
        <div style={{
          maxWidth: '640px',
          width: '100%',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}>
          
          {/* Interactive 4 - 👁️ - 4 Display Assembly */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            userSelect: 'none',
          }}>
            <span style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontWeight: 700,
              fontSize: 'clamp(5.5rem, 16vw, 9.5rem)',
              lineHeight: 1,
              color: '#3ECF8E',
              letterSpacing: '-0.05em',
              textShadow: '0 0 35px rgba(62, 207, 142, 0.25)',
            }}>
              4
            </span>

            {/* Reactive Ocular Scanner Socket */}
            <div
              ref={socketRef}
              style={{
                position: 'relative',
                width: 'clamp(84px, 14vw, 132px)',
                height: 'clamp(84px, 14vw, 132px)',
                borderRadius: '9999px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                backgroundColor: '#0D0D0D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 32px rgba(0, 0, 0, 0.8), inset 0 0 16px rgba(0, 0, 0, 0.6)',
                overflow: 'hidden',
              }}
            >
              {/* Radar Grid Lines & Concentric Target Rings */}
              <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} viewBox="0 0 128 128" fill="none">
                <circle cx="64" cy="64" r="63" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
                <circle cx="64" cy="64" r="44" stroke="rgba(255, 255, 255, 0.06)" strokeDasharray="3 3" strokeWidth="1" />
                <circle cx="64" cy="64" r="24" stroke="rgba(62, 207, 142, 0.15)" strokeWidth="1" />
                <line x1="64" y1="0" x2="64" y2="128" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="1" />
                <line x1="0" y1="64" x2="128" y2="64" stroke="rgba(255, 255, 255, 0.06)" strokeWidth="1" />
              </svg>

              {/* The Iris & Emerald Pupil Focal Core */}
              <div
                ref={pupilRef}
                style={{
                  position: 'absolute',
                  width: 'clamp(28px, 4.5vw, 38px)',
                  height: 'clamp(28px, 4.5vw, 38px)',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 35% 35%, #3ECF8E 0%, #10B981 60%, #065F46 100%)',
                  boxShadow: '0 0 18px rgba(62, 207, 142, 0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                  willChange: 'transform',
                  transition: 'transform 0.05s ease-out',
                }}
              >
                <div style={{
                  width: '32%',
                  height: '32%',
                  borderRadius: '50%',
                  backgroundColor: '#0A0A0A',
                }} />
              </div>
            </div>

            <span style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontWeight: 700,
              fontSize: 'clamp(5.5rem, 16vw, 9.5rem)',
              lineHeight: 1,
              color: '#3ECF8E',
              letterSpacing: '-0.05em',
              textShadow: '0 0 35px rgba(62, 207, 142, 0.25)',
            }}>
              4
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)',
            fontWeight: 700,
            color: '#FFFFFF',
            letterSpacing: '-0.03em',
            margin: '28px 0 0 0',
            lineHeight: 1.2,
          }}>
            Node Lost in Dark Fiber
          </h1>

          <p style={{
            fontSize: '0.9375rem',
            color: '#737373',
            lineHeight: 1.6,
            maxWidth: '460px',
            margin: '12px 0 0 0',
          }}>
            The SKU, index route, or document pointer you requested could not be tracked by our sensors across the retail grid.
          </p>

          {/* Action Recovery Buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginTop: '24px',
            flexWrap: 'wrap',
          }}>
            <a
              href="/"
              style={{
                backgroundColor: '#3ECF8E',
                color: '#0A0A0A',
                fontWeight: 600,
                fontSize: '0.6875rem',
                padding: '6px 14px',
                borderRadius: '6px',
                textDecoration: 'none',
                lineHeight: 1.4,
                transition: 'background-color 150ms ease-in-out',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#34B27B'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3ECF8E'}
            >
              Return to Terminal
            </a>

            <a
              href="/tracker"
              style={{
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#EDEDED',
                fontWeight: 600,
                fontSize: '0.6875rem',
                padding: '6px 14px',
                borderRadius: '6px',
                textDecoration: 'none',
                lineHeight: 1.4,
                transition: 'background-color 150ms ease-in-out, border-color 150ms ease-in-out',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
              }}
            >
              Open Telemetry Tracker
            </a>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
