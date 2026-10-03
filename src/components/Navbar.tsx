import { ChevronDown, Menu, X } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import cawlixLogo from '../assets/ICon.png';

const NAV_ITEMS = [
  {
    label: 'Products',
    children: [
      { label: 'True-Cost Engine',   desc: 'Exact out-of-pocket spend calculation',       href: '#showcase' },
      { label: 'Landed-Cost Engine', desc: 'Import economics for US → Egypt sourcing',    href: '#showcase' },
      { label: 'Ghost Auditor',      desc: 'Synthetic price spike detection & scoring',   href: '#showcase' },
      { label: 'Flash Glitch Radar', desc: 'Flash sale & glitch deal early detection',    href: '#showcase' },
    ],
  },
  {
    label: 'Intelligence',
    children: [
      { label: 'Market Telemetry',  desc: 'Sub-200ms price probe telemetry across 12 retailers', href: '#showcase' },
      { label: 'Arbitrage Corridors', desc: 'US to Egypt import spread benchmarks',              href: '#showcase' },
      { label: 'Customs & FX Matrix', desc: 'Live statutory tariff & commercial rate feeds',     href: '#showcase' },
    ],
  },
  {
    label: 'Developers',
    children: [
      { label: 'REST API',      desc: 'Deterministic endpoints for prices & audits', href: '#' },
      { label: 'Documentation', desc: 'SDKs, Webhooks & Telemetry protocol',        href: '#' },
      { label: 'System Status', desc: 'Cluster uptime & engine latency',             href: '#' },
    ],
  },
  { label: 'Enterprise', href: '#' },
];

interface DropdownProps {
  items: { label: string; desc: string; href: string }[];
}

function Dropdown({ items }: DropdownProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#121212',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '10px',
        padding: '6px',
        minWidth: '270px',
        boxShadow: '0 20px 48px rgba(0, 0, 0, 0.75)',
        zIndex: 100,
      }}
    >
      {items.map((item) => (
        <a
          key={item.label}
          href={item.href}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '3px',
            padding: '10px 12px',
            borderRadius: '6px',
            textDecoration: 'none',
            transition: 'background 140ms ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <span style={{ fontSize: '0.8125rem', color: '#FFFFFF', fontWeight: 500, letterSpacing: '-0.01em' }}>
            {item.label}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#888888', lineHeight: 1.4 }}>
            {item.desc}
          </span>
        </a>
      ))}
    </div>
  );
}

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: '60px',
        background: 'rgba(10, 10, 10, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: '1280px',
          margin: '0 auto',
        }}
      >
        {/* ── Brand Logo ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <a
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            <img
              src={cawlixLogo}
              alt="Cawlix Logo"
              style={{
                height: '26px',
                width: 'auto',
                display: 'block',
                objectFit: 'contain',
              }}
            />
            <span
              style={{
                fontWeight: 600,
                fontSize: '0.9375rem',
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
              }}
            >
              Cawlix
            </span>
          </a>

          {/* ── Desktop Nav Links ── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            className="hidden-mobile"
          >
            {NAV_ITEMS.map((item) =>
              item.children ? (
                <div
                  key={item.label}
                  style={{ position: 'relative' }}
                  onMouseEnter={() => setOpenMenu(item.label)}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  <button
                    className={clsx('btn', 'btn-ghost', 'btn-sm')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: openMenu === item.label ? '#FFFFFF' : '#888888',
                      fontSize: '0.8125rem',
                      fontWeight: 500,
                      padding: '6px 10px',
                    }}
                  >
                    {item.label}
                    <ChevronDown
                      size={12}
                      strokeWidth={1.5}
                      style={{
                        transition: 'transform 140ms ease',
                        transform: openMenu === item.label ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                    />
                  </button>
                  {openMenu === item.label && <Dropdown items={item.children} />}
                </div>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  className={clsx('btn', 'btn-ghost', 'btn-sm')}
                  style={{
                    color: '#888888',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    padding: '6px 10px',
                  }}
                >
                  {item.label}
                </a>
              )
            )}
          </div>
        </div>

        {/* ── Right Action CTAs ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <a
            href="/sign-in"
            className={clsx('btn', 'btn-ghost', 'btn-sm')}
            style={{
              color: '#888888',
              fontSize: '0.8125rem',
              fontWeight: 500,
            }}
          >
            Sign In
          </a>
          <a
            href="#showcase"
            className={clsx('btn', 'btn-primary', 'btn-sm')}
            style={{
              fontSize: '0.8125rem',
              fontWeight: 500,
              padding: '7px 14px',
              borderRadius: '8px',
            }}
          >
            Launch Tracker
          </a>

          {/* Mobile hamburger */}
          <button
            className={clsx('btn', 'btn-ghost', 'btn-sm')}
            onClick={() => setMobileOpen((v) => !v)}
            style={{ display: 'none', padding: '6px' }}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
