import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Layers,
  ShieldAlert,
  Globe,
  Zap,
  ShoppingBag,
  Store,
  Menu,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import cawlixLogo from '../../assets/ICon.png';

interface DropdownItem {
  title: string;
  desc: string;
  href: string;
  icon: React.ComponentType<{ size: number; color?: string; strokeWidth?: number; className?: string }>;
}

const ENGINES_ITEMS: DropdownItem[] = [
  {
    title: 'True-Cost Engine',
    desc: 'Deterministic out-of-pocket checkout calculation',
    href: '/engines/true-cost',
    icon: Layers,
  },
  {
    title: 'Ghost-Discount Auditor',
    desc: '90-day baseline time-series fraud detection',
    href: '/engines/ghost-auditor',
    icon: ShieldAlert,
  },
  {
    title: 'Landed-Cost Arbitrage',
    desc: 'End-to-end US/EU to Egypt import modeling',
    href: '/engines/landed-cost',
    icon: Globe,
  },
  {
    title: 'Anomaly Radar',
    desc: 'Sub-second pricing glitch & decimal error telemetry',
    href: '/engines/anomaly-radar',
    icon: Zap,
  },
];

const SOLUTIONS_ITEMS: DropdownItem[] = [
  {
    title: 'For Smart Shoppers',
    desc: 'Flagship electronics audits & cashback stacking',
    href: '/solutions/consumers',
    icon: ShoppingBag,
  },
  {
    title: 'For Merchants & Resellers',
    desc: 'Real-time competitor tracking & ERP feeds',
    href: '/solutions/merchants',
    icon: Store,
  },
];

