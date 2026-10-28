import React from 'react';
import cawlixLogo from '../../assets/ICon.png';

const ENGINES_LINKS = [
  { label: 'True-Cost Calculator', href: '/engines/true-cost' },
  { label: 'Ghost-Discount Auditor', href: '/engines/ghost-auditor' },
  { label: 'Landed-Cost Arbitrage', href: '/engines/landed-cost' },
  { label: 'Anomaly & Glitch Radar', href: '/engines/anomaly-radar' },
];

const SOLUTIONS_LINKS = [
  { label: 'For Hardware Enthusiasts', href: '/solutions/consumers' },
  { label: 'For Merchants & Resellers', href: '/solutions/merchants' },
  { label: 'Network Coverage & Probes', href: '/network/coverage' },
  { label: 'Tracker Utility', href: '/tracker' },
];

const RESOURCES_LINKS = [
  { label: 'Technical Documentation', href: '/docs' },
  { label: 'API Reference', href: '/docs#endpoints' },
  { label: 'White Friday Forensic Audit', href: '/blog/white-friday-fake-discounts' },
  { label: 'Platform Changelog', href: '/changelog' },
  { label: 'Pricing Plans', href: '/pricing' },
];

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Telemetry', href: '/terms' },
  { label: 'Security Matrix', href: '/security' },
];

