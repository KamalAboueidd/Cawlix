import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ShowcaseConsole from '../components/ShowcaseConsole';
import TelemetryConsole from '../components/TelemetryConsole';

export default function TrackerPage() {
  return (
    <div style={{ backgroundColor: '#000000', minHeight: '100vh', color: '#FFFFFF', overflowX: 'hidden' }}>
      <Navbar />

      <main style={{ minHeight: '100vh', paddingTop: '145px', paddingBottom: '96px', overflowX: 'hidden' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          
          {/* Terminal Header */}
          <header style={{ marginBottom: '40px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '32px' }}>
            <div style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.75rem',
              color: '#3ECF8E',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '12px',
            }}>
              TELEMETRY UTILITY · LIVE SCANNER
            </div>

            <h1 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 600,
              color: '#FFFFFF',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              margin: '0 0 16px 0',
            }}>
              Cawlix Telemetry Tracker
            </h1>

            <p style={{
              fontSize: '1rem',
              color: '#888888',
              lineHeight: 1.6,
              maxWidth: '680px',
              margin: 0,
            }}>
              Direct SKU telemetry query terminal and multi-retailer price probe console. Inspect 90-day pricing velocity and detect synthetic sales.
            </p>
          </header>

          {/* Interactive Showcase / Search Island */}
          <section style={{ marginBottom: '60px' }}>
            <ShowcaseConsole />
          </section>

          {/* Live Stream Console */}
          <section style={{ marginTop: '40px' }}>
            <TelemetryConsole />
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