const DIRECT_LINKS = [
  { label: 'Network Coverage', href: '/network/coverage' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Changelog', href: '/changelog' },
  { label: 'Blog', href: '/blog' },
  { label: 'Docs', href: '/docs' },
];

export default function Navbar() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleMouseEnter = (menuKey: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(menuKey);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 120);
  };

  return (
    <header className={`navbar-header ${scrolled || mobileOpen ? 'scrolled' : ''}`}>
      <div className="navbar-inner">
        {/* Brand Group */}
        <div className="navbar-brand-group">
          <a href="/" className="navbar-brand-link">
            <img
              src={cawlixLogo}
              alt="Cawlix Logo"
              className="navbar-logo"
            />
            <span className="navbar-brand-text">Cawlix</span>
          </a>

          {/* Desktop Navigation Links (>= 768px) */}
          <nav className="desktop-nav">
            {/* 1. Engines Dropdown */}
            <div
              className="dropdown-wrapper"
              onMouseEnter={() => handleMouseEnter('engines')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                className={`nav-btn ${activeMenu === 'engines' ? 'nav-btn-active' : ''}`}
                onClick={() => setActiveMenu(activeMenu === 'engines' ? null : 'engines')}
              >
                <span>Engines</span>
                <ChevronDown
                  size={12}
                  className={`chevron-icon ${activeMenu === 'engines' ? 'rotated' : ''}`}
                />
              </button>

              <AnimatePresence>
                {activeMenu === 'engines' && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.99 }}
                    transition={{ duration: 0.12, ease: 'easeOut' }}
                    className="flyout-menu flyout-engines"
                  >
                    <div className="flyout-grid">
                      {ENGINES_ITEMS.map((item) => {
                        const Icon = item.icon;
                        return (
                          <a
                            key={item.title}
                            href={item.href}
                            className="flyout-item"
                            onClick={() => setActiveMenu(null)}
                          >
                            <div className="flyout-icon-box">
                              <Icon size={14} color="#3ECF8E" strokeWidth={1.75} />
                            </div>
                            <div className="flyout-item-body">
                              <span className="flyout-item-title">{item.title}</span>
                              <span className="flyout-item-desc">{item.desc}</span>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 2. Solutions Dropdown */}
            <div
              className="dropdown-wrapper"
              onMouseEnter={() => handleMouseEnter('solutions')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                className={`nav-btn ${activeMenu === 'solutions' ? 'nav-btn-active' : ''}`}
                onClick={() => setActiveMenu(activeMenu === 'solutions' ? null : 'solutions')}
              >
                <span>Solutions</span>
                <ChevronDown
                  size={12}
                  className={`chevron-icon ${activeMenu === 'solutions' ? 'rotated' : ''}`}
                />
              </button>

              <AnimatePresence>
                {activeMenu === 'solutions' && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.99 }}
                    transition={{ duration: 0.12, ease: 'easeOut' }}
                    className="flyout-menu flyout-solutions"
                  >
                    <div className="flyout-stack">
                      {SOLUTIONS_ITEMS.map((item) => {
                        const Icon = item.icon;
                        return (
                          <a
                            key={item.title}
                            href={item.href}
                            className="flyout-item"
                            onClick={() => setActiveMenu(null)}
                          >
                            <div className="flyout-icon-box">
                              <Icon size={14} color="#3ECF8E" strokeWidth={1.75} />
                            </div>
                            <div className="flyout-item-body">
                              <span className="flyout-item-title">{item.title}</span>
                              <span className="flyout-item-desc">{item.desc}</span>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 3. Direct Header Links */}
            {DIRECT_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="nav-direct-link"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Action CTA Group */}
        <div className="navbar-action-group">
          <a
            href="/login"
            className="navbar-login-link"
          >
            Sign In
          </a>
          <a
            href="/register"
            className="navbar-register-btn"
          >
            Register
          </a>
          <a
            href="/#showcase"
            className="navbar-cta-btn"
          >
            Launch Tracker
          </a>

          {/* Mobile Hamburger Toggle (< 768px) */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="mobile-hamburger-btn"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer / Fullscreen Slide-Over (< 768px) */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="mobile-drawer-overlay"
          >
            <div className="mobile-drawer-content">
              {/* Engines Section */}
              <div className="mobile-section">
                <span className="mobile-section-label">ENGINES</span>
                <div className="mobile-links-list">
                  {ENGINES_ITEMS.map((item) => (
                    <a
                      key={item.title}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="mobile-nav-link"
                    >
                      <div className="mobile-nav-item-body">
                        <span className="mobile-nav-item-title">{item.title}</span>
                        <span className="mobile-nav-item-desc">{item.desc}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Solutions Section */}
              <div className="mobile-section">
                <span className="mobile-section-label">SOLUTIONS</span>
                <div className="mobile-links-list">
                  {SOLUTIONS_ITEMS.map((item) => (
                    <a
                      key={item.title}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="mobile-nav-link"
                    >
                      <div className="mobile-nav-item-body">
                        <span className="mobile-nav-item-title">{item.title}</span>
                        <span className="mobile-nav-item-desc">{item.desc}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Direct Links Section */}
              <div className="mobile-section">
                <span className="mobile-section-label">PLATFORM &amp; DOCS</span>
                <div className="mobile-direct-grid">
                  {DIRECT_LINKS.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="mobile-direct-link"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>

              {/* Mobile CTA */}
              <div className="mobile-cta-wrap">
                <a
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="mobile-register-btn"
                >
                  Register Free Account
                </a>
                <a
                  href="/#showcase"
                  onClick={() => setMobileOpen(false)}
                  className="mobile-launch-btn"
                >
                  Launch Tracker
                </a>
                <div style={{ textAlign: 'center', marginTop: '14px' }}>
                  <a
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="mobile-login-link"
                  >
                    Already have an account? Sign In &rarr;
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .navbar-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          height: 60px;
          width: 100%;
          background-color: transparent;
          border-bottom: 1px solid transparent;
          backdrop-filter: none;
          -webkit-backdrop-filter: none;
          transition: background-color 200ms ease, border-color 200ms ease, backdrop-filter 200ms ease;
        }

        .navbar-header.scrolled {
          background-color: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .navbar-inner {
          max-width: 1280px;
          height: 100%;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-sizing: border-box;
        }

        .navbar-brand-group {
          display: flex;
          align-items: center;
          gap: 28px;
        }

        .navbar-brand-link {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          flex-shrink: 0;
        }

        .navbar-logo {
          height: 24px;
          width: auto;
          display: block;
          object-fit: contain;
        }

        .navbar-brand-text {
          font-family: var(--font-sans, system-ui, sans-serif);
          font-size: 0.9375rem;
          font-weight: 700;
          color: #FFFFFF;
          letter-spacing: -0.02em;
        }

        /* ── Desktop Navigation ─────────────────────────────────────────────────── */
        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .dropdown-wrapper {
          position: relative;
        }

        .nav-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          border-radius: 6px;
          background: transparent;
          border: none;
          color: #888888;
          font-family: var(--font-sans, system-ui, sans-serif);
          font-size: 0.8125rem;
          font-weight: 500;
          cursor: pointer;
          transition: color 150ms ease-in-out;
        }

        .nav-btn:hover,
        .nav-btn-active {
          color: #3ECF8E;
          background-color: transparent;
        }

        .chevron-icon {
          color: #737373;
          transition: transform 150ms ease, color 150ms ease-in-out;
        }

        .nav-btn:hover .chevron-icon,
        .nav-btn-active .chevron-icon {
          color: #3ECF8E;
        }

        .chevron-icon.rotated {
          transform: rotate(180deg);
          color: #3ECF8E;
        }

        /* ── Flyout Dropdowns (Institutional Zero-Card Surface) ─────────────────── */
        .flyout-menu {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          background: #0A0A0A;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.95);
          padding: 16px;
          border-radius: 8px;
          z-index: 100;
        }

        .flyout-engines {
          width: 540px;
        }

        .flyout-solutions {
          width: 380px;
        }

        .flyout-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 6px;
        }

        .flyout-stack {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .flyout-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 6px;
          text-decoration: none;
          background: transparent;
        }

        .flyout-item:hover {
          background-color: transparent;
        }

        .flyout-icon-box {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .flyout-item-body {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .flyout-item-title {
          font-family: var(--font-sans, system-ui, sans-serif);
          color: #FFFFFF;
          font-size: 0.8125rem;
          font-weight: 600;
          letter-spacing: -0.01em;
          transition: color 150ms ease-in-out;
        }

        .flyout-item:hover .flyout-item-title {
          color: #3ECF8E;
        }

        .flyout-item-desc {
          color: #888888;
          font-size: 0.75rem;
          line-height: 1.4;
        }

        .nav-direct-link {
          padding: 6px 12px;
          border-radius: 6px;
          color: #888888;
          font-family: var(--font-sans, system-ui, sans-serif);
          font-size: 0.8125rem;
          font-weight: 500;
          text-decoration: none;
          background: transparent;
          transition: color 150ms ease-in-out;
        }

        .nav-direct-link:hover {
          color: #3ECF8E;
          background-color: transparent;
        }

        /* ── Action CTA Group ───────────────────────────────────────────────────── */
        .navbar-action-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .navbar-login-link {
          color: #888888;
          font-family: var(--font-sans, system-ui, sans-serif);
          font-weight: 500;
          font-size: 0.75rem;
          padding: 6px 10px;
          text-decoration: none;
          transition: color 140ms ease;
          white-space: nowrap;
        }

        .navbar-login-link:hover {
          color: #FFFFFF;
        }

        .navbar-register-btn {
          background-color: transparent;
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: #EDEDED;
          font-family: var(--font-sans, system-ui, sans-serif);
          font-weight: 600;
          font-size: 0.75rem;
          padding: 7px 14px;
          border-radius: 8px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          white-space: nowrap;
          line-height: 1;
          transition: all 140ms ease;
        }

        .navbar-register-btn:hover {
          background-color: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.28);
          color: #FFFFFF;
        }

        .navbar-cta-btn {
          background-color: #3ECF8E;
          color: #0A0A0A;
          font-family: var(--font-sans, system-ui, sans-serif);
          font-size: 0.75rem;
          font-weight: 700;
          padding: 8px 16px;
          border-radius: 8px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          white-space: nowrap;
          line-height: 1;
          transition: background-color 140ms ease;
        }

        .navbar-cta-btn:hover {
          background-color: #34B27B;
        }

        .mobile-hamburger-btn {
          display: none;
          padding: 6px;
          background: transparent;
          border: none;
          color: #888888;
          cursor: pointer;
          transition: color 140ms ease;
        }

        .mobile-hamburger-btn:hover {
          color: #FFFFFF;
        }

        /* ── Mobile Fullscreen Slide-Over Drawer (< 768px) ─────────────────────── */
        .mobile-drawer-overlay {
          display: none;
        }

        @media (max-width: 900px) {
          .desktop-nav {
            display: none !important;
          }

          .mobile-hamburger-btn {
            display: block !important;
          }
        }

        @media (max-width: 768px) {
          .navbar-header {
            height: 56px !important;
          }

          .navbar-inner {
            padding: 0 16px !important;
          }

          .navbar-logo {
            height: 22px !important;
          }

          .navbar-login-link,
          .navbar-register-btn,
          .navbar-cta-btn {
            display: none !important;
          }

          .mobile-drawer-overlay {
            display: block !important;
            position: fixed;
            top: 56px;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 49;
            background: #0A0A0A;
            border-top: 1px solid rgba(255, 255, 255, 0.06);
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
          }

          .mobile-drawer-content {
            padding: 24px 20px 48px 20px;
            display: flex;
            flex-direction: column;
            gap: 28px;
            max-width: 520px;
            margin: 0 auto;
          }

          .mobile-section {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .mobile-section-label {
            font-family: var(--font-mono, monospace);
            font-size: 0.6875rem;
            font-weight: 600;
            color: #737373;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          .mobile-links-list {
            display: flex;
            flex-direction: column;
            gap: 14px;
          }

          .mobile-nav-link {
            text-decoration: none;
            display: block;
            padding: 6px 0;
          }

          .mobile-nav-item-body {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .mobile-nav-item-title {
            font-family: var(--font-sans, system-ui, sans-serif);
            font-size: 0.9375rem;
            font-weight: 600;
            color: #FFFFFF;
          }

          .mobile-nav-item-desc {
            font-size: 0.75rem;
            color: #888888;
            line-height: 1.4;
          }

          .mobile-direct-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .mobile-direct-link {
            font-family: var(--font-sans, system-ui, sans-serif);
            font-size: 0.875rem;
            font-weight: 500;
            color: #A3A3A3;
            text-decoration: none;
            padding: 6px 0;
            transition: color 140ms ease;
          }

          .mobile-direct-link:hover {
            color: #3ECF8E;
          }

          .mobile-cta-wrap {
            margin-top: 8px;
            padding-top: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.06);
          }

          .mobile-register-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            background-color: transparent;
            border: 1px solid rgba(255, 255, 255, 0.16);
            color: #FFFFFF;
            font-family: var(--font-sans, system-ui, sans-serif);
            font-size: 0.875rem;
            font-weight: 600;
            padding: 11px 16px;
            border-radius: 8px;
            text-decoration: none;
            box-sizing: border-box;
            margin-bottom: 10px;
            transition: background-color 140ms ease;
          }

          .mobile-register-btn:hover {
            background-color: rgba(255, 255, 255, 0.06);
          }

          .mobile-launch-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            background-color: #3ECF8E;
            color: #0A0A0A;
            font-family: var(--font-sans, system-ui, sans-serif);
            font-size: 0.875rem;
            font-weight: 700;
            padding: 12px 16px;
            border-radius: 8px;
            text-decoration: none;
            box-sizing: border-box;
            transition: background-color 140ms ease;
          }

          .mobile-launch-btn:hover {
            background-color: #34B27B;
          }

          .mobile-login-link {
            color: #888888;
            font-family: var(--font-mono, monospace);
            font-size: 0.75rem;
            text-decoration: none;
            transition: color 140ms ease;
          }

          .mobile-login-link:hover {
            color: #3ECF8E;
          }
        }
      `}</style>
    </header>
  );
}