export default function Footer() {
  return (
    <footer className="cawlix-global-footer">
      <div className="footer-inner">
        {/* Main Grid: Platform Brand + 4 Nav Columns */}
        <div className="footer-columns-grid">
          
          {/* Column 1: Core Platform & Node Status */}
          <div className="col-platform">
            <a href="/" className="platform-brand">
              <img
                src={cawlixLogo}
                alt="Cawlix Telemetry Core Logo"
                width={22}
                height={22}
                className="platform-logo"
              />
              <span className="platform-title">Cawlix Telemetry Core</span>
            </a>

            <div className="platform-status">
              12 RETAIL NODES ACTIVE · PING: 118MS
            </div>

            <p className="platform-tagline">
              Deterministic price telemetry, fake discount forensic auditing, and landed-cost arbitrage for consumer electronics.
            </p>
          </div>

          {/* Nav Columns: 2x2 on Mobile, 4 columns on Desktop */}
          <div className="footer-nav-grid">
            {/* 1. ENGINES */}
            <div className="col-nav">
              <div className="col-header">ENGINES</div>
              <ul className="col-list">
                {ENGINES_LINKS.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="footer-link">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* 2. SOLUTIONS */}
            <div className="col-nav">
              <div className="col-header">SOLUTIONS</div>
              <ul className="col-list">
                {SOLUTIONS_LINKS.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="footer-link">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. RESOURCES */}
            <div className="col-nav">
              <div className="col-header">RESOURCES</div>
              <ul className="col-list">
                {RESOURCES_LINKS.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="footer-link">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* 4. LEGAL & SECURITY */}
            <div className="col-nav">
              <div className="col-header">LEGAL &amp; SECURITY</div>
              <ul className="col-list">
                {LEGAL_LINKS.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="footer-link">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        {/* Bottom Legal & Attribution Strip */}
        <div className="footer-bottom-strip">
          <div className="bottom-meta-group">
            <span className="platform-copyright">
              © 2026 Cawlix Inc. All rights reserved.
            </span>
            <span className="bottom-meta-sep">·</span>
            <span className="powered-by-text">
              Powered by{' '}
              <a
                href="https://kamalaboueidd.site"
                target="_blank"
                rel="noopener noreferrer"
                className="powered-by-link"
              >
                kamalaboueidd.site
              </a>
            </span>
          </div>

          <div className="strip-currency">
            EGYPTIAN POUND (EGP) TELEMETRY · CENTRAL BANK OF EGYPT REFERENCE RATE ENFORCED
          </div>
        </div>
      </div>

      <style>{`
        .cawlix-global-footer {
          background-color: #000000;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          width: 100%;
          position: relative;
          overflow-x: hidden;
        }

        .footer-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 40px 24px 28px 24px;
          box-sizing: border-box;
        }

        /* 5-Column Desktop Grid */
        .footer-columns-grid {
          display: grid;
          grid-template-columns: 1.3fr 1fr 1fr 1fr 1fr;
          gap: 36px;
          align-items: flex-start;
        }

        /* Platform Brand Block */
        .col-platform {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .platform-brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .platform-logo {
          height: 22px;
          width: auto;
          object-fit: contain;
          display: block;
        }

        .platform-title {
          font-family: var(--font-mono, monospace);
          font-size: 0.8125rem;
          font-weight: 600;
          color: #FFFFFF;
          letter-spacing: -0.01em;
        }

        .platform-status {
          font-family: var(--font-mono, monospace);
          font-size: 0.75rem;
          color: #3ECF8E;
          letter-spacing: 0.04em;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .platform-tagline {
          font-family: var(--font-sans, system-ui, sans-serif);
          font-size: 0.75rem;
          color: #737373;
          line-height: 1.6;
          margin: 0;
          max-width: 320px;
        }

        /* Nav Container: Contents on Desktop */
        .footer-nav-grid {
          display: contents;
        }

        /* Nav Columns */
        .col-nav {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .col-header {
          font-family: var(--font-mono, monospace);
          font-size: 0.75rem;
          font-weight: 600;
          color: #FFFFFF;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .col-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .footer-link {
          font-family: var(--font-sans, system-ui, sans-serif);
          font-size: 0.75rem;
          color: #888888;
          text-decoration: none;
          transition: color 150ms ease-in-out;
          background: transparent;
          display: inline-block;
        }

        .footer-link:hover {
          color: #3ECF8E;
          background: transparent;
        }

        /* Bottom Strip */
        .footer-bottom-strip {
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          margin-top: 28px;
          padding-top: 18px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 10px;
          width: 100%;
        }

        .bottom-meta-group {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
          text-align: center;
        }

        .platform-copyright {
          font-family: var(--font-mono, monospace);
          font-size: 0.75rem;
          color: #737373;
          text-align: center;
        }

        .bottom-meta-sep {
          font-family: var(--font-mono, monospace);
          font-size: 0.75rem;
          color: #333333;
        }

        .powered-by-text {
          font-family: var(--font-mono, monospace);
          font-size: 0.75rem;
          color: #737373;
          text-align: center;
        }

        .powered-by-link {
          color: #3ECF8E;
          text-decoration: none;
          font-weight: 500;
          transition: color 150ms ease, text-decoration 150ms ease;
        }

        .powered-by-link:hover {
          color: #FFFFFF;
          text-decoration: underline;
        }

        .strip-currency {
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          color: #525252;
          letter-spacing: 0.04em;
          text-align: center;
        }

        /* Tablet Responsive */
        @media (max-width: 1024px) {
          .footer-columns-grid {
            grid-template-columns: 1fr;
            gap: 28px;
          }

          .footer-nav-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 24px;
          }
        }

        /* Mobile Responsive (< 768px): 2x2 Grid + Centered Compact Bottom */
        @media (max-width: 768px) {
          .footer-inner {
            padding: 24px 16px 24px 16px;
          }

          .footer-columns-grid {
            display: flex;
            flex-direction: column;
            gap: 22px;
          }

          .col-platform {
            width: 100%;
          }

          .platform-tagline {
            max-width: 100%;
          }

          /* 2x2 Layout: Row 1 = Engines & Solutions, Row 2 = Resources & Legal */
          .footer-nav-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 22px 18px;
            width: 100%;
          }

          .col-header {
            font-size: 0.6875rem;
            letter-spacing: 0.08em;
          }

          .footer-link {
            font-size: 0.75rem;
            line-height: 1.4;
          }

          .footer-bottom-strip {
            flex-direction: column;
            align-items: center !important;
            justify-content: center !important;
            text-align: center !important;
            gap: 8px;
            margin-top: 18px !important;
            padding-top: 14px !important;
          }

          .bottom-meta-group {
            flex-direction: column;
            align-items: center !important;
            justify-content: center !important;
            text-align: center !important;
            gap: 5px;
          }

          .bottom-meta-sep {
            display: none;
          }

          .platform-copyright,
          .powered-by-text,
          .strip-currency {
            font-size: 0.6875rem;
            line-height: 1.5;
            text-align: center !important;
          }
        }
      `}</style>
    </footer>
  );
}
