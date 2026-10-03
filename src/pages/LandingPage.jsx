import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import CoreEnginesDeepDive from '../components/landing/CoreEnginesDeepDive';
import TelemetryConsole from '../components/TelemetryConsole';

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#FFFFFF' }}>
      <Navbar />
      <main>
        <Hero />
        <CoreEnginesDeepDive />
        <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 80px 24px' }}>
          <TelemetryConsole />
        </section>
      </main>

      {/* Institutional Minimalist Footer */}
      <footer
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: '#070707',
          padding: '40px 24px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          color: '#666666',
        }}
      >
        <div
          style={{
            maxWidth: '1120px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <span style={{ color: '#FFFFFF', fontWeight: 600 }}>CAWLIX TRACKER</span>
            <span style={{ marginLeft: '12px' }}>
              Institutional Real-Time Price Intelligence & Arbitrage
            </span>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <span>EGYPT RETAIL MESH: 12 SOURCES</span>
            <span>US IMPORT CORRIDORS: ACTIVE</span>
            <span style={{ color: '#3ECF8E' }}>SYSTEM HEALTH: 100%</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
