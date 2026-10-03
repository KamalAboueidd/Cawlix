import { ArrowRight } from 'lucide-react';
import ShowcaseConsole from './ShowcaseConsole';
import heroGraphic from '../assets/Landing/1.png';

export default function Hero() {
  return (
    <section
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '130px',
        paddingBottom: '90px',
        paddingLeft: '24px',
        paddingRight: '24px',
        position: 'relative',
        background: '#0A0A0A',
        overflow: 'hidden',
      }}
    >
      {/* Visual 1: Primary Hero Graphic with subtle radial fade mask */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '1240px',
          height: 'auto',
          aspectRatio: '1672 / 941',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.38,
          WebkitMaskImage: 'radial-gradient(circle at 50% 45%, black 40%, rgba(0, 0, 0, 0.4) 65%, transparent 85%)',
          maskImage: 'radial-gradient(circle at 50% 45%, black 40%, rgba(0, 0, 0, 0.4) 65%, transparent 85%)',
        }}
      >
        <img
          src={heroGraphic}
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
          }}
        />
      </div>

      {/* Ultra-subtle ambient radial mask */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '1000px',
          height: '520px',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(62, 207, 142, 0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Main Container */}
      <div
        style={{
          maxWidth: '1040px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '32px',
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
        }}
      >
        {/* Confident, Razor-Sharp Headline with Vercel Multi-tone Narrative Contrast */}
        <h1
          className="text-display"
          style={{
            fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)',
            fontWeight: 500,
            letterSpacing: '-0.04em',
            lineHeight: 1.08,
            maxWidth: '920px',
            margin: '0 auto',
          }}
        >
          <span style={{ color: '#FFFFFF', fontWeight: 500 }}>Institutional Price Intelligence. </span>
          <span className="text-contrast-tail">Engineered for absolute accuracy.</span>
        </h1>

        {/* Concise 2-line Subtitle */}
        <p
          style={{
            fontSize: '1.0625rem',
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

        {/* Action Area: High-Conviction Buttons */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'center' }}>
          <a
            href="#showcase"
            className="btn btn-primary"
            style={{
              padding: '10px 20px',
              fontSize: '0.875rem',
              fontWeight: 500,
              borderRadius: '8px',
              color: '#0A0A0A',
              background: '#3ECF8E',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            Launch Tracker
            <ArrowRight size={15} strokeWidth={2} />
          </a>
          <a
            href="#showcase"
            className="btn btn-secondary"
            style={{
              padding: '10px 20px',
              fontSize: '0.875rem',
              fontWeight: 500,
              borderRadius: '8px',
              color: '#EDEDED',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              background: 'transparent',
            }}
          >
            Explore Intelligence Console
          </a>
        </div>

        {/* Borderless Horizontal Telemetry Ticker */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '28px',
            flexWrap: 'wrap',
            padding: '16px 0',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: '#888888',
            letterSpacing: '0.04em',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            width: '100%',
            maxWidth: '860px',
            marginTop: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#FFFFFF', fontWeight: 600 }}>12</span>
            <span>RETAILERS INDEXED</span>
          </div>
          <span style={{ color: 'rgba(255, 255, 255, 0.15)' }}>·</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#FFFFFF', fontWeight: 600 }}>90-DAY</span>
            <span>PRICE VELOCITY</span>
          </div>
          <span style={{ color: 'rgba(255, 255, 255, 0.15)' }}>·</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#FFFFFF', fontWeight: 600 }}>&lt;180MS</span>
            <span>PROBE LATENCY</span>
          </div>
          <span style={{ color: 'rgba(255, 255, 255, 0.15)' }}>·</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#3ECF8E', fontWeight: 600 }}>0%</span>
            <span>GHOST DEAL TOLERANCE</span>
          </div>
        </div>

        {/* Institutional Feature Showcase Header */}
        <div style={{ width: '100%', marginTop: '40px', textAlign: 'center' }}>
          <span className="feature-group-label" style={{ marginBottom: '12px' }}>
            // INTERACTIVE_FEATURE_SHOWCASE
          </span>
          <h2
            className="text-display"
            style={{
              fontSize: 'clamp(1.875rem, 3.8vw, 3rem)',
              fontWeight: 500,
              letterSpacing: '-0.04em',
              lineHeight: 1.08,
              marginBottom: '16px',
            }}
          >
            <span style={{ color: '#FFFFFF', fontWeight: 500 }}>Live Telemetry Feeds & Market Probes </span>
            <span className="text-contrast-tail">across 12 Egyptian retailers.</span>
          </h2>
        </div>

        {/* Institutional Interactive Showcase Console */}
        <div style={{ width: '100%', marginTop: '12px' }}>
          <ShowcaseConsole />
        </div>
      </div>
    </section>
  );
}
