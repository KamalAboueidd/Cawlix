import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function SecurityPage() {
  return (
    <div style={{ backgroundColor: '#000000', minHeight: '100vh', color: '#FFFFFF', overflowX: 'hidden' }}>
      <Navbar />

      <main className="legal-main">
        <div className="legal-container">
          {/* Header */}
          <header className="legal-header">
            <div className="legal-kicker">
              INFRASTRUCTURE SECURITY · INTEGRITY MATRIX
            </div>
            <h1 className="legal-title">Security Matrix</h1>
            <p className="legal-subtitle">
              Cryptographic verification protocols, telemetry node isolation, and data integrity safeguards.
            </p>
            <div className="legal-meta">
              <span>STATUS: PRODUCTION SECURED</span>
              <span>·</span>
              <span>ENCRYPTION: AES-256-GCM / TLS 1.3</span>
            </div>
          </header>

          {/* Matrix Grid / Overview */}
          <div className="matrix-overview-grid">
            <div className="matrix-card">
              <div className="matrix-card-head">
                <span className="matrix-tag">PROTOCOL 01</span>
                <span className="matrix-badge">ACTIVE</span>
              </div>
              <h3 className="matrix-card-title">HMAC-SHA256 Signatures</h3>
              <p className="matrix-card-desc">
                Every programmatic webhook and alert payload is cryptographically signed using unique per-client secret keys to prevent replay and MITM tampering.
              </p>
            </div>

            <div className="matrix-card">
              <div className="matrix-card-head">
                <span className="matrix-tag">PROTOCOL 02</span>
                <span className="matrix-badge">ACTIVE</span>
              </div>
              <h3 className="matrix-card-title">Node Telemetry Isolation</h3>
              <p className="matrix-card-desc">
                Storefront ingestion probes execute within isolated, stateless micro-containers with zero persistent file access and strictly outgoing egress policies.
              </p>
            </div>

            <div className="matrix-card">
              <div className="matrix-card-head">
                <span className="matrix-tag">PROTOCOL 03</span>
                <span className="matrix-badge">ACTIVE</span>
              </div>
              <h3 className="matrix-card-title">Row-Level Security (RLS)</h3>
              <p className="matrix-card-desc">
                All database tables enforce strict PostgreSQL tenant isolation. Authenticated users cannot read, write, or enumerate other tenants’ tracked SKUs.
              </p>
            </div>

            <div className="matrix-card">
              <div className="matrix-card-head">
                <span className="matrix-tag">PROTOCOL 04</span>
                <span className="matrix-badge">ACTIVE</span>
              </div>
              <h3 className="matrix-card-title">Rate Limiting &amp; DDoS Defense</h3>
              <p className="matrix-card-desc">
                In-memory token bucket rate limiters prevent API exhaustion, protecting critical price calculation clusters from denial-of-service spikes.
              </p>
            </div>
          </div>

          {/* Sections */}
          <div className="legal-content">
            <section className="legal-section">
              <h2 className="section-title">Cryptographic Ingestion Integrity</h2>
              <p className="section-text">
                Every scraped product data point is timestamped and verified against cryptographic hash baselines. Before a price drop or anomaly alert is dispatched to consumer or merchant conduits, three independent node samples must confirm parity within a 45-second window, neutralizing synthetic or erroneous retailer glitch signals.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="section-title">Vulnerability Reporting &amp; Bug Bounty</h2>
              <p className="section-text">
                If you discover a potential vulnerability within the Cawlix telemetry cluster, API endpoints, or console portal, please coordinate directly with our security operations team at <a href="mailto:security@cawlix.com" className="legal-inline-link">security@cawlix.com</a>. We review and remediate critical disclosures within 24 hours.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />

      <style>{`
        .legal-main {
          min-height: 100vh;
          background-color: #000000;
          padding-top: 140px;
          padding-bottom: 120px;
          width: 100%;
          box-sizing: border-box;
        }

        .legal-container {
          max-width: 860px;
          margin: 0 auto;
          padding: 0 24px;
          box-sizing: border-box;
        }

        .legal-header {
          margin-bottom: 40px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          padding-bottom: 36px;
        }

        .legal-kicker {
          font-family: var(--font-mono, monospace);
          font-size: 0.75rem;
          color: #3ECF8E;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 14px;
        }

        .legal-title {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 600;
          color: #FFFFFF;
          letter-spacing: -0.03em;
          line-height: 1.15;
          margin: 0 0 16px 0;
        }

        .legal-subtitle {
          font-size: 1rem;
          color: #888888;
          line-height: 1.6;
          margin: 0 0 20px 0;
        }

        .legal-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: var(--font-mono, monospace);
          font-size: 0.6875rem;
          color: #737373;
          letter-spacing: 0.04em;
        }

        .matrix-overview-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 48px;
        }

        .matrix-card {
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .matrix-card-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .matrix-tag {
          font-family: var(--font-mono, monospace);
          font-size: 0.625rem;
          color: #737373;
          letter-spacing: 0.06em;
        }

        .matrix-badge {
          font-family: var(--font-mono, monospace);
          font-size: 0.625rem;
          color: #3ECF8E;
          letter-spacing: 0.04em;
          font-weight: 600;
        }

        .matrix-card-title {
          font-family: var(--font-sans, system-ui, sans-serif);
          font-size: 0.9375rem;
          font-weight: 600;
          color: #FFFFFF;
          margin: 0;
          letter-spacing: -0.01em;
        }

        .matrix-card-desc {
          font-family: var(--font-sans, system-ui, sans-serif);
          font-size: 0.8125rem;
          color: #888888;
          line-height: 1.5;
          margin: 0;
        }

        .legal-content {
          display: flex;
          flex-direction: column;
          gap: 36px;
        }

        .legal-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .section-title {
          font-family: var(--font-sans, system-ui, sans-serif);
          font-size: 1.125rem;
          font-weight: 600;
          color: #EDEDED;
          letter-spacing: -0.01em;
          margin: 0;
        }

        .section-text {
          font-family: var(--font-sans, system-ui, sans-serif);
          font-size: 0.875rem;
          color: #A3A3A3;
          line-height: 1.7;
          margin: 0;
        }

        .legal-inline-link {
          color: #3ECF8E;
          text-decoration: underline;
          transition: opacity 140ms ease;
        }

        .legal-inline-link:hover {
          opacity: 0.8;
        }

        @media (max-width: 768px) {
          .legal-main {
            padding-top: 145px !important;
            padding-bottom: 80px;
          }

          .legal-container {
            padding: 0 16px;
          }

          .matrix-overview-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
}
