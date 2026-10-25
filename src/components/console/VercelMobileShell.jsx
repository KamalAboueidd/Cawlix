import { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Layers,
  TrendingDown,
  Server,
  ShieldAlert,
  BookmarkCheck,
  FileSpreadsheet,
  Terminal,
  Settings,
  Search,
  Menu,
  X,
  LogOut,
  ExternalLink,
  Loader2,
  Sparkles,
  Zap,
} from 'lucide-react';
import cawlixLogo from '../../assets/ICon.png';
import { useLanguage } from '../../context/LanguageContext';
import { searchLocalMasterProducts } from '../../services/productResolver';
import { executeLiveFederatedSearch } from '../../services/liveSearchDispatcher';

/**
 * VERCEL-STYLE MOBILE SHELL & COMMAND PILL (CAWLIX)
 * - Fixed floating bottom command pill (Mobile Only: max-w-md mx-auto)
 * - Full-screen clean institutional navigation sheet (Vercel mobile drawer)
 * - Integrated mobile Command Palette search modal
 * - Strict RTL/LTR bidirectional support
 */
export default function VercelMobileShell({
  activeTab = 'overview',
  onTabChange,
  trackedCount = 0,
  anomalyCount = 0,
  watchlistCount = 0,
  userHandle = 'kamalaboueidd',
  userEmail = 'kamalaboueidd@gmail.com',
  realtimeConnected = true,
  onSignOut,
  onRunFleetAudit,
  fleetAuditProgress = null,
  fleetAuditCompleted = false,
  onOpenAddSku,
  onSelectProduct,
}) {
  const { lang, toggleLang, isRtl, dir, t, getRetailerName, formatCurrency } = useLanguage();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Search modal state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLiveSearching, setIsLiveSearching] = useState(false);
  const [liveSearchError, setLiveSearchError] = useState('');
  const searchInputRef = useRef(null);

  // Auto-focus search input when modal opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery('');
      setSearchResults([]);
      setLiveSearchError('');
      setIsLiveSearching(false);
    }
  }, [isSearchOpen]);

  // Lock body scroll when navigation or search modal is open
  useEffect(() => {
    if (isNavOpen || isSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isNavOpen, isSearchOpen]);

  // Handle local catalog search with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setLiveSearchError('');
      return;
    }
    const results = searchLocalMasterProducts(searchQuery.trim(), 8);
    setSearchResults(results);
  }, [searchQuery]);

  // Execute live federated search across Egyptian platforms
  const handleExecuteLiveSearch = async () => {
    const q = searchQuery?.trim();
    console.log('[CAWLIX_LIVE_SEARCH] Triggered for:', q);
    if (!q || isLiveSearching) return;
    setIsLiveSearching(true);
    setLiveSearchError('');
    try {
      // Dispatcher returns: { found, masterProduct, listings, matchedCount, message }
      const response = await executeLiveFederatedSearch(q);
      console.log('[CAWLIX_LIVE_SEARCH] Results received:', response);
      if (response?.found && response.masterProduct) {
        // Auto-select and navigate to the resolved product's market matrix
        handleSelectSearchResult(response.masterProduct);
      } else {
        setLiveSearchError(
          response?.message ||
          (isRtl
            ? `لم يتم العثور على نتائج تطابق "${searchQuery}" في المتاجر الـ 12 حالياً.`
            : `No verified active matches found for "${searchQuery}" across 12 domestic retailers.`)
        );
      }
    } catch (err) {
      console.error('[CAWLIX_LIVE_SEARCH] Execution failed:', err);
      setLiveSearchError(
        isRtl
          ? 'حدث خطأ أثناء الاتصال بعقد المتاجر المصرية. حاول مجدداً.'
          : `Error querying domestic platform nodes: ${err.message}`
      );
    } finally {
      setIsLiveSearching(false);
    }
  };

  const handleSelectSearchResult = (product) => {
    if (!product) return;
    if (onSelectProduct) {
      onSelectProduct(product);
    }
    setIsSearchOpen(false);
    setIsNavOpen(false);
  };

  const sectors = [
    {
      title: t('nav.telemetryFleet'),
      items: [
        {
          id: 'overview',
          label: t('nav.overview'),
          badge: trackedCount > 0 ? (isRtl ? `${trackedCount} منتج` : `${trackedCount} SKUs`) : null,
          icon: <Activity size={16} />,
        },
        {
          id: 'intelligence',
          label: t('nav.marketMatrix'),
          badge: isRtl ? '12 متجر' : '12 NODES',
          icon: <Layers size={16} />,
        },
      ],
    },
    {
      title: isRtl ? 'فروق الأسعار وتحليل التلاعب' : 'MARKET ARBITRAGE & FORENSICS',
      items: [
        {
          id: 'arbitrage',
          label: t('nav.arbitrageEngine'),
          badge: isRtl ? 'فروق أسعار' : 'SPREADS',
          icon: <TrendingDown size={16} />,
        },
        {
          id: 'retailer-health',
          label: t('nav.retailerHealth'),
          badge: '12/12',
          icon: <Server size={16} />,
        },
        {
          id: 'forensics',
          label: t('nav.glitchRadar'),
          badge: anomalyCount > 0 ? (isRtl ? `${anomalyCount} تلاعب` : `${anomalyCount} HIKES`) : (isRtl ? 'رادار' : 'RADAR'),
          icon: <ShieldAlert size={16} />,
        },
      ],
    },
    {
      title: isRtl ? 'قوائم المتابعة والتقارير' : 'TRADER WORKSPACE',
      items: [
        {
          id: 'watchlist',
          label: t('nav.watchlist'),
          badge: watchlistCount > 0 ? `${watchlistCount}` : null,
          icon: <BookmarkCheck size={16} />,
        },
        {
          id: 'reports',
          label: t('nav.reports'),
          badge: isRtl ? 'ملفات البيانات' : 'CSV/JSON',
          icon: <FileSpreadsheet size={16} />,
        },
      ],
    },
    {
      title: t('nav.systemLogs'),
      items: [
        {
          id: 'logs',
          label: isRtl ? 'سجل العمليات والتدقيق' : 'System Telemetry Logs',
          badge: anomalyCount ? `${anomalyCount}` : null,
          icon: <Terminal size={16} />,
        },
        {
          id: 'settings',
          label: t('nav.settings'),
          icon: <Settings size={16} />,
        },
      ],
    },
  ];

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────────────────────
          1. VERCEL FLOATING BOTTOM COMMAND PILL (MOBILE ONLY: max-w-md mx-auto)
          fixed bottom-5 left-1/2 -translate-x-1/2 z-50
          rounded-full bg-[#111111]/90 backdrop-blur-md border border-white/10 shadow-2xl px-4 py-2.5
          ───────────────────────────────────────────────────────────────────────────── */}
      <nav
        aria-label="Mobile Command Pill"
        dir={dir}
        className="vercel-floating-pill-container vercel-mobile-only"
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 50,
          width: 'max-content',
          maxWidth: 'min(420px, calc(100vw - 32px))',
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: 'rgba(17, 17, 17, 0.92)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '9999px',
            padding: '8px 16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.05)',
            userSelect: 'none',
          }}
        >
          {/* Left Segment: Search button (🔍 icon + text بحث / Find) */}
          <button
            type="button"
            onClick={() => {
              setIsSearchOpen((prev) => !prev);
              setIsNavOpen(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'transparent',
              border: 'none',
              color: isSearchOpen ? '#FFFFFF' : '#EDEDED',
              fontSize: '0.8125rem',
              fontWeight: 500,
              cursor: 'pointer',
              padding: '4px 6px',
              borderRadius: '9999px',
              transition: 'all 120ms ease',
              fontFamily: "'Geist', sans-serif",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#10B981';
              const svg = e.currentTarget.querySelector('svg');
              if (svg) svg.style.stroke = '#10B981';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = isSearchOpen ? '#10B981' : '#EDEDED';
              const svg = e.currentTarget.querySelector('svg');
              if (svg) svg.style.stroke = isSearchOpen ? '#10B981' : '#A1A1AA';
            }}
            aria-label="Universal Search"
          >
            <Search size={14} color={isSearchOpen ? '#10B981' : '#A1A1AA'} style={{ flexShrink: 0, transition: 'stroke 120ms ease' }} />
            <span style={{ letterSpacing: '-0.01em', transition: 'color 120ms ease' }}>
              {isSearchOpen ? 'Close' : 'Search'}
            </span>
          </button>

          {/* Divider: Subtle hairline separator (w-[1px] h-4 bg-white/20) */}
          <div
            style={{
              width: '1px',
              height: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              flexShrink: 0,
            }}
          />

          {/* Right Segment: Menu toggle (clean minimal text when open, without any '✕' emoji/icons) */}
          <button
            type="button"
            onClick={() => {
              setIsNavOpen((prev) => !prev);
              setIsSearchOpen(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'transparent',
              border: 'none',
              color: isNavOpen ? '#10B981' : '#EDEDED',
              fontSize: '0.8125rem',
              fontWeight: 500,
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '9999px',
              transition: 'all 120ms ease',
              fontFamily: "'Geist', sans-serif",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#10B981';
              const svg = e.currentTarget.querySelector('svg');
              if (svg) svg.style.stroke = '#10B981';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = isNavOpen ? '#10B981' : '#EDEDED';
              const svg = e.currentTarget.querySelector('svg');
              if (svg) svg.style.stroke = isNavOpen ? '#10B981' : '#EDEDED';
            }}
            aria-label={isNavOpen ? 'Close Menu' : 'Open Menu'}
          >
            {!isNavOpen && (
              <Menu size={15} color="#EDEDED" style={{ flexShrink: 0, transition: 'stroke 120ms ease' }} />
            )}
            <span style={{ letterSpacing: '-0.01em', transition: 'color 120ms ease' }}>
              {isNavOpen ? 'Close' : 'Menu'}
            </span>
          </button>
        </div>
      </nav>

      {/* ─────────────────────────────────────────────────────────────────────────────
          2. FULL-SCREEN CLEAN NAVIGATION SHEET (VERCEL MOBILE DRAWER)
          fixed inset-0 z-40 bg-[#000000] p-4 pt-12 overflow-y-auto
          ───────────────────────────────────────────────────────────────────────────── */}
      {isNavOpen && (
        <div
          dir={dir}
          className="vercel-mobile-drawer vercel-mobile-only"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 45,
            backgroundColor: '#000000',
            padding: '16px',
            paddingTop: '20px',
            paddingBottom: '100px', // Extra bottom spacing so floating pill never covers items
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            animation: 'vercelFadeIn 180ms ease forwards',
          }}
        >
          {/* Top Header Row with Logo, User Identity, and Close Button */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '14px',
              borderBottom: '1px solid #1F1F1F',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <img
                src={cawlixLogo}
                alt="Cawlix Mark"
                width={22}
                height={22}
                style={{ width: '22px', height: '22px', objectFit: 'contain', flexShrink: 0 }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: '#EDEDED',
                      fontFamily: "'Geist', sans-serif",
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      transition: 'color 120ms ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#10B981')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#EDEDED')}
                  >
                    {userHandle}
                  </span>
                  <span
                    style={{
                      fontSize: '0.625rem',
                      fontWeight: 600,
                      color: '#888888',
                      padding: '1px 6px',
                      borderRadius: '9999px',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      fontFamily: "'Geist Mono', monospace",
                    }}
                  >
                    PRO FLEET
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    color: '#666666',
                    fontFamily: "'Geist Mono', monospace",
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {userEmail}
                </span>
              </div>
            </div>

            {/* Realtime Ping Dot (minimal indicator without redundant top circular X) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: realtimeConnected ? '#00DF8F' : '#F59E0B',
                  boxShadow: realtimeConnected ? '0 0 6px rgba(0, 223, 143, 0.6)' : 'none',
                }}
                title={realtimeConnected ? 'WebSocket Online' : 'Standby'}
              />
            </div>
          </div>

          {/* Quick Actions Strip (Fleet Audit + Add SKU) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
            }}
          >

            {/* Run Fleet Audit */}
            <button
              type="button"
              onClick={() => {
                if (onRunFleetAudit) onRunFleetAudit();
              }}
              disabled={Boolean(fleetAuditProgress)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                padding: '6px 10px',
                borderRadius: '8px',
                backgroundColor: fleetAuditCompleted ? 'rgba(16, 185, 129, 0.08)' : '#0A0A0A',
                border: fleetAuditCompleted ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid #222222',
                color: fleetAuditCompleted ? '#10B981' : '#EDEDED',
                fontSize: '11px',
                fontWeight: 500,
                cursor: fleetAuditProgress ? 'not-allowed' : 'pointer',
                fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist', sans-serif",
                transition: 'all 120ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#10B981';
                e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)';
                const svg = e.currentTarget.querySelector('svg');
                if (svg) svg.style.stroke = '#10B981';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = fleetAuditCompleted ? '#10B981' : '#EDEDED';
                e.currentTarget.style.borderColor = fleetAuditCompleted ? 'rgba(16, 185, 129, 0.25)' : '1px solid #222222';
                const svg = e.currentTarget.querySelector('svg');
                if (svg) svg.style.stroke = fleetAuditCompleted ? '#10B981' : '#888888';
              }}
            >
              <Zap size={11} color={fleetAuditCompleted ? '#10B981' : '#888888'} style={{ transition: 'stroke 120ms ease' }} />
              <span style={{ transition: 'color 120ms ease' }}>
                {fleetAuditCompleted ? (isRtl ? 'تم الفحص ✓' : 'Audited ✓') : (isRtl ? 'فحص المتاجر' : 'Audit Fleet')}
              </span>
            </button>

            {/* Add Target SKU */}
            <button
              type="button"
              onClick={() => {
                if (onOpenAddSku) onOpenAddSku();
                setIsNavOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                padding: '6px 10px',
                borderRadius: '8px',
                backgroundColor: '#18181B',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#E4E4E7',
                fontSize: '11px',
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist', sans-serif",
                transition: 'all 120ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#202024';
                e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)';
                e.currentTarget.style.color = '#10B981';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#18181B';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = '#E4E4E7';
              }}
            >
              <span>+</span>
              <span>{isRtl ? 'إضافة منتج' : 'Add SKU'}</span>
            </button>
          </div>

          {/* Demarcated Institutional Sectors */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {sectors.map((sector) => (
              <div key={sector.title} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div
                  style={{
                    fontSize: '0.625rem',
                    fontWeight: 600,
                    color: '#666666',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    padding: '4px 6px',
                    fontFamily: "'Geist Mono', monospace",
                  }}
                >
                  {sector.title}
                </div>

                {sector.items.map((route) => {
                  const isActive = activeTab === route.id;
                  return (
                    <button
                      key={route.id}
                      type="button"
                      onClick={() => {
                        onTabChange(route.id);
                        setIsNavOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        backgroundColor: isActive ? '#161616' : 'transparent',
                        border: isActive ? '1px solid #262626' : '1px solid transparent',
                        color: isActive ? '#10B981' : '#A1A1AA',
                        fontSize: '0.875rem',
                        fontWeight: isActive ? 500 : 400,
                        cursor: 'pointer',
                        textAlign: 'start',
                        transition: 'all 120ms ease',
                        fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist', sans-serif",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#10B981';
                        e.currentTarget.style.backgroundColor = isActive ? '#161616' : '#111111';
                        const iconSpan = e.currentTarget.querySelector('.route-icon-wrap');
                        if (iconSpan) {
                          iconSpan.style.color = '#10B981';
                          const svg = iconSpan.querySelector('svg');
                          if (svg) svg.style.stroke = '#10B981';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = isActive ? '#10B981' : '#A1A1AA';
                        e.currentTarget.style.backgroundColor = isActive ? '#161616' : 'transparent';
                        const iconSpan = e.currentTarget.querySelector('.route-icon-wrap');
                        if (iconSpan) {
                          iconSpan.style.color = isActive ? '#10B981' : '#71717A';
                          const svg = iconSpan.querySelector('svg');
                          if (svg) svg.style.stroke = isActive ? '#10B981' : '#71717A';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span
                          className="route-icon-wrap"
                          style={{
                            color: isActive ? '#10B981' : '#71717A',
                            display: 'flex',
                            transition: 'color 120ms ease',
                          }}
                        >
                          {route.icon}
                        </span>
                        <span style={{ transition: 'color 120ms ease' }}>{route.label}</span>
                      </div>

                      {route.badge && (
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 400,
                            color: '#71717A',
                            fontFamily: "'Geist Mono', monospace",
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {route.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}

            {/* Sign Out Link in Drawer (clean minimal text link) */}
            <div style={{ paddingTop: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  if (onSignOut) onSignOut();
                  setIsNavOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#71717A',
                  fontSize: '0.75rem',
                  fontWeight: 400,
                  cursor: 'pointer',
                  textAlign: 'start',
                  transition: 'color 120ms ease',
                  fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist', sans-serif",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#10B981';
                  const svg = e.currentTarget.querySelector('svg');
                  if (svg) svg.style.stroke = '#10B981';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#71717A';
                  const svg = e.currentTarget.querySelector('svg');
                  if (svg) svg.style.stroke = '#71717A';
                }}
              >
                <LogOut size={13} style={{ flexShrink: 0, transition: 'stroke 120ms ease' }} />
                <span style={{ transition: 'color 120ms ease' }}>
                  {isRtl ? 'تسجيل الخروج من الحساب' : 'Sign Out of Account'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          3. FULL-SCREEN MOBILE COMMAND PALETTE SEARCH MODAL
          ───────────────────────────────────────────────────────────────────────────── */}
      {isSearchOpen && (
        <div
          dir={dir}
          className="vercel-mobile-search-modal vercel-mobile-only"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 48,
            backgroundColor: 'rgba(0, 0, 0, 0.96)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            padding: '16px',
            paddingTop: '24px',
            paddingBottom: '100px',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            animation: 'vercelFadeIn 180ms ease forwards',
          }}
        >
          {/* Search Header Row with Full Width Input (No redundant cancel button) */}
          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <div
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#0A0A0A',
                border: '1px solid #2E2E2E',
                borderRadius: '8px',
                padding: '10px 12px',
              }}
            >
              <Search size={16} color="#A1A1AA" style={{ flexShrink: 0 }} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleExecuteLiveSearch();
                  } else if (e.key === 'Escape') {
                    setIsSearchOpen(false);
                  }
                }}
                placeholder={isRtl ? 'ابحث في المتاجر الـ 12 (مثل: iPhone 16 Pro, S24...)' : 'Search 12 platforms (e.g. iPhone 16 Pro, S24...)'}
                className="cawlix-mobile-search-input"
                style={{
                  flex: 1,
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#EDEDED',
                  fontSize: '12px',
                  fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist', sans-serif",
                }}
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#888888',
                    cursor: 'pointer',
                    fontSize: '12px',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  aria-label="Clear Search"
                >
                  <X size={14} color="#71717A" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#71717A',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  aria-label="Close Search"
                >
                  <X size={14} color="#71717A" />
                </button>
              )}
            </div>
          </div>

          {/* Trigger Direct Live Search Button across all 12 Egyptian stores */}
          {searchQuery.trim().length > 0 && (
            <button
              type="button"
              onClick={handleExecuteLiveSearch}
              disabled={isLiveSearching}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: '#111111',
                border: '1px solid #222222',
                color: '#EDEDED',
                fontSize: '0.8125rem',
                fontWeight: 500,
                cursor: isLiveSearching ? 'wait' : 'pointer',
                fontFamily: "'Geist', sans-serif",
                textAlign: 'start',
                transition: 'all 120ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#333333';
                e.currentTarget.style.backgroundColor = '#161616';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#222222';
                e.currentTarget.style.backgroundColor = '#111111';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isLiveSearching && (
                  <Loader2 size={14} color="#10B981" style={{ animation: 'spin 1s linear infinite' }} />
                )}
                <span>
                  {isLiveSearching
                    ? 'Scanning all 12 platform websites...'
                    : `Execute live probe across all 12 retailers: "${searchQuery}"`}
                </span>
              </div>
              <span style={{ fontSize: '0.6875rem', fontFamily: "'Geist Mono', monospace", color: '#888888' }}>
                12 NODES
              </span>
            </button>
          )}

          {/* Search Results Feed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {liveSearchError && (
              <div
                style={{
                  padding: '16px',
                  backgroundColor: '#0A0A0A',
                  border: '1px solid #222222',
                  borderRadius: '8px',
                  color: '#888888',
                  fontSize: '0.8125rem',
                  textAlign: 'center',
                  fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist', sans-serif",
                }}
              >
                {liveSearchError}
              </div>
            )}

            {searchResults.map((item) => {
              const lowestPrice = item.cheapest_price || (item.platform_listings ? Math.min(...item.platform_listings.map((l) => l.current_price).filter((p) => p > 0)) : null);
              const storeCount = item.active_platforms_count || (item.platform_listings ? item.platform_listings.length : 12);

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectSearchResult(item)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#0A0A0A',
                    border: '1px solid #1F1F1F',
                    cursor: 'pointer',
                    transition: 'border-color 120ms ease',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, flex: 1 }}>
                    <span
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#EDEDED',
                        fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist', sans-serif",
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.title}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '0.625rem',
                          color: '#888888',
                          fontFamily: "'Geist Mono', monospace",
                        }}
                      >
                        {item.brand || 'Authentic Egyptian SKU'}
                      </span>
                      <span style={{ fontSize: '0.625rem', color: '#444444' }}>•</span>
                      <span
                        style={{
                          fontSize: '0.625rem',
                          color: '#00DF8F',
                          fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist Mono', monospace",
                        }}
                      >
                        {isRtl ? `${storeCount} متجر متاح` : `${storeCount} domestic stores`}
                      </span>
                    </div>
                  </div>

                  {lowestPrice > 0 && (
                    <div style={{ textAlign: isRtl ? 'left' : 'right', flexShrink: 0 }}>
                      <div
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: '#10B981',
                          fontFamily: "'Geist Mono', monospace",
                        }}
                      >
                        {formatCurrency(lowestPrice)}
                      </div>
                      <span
                        style={{
                          fontSize: '0.625rem',
                          color: '#666666',
                          fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist', sans-serif",
                        }}
                      >
                        {isRtl ? 'أرخص سعر' : 'Best Deal'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
