import { useState, useRef, useEffect } from 'react';
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
  MoreHorizontal,
  Smile,
  Monitor,
  Sun,
  Moon,
  Home,
  Edit3,
  HelpCircle,
  BookOpen,
  LogOut,
  Languages,
} from 'lucide-react';
import NotificationCenter from './NotificationCenter.jsx';
import cawlixLogo from '../../assets/ICon.png';
import { useLanguage } from '../../context/LanguageContext.jsx';

/**
 * Institutional Pitch-Black Sidebar Navigation (CAWLIX)
 * Organized into demarcated institutional sectors with active route indicators and live counters.
 */
export default function Sidebar({
  activeTab = 'overview',
  onTabChange,
  trackedCount = 0,
  anomalyCount = 0,
  watchlistCount = 0,
  userHandle = 'kamalaboueidd',
  userEmail = 'kamalaboueidd@gmail.com',
  userAvatar = null,
  realtimeConnected = true,
  onSignOut,
  onShowToast,
  onInspectProduct,
}) {
  const { lang, toggleLang, isRtl, t } = useLanguage();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [themeMode, setThemeMode] = useState('dark');
  const userMenuRef = useRef(null);

  // Close user menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const sectors = [
    {
      title: t('nav.telemetryFleet'),
      items: [
        {
          id: 'overview',
          label: t('nav.overview'),
          badge: trackedCount > 0 ? (isRtl ? `${trackedCount} منتج` : `${trackedCount} SKUs`) : (isRtl ? 'نشط' : 'ACTIVE'),
          icon: <Activity size={15} />,
        },
        {
          id: 'intelligence',
          label: t('nav.marketMatrix'),
          badge: isRtl ? '12 متجر' : '12 NODES',
          icon: <Layers size={15} />,
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
          icon: <TrendingDown size={15} />,
        },
        {
          id: 'retailer-health',
          label: t('nav.retailerHealth'),
          badge: '12/12',
          icon: <Server size={15} />,
        },
        {
          id: 'forensics',
          label: t('nav.glitchRadar'),
          badge: anomalyCount > 0 ? (isRtl ? `${anomalyCount} تلاعب` : `${anomalyCount} HIKES`) : (isRtl ? 'رادار' : 'RADAR'),
          icon: <ShieldAlert size={15} />,
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
          icon: <BookmarkCheck size={15} />,
        },
        {
          id: 'reports',
          label: t('nav.reports'),
          badge: isRtl ? 'ملفات البيانات' : 'CSV/JSON',
          icon: <FileSpreadsheet size={15} />,
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
          icon: <Terminal size={15} />,
        },
        {
          id: 'settings',
          label: t('nav.settings'),
          icon: <Settings size={15} />,
        },
      ],
    },
  ];

  return (
    <aside
      style={{
        width: '248px',
        height: '100vh',
        maxHeight: '100vh',
        flexShrink: 0,
        backgroundColor: '#000000',
        borderInlineEnd: '1px solid #1F1F1F',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflowY: 'auto',
        overflowX: 'hidden',
        position: 'relative',
        zIndex: 40,
        boxSizing: 'border-box',
      }}
    >
      <div>
        {/* Workspace Switcher Header */}
        <div
          style={{
            padding: '14px 14px 12px 14px',
            borderBottom: '1px solid #1F1F1F',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <img
                src={cawlixLogo}
                alt="Cawlix Mark"
                width={18}
                height={18}
                style={{ width: '18px', height: '18px', objectFit: 'contain', flexShrink: 0 }}
              />
              <span
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: '#EDEDED',
                  letterSpacing: '-0.01em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontFamily: "'Geist', sans-serif",
                }}
              >
                {userHandle}
              </span>
              <span
                style={{
                  fontSize: '0.625rem',
                  fontWeight: 500,
                  color: '#888888',
                  border: '1px solid #262626',
                  padding: '1px 6px',
                  borderRadius: '9999px',
                  lineHeight: '1.4',
                  fontFamily: "'Geist Mono', monospace",
                }}
              >
                PRO FLEET
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: realtimeConnected ? '#00DF8F' : '#F59E0B',
                  boxShadow: realtimeConnected ? '0 0 6px rgba(0, 223, 143, 0.7)' : 'none',
                }}
                title={realtimeConnected ? 'WebSocket Telemetry Connected' : 'Telemetry Standby'}
              />
            </div>
          </div>
        </div>

        {/* Demarcated Institutional Sectors */}
        <div style={{ padding: '10px 8px 16px 8px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {sectors.map((sector) => (
            <div key={sector.title} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {/* Sector Title Label */}
              <div
                style={{
                  fontSize: '0.625rem',
                  fontWeight: 600,
                  color: '#555555',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  padding: '6px 8px 4px 8px',
                  fontFamily: "'Geist Mono', monospace",
                }}
              >
                {sector.title}
              </div>

              {/* Sector Navigation Items */}
              {sector.items.map((route) => {
                const isActive = activeTab === route.id;
                return (
                  <button
                    key={route.id}
                    type="button"
                    onClick={() => onTabChange(route.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: '6px',
                      backgroundColor: isActive ? '#161616' : 'transparent',
                      border: 'none',
                      color: isActive ? '#FFFFFF' : '#888888',
                      fontSize: '0.8125rem',
                      fontWeight: isActive ? 500 : 400,
                      cursor: 'pointer',
                      textAlign: 'start',
                      transition: 'all 120ms ease',
                      fontFamily: isRtl ? "'Cairo', 'Alexandria', sans-serif" : "'Geist', sans-serif",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = '#0F0F0F';
                        e.currentTarget.style.color = '#EDEDED';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#888888';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                      <span style={{ color: isActive ? '#10B981' : '#777777', display: 'flex' }}>
                        {route.icon}
                      </span>
                      <span>{route.label}</span>
                    </div>

                    {route.badge && (
                      <span
                        style={{
                          fontSize: '0.625rem',
                          fontWeight: 500,
                          padding: '1px 5px',
                          borderRadius: '3px',
                          border: '1px solid #222222',
                          backgroundColor: '#0A0A0A',
                          color:
                            route.badge === 'SPREADS'
                              ? '#10B981'
                              : route.badge === '12/12'
                              ? '#38BDF8'
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
        </div>
      </div>

      {/* Vercel-Style Sidebar Bottom User Bar */}
      <div
        ref={userMenuRef}
        style={{
          position: 'relative',
          padding: '10px 14px',
          borderTop: '1px solid #1F1F1F',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#000000',
        }}
      >
        {/* Left: User Avatar & Handle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '9px',
            minWidth: 0,
            flex: 1,
            cursor: 'pointer',
          }}
          onClick={() => setUserMenuOpen(!userMenuOpen)}
        >
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={userHandle}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                objectFit: 'cover',
                flexShrink: 0,
                border: '1px solid #333333',
              }}
            />
          ) : (
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#1E1E1E',
                color: '#EDEDED',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.6875rem',
                fontWeight: 600,
                flexShrink: 0,
                fontFamily: "'Geist Mono', monospace",
              }}
            >
              {userHandle.charAt(0).toUpperCase()}
            </div>
          )}
          <span
            style={{
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: '#EDEDED',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontFamily: "'Geist', sans-serif",
            }}
          >
            {userHandle}
          </span>
        </div>

        {/* Right: Three Dots Menu + Notification Center */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: userMenuOpen ? '#1F1F1F' : 'transparent',
              border: 'none',
              color: '#888888',
              cursor: 'pointer',
              transition: 'all 120ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#161616';
              e.currentTarget.style.color = '#EDEDED';
            }}
            onMouseLeave={(e) => {
              if (!userMenuOpen) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#888888';
              }
            }}
            title="User Options"
          >
            <MoreHorizontal size={14} />
          </button>

          {/* Clean Notification Center */}
          <NotificationCenter
            placement="top"
            onInspectProduct={(prodId) => {
              if (onInspectProduct) onInspectProduct(prodId);
            }}
          />
        </div>

        {/* Vercel Exact Popover Menu */}
        {userMenuOpen && (
          <div
            style={{
              position: 'absolute',
              bottom: 'calc(100% + 8px)',
              left: '8px',
              right: '8px',
              backgroundColor: '#050505',
              border: '1px solid #222222',
              borderRadius: '8px',
              boxShadow: '0 16px 40px -8px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.04)',
              padding: '6px',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            {/* User Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, maxWidth: '160px' }}>
                <span
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: '#EDEDED',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {userHandle}
                </span>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    color: '#666666',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {userEmail}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setUserMenuOpen(false);
                  onTabChange('settings');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#888888',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  borderRadius: '4px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#EDEDED')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#888888')}
                title="Settings"
              >
                <Settings size={14} />
              </button>
            </div>

            <div style={{ height: '1px', backgroundColor: '#1A1A1A', margin: '4px 0' }} />

            {/* Feedback */}
            <button
              type="button"
              onClick={() => {
                setUserMenuOpen(false);
                if (onShowToast) {
                  onShowToast('Feedback Channel', 'Thank you! The engineering telemetry team has been notified.');
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '7px 10px',
                borderRadius: '5px',
                background: 'none',
                border: 'none',
                color: '#A1A1A1',
                fontSize: '0.8125rem',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#141414';
                e.currentTarget.style.color = '#EDEDED';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#A1A1A1';
              }}
            >
              <span>Feedback</span>
              <Smile size={14} />
            </button>

            {/* Language Switcher */}
            <button
              type="button"
              onClick={() => {
                toggleLang();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '7px 10px',
                borderRadius: '5px',
                background: 'none',
                border: 'none',
                color: '#EDEDED',
                fontSize: '0.8125rem',
                cursor: 'pointer',
                textAlign: 'start',
                fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist', sans-serif",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#141414';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span>{isRtl ? 'اللغة: عربي 🇸🇦' : 'Language: English 🇬🇧'}</span>
              <Languages size={14} color="#10B981" />
            </button>

            {/* Theme Toggle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '7px 10px',
                borderRadius: '5px',
                color: '#A1A1A1',
                fontSize: '0.8125rem',
              }}
            >
              <span>Theme</span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: '#111111',
                  padding: '2px 4px',
                  borderRadius: '4px',
                  border: '1px solid #1F1F1F',
                }}
              >
                <button
                  type="button"
                  onClick={() => setThemeMode('system')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: themeMode === 'system' ? '#EDEDED' : '#555555',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                  }}
                  title="System Theme"
                >
                  <Monitor size={11} />
                </button>
                <button
                  type="button"
                  onClick={() => setThemeMode('light')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: themeMode === 'light' ? '#EDEDED' : '#555555',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                  }}
                  title="Light Theme"
                >
                  <Sun size={11} />
                </button>
                <button
                  type="button"
                  onClick={() => setThemeMode('dark')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: themeMode === 'dark' ? '#EDEDED' : '#555555',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                  }}
                  title="Dark Theme"
                >
                  <Moon size={11} />
                </button>
              </div>
            </div>

            {/* Home Page */}
            <button
              type="button"
              onClick={() => {
                window.location.href = '/';
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '7px 10px',
                borderRadius: '5px',
                background: 'none',
                border: 'none',
                color: '#A1A1A1',
                fontSize: '0.8125rem',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#141414';
                e.currentTarget.style.color = '#EDEDED';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#A1A1A1';
              }}
            >
              <span>{isRtl ? 'الصفحة الرئيسية' : 'Home Page'}</span>
              <Home size={14} />
            </button>

            {/* Changelog */}
            <button
              type="button"
              onClick={() => {
                window.location.href = '/changelog';
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '7px 10px',
                borderRadius: '5px',
                background: 'none',
                border: 'none',
                color: '#A1A1A1',
                fontSize: '0.8125rem',
                cursor: 'pointer',
                textAlign: isRtl ? 'right' : 'left',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#141414';
                e.currentTarget.style.color = '#EDEDED';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#A1A1A1';
              }}
            >
              <span>{isRtl ? 'سجل التحديثات' : 'Changelog'}</span>
              <Edit3 size={14} />
            </button>

            {/* Help */}
            <button
              type="button"
              onClick={() => {
                window.location.href = '/docs';
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '7px 10px',
                borderRadius: '5px',
                background: 'none',
                border: 'none',
                color: '#A1A1A1',
                fontSize: '0.8125rem',
                cursor: 'pointer',
                textAlign: isRtl ? 'right' : 'left',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#141414';
                e.currentTarget.style.color = '#EDEDED';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#A1A1A1';
              }}
            >
              <span>{isRtl ? 'المساعدة والدعم' : 'Help & Support'}</span>
              <HelpCircle size={14} />
            </button>

            {/* Docs */}
            <button
              type="button"
              onClick={() => {
                window.location.href = '/docs';
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '7px 10px',
                borderRadius: '5px',
                background: 'none',
                border: 'none',
                color: '#A1A1A1',
                fontSize: '0.8125rem',
                cursor: 'pointer',
                textAlign: isRtl ? 'right' : 'left',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#141414';
                e.currentTarget.style.color = '#EDEDED';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#A1A1A1';
              }}
            >
              <span>{isRtl ? 'دليل الاستخدام' : 'Documentation'}</span>
              <BookOpen size={14} />
            </button>

            {/* Log Out */}
            <button
              type="button"
              onClick={onSignOut}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '7px 10px',
                borderRadius: '5px',
                background: 'none',
                border: 'none',
                color: '#A1A1A1',
                fontSize: '0.8125rem',
                cursor: 'pointer',
                textAlign: isRtl ? 'right' : 'left',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#141414';
                e.currentTarget.style.color = '#EDEDED';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#A1A1A1';
              }}
            >
              <span>{t('nav.signOut')}</span>
              <LogOut size={14} />
            </button>

            <div style={{ height: '1px', backgroundColor: '#1A1A1A', margin: '4px 0' }} />

            {/* Upgrade to Pro Button */}
            <button
              type="button"
              onClick={() => {
                setUserMenuOpen(false);
                if (onShowToast) {
                  onShowToast('Institutional Pro', isRtl ? 'الباقة الاحترافية تفعل التحديث كل 10 ثوانٍ وتنبيهات الرسائل القصيرة.' : 'Pro subscription unlocks automated 10-second polling & unlimited SMS dispatching.');
                }
              }}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#000000',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 12px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                width: '100%',
                marginTop: '2px',
                fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist', sans-serif",
                transition: 'background-color 120ms ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#EAEAEA')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
            >
              {isRtl ? 'ترقية إلى الباقة الاحترافية' : 'Upgrade to Pro'}
            </button>

            <div style={{ height: '1px', backgroundColor: '#1A1A1A', margin: '4px 0' }} />

            {/* All Systems Normal Status */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                fontSize: '0.75rem',
                color: realtimeConnected ? '#00DF8F' : '#0070F3',
                fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist', sans-serif",
              }}
            >
              <span>{realtimeConnected ? (isRtl ? 'مزامنة لحظية نشطة' : 'WebSocket sync active') : (isRtl ? 'كافة الأنظمة تعمل بكفاءة' : 'All systems normal.')}</span>
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: realtimeConnected ? '#00DF8F' : '#0070F3',
                  boxShadow: realtimeConnected ? '0 0 6px rgba(0, 223, 143, 0.8)' : '0 0 6px rgba(0, 112, 243, 0.8)',
                }}
              />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
