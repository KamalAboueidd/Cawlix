import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Layers,
  ShieldAlert,
  Globe,
  Zap,
  ShoppingBag,
  Store,
  ArrowRightLeft,
  Activity,
  Grid,
  Terminal,
  Menu,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import cawlixLogo from '../../assets/ICon.png';

interface DropdownItem {
  title: string;
  desc: string;
  href: string;
  icon: React.ComponentType<{ size: number; className?: string; color?: string; strokeWidth?: number; style?: React.CSSProperties }>;
  badge?: string;
}

const ENGINES_ITEMS: DropdownItem[] = [
  {
    title: 'True-Cost Engine',
    desc: 'Deterministic net checkout cost computation',
    href: '/engines/true-cost',
    icon: Layers,
  },
  {
    title: 'Ghost-Discount Auditor',
    desc: '90-day time-series markdown validation',
    href: '/engines/ghost-auditor',
    icon: ShieldAlert,
    badge: 'ZERO-DAY',
  },
  {
    title: 'Landed-Cost Matrix',
    desc: 'US-to-Egypt import customs & FX calculation',
    href: '/engines/landed-cost',
    icon: Globe,
  },
  {
    title: 'Anomaly Glitch Radar',
    desc: 'Sub-second error-pricing detection',
    href: '/engines/anomaly-radar',
    icon: Zap,
    badge: 'LIVE',
  },
];

const SOLUTIONS_ITEMS: DropdownItem[] = [
  {
    title: 'For Consumers',
    desc: 'Find genuine price drops, bank cashback, & coupons',
    href: '/solutions/power-shoppers',
    icon: ShoppingBag,
  },
  {
    title: 'For Retailers & Resellers',
    desc: 'Competitive dynamic pricing & margin monitoring',
    href: '/solutions/retailers',
    icon: Store,
  },
  {
    title: 'Global Arbitrage Traders',
    desc: 'Cross-border import spread & customs arbitrage',
    href: '/solutions/arbitrage',
    icon: ArrowRightLeft,
  },
];

const DEVELOPERS_ITEMS: DropdownItem[] = [
  {
    title: 'Scraper Network Status',
    desc: 'Live telemetry nodes, health & probe latency',
    href: '/status',
    icon: Activity,
    badge: '100%',
  },
  {
    title: 'Coverage Matrix',
    desc: '12 Egyptian stores & direct US freight corridors',
    href: '/network/coverage',
    icon: Grid,
  },
  {
    title: 'API Sandbox',
    desc: 'REST endpoints, webhooks & SDK integrations',
    href: '/docs/api',
    icon: Terminal,
  },
];

const DIRECT_LINKS = [
  { label: 'Pricing', href: '/pricing' },
  { label: 'Changelog', href: '/changelog' },
  { label: 'Blog', href: '/blog' },
  { label: 'Docs', href: '/docs' },
];

