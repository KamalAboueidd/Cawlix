import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import CoreEnginesDeepDive from '../components/landing/CoreEnginesDeepDive';
import TelemetryConsole from '../components/TelemetryConsole';
import Footer from '../components/landing/Footer';

export default function LandingPage() {
  return (
    <div dir="ltr" style={{ minHeight: '100vh', background: '#000000', color: '#FFFFFF', overflowX: 'hidden', width: '100%', maxWidth: '100vw' }}>
      <Navbar />
      <main style={{ overflowX: 'hidden', width: '100%', maxWidth: '100vw', background: '#000000' }}>
        <Hero />
        <CoreEnginesDeepDive />
        <section className="page-container" style={{ paddingTop: '20px', paddingBottom: '24px', background: '#000000' }}>
          <TelemetryConsole />
        </section>
      </main>

      <Footer />
    </div>
  );
}
