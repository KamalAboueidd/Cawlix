import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function PrivacyPage() {
  return (
    <div style={{ backgroundColor: '#000000', minHeight: '100vh', color: '#FFFFFF', overflowX: 'hidden' }}>
      <Navbar />

      <main className="legal-main">
        <div className="legal-container">
          {/* Header */}
          <header className="legal-header">
            <div className="legal-kicker">
              DATA PROTOCOL · TELEMETRY COMPLIANCE
            </div>
            <h1 className="legal-title">Privacy Policy</h1>
            <p className="legal-subtitle">
              How Cawlix processes publicly ingested retail price telemetry, handles authentication credentials, and protects user data.
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
              <h2 className="section-title">1. Public Telemetry Collection</h2>
              <p className="section-text">
                Cawlix ingests publicly accessible retail shelf pricing across e-commerce storefronts (including Amazon Egypt, B.TECH, RayaShop, 2B, and Tradeline). Our automated telemetry nodes extract only publicly broadcasted product metrics: SKU IDs, listed shelf prices, advertised discount flags, and stock availability statuses. We do not gather, store, or process consumer personal data from external retailer storefronts.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="section-title">2. User Account Information</h2>
              <p className="section-text">
                When you create a Cawlix account or subscribe to price telemetry alerts, we process your verified email address and authentication credentials via Supabase Auth. Passwords and cryptographic tokens are hashed and encrypted at rest with industry-standard protocols. We never sell, lease, or monetize user contact records with third-party advertising brokers.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="section-title">3. Telemetry Cache &amp; Storage</h2>
              <p className="section-text">
                Historical price time-series data, ghost-discount audit records, and landed-cost calculation histories are persisted in partitioned PostgreSQL databases with Row-Level Security (RLS) policies. Saved search queries and user alert thresholds are strictly isolated to your authenticated user identity.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="section-title">4. Cookies &amp; Session Tokens</h2>
              <p className="section-text">
                Cawlix utilizes strictly essential cryptographic session tokens in <code className="legal-code">localStorage</code> to maintain authenticated user sessions across terminal visits. We do not embed third-party tracking pixels, behavioural surveillance scripts, or advertising fingerprinting tools.
              </p>
            </section>

            <section className="legal-section">
              <h2 className="section-title">5. Data Deletion &amp; Compliance</h2>
              <p className="section-text">
                You maintain the unconditional right to request the permanent purging of your account credentials, alert subscriptions, and custom SKU tracking monitors. To initiate immediate record termination, contact our compliance engineering team at <a href="mailto:privacy@cawlix.com" className="legal-inline-link">privacy@cawlix.com</a> or trigger account decommissioning directly within the Console settings.
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

        .legal-code {
          font-family: var(--font-mono, monospace);
          font-size: 0.8125rem;
          color: #3ECF8E;
          background: rgba(62, 207, 142, 0.08);
          padding: 2px 6px;
          border-radius: 4px;
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

          .legal-header {
            margin-bottom: 36px;
            padding-bottom: 28px;
          }
        }
      `}</style>
    </div>
  );
}
