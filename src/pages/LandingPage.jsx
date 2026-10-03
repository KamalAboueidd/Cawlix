import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import CoreEnginesDeepDive from '../components/landing/CoreEnginesDeepDive';
import TelemetryConsole from '../components/TelemetryConsole';
import Footer from '../components/landing/Footer';

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#FFFFFF', overflowX: 'hidden', width: '100%', maxWidth: '100vw' }}>
      <Navbar />
      <main style={{ overflowX: 'hidden', width: '100%', maxWidth: '100vw' }}>
        <Hero />
        <CoreEnginesDeepDive />
        <section className="page-container" style={{ paddingTop: '20px', paddingBottom: '60px' }}>
          <TelemetryConsole />
        </section>
      </main>

      <Footer />
    </div>
  );
}
