import React from 'react';
import cawlixLogo from '../../assets/ICon.png';

interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'Engines',
    links: [
      { label: 'True-Cost Matrix', href: '/engines/true-cost' },
      { label: 'Ghost Auditor', href: '/engines/ghost-auditor' },
      { label: 'Landed-Cost Corridor', href: '/engines/landed-cost' },
      { label: 'Glitch Radar', href: '/engines/anomaly-radar' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { label: 'Smart Consumers', href: '/solutions/consumers' },
      { label: 'Retailers & Resellers', href: '/solutions/merchants' },
      { label: 'Arbitrage Traders', href: '/solutions/arbitrage' },
      { label: 'Enterprise Feeds', href: '/pricing' },
    ],
  },
  {
    title: 'Platform',
    links: [
      { label: 'Coverage Index', href: '/network/coverage' },
      { label: 'Documentation', href: '/docs' },
      { label: 'Changelog', href: '/changelog' },
      { label: 'System Status', href: '/status' },
    ],
  },
  {
    title: 'Legal & Code',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Security Architecture', href: '/security' },
      { label: 'API Sandbox', href: '/docs/api' },
    ],
  },
];

export default function Footer() {
  return (
    <footer
      style={{
        background: '#0A0A0A',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        width: '100%',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '64px 24px 0 24px',
        }}
      >
        {/* Upper Grid (Brand 40% + 4 Columns 60%) */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            gap: '48px',
          }}
        >
          {/* Brand Column (Left, ~40% width on desktop) */}
          <div
            style={{
              flex: '1 1 340px',
              maxWidth: '420px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Logo + Name */}
            <a
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                textDecoration: 'none',
              }}
            >
              <img
                src={cawlixLogo}
                alt="Cawlix Logo"
                style={{
                  height: '24px',
                  width: 'auto',
                  display: 'block',
                  objectFit: 'contain',
                }}
              />
              <span
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  letterSpacing: '-0.02em',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Cawlix
              </span>
            </a>

            {/* Subtitle */}
            <p
              style={{
                fontSize: '0.75rem',
                color: '#888888',
                lineHeight: 1.6,
                margin: '12px 0 0 0',
                maxWidth: '380px',
                fontFamily: 'var(--font-sans)',
              }}
            >
              Deterministic price intelligence, fraud auditing, and cross-border landed cost arbitrage for the Egyptian electronics market.
            </p>

            {/* System Health Indicator */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '20px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: '#737373',
                letterSpacing: '0.04em',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#3ECF8E',
                  boxShadow: '0 0 8px rgba(62, 207, 142, 0.6)',
                  flexShrink: 0,
                  display: 'inline-block',
                }}
              />
              <span>ALL SYSTEMS OPERATIONAL · 99.98% PROBE ACCURACY</span>
            </div>
          </div>

          {/* Navigation Columns (Right, ~60% width, 4 equal columns on desktop, 2x2 on mobile) */}
          <div className="footer-nav-grid">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span
                  style={{
                    color: '#FFFFFF',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    fontFamily: 'var(--font-sans)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {col.title}
                </span>
                <ul
                  style={{
                    listStyle: 'none',
                    margin: 0,
                    padding: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        style={{
                          color: '#888888',
                          fontSize: '0.75rem',
                          textDecoration: 'none',
                          transition: 'color 140ms ease',
                          fontFamily: 'var(--font-sans)',
                          display: 'inline-block',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#EDEDED')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#888888')}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Signature Sub-bar */}
        <div
          className="footer-sub-bar"
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            marginTop: '40px',
            paddingTop: '24px',
            paddingBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
            fontSize: '0.75rem',
            color: '#666666',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {/* Left Side */}
          <div>
            &copy; 2026 Cawlix Systems. Deterministic Market Truth.
          </div>

          {/* Center / Highlight */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <span>Engineered &amp; Developed by</span>
            <span
              style={{
                color: '#EDEDED',
                fontFamily: 'var(--font-mono)',
                fontWeight: 500,
                transition: 'color 140ms ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#3ECF8E')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#EDEDED')}
            >
              Kamal Abou Eid
            </span>
          </div>

          {/* Right Side (Socials: Minimal outline icons, NO background, hover:text-white) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* GitHub */}
            <a
              href="https://github.com/KamalAboueidd/Cawlix"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Repository"
              style={{
                color: '#737373',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                transition: 'color 140ms ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#737373')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
                <path d="M9 18c-4.51 2-5-2-7-2"/>
              </svg>
            </a>

            {/* X (Twitter) */}
            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X Profile"
              style={{
                color: '#737373',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                transition: 'color 140ms ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#737373')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4l11.733 16h4.267l-11.733 -16z"/>
                <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/>
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn Profile"
              style={{
                color: '#737373',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                transition: 'color 140ms ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#737373')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                <rect width="4" height="12" x="2" y="9"/>
                <circle cx="4" cy="4" r="2"/>
              </svg>
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-sub-bar {
            flex-direction: column !important;
            text-align: center !important;
            justify-content: center !important;
            gap: 12px !important;
          }
        }
      `}</style>
    </footer>
  );
}
