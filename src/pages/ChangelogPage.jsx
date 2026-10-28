import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/landing/Footer';

const RELEASES = [
  {
    version: 'v2.4.0',
    date: 'OCTOBER 2, 2026',
    isLatest: true,
    headline: 'Sub-Second Anomaly Webhook Dispatch & iPhone 16 Customs Index',
    deliverables: [
      'Indexed Egyptian Customs HS Code 8517.13 tariff calculations for new flagship mobile imports.',
      'Reduced anomaly radar webhook dispatch latency from 1.8s down to 850ms.',
      'Added automated cache-busting for B.TECH installment pricing schemas.',
    ],
  },
  {
    version: 'v2.3.2',
    date: 'SEPTEMBER 21, 2026',
    isLatest: false,
    headline: 'Commercial Bank FX Stream & Checkout Surcharge Detection',
    deliverables: [
      'Connected direct commercial bank FX clearing feeds (CIB / NBE) for live USD-to-EGP conversion.',
      'Integrated detection of administrative fee surcharges on 0% interest BNPL plans.',
      'Mitigated hydration lag on Noon Egypt dynamic catalog endpoints.',
    ],
  },
  {
    version: 'v2.2.0',
    date: 'SEPTEMBER 04, 2026',
    isLatest: false,
    headline: 'Ghost-Discount 90-Day Baseline Engine Launch',
    deliverables: [
      'Deployed rolling 90-day time-series telemetry to detect pre-sale artificial price spikes.',
      'Introduced the 0–100 Authenticity Rating algorithm for consumer electronics.',
      'Added dedicated tracking nodes for 2B Egypt and Tradeline authorized stock.',
    ],
  },
];

export default function ChangelogPage() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
    }
  };

  return (
    <div style={{ backgroundColor: '#000000', minHeight: '100vh', color: '#FFFFFF', overflowX: 'hidden' }}>
      <Navbar />

      <main style={{ minHeight: '100vh', paddingTop: '140px', paddingBottom: '120px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 24px' }}>
          
          {/* A. Header Module */}
          <header style={{ marginBottom: '56px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '40px' }}>
            <div style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.75rem',
              color: '#3ECF8E',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '14px',
            }}>
              SYSTEM LOG · PRODUCTION RELEASES
            </div>

            <h1 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 600,
              color: '#FFFFFF',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              margin: '0 0 16px 0',
            }}>
              Platform Changelog
            </h1>

            <p style={{
              fontSize: '1.0625rem',
              color: '#888888',
              lineHeight: 1.6,
              maxWidth: '680px',
              margin: '0 0 24px 0',
            }}>
              Continuous telemetry deployment ledger. Tracking parser releases, statutory tariff index updates, and probe latency optimizations across 12 indexed retailers.
            </p>

            <div style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '11px',
              color: '#737373',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}>
              WEEKLY SHIP CADENCE • ZERO DOWNTIME ROLLING DEPLOYS • SEMVER DISCIPLINE
            </div>
          </header>

          {/* B. The Release Log Feed (Chronological Open Entries) */}
          <section aria-label="Release Log Feed" style={{ position: 'relative', marginBottom: '64px' }}>
            {/* Hairline Guide */}
            <div style={{
              position: 'absolute',
              left: 0,
              top: '8px',
              bottom: '8px',
              width: '1px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
              {RELEASES.map((entry) => (
                <article key={entry.version} style={{ paddingLeft: '28px', position: 'relative' }}>
                  {/* Borderless Monospace Version & Timestamp Marker */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontFamily: 'var(--font-mono, monospace)',
                    fontSize: '0.75rem',
                    marginBottom: '10px',
                    flexWrap: 'wrap',
                  }}>
                    <span style={{ fontWeight: 600, color: entry.isLatest ? '#3ECF8E' : '#888888' }}>
                      {entry.version}
                    </span>
                    <span style={{ color: '#737373' }}>•</span>
                    <span style={{ color: entry.isLatest ? '#3ECF8E' : '#888888' }}>
                      {entry.date}
                    </span>
                  </div>

                  {/* Headline */}
                  <h2 style={{
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    lineHeight: 1.35,
                    letterSpacing: '-0.02em',
                    margin: '0 0 16px 0',
                  }}>
                    {entry.headline}
                  </h2>

                  {/* Deliverables (Clean flat bullet points directly on background) */}
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {entry.deliverables.map((item, i) => (
                      <li key={i} style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '12px',
                        fontSize: '0.875rem',
                        color: '#D4D4D4',
                        lineHeight: 1.6,
                      }}>
                        <span style={{
                          display: 'inline-block',
                          width: '4px',
                          height: '4px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(255, 255, 255, 0.4)',
                          flexShrink: 0,
                          transform: 'translateY(-2px)',
                        }} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          {/* C. Minimal Subscription Bar */}
          <section style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '40px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '580px' }}>
              <p style={{ fontSize: '0.875rem', color: '#888888', margin: 0, lineHeight: 1.5 }}>
                Receive deployment notices via developer webhook or RSS.
              </p>

              {subscribed ? (
                <div style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.75rem',
                  color: '#3ECF8E',
                  padding: '9px 0',
                }}>
                  ✓ Notice channel registered for {email}
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="developer@enterprise.com"
                    aria-label="Email address for release notices"
                    style={{
                      flex: 1,
                      minWidth: '220px',
                      background: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#FFFFFF',
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '0.75rem',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      backgroundColor: '#3ECF8E',
                      color: '#0A0A0A',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      padding: '9px 16px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#34B27B'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3ECF8E'}
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
