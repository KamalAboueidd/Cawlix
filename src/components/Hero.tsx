import React from 'react';
import { ArrowRight } from 'lucide-react';
import ShowcaseConsole from './ShowcaseConsole';

const TICKER_ITEMS = [
  { value: '12', label: 'RETAILERS INDEXED' },
  { value: '90-DAY', label: 'PRICE VELOCITY' },
  { value: '<180MS', label: 'PROBE LATENCY' },
  { value: '0%', label: 'GHOST DEAL TOLERANCE', highlight: true },
];

export default function Hero() {
  return (
    <section
      dir="ltr"
      className="page-container hero-section-root"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '110px',
        paddingBottom: '60px',
        position: 'relative',
        background: '#0A0A0A',
        overflowX: 'hidden',
        maxWidth: '100vw',
      }}
    >
      {/* Visual 1: Primary Hero Graphic with subtle radial fade mask */}
      <div
        aria-hidden="true"
        className="hero-globe-graphic"
        style={{
          position: 'absolute',
          top: '60px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '1240px',
          height: 'auto',
          aspectRatio: '1672 / 941',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.28,
          mixBlendMode: 'screen',
          WebkitMaskImage: 'radial-gradient(circle at 50% 48%, black 35%, rgba(0, 0, 0, 0.3) 65%, transparent 85%)',
          maskImage: 'radial-gradient(circle at 50% 48%, black 35%, rgba(0, 0, 0, 0.3) 65%, transparent 85%)',
        }}
      >
        <img
          src="/landing/1.webp"
          alt="Cawlix Institutional Telemetry Infrastructure"
          width={1672}
          height={941}
          loading="eager"
          // @ts-ignore
          fetchPriority="high"
          style={{
            width: '100%',
            height: 'auto',
            aspectRatio: '1672 / 941',
            objectFit: 'cover',
            display: 'block',
            mixBlendMode: 'screen',
          }}
        />
      </div>

      {/* Ultra-subtle ambient radial mask */}
      <div
        aria-hidden
        className="hero-ambient-glow"
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '1000px',
          maxWidth: '100vw',
          height: '520px',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(62, 207, 142, 0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Hero First Fold (takes full 100dvh on mobile) */}
      <div
        className="hero-first-fold"
        style={{
          maxWidth: '1040px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
        }}
      >
        {/* Central Content Cluster: Title + Subtitle + Compact Actions */}
        <div className="hero-content-cluster">
          {/* Confident, Razor-Sharp Headline with Vercel Multi-tone Narrative Contrast */}
          <h1
            className="text-display hero-title-responsive"
            style={{
              maxWidth: '920px',
              margin: '0 auto',
            }}
          >
            <span style={{ color: '#FFFFFF', fontWeight: 500 }}>Institutional Price Intelligence. </span>
            <span className="text-contrast-tail">Engineered for absolute accuracy.</span>
          </h1>

          {/* Concise 2-line Subtitle */}
          <p
            className="hero-sub-responsive"
            style={{
              fontSize: '1rem',
              color: '#888888',
              lineHeight: 1.6,
              maxWidth: '660px',
              margin: '0 auto',
              letterSpacing: '-0.01em',
            }}
          >
            Stop paying ghost-inflated prices. Cawlix computes deterministic out-of-pocket costs
            across 12 Egyptian retailers and direct US import corridors in real-time.
          </p>

          {/* Action Area: High-Conviction Side-by-Side Sleek Compact Buttons */}
          <div className="hero-actions-wrapper">
            <a
              href="#showcase"
              className="hero-action-btn hero-btn-primary"
            >
              <span>Launch Tracker</span>
              <ArrowRight size={12} strokeWidth={2.2} />
            </a>
            <a
              href="#engines"
              className="hero-action-btn hero-btn-secondary"
            >
              <span>Docs</span>
            </a>
          </div>
        </div>

        {/* Borderless Horizontal Telemetry Ticker (Marquee on mobile, static centered on desktop) */}
        <div className="ticker-wrapper">
          <div className="ticker-track">
            {/* Primary group */}
            <div className="ticker-group">
              {TICKER_ITEMS.map((item, idx) => (
                <React.Fragment key={`ticker-1-${idx}`}>
                  <div className="ticker-item">
                    <span style={{ color: item.highlight ? '#3ECF8E' : '#FFFFFF', fontWeight: 600 }}>
                      {item.value}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  <span className="ticker-dot">·</span>
                </React.Fragment>
              ))}
            </div>

            {/* Seamless duplicate group for continuous looping marquee on mobile */}
            <div className="ticker-group ticker-group-duplicate" aria-hidden="true">
              {TICKER_ITEMS.map((item, idx) => (
                <React.Fragment key={`ticker-2-${idx}`}>
                  <div className="ticker-item">
                    <span style={{ color: item.highlight ? '#3ECF8E' : '#FFFFFF', fontWeight: 600 }}>
                      {item.value}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  <span className="ticker-dot">·</span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Institutional Feature Showcase Header */}
      <div style={{ width: '100%', marginTop: '36px', textAlign: 'center' }}>
        <span className="feature-group-label" style={{ marginBottom: '10px' }}>
          Interactive Intelligence Console
        </span>
        <h2
          className="text-display"
          style={{
            fontSize: 'clamp(1.5rem, 3.8vw, 3rem)',
            fontWeight: 500,
            letterSpacing: -0.04,
            lineHeight: 1.15,
            marginBottom: '12px',
          }}
        >
          <span style={{ color: '#FFFFFF', fontWeight: 500 }}>Live Telemetry Feeds & Market Probes </span>
          <span className="text-contrast-tail">across 12 Egyptian retailers.</span>
        </h2>
      </div>

      {/* Institutional Interactive Showcase Console */}
      <div style={{ width: '100%', maxWidth: '100%', marginTop: '12px', overflowX: 'hidden' }}>
        <ShowcaseConsole />
      </div>

      <style>{`
        /* Hero Actions: Always side by side with equal 50/50 balance */
        .hero-actions-wrapper {
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 8px !important;
          width: 100% !important;
          max-width: 250px !important;
          margin: 0 auto !important;
        }

        .hero-action-btn {
          flex: 1 1 0px !important;
          min-width: 0 !important;
          height: 32px !important;
          max-height: 32px !important;
          line-height: 32px !important;
          padding: 0 10px !important;
          font-size: 0.70rem !important;
          font-weight: 600 !important;
          border-radius: 6px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 4px !important;
          text-decoration: none !important;
          white-space: nowrap !important;
          box-sizing: border-box !important;
          transition: all 140ms ease !important;
        }

        .hero-btn-primary {
          color: #0A0A0A !important;
          background-color: #3ECF8E !important;
          border: 1px solid #3ECF8E !important;
        }
        .hero-btn-primary:hover {
          background-color: #34B77B !important;
          border-color: #34B77B !important;
        }

        .hero-btn-secondary {
          color: #EDEDED !important;
          background-color: rgba(255, 255, 255, 0.03) !important;
          border: 1px solid rgba(255, 255, 255, 0.14) !important;
        }
        .hero-btn-secondary:hover {
          background-color: rgba(255, 255, 255, 0.07) !important;
          border-color: rgba(255, 255, 255, 0.25) !important;
          color: #FFFFFF !important;
        }

        /* Telemetry Ticker Marquee styles */
        .ticker-wrapper {
          width: 100%;
          max-width: 860px;
          margin: 0 auto;
          position: relative;
          overflow: hidden;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          padding: 14px 0;
        }

        .ticker-track {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
        }

        .ticker-group {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 24px;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: #888888;
          letter-spacing: 0.04em;
          white-space: nowrap;
        }

        .ticker-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .ticker-dot {
          color: rgba(255, 255, 255, 0.15);
          user-select: none;
        }

        .ticker-group-duplicate {
          display: none;
        }

        @media (max-width: 768px) {
          .hero-section-root {
            padding-top: 56px !important;
            padding-bottom: 16px !important;
            background: #0A0A0A !important;
          }

          .hero-ambient-glow {
            display: none !important;
          }

          /* Mobile 100vh / 100dvh Exact Fit First Fold */
          .hero-first-fold {
            min-height: calc(100dvh - 56px) !important;
            min-height: calc(100vh - 56px);
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            align-items: center !important;
            padding: 16px 16px 12px 16px !important;
            box-sizing: border-box !important;
            position: relative !important;
            background: transparent !important;
          }

          /* Central cluster vertically centered in the fold */
          .hero-content-cluster {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            gap: 14px !important;
            text-align: center !important;
            margin: auto 0 !important;
            position: relative !important;
            z-index: 2 !important;
            background: transparent !important;
            width: 100% !important;
            max-width: 360px !important;
          }

          /* Globe positioned gracefully as ambient depth behind the action area */
          .hero-globe-graphic {
            top: 140px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            transform-origin: center center !important;
            width: 135% !important;
            max-width: 520px !important;
            height: 400px !important;
            opacity: 0.28 !important;
            overflow: hidden !important;
            mix-blend-mode: screen !important;
            background: transparent !important;
            pointer-events: none !important;
            -webkit-mask-image: radial-gradient(circle at 50% 50%, black 45%, rgba(0, 0, 0, 0.3) 75%, transparent 100%) !important;
            mask-image: radial-gradient(circle at 50% 50%, black 45%, rgba(0, 0, 0, 0.3) 75%, transparent 100%) !important;
          }

          .hero-globe-graphic img {
            width: 100% !important;
            height: 100% !important;
            object-fit: contain !important;
            object-position: center !important;
            mix-blend-mode: screen !important;
            background: transparent !important;
          }

          .hero-title-responsive {
            font-size: clamp(1.8rem, 7.2vw, 2.3rem) !important;
            line-height: 1.14 !important;
            letter-spacing: -0.035em !important;
            margin: 0 auto !important;
            max-width: 350px !important;
            text-shadow: 0 2px 14px rgba(0, 0, 0, 0.9);
          }

          .hero-sub-responsive {
            font-size: 0.84rem !important;
            line-height: 1.55 !important;
            max-width: 320px !important;
            margin: 2px auto 0 auto !important;
            color: #9CA3AF !important;
            letter-spacing: -0.01em !important;
            text-shadow: 0 1px 8px rgba(0, 0, 0, 0.95);
          }

          .hero-actions-wrapper {
            max-width: 270px !important;
            gap: 10px !important;
            margin: 8px auto 0 auto !important;
          }

          .hero-action-btn {
            height: 38px !important;
            max-height: 38px !important;
            line-height: 38px !important;
            font-size: 0.8125rem !important;
            padding: 0 14px !important;
            border-radius: 8px !important;
            gap: 6px !important;
          }

          /* Auto-marquee ticker on mobile */
          .ticker-wrapper {
            padding: 9px 0 !important;
            max-width: 100% !important;
            margin-top: auto !important;
            margin-bottom: 12px !important;
            border-top: 1px solid rgba(255, 255, 255, 0.06) !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
            -webkit-mask-image: linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 1) 8%, rgba(0, 0, 0, 1) 92%, transparent 100%) !important;
            mask-image: linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 1) 8%, rgba(0, 0, 0, 1) 92%, transparent 100%) !important;
          }

          .ticker-track {
            justify-content: flex-start !important;
            width: max-content !important;
            animation: cawlixTickerMarquee 16s linear infinite !important;
            will-change: transform;
          }

          .ticker-track:hover,
          .ticker-track:active {
            animation-play-state: paused !important;
          }

          .ticker-group {
            gap: 16px !important;
            padding-right: 16px !important;
            font-size: 0.6875rem !important;
            letter-spacing: 0.04em !important;
            flex-shrink: 0 !important;
          }

          .ticker-group-duplicate {
            display: flex !important;
          }
        }

        @keyframes cawlixTickerMarquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}
