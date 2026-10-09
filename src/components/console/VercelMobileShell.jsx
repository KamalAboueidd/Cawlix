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
    if (!searchQuery.trim() || isLiveSearching) return;
    setIsLiveSearching(true);
    setLiveSearchError('');
    try {
      // Dispatcher returns: { found, masterProduct, listings, matchedCount, message }
      const response = await executeLiveFederatedSearch(searchQuery.trim());
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
          badge: trackedCount > 0 ? (isRtl ? `${trackedCount} منتج` : `${trackedCount} SKUs`) : (isRtl ? 'نشط' : 'ACTIVE'),
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
              setIsSearchOpen(true);
              setIsNavOpen(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#EDEDED',
              fontSize: '0.8125rem',
              fontWeight: 500,
              cursor: 'pointer',
              padding: '4px 6px',
              borderRadius: '9999px',
              transition: 'all 120ms ease',
              fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist', sans-serif",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#EDEDED')}
            aria-label="Universal Search"
          >
            <Search size={14} color="#A1A1AA" style={{ flexShrink: 0 }} />
            <span style={{ letterSpacing: '-0.01em' }}>
              {isRtl ? 'بحث / Find' : 'Find / بحث'}
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

          {/* Right Segment: Menu toggle (☰ icon / ✕ when open) */}
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
              backgroundColor: isNavOpen ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              border: 'none',
              color: isNavOpen ? '#FFFFFF' : '#EDEDED',
              fontSize: '0.8125rem',
              fontWeight: 500,
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '9999px',
              transition: 'all 120ms ease',
              fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist', sans-serif",
            }}
            aria-label={isNavOpen ? 'Close Menu' : 'Open Menu'}
          >
            {isNavOpen ? (
              <X size={15} color="#FB7185" style={{ flexShrink: 0 }} />
            ) : (
              <Menu size={15} color="#EDEDED" style={{ flexShrink: 0 }} />
            )}
            <span style={{ letterSpacing: '-0.01em' }}>
              {isNavOpen
                ? (isRtl ? 'إغلاق' : 'Close')
                : (isRtl ? 'القائمة' : 'Menu')}
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
                    }}
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

            {/* Close '✕' Button & Realtime Ping Dot */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: realtimeConnected ? '#00DF8F' : '#F59E0B',
                  boxShadow: realtimeConnected ? '0 0 8px rgba(0, 223, 143, 0.8)' : 'none',
                }}
                title={realtimeConnected ? 'WebSocket Online' : 'Standby'}
              />
              <button
                type="button"
                onClick={() => setIsNavOpen(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#111111',
                  border: '1px solid #222222',
                  color: '#EDEDED',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                aria-label="Close Navigation"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Quick Actions Strip (Language Switcher + Fleet Audit + Add SKU) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '8px',
            }}
          >
            {/* Language Switch */}
            <button
              type="button"
              onClick={toggleLang}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                padding: '8px 10px',
                borderRadius: '6px',
                backgroundColor: '#0A0A0A',
                border: '1px solid #222222',
                color: '#EDEDED',
                fontSize: '0.75rem',
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist', sans-serif",
              }}
            >
              <span>{isRtl ? '🇬🇧' : '🇸🇦'}</span>
              <span>{isRtl ? 'English' : 'عربي'}</span>
            </button>

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
                padding: '8px 10px',
                borderRadius: '6px',
                backgroundColor: fleetAuditCompleted ? 'rgba(16, 185, 129, 0.15)' : '#0A0A0A',
                border: fleetAuditCompleted ? '1px solid #10B981' : '1px solid #222222',
                color: fleetAuditCompleted ? '#10B981' : '#EDEDED',
                fontSize: '0.75rem',
                fontWeight: 500,
                cursor: fleetAuditProgress ? 'not-allowed' : 'pointer',
                fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist', sans-serif",
              }}
            >
              <Zap size={12} color={fleetAuditCompleted ? '#10B981' : '#888888'} />
              <span>{fleetAuditCompleted ? (isRtl ? 'تم الفحص ✓' : 'Audited ✓') : (isRtl ? 'فحص المتاجر' : 'Audit Fleet')}</span>
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
                padding: '8px 10px',
                borderRadius: '6px',
                backgroundColor: '#FFFFFF',
                border: 'none',
                color: '#000000',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist', sans-serif",
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
                        color: isActive ? '#FFFFFF' : '#A1A1AA',
                        fontSize: '0.875rem',
                        fontWeight: isActive ? 500 : 400,
                        cursor: 'pointer',
                        textAlign: 'start',
                        transition: 'all 120ms ease',
                        fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist', sans-serif",
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: isActive ? '#10B981' : '#71717A', display: 'flex' }}>
                          {route.icon}
                        </span>
                        <span>{route.label}</span>
                      </div>

                      {route.badge && (
                        <span
                          style={{
                            fontSize: '0.625rem',
                            fontWeight: 500,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor:
                              route.badge === 'SPREADS' || route.badge === 'فروق أسعار'
                                ? 'rgba(16, 185, 129, 0.12)'
                                : route.badge === '12/12'
                                ? 'rgba(56, 189, 248, 0.12)'
                                : route.badge === '3 HIKES' || (typeof route.badge === 'string' && route.badge.includes('تلاعب'))
                                ? 'rgba(251, 113, 133, 0.12)'
                                : 'rgba(255, 255, 255, 0.05)',
                            color:
                              route.badge === 'SPREADS' || route.badge === 'فروق أسعار'
                                ? '#10B981'
                                : route.badge === '12/12'
                                ? '#38BDF8'
                                : route.badge === '3 HIKES' || (typeof route.badge === 'string' && route.badge.includes('تلاعب'))
                                ? '#FB7185'
                                : '#888888',
                            fontFamily: "'Geist Mono', monospace",
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

            {/* Sign Out Button in Drawer */}
            <div style={{ paddingTop: '6px' }}>
              <button
                type="button"
                onClick={() => {
                  if (onSignOut) onSignOut();
                  setIsNavOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(239, 68, 68, 0.06)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  color: '#EF4444',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textAlign: 'start',
                  fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist', sans-serif",
                }}
              >
                <LogOut size={15} color="#EF4444" />
                <span>{isRtl ? 'تسجيل الخروج من الحساب' : 'Sign Out of Account'}</span>
              </button>
            </div>
          </div>

          {/* System Status Indicator at the Very Bottom */}
          <div
            style={{
              marginTop: 'auto',
              paddingTop: '20px',
              borderTop: '1px solid #1F1F1F',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#00DF8F',
                boxShadow: '0 0 8px rgba(0, 223, 143, 0.9)',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: '0.6875rem',
                color: '#A1A1AA',
                fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist Mono', monospace",
              }}
            >
              {isRtl ? 'جميع الأنظمة متصلة وتعمل بكفاءة' : 'All systems normal · 12 Nodes Online'}
            </span>
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
          {/* Search Header Row with Input & Close Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                flex: 1,
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
                  }
                }}
                placeholder={isRtl ? 'ابحث في المتاجر الـ 12 (مثل: iPhone 16 Pro, S24...)' : 'Search 12 platforms (e.g. iPhone 16 Pro, S24...)'}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#EDEDED',
                  fontSize: '0.875rem',
                  fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist', sans-serif",
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#888888',
                    cursor: 'pointer',
                    fontSize: '14px',
                    padding: 0,
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsSearchOpen(false)}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: '#111111',
                border: '1px solid #222222',
                color: '#EDEDED',
                fontSize: '0.8125rem',
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist', sans-serif",
                whiteSpace: 'nowrap',
              }}
            >
              {isRtl ? 'إلغاء' : 'Cancel'}
            </button>
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
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#10B981',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: isLiveSearching ? 'wait' : 'pointer',
                fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist', sans-serif",
                textAlign: 'start',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isLiveSearching ? (
                  <Loader2 size={15} color="#10B981" style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <Sparkles size={15} color="#10B981" />
                )}
                <span>
                  {isLiveSearching
                    ? (isRtl ? 'جاري مسح المتاجر المصرية الـ 12 مباشرة...' : 'Scanning all 12 Egyptian platform websites...')
                    : (isRtl ? `بحث مباشر في مواقع المتاجر الـ 12 الآن عن: "${searchQuery}"` : `Execute live probe across all 12 retailers: "${searchQuery}"`)}
                </span>
              </div>
              <span style={{ fontSize: '0.6875rem', fontFamily: "'Geist Mono', monospace" }}>
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