export default function Navbar() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseEnter = (menuKey: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(menuKey);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 120);
  };

  const isTransparent = !scrolled && !mobileOpen;

  return (
    <header
      className={`navbar-header ${!isTransparent ? 'scrolled' : ''}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: isTransparent ? 'transparent' : 'rgba(10, 10, 10, 0.90)',
        backdropFilter: isTransparent ? 'none' : 'blur(16px)',
        WebkitBackdropFilter: isTransparent ? 'none' : 'blur(16px)',
        borderBottom: isTransparent ? '1px solid transparent' : '1px solid rgba(255, 255, 255, 0.08)',
        transition: 'background-color 200ms ease, border-color 200ms ease, backdrop-filter 200ms ease',
        width: '100%',
        maxWidth: '100vw',
      }}
    >
      <div
        className="navbar-inner"
        style={{
          maxWidth: '1280px',
          height: '100%',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand Group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <a
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            <img
              src={cawlixLogo}
              alt="Cawlix Logo"
              className="navbar-logo"
              style={{
                width: 'auto',
                display: 'block',
                objectFit: 'contain',
              }}
            />
            <span
              style={{
                fontSize: '0.9375rem',
                fontWeight: 700,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                fontFamily: 'var(--font-sans)',
              }}
            >
              Cawlix
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
            }}
            className="hidden-mobile"
          >
            {/* 1. Engines Dropdown */}
            <div
              style={{ position: 'relative' }}
              onMouseEnter={() => handleMouseEnter('engines')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: activeMenu === 'engines' ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                  border: 'none',
                  color: activeMenu === 'engines' ? '#FFFFFF' : '#888888',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 140ms ease',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Engines
                <ChevronDown
                  size={13}
                  style={{
                    transform: activeMenu === 'engines' ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 150ms ease',
                    color: activeMenu === 'engines' ? '#3ECF8E' : '#737373',
                  }}
                />
              </button>

              <AnimatePresence>
                {activeMenu === 'engines' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      left: 0,
                      width: '640px',
                      background: 'rgba(14, 14, 14, 0.96)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      padding: '12px',
                      boxShadow: '0 24px 64px rgba(0, 0, 0, 0.85)',
                      zIndex: 100,
                    }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '6px',
                      }}
                    >
                      {ENGINES_ITEMS.map((item) => {
                        const Icon = item.icon;
                        return (
                          <a
                            key={item.title}
                            href={item.href}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '12px',
                              padding: '10px 12px',
                              borderRadius: '8px',
                              textDecoration: 'none',
                              transition: 'background-color 140ms ease',
                              background: 'transparent',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <Icon
                              size={18}
                              color="#3ECF8E"
                              strokeWidth={1.8}
                              style={{ flexShrink: 0, marginTop: '2px' }}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0, flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
                                <span style={{ color: '#FFFFFF', fontSize: '0.8125rem', fontWeight: 500 }}>
                                  {item.title}
                                </span>
                                {item.badge && (
                                  <span
                                    style={{
                                      fontFamily: 'var(--font-mono)',
                                      fontSize: '0.625rem',
                                      color: '#3ECF8E',
                                      fontWeight: 600,
                                      letterSpacing: '0.04em',
                                    }}
                                  >
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <span style={{ color: '#888888', fontSize: '0.75rem', lineHeight: 1.4 }}>
                                {item.desc}
                              </span>
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
              style={{ position: 'relative' }}
              onMouseEnter={() => handleMouseEnter('solutions')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: activeMenu === 'solutions' ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                  border: 'none',
                  color: activeMenu === 'solutions' ? '#FFFFFF' : '#888888',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 140ms ease',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Solutions
                <ChevronDown
                  size={13}
                  style={{
                    transform: activeMenu === 'solutions' ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 150ms ease',
                    color: activeMenu === 'solutions' ? '#3ECF8E' : '#737373',
                  }}
                />
              </button>

              <AnimatePresence>
                {activeMenu === 'solutions' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      left: 0,
                      width: '420px',
                      background: 'rgba(14, 14, 14, 0.96)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      padding: '12px',
                      boxShadow: '0 24px 64px rgba(0, 0, 0, 0.85)',
                      zIndex: 100,
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {SOLUTIONS_ITEMS.map((item) => {
                        const Icon = item.icon;
                        return (
                          <a
                            key={item.title}
                            href={item.href}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '12px',
                              padding: '10px 12px',
                              borderRadius: '8px',
                              textDecoration: 'none',
                              transition: 'background-color 140ms ease',
                              background: 'transparent',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <Icon
                              size={18}
                              color="#3ECF8E"
                              strokeWidth={1.8}
                              style={{ flexShrink: 0, marginTop: '2px' }}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0, flex: 1 }}>
                              <span style={{ color: '#FFFFFF', fontSize: '0.8125rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
                                {item.title}
                              </span>
                              <span style={{ color: '#888888', fontSize: '0.75rem', lineHeight: 1.4 }}>
                                {item.desc}
                              </span>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 3. Developers Dropdown */}
            <div
              style={{ position: 'relative' }}
              onMouseEnter={() => handleMouseEnter('developers')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: activeMenu === 'developers' ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                  border: 'none',
                  color: activeMenu === 'developers' ? '#FFFFFF' : '#888888',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 140ms ease',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Developers
                <ChevronDown
                  size={13}
                  style={{
                    transform: activeMenu === 'developers' ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 150ms ease',
                    color: activeMenu === 'developers' ? '#3ECF8E' : '#737373',
                  }}
                />
              </button>

              <AnimatePresence>
                {activeMenu === 'developers' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      left: 0,
                      width: '440px',
                      background: 'rgba(14, 14, 14, 0.96)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      padding: '12px',
                      boxShadow: '0 24px 64px rgba(0, 0, 0, 0.85)',
                      zIndex: 100,
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {DEVELOPERS_ITEMS.map((item) => {
                        const Icon = item.icon;
                        return (
                          <a
                            key={item.title}
                            href={item.href}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '12px',
                              padding: '10px 12px',
                              borderRadius: '8px',
                              textDecoration: 'none',
                              transition: 'background-color 140ms ease',
                              background: 'transparent',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <Icon
                              size={18}
                              color="#3ECF8E"
                              strokeWidth={1.8}
                              style={{ flexShrink: 0, marginTop: '2px' }}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0, flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
                                <span style={{ color: '#FFFFFF', fontSize: '0.8125rem', fontWeight: 500 }}>
                                  {item.title}
                                </span>
                                {item.badge && (
                                  <span
                                    style={{
                                      fontFamily: 'var(--font-mono)',
                                      fontSize: '0.625rem',
                                      color: '#3ECF8E',
                                      fontWeight: 600,
                                      letterSpacing: '0.04em',
                                    }}
                                  >
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <span style={{ color: '#888888', fontSize: '0.75rem', lineHeight: 1.4 }}>
                                {item.desc}
                              </span>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 4. Direct Links */}
            {DIRECT_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  color: '#888888',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'color 140ms ease',
                  fontFamily: 'var(--font-sans)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#888888')}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Action CTA Group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <a
            href="/sign-in"
            className="hidden-mobile"
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#888888',
              textDecoration: 'none',
              transition: 'color 140ms ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#888888')}
          >
            Sign In
          </a>

          <a
            href="/#showcase"
            className="navbar-launch-btn"
            style={{
              backgroundColor: '#3ECF8E',
              color: '#0A0A0A',
              fontWeight: 700,
              fontSize: '0.875rem',
              padding: '8px 16px',
              borderRadius: '8px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              transition: 'background-color 140ms ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#34B27B')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3ECF8E')}
          >
            Launch Tracker
          </a>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              display: 'none',
              padding: '6px',
              background: 'transparent',
              border: 'none',
              color: '#888888',
              cursor: 'pointer',
            }}
            className="show-mobile"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              background: '#0A0A0A',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              overflow: 'hidden',
            }}
          >
            {/* Engines Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: '#737373', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Engines
              </span>
              {ENGINES_ITEMS.map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    color: '#FFFFFF',
                    textDecoration: 'none',
                    fontSize: '0.8125rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '2px 0',
                  }}
                >
                  <span>{item.title}</span>
                  {item.badge && (
                    <span style={{ color: '#3ECF8E', fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', fontWeight: 600 }}>
                      {item.badge}
                    </span>
                  )}
                </a>
              ))}
            </div>

            <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.06)', margin: '4px 0' }} />

            {/* Solutions & Dev Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: '#737373', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Solutions &amp; Network
              </span>
              {SOLUTIONS_ITEMS.concat(DEVELOPERS_ITEMS).map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    color: '#D4D4D4',
                    textDecoration: 'none',
                    fontSize: '0.8125rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '2px 0',
                  }}
                >
                  <span>{item.title}</span>
                  <span style={{ color: '#666666', fontSize: '0.6875rem' }}>&rarr;</span>
                </a>
              ))}
            </div>

            <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.06)', margin: '4px 0' }} />

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', paddingTop: '4px' }}>
              {DIRECT_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  style={{ color: '#888888', textDecoration: 'none', fontSize: '0.75rem' }}
                >
                  {link.label}
                </a>
              ))}
              <a
                href="/sign-in"
                onClick={() => setMobileOpen(false)}
                style={{ color: '#3ECF8E', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 600 }}
              >
                Sign In
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .navbar-header {
          height: 60px;
        }
        .navbar-inner {
          padding: 0 24px;
        }
        .navbar-logo {
          height: 24px;
        }
        @media (max-width: 900px) {
          .hidden-mobile {
            display: none !important;
          }
          .show-mobile {
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
          .navbar-launch-btn {
            font-size: 0.75rem !important;
            padding: 6px 12px !important;
            font-weight: 700 !important;
          }
        }
      `}</style>
    </header>
  );
}
