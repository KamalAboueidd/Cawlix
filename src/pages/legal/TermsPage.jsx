import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function TermsPage() {
  return (
    <div style={{ backgroundColor: '#000000', minHeight: '100vh', color: '#FFFFFF', overflowX: 'hidden' }}>
      <Navbar />

      <main className="legal-main">
        <div className="legal-container">
          {/* Header */}
          <header className="legal-header">
            <div className="legal-kicker">
              SERVICE LEVEL AGREEMENT · CLIENT TERMS
            </div>
            <h1 className="legal-title">Terms of Telemetry</h1>
            <p className="legal-subtitle">
              Statutory terms governing automated price indexing, API consumption, landed-cost arbitrage valuation, and forensic audit reports.
            </p>
            <div className="legal-meta">
              <span>EFFECTIVE DATE: OCTOBER 2026</span>
              <span>·</span>
              <span>REVISION: V2.4-STABLE</span>
            </div>
          </header>

          {/* Sections */}
          <div className="legal-content">
            <section className="legal-section">
              <h2 className="section-title">1. Scope of Service &amp; Ingestion</h2>
              <p className="section-text">
                Cawlix operates an automated, deterministic price telemetry engine. We calculate historical price trends, identify synthetic &quot;ghost discounts&quot; through rolling-window baselines, and compute cross-border landed costs across US/EU import conduits into the Arab Republic of Egypt. All telemetry data is supplied strictly for benchmarking, analytical, and arbitrage valuation purposes.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="section-title">2. FX Clearing &amp; Statutory Customs Accuracy</h2>
              <p className="section-text">
                Landed-cost calculations utilize official Central Bank of Egypt (CBE) commercial foreign exchange rates and accredited Egyptian Customs statutory HS-code classifications. While Cawlix algorithms strive for sub-second parity with published regulations, actual import clearing fees, local courier handling tariffs, and commercial banking FX commissions remain subject to individual financial issuer discretion.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="section-title">3. API Usage &amp; Rate Limits</h2>
              <p className="section-text">
                Subscribers to Cawlix programmatic API endpoints agree to adhere to assigned rate limits (e.g., 60 requests/minute on Standard tiers, 600 requests/minute on Enterprise conduits). Automated reverse engineering, abusive scraping of Cawlix telemetry clusters, or attempts to circumvent authentication tokens will result in immediate API key revocation.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="section-title">4. Forensic Audit Disclaimers</h2>
              <p className="section-text">
                Our Ghost-Discount Auditor algorithm identifies price inflations preceding major promotional campaigns (such as White Friday). Forensic outputs reflect objective mathematical deviations from documented median price points over 30, 60, and 90-day observation windows and do not constitute legal determinations of consumer fraud.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="section-title">5. SLA &amp; Service Availability</h2>
              <p className="section-text">
                Cawlix targets a 99.9% uptime SLA for telemetry ingestion pipelines and public webhooks. Maintenance windows are announced via the Platform Changelog and developer alert feeds. In the event of emergency node recalibration, live telemetry status is broadcast via the terminal header.
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
          max-width: 820px;
          margin: 0 auto;
          padding: 0 24px;
          box-sizing: border-box;
        }

        .legal-header {
          margin-bottom: 48px;
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

        @media (max-width: 768px) {
          .legal-main {
            padding-top: 145px !important;
            padding-bottom: 80px;
          }

          .legal-container {
            padding: 0 16px;
          }

          .legal-header {
            margin-bottom: 36px;
            padding-bottom: 28px;
          }
        }
      `}</style>
    </div>
  );
}
