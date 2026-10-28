import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
import { supabase } from '../../lib/supabaseClient';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
    <>
      <header dir="ltr" className={`navbar-header ${scrolled || mobileOpen ? 'scrolled' : ''}`}>
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
          {isAuthenticated ? (
            <a
              href="/console"
              className="navbar-register-btn"
            >
              Console &rarr;
            </a>
          ) : (
            <>
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
            </>
          )}
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
    </header>

    {/* Mobile Navigation Bottom Sheet (< 900px) */}
    {mounted &&
      createPortal(
        <AnimatePresence>
          {mobileOpen && (
            <>
              {/* Dimmed backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                onClick={() => setMobileOpen(false)}
                className="mobile-sheet-backdrop"
              />

              {/* Bottom Sheet Modal */}
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                className="mobile-bottom-sheet"
              >
                {/* Visual Pull / Drag Handle */}
                <div className="sheet-handle-bar" onClick={() => setMobileOpen(false)}>
                  <div className="sheet-handle-pill" />
                </div>

                {/* Sheet Top Header */}
                <div className="sheet-header">
                  <div className="sheet-brand">
                    <img src={cawlixLogo} alt="Cawlix" className="sheet-brand-icon" />
                    <span className="sheet-brand-name">Cawlix</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="sheet-close-btn"
                    style={{ background: 'transparent', backgroundColor: 'transparent', border: 'none', outline: 'none', boxShadow: 'none', borderRadius: 0, padding: 0 }}
                    aria-label="Close menu"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="sheet-scrollable-content">
                  {/* 1. Core Engines */}
                  <div className="sheet-group">
                    <span className="sheet-group-label">ENGINES</span>
                    <div className="sheet-items-grid">
                      {ENGINES_ITEMS.map((item) => {
                        const Icon = item.icon;
                        return (
                          <a
                            key={item.title}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className="sheet-clean-row"
                          >
                            <Icon size={16} color="#3ECF8E" strokeWidth={1.8} className="sheet-raw-icon" />
                            <div className="sheet-row-text">
                              <span className="sheet-row-title">{item.title}</span>
                              <span className="sheet-row-desc">{item.desc}</span>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Solutions */}
                  <div className="sheet-group">
                    <span className="sheet-group-label">SOLUTIONS</span>
                    <div className="sheet-items-grid">
                      {SOLUTIONS_ITEMS.map((item) => {
                        const Icon = item.icon;
                        return (
                          <a
                            key={item.title}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className="sheet-clean-row"
                          >
                            <Icon size={16} color="#3ECF8E" strokeWidth={1.8} className="sheet-raw-icon" />
                            <div className="sheet-row-text">
                              <span className="sheet-row-title">{item.title}</span>
                              <span className="sheet-row-desc">{item.desc}</span>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. Platform & Docs Text Links (No background, no border) */}
                  <div className="sheet-group">
                    <span className="sheet-group-label">PLATFORM &amp; DOCS</span>
                    <div className="sheet-links-row">
                      {DIRECT_LINKS.map((link) => (
                        <a
                          key={link.label}
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          className="sheet-text-link"
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* 4. Action Buttons & Auth subtext */}
                  <div className="sheet-footer-actions">
                    {isAuthenticated ? (
                      <a
                        href="/console"
                        onClick={() => setMobileOpen(false)}
                        className="sheet-action-primary"
                      >
                        Open Console &rarr;
                      </a>
                    ) : (
                      <>
                        <a
                          href="/register"
                          onClick={() => setMobileOpen(false)}
                          className="sheet-action-primary"
                        >
                          Register Free
                        </a>
                        <div className="sheet-auth-subtext">
                          <span>Already have an account?</span>
                          <a
                            href="/login"
                            onClick={() => setMobileOpen(false)}
                            className="sheet-auth-inline-link"
                          >
                            Sign In
                          </a>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

      <style>{`
        .navbar-header {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          height: 60px;
          width: 100%;
          background: transparent !important;
          background-color: transparent !important;
          border-bottom: none !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
        }

        .navbar-header.scrolled {
          background: transparent !important;
          background-color: transparent !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          border-bottom: none !important;
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
          max-width: min(540px, 92vw);
        }

        .flyout-solutions {
          width: 380px;
          max-width: min(380px, 92vw);
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

        /* ── Mobile Bottom Sheet Drawer (< 900px) ─────────────────────── */
        .mobile-sheet-backdrop {
          display: none;
        }
        .mobile-bottom-sheet {
          display: none;
        }

        @media (max-width: 900px) {
          .desktop-nav {
            display: none !important;
          }

          .mobile-hamburger-btn {
            display: flex !important;
            align-items: center;
            justify-content: center;
            z-index: 10001;
            position: relative;
          }

          .navbar-header {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            height: 56px !important;
            background: transparent !important;
            background-color: transparent !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            border-bottom: none !important;
          }

          .navbar-header.scrolled {
            background: transparent !important;
            background-color: transparent !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            border-bottom: none !important;
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

          /* Backdrop */
          .mobile-sheet-backdrop {
            display: block !important;
            position: fixed !important;
            inset: 0 !important;
            background: rgba(0, 0, 0, 0.72) !important;
            backdrop-filter: blur(8px) !important;
            -webkit-backdrop-filter: blur(8px) !important;
            z-index: 10001 !important;
          }

          /* Bottom Sheet Modal Container */
          .mobile-bottom-sheet {
            display: flex !important;
            flex-direction: column !important;
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: 100vw !important;
            max-height: 86vh !important;
            max-height: 86dvh !important;
            background: #000000 !important;
            background-color: #000000 !important;
            border-top: 1px solid #1F1F1F !important;
            border-top-left-radius: 20px !important;
            border-top-right-radius: 20px !important;
            box-shadow: 0 -12px 36px rgba(0, 0, 0, 0.8) !important;
            z-index: 10002 !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
          }

          .sheet-handle-bar {
            width: 100%;
            padding: 10px 0 4px 0;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          }

          .sheet-handle-pill {
            width: 36px;
            height: 4px;
            border-radius: 2px;
            background: rgba(255, 255, 255, 0.22);
          }

          .sheet-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 4px 18px 12px 18px;
            border-bottom: none !important;
          }

          .sheet-brand {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .sheet-brand-icon {
            height: 18px;
            width: auto;
          }

          .sheet-brand-name {
            font-size: 0.8125rem;
            font-weight: 600;
            color: #FFFFFF;
            letter-spacing: -0.01em;
          }

          .sheet-close-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            background: transparent !important;
            background-color: transparent !important;
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
            color: #888888;
            cursor: pointer;
            transition: color 140ms ease;
            padding: 0 !important;
            border-radius: 0 !important;
            -webkit-tap-highlight-color: transparent !important;
          }

          .sheet-close-btn svg {
            transition: color 140ms ease, stroke 140ms ease;
          }

          .sheet-close-btn:hover,
          .sheet-close-btn:focus,
          .sheet-close-btn:active {
            color: #3ECF8E !important;
            background: transparent !important;
            background-color: transparent !important;
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }

          .sheet-close-btn:hover svg,
          .sheet-close-btn:focus svg,
          .sheet-close-btn:active svg {
            color: #3ECF8E !important;
            stroke: #3ECF8E !important;
          }

          .sheet-scrollable-content {
            padding: 14px 16px 28px 16px;
            display: flex;
            flex-direction: column;
            gap: 16px;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
          }

          .sheet-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .sheet-group-label {
            font-family: var(--font-mono, monospace);
            font-size: 0.625rem;
            font-weight: 600;
            color: #737373;
            letter-spacing: 0.06em;
          }

          .sheet-items-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px 14px;
          }

          .sheet-clean-row {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            background: transparent !important;
            border: none !important;
            padding: 2px 0;
            text-decoration: none;
            transition: opacity 120ms ease;
          }

          .sheet-clean-row:active {
            opacity: 0.7;
          }

          .sheet-raw-icon {
            flex-shrink: 0;
            margin-top: 2px;
          }

          .sheet-row-text {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .sheet-row-title {
            font-size: 0.78rem;
            font-weight: 600;
            color: #FFFFFF;
            line-height: 1.25;
          }

          .sheet-row-desc {
            font-size: 0.65rem;
            color: #737373;
            line-height: 1.3;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .sheet-links-row {
            display: flex;
            flex-wrap: wrap;
            gap: 14px 18px;
            padding: 2px 0;
          }

          .sheet-text-link {
            font-size: 0.75rem;
            font-weight: 500;
            color: #A3A3A3;
            text-decoration: none;
            background: transparent !important;
            border: none !important;
            padding: 0 !important;
            transition: color 120ms ease;
          }

          .sheet-text-link:active {
            color: #3ECF8E;
          }

          .sheet-footer-actions {
            margin-top: 6px;
            padding-top: 14px;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            width: 100%;
          }

          .sheet-action-primary {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 38px;
            background: #3ECF8E !important;
            color: #000000 !important;
            font-weight: 600;
            font-size: 0.8125rem;
            border-radius: 8px;
            text-decoration: none;
            transition: background-color 140ms ease;
          }

          .sheet-action-primary:active {
            background: #34B77B !important;
          }

          .sheet-auth-subtext {
            font-size: 0.75rem;
            color: #737373;
            display: flex;
            align-items: center;
            gap: 4px;
          }

          .sheet-auth-inline-link {
            color: #3ECF8E;
            font-weight: 500;
            text-decoration: underline;
            text-underline-offset: 3px;
            cursor: pointer;
          }

          .sheet-auth-inline-link:active {
            color: #FFFFFF;
          }
      `}</style>
    </>
  );
}
