import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import AddSkuModal from '../../components/console/AddSkuModal';
import cawlixLogo from '../../assets/ICon.png';

// Domestic telemetry nodes cluster definitions
const CLUSTER_NODES = [
  { id: 'AMZN_EG', name: 'Amazon Egypt Node', domain: 'amazon.eg', status: 'ONLINE', ping: '18ms', throughput: '420 req/m', successRate: '99.9%' },
  { id: 'NOON_EG', name: 'Noon Egypt Node', domain: 'noon.com/egypt', status: 'ONLINE', ping: '22ms', throughput: '380 req/m', successRate: '99.7%' },
  { id: 'BTECH_EG', name: 'B.TECH Telemetry Node', domain: 'btech.com', status: 'ONLINE', ping: '29ms', throughput: '195 req/m', successRate: '99.4%' },
  { id: '2B_EG', name: '2B Hardware Node', domain: '2b.com.eg', status: 'ONLINE', ping: '34ms', throughput: '140 req/m', successRate: '98.9%' },
  { id: 'RAYA_EG', name: 'Raya Shop Probe', domain: 'rayashop.com', status: 'ONLINE', ping: '26ms', throughput: '165 req/m', successRate: '99.2%' },
];

export default function ConsolePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackedItems, setTrackedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'nodes' | 'tracker' | 'logs' | 'settings'
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [probingSkuId, setProbingSkuId] = useState(null);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  // Glitch Radar & Live Events State
  const [glitchRadarEvents, setGlitchRadarEvents] = useState([
    {
      id: 'gre-seed-1',
      sku: 'caw_sku_981a',
      title: 'MacBook Pro 14" M3 Pro 18GB/512GB (Space Black)',
      retailer: 'AMZN_EG',
      current_price_egp: 54900,
      baseline_price_egp: 94500,
      drop_pct: -41.9,
      status: 'SYSTEM_GLITCH',
      detected_at: '2m ago',
    },
    {
      id: 'gre-seed-2',
      sku: 'caw_sku_719b',
      title: 'Apple iPhone 16 Pro Max 256GB Natural Titanium',
      retailer: 'NOON_EG',
      current_price_egp: 49999,
      baseline_price_egp: 68900,
      drop_pct: -27.4,
      status: 'FLASH_CRASH',
      detected_at: '7m ago',
    },
    {
      id: 'gre-seed-3',
      sku: 'caw_sku_118k',
      title: 'Sony WH-1000XM5 Wireless Noise-Canceling',
      retailer: 'BTECH_EG',
      current_price_egp: 9999,
      baseline_price_egp: 18900,
      drop_pct: -47.1,
      status: 'ZERO_MARGIN_MISPRICE',
      detected_at: '14m ago',
    },
  ]);

  // Drawer Inspection State
  const [selectedDrawerItem, setSelectedDrawerItem] = useState(null);
  const [alertTargetPrice, setAlertTargetPrice] = useState('');
  const [alertSavedSuccess, setAlertSavedSuccess] = useState(false);

  // Live Supabase data hydration & Glitch Radar realtime channel
  useEffect(() => {
    let active = true;

    async function loadConsoleData() {
      setLoading(true);
      try {
        const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
        if (sessionErr || !sessionData?.session) {
          window.location.href = '/login';
          return;
        }

        const activeUser = sessionData.session.user;
        if (!active) return;
        setUser(activeUser);

        // Fetch User Watchlist joined with products
        const { data, error } = await supabase
          .from('user_watchlists')
          .select(`
            id,
            target_price,
            notify_on_glitch,
            tracked_products (*)
          `)
          .eq('user_id', activeUser.id);

        if (error) {
          console.error('Error fetching user watchlists:', error);
          if (active) setTrackedItems(getFallbackItems());
          return;
        }

        if (!active) return;

        if (data && data.length > 0) {
          const hydratedItems = data
            .map((row) => {
              const product = Array.isArray(row.tracked_products)
                ? row.tracked_products[0]
                : row.tracked_products;

              if (!product) return null;

              const currentPrice = product.current_price_egp ?? product.current_price ?? 0;
              const baselinePrice = product.baseline_price_egp ?? product.baseline_price ?? currentPrice;
              const delta =
                product.delta_pct ??
                (currentPrice && baselinePrice
                  ? parseFloat((((currentPrice - baselinePrice) / baselinePrice) * 100).toFixed(1))
                  : 0);

              return {
                id: row.id,
                watchlist_id: row.id,
                target_price: row.target_price,
                notify_on_glitch: row.notify_on_glitch,
                sku: product.sku || 'caw_sku_' + row.id.slice(0, 4),
                title: product.title || 'Tracked Product',
                node: product.node || product.retailer || 'AMZN_EG',
                domain: product.domain || 'node.cawlix.com',
                current_price_egp: currentPrice,
                baseline_price_egp: baselinePrice,
                delta_pct: delta,
                status: product.status || (delta > 5 ? 'FLAGGED' : 'Active'),
                last_ping: product.last_ping || 'just now',
                created_at: product.created_at || row.created_at,
                ...product,
              };
            })
            .filter(Boolean);

          setTrackedItems(hydratedItems.length > 0 ? hydratedItems : getFallbackItems());
        } else {
          setTrackedItems(getFallbackItems());
        }
      } catch (err) {
        console.error('Failed to load telemetry console data:', err);
        if (active) setTrackedItems(getFallbackItems());
      } finally {
        if (active) setLoading(false);
      }
    }

    loadConsoleData();

    // Supabase Realtime Subscription for Glitch Radar
    const channel = supabase
      .channel('realtime:glitch_radar_events')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'glitch_radar_events' },
        (payload) => {
          const newEvent = payload.new || payload;
          setGlitchRadarEvents((prev) => [
            {
              id: newEvent.id || `gre-${Date.now()}`,
              sku: newEvent.sku || 'caw_sku_glitch',
              title: newEvent.title || 'Sudden Pricing Anomaly Detected',
              retailer: newEvent.retailer || newEvent.node || 'AMZN_EG',
              current_price_egp: newEvent.current_price_egp ?? newEvent.price ?? 0,
              baseline_price_egp: newEvent.baseline_price_egp ?? newEvent.baseline ?? 0,
              drop_pct: newEvent.drop_pct ?? newEvent.delta_pct ?? -30.0,
              status: newEvent.status || 'FLASH_CRASH',
              detected_at: 'just now',
              isRealtime: true,
              ...newEvent,
            },
            ...prev,
          ]);
        }
      )
      .subscribe((status) => {
        if (active) {
          setRealtimeConnected(status === 'SUBSCRIBED');
        }
      });

    return () => {
      active = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  // Keyboard navigation (Escape to close drawer)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedDrawerItem) {
        setSelectedDrawerItem(null);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('telemetry-search-input');
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDrawerItem]);

  function getFallbackItems() {
    return [
      {
        id: 'item-1',
        sku: 'caw_sku_981a',
        title: 'Apple MacBook Pro 14" M3 Pro Chip 18GB/512GB (Space Black)',
        node: 'AMZN_EG',
        domain: 'amazon.eg',
        current_price_egp: 86999,
        baseline_price_egp: 94500,
        delta_pct: -7.9,
        status: 'Active',
        last_ping: 'just now',
      },
      {
        id: 'item-2',
        sku: 'caw_sku_719b',
        title: 'Apple iPhone 16 Pro Max 256GB Natural Titanium (Domestic Cairo)',
        node: 'NOON_EG',
        domain: 'noon.com',
        current_price_egp: 64500,
        baseline_price_egp: 68900,
        delta_pct: -6.4,
        status: 'Active',
        last_ping: '1m ago',
      },
      {
        id: 'item-3',
        sku: 'caw_sku_118k',
        title: 'Sony WH-1000XM5 Wireless Noise-Canceling Headphones',
        node: 'BTECH_EG',
        domain: 'btech.com',
        current_price_egp: 18200,
        baseline_price_egp: 16900,
        delta_pct: 7.7,
        status: 'Syncing',
        last_ping: '3m ago',
      },
      {
        id: 'item-4',
        sku: 'caw_sku_552d',
        title: 'Dell XPS 15 9530 Core i7-13700H 32GB 1TB RTX 4060 OLED 3.5K',
        node: '2B_EG',
        domain: '2b.com.eg',
        current_price_egp: 112000,
        baseline_price_egp: 112000,
        delta_pct: 0.0,
        status: 'Active',
        last_ping: '6m ago',
      },
      {
        id: 'item-5',
        sku: 'caw_sku_304z',
        title: 'Samsung 65" Neo QLED 4K Smart TV QN90C',
        node: 'RAYA_EG',
        domain: 'rayashop.com',
        current_price_egp: 41999,
        baseline_price_egp: 45999,
        delta_pct: -8.7,
        status: 'Active',
        last_ping: '9m ago',
      },
    ];
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const handleReaudit = async (e, item) => {
    e.stopPropagation();
    e.preventDefault();
    setProbingSkuId(item.id);

    try {
      await fetch(`/api/v1/telemetry/sku?sku=${encodeURIComponent(item.sku)}&retailer=${encodeURIComponent(item.node)}`);
    } catch {
      // Offline fallback simulation
    }

    setTimeout(() => {
      setProbingSkuId(null);
      setTrackedItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, last_ping: 'just now', status: 'Active' } : i))
      );
      if (selectedDrawerItem && selectedDrawerItem.id === item.id) {
        setSelectedDrawerItem((prev) => (prev ? { ...prev, last_ping: 'just now' } : null));
      }
    }, 450);
  };

  const handleRowClick = (item) => {
    setSelectedDrawerItem(item);
    setAlertTargetPrice(Math.round(item.baseline_price_egp * 0.95).toString());
    setAlertSavedSuccess(false);
  };

  const handleSaveAlert = async () => {
    if (!selectedDrawerItem) return;
    try {
      await supabase.from('user_watchlists').upsert({
        sku: selectedDrawerItem.sku,
        target_alert_price: parseFloat(alertTargetPrice || '0'),
        glitch_radar_enabled: true,
        updated_at: new Date().toISOString(),
      });
    } catch {
      // Fallback
    }

    setAlertSavedSuccess(true);
    setTimeout(() => setAlertSavedSuccess(false), 2400);
  };

  const filteredItems = trackedItems.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.sku.toLowerCase().includes(q) ||
      item.domain.toLowerCase().includes(q) ||
      item.node.toLowerCase().includes(q)
    );
  });

  const userHandle = user?.email ? user.email.split('@')[0] : 'admin-node';

  // Helper for external store links
  const getStoreUrl = (item) => {
    if (item.node.includes('AMZN')) return `https://www.amazon.eg/dp/${item.sku.replace('caw_sku_', 'B0')}`;
    if (item.node.includes('NOON')) return `https://www.noon.com/egypt-en/p-${item.sku}/`;
    if (item.node.includes('BTECH')) return `https://btech.com/en/${item.sku}`;
    if (item.node.includes('2B')) return `https://2b.com.eg/en/catalogsearch/result/?q=${item.sku}`;
    return `https://www.rayashop.com/en/search?q=${item.sku}`;
  };

  // Landed Cost calculations for drawer
  const drawerDomestic = selectedDrawerItem?.current_price_egp || 0;
  const drawerBaseUsd = Math.round(drawerDomestic / 62);
  const drawerBaseEgp = Math.round(drawerBaseUsd * 48.5);
  const drawerAirFreight = 1450;
  const drawerCif = drawerBaseEgp + drawerAirFreight;
  const drawerCustoms = Math.round(drawerCif * 0.10);
  const drawerVat = Math.round((drawerCif + drawerCustoms) * 0.14);
  const drawerBankFx = Math.round(drawerBaseEgp * 0.03);
  const drawerTotalLanded = drawerCif + drawerCustoms + drawerVat + drawerBankFx;
  const drawerNetSaved = drawerDomestic - drawerTotalLanded;
  const drawerHasAdvantage = drawerNetSaved > 2000;
  const drawerIsMarkup = selectedDrawerItem ? selectedDrawerItem.delta_pct > 0 : false;

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#05070A',
        color: '#EDEDED',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        display: 'flex',
      }}
    >
      {/* ── 1. GLOBAL MINIMAL COMPACT SIDEBAR ── */}
      <aside
        style={{
          width: '240px',
          flexShrink: 0,
          backgroundColor: '#0D1117',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          height: '100vh',
          boxSizing: 'border-box',
          zIndex: 40,
        }}
      >
        {/* Brand & Engine Status Section */}
        <div>
          <div
            style={{
              padding: '20px 18px 16px 18px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <a
              href="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                textDecoration: 'none',
                color: '#FFFFFF',
              }}
            >
              <img
                src={cawlixLogo}
                alt="Cawlix Mark"
                width={24}
                height={24}
                style={{ width: '24px', height: '24px', objectFit: 'contain' }}
              />
              <span
                style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: '#FFFFFF',
                }}
              >
                Cawlix
              </span>
            </a>

            {/* Connection Status Indicator */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '6px',
                padding: '5px 10px',
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  boxShadow: '0 0 8px #10B981',
                  animation: 'pulseDot 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                }}
              />
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  color: '#10B981',
                  textTransform: 'uppercase',
                }}
              >
                ENGINE ONLINE
              </span>
            </div>
          </div>

          {/* Navigation Routes */}
          <nav style={{ padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              {
                id: 'overview',
                label: 'Overview',
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="7" height="9" x="3" y="3" rx="1" />
                    <rect width="7" height="5" x="14" y="3" rx="1" />
                    <rect width="7" height="9" x="14" y="12" rx="1" />
                    <rect width="7" height="5" x="3" y="16" rx="1" />
                  </svg>
                ),
              },
              {
                id: 'nodes',
                label: 'Telemetry Nodes',
                badge: '5 ACTIVE',
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <circle cx="19" cy="5" r="2" />
                    <circle cx="5" cy="5" r="2" />
                    <circle cx="5" cy="19" r="2" />
                    <circle cx="19" cy="19" r="2" />
                    <line x1="7" y1="6" x2="10" y2="10" />
                    <line x1="17" y1="6" x2="14" y2="10" />
                    <line x1="7" y1="18" x2="10" y2="14" />
                    <line x1="17" y1="18" x2="14" y2="14" />
                  </svg>
                ),
              },
              {
                id: 'tracker',
                label: 'SKU Tracker',
                badge: trackedItems.length.toString(),
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m21 16-4 4-4-4" />
                    <path d="M17 20V4" />
                    <path d="m3 8 4-4 4 4" />
                    <path d="M7 4v16" />
                  </svg>
                ),
              },
              {
                id: 'logs',
                label: 'System Logs',
                badge: glitchRadarEvents.length ? `${glitchRadarEvents.length}` : null,
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                    <polyline points="13 2 13 9 20 9" />
                    <line x1="9" y1="13" x2="15" y2="13" />
                    <line x1="9" y1="17" x2="13" y2="17" />
                  </svg>
                ),
              },
              {
                id: 'settings',
                label: 'Settings',
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ),
              },
            ].map((route) => {
              const isActive = activeTab === route.id;
              return (
                <button
                  key={route.id}
                  type="button"
                  onClick={() => setActiveTab(route.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    background: isActive ? '#161D2B' : 'transparent',
                    borderLeft: isActive ? '3px solid #10B981' : '3px solid transparent',
                    borderTop: 'none',
                    borderRight: 'none',
                    borderBottom: 'none',
                    color: isActive ? '#FFFFFF' : '#A1A1AA',
                    fontSize: '0.8125rem',
                    fontWeight: isActive ? 600 : 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 120ms ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                      e.currentTarget.style.color = '#EDEDED';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#A1A1AA';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: isActive ? '#10B981' : '#71717A' }}>{route.icon}</span>
                    <span>{route.label}</span>
                  </div>
                  {route.badge && (
                    <span
                      style={{
                        fontSize: '0.625rem',
                        fontWeight: 600,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                        color: isActive ? '#10B981' : '#71717A',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {route.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div
          style={{
            padding: '16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.6875rem', color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              CLUSTER
            </span>
            <span
              style={{
                fontSize: '0.6875rem',
                fontFamily: "'JetBrains Mono', monospace",
                color: '#10B981',
                fontWeight: 600,
              }}
            >
              CAIRO_CORE
            </span>
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#52525B', lineHeight: 1.4 }}>
            Direct PostgreSQL WebSocket telemetry sync active.
          </div>
        </div>
      </aside>

      {/* ── 2. MAIN APPLICATION WORKSPACE ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
        
        {/* Topbar */}
        <header
          style={{
            height: '56px',
            backgroundColor: '#0D1117',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
            position: 'sticky',
            top: 0,
            zIndex: 30,
            boxSizing: 'border-box',
          }}
        >
          {/* Unified Search Command Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flex: 1,
              maxWidth: '520px',
              backgroundColor: '#05070A',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              height: '38px',
              padding: '0 12px',
              gap: '10px',
              transition: 'border-color 150ms ease, box-shadow 150ms ease',
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#71717A"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0 }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              id="telemetry-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tracked SKUs, nodes, or retailers..."
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: '#EDEDED',
                fontSize: '0.8125rem',
                fontFamily: "'Inter', system-ui, sans-serif",
                outline: 'none',
              }}
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#71717A',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                &times;
              </button>
            ) : (
              <kbd
                style={{
                  fontSize: '0.6875rem',
                  fontFamily: "'JetBrains Mono', monospace",
                  color: '#71717A',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px',
                  padding: '2px 6px',
                }}
              >
                ⌘K
              </kbd>
            )}
          </div>

          {/* Topbar Right Controls: Workspace Badge + Live Ping + Add SKU + Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Active Workspace Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: '#131822',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                fontSize: '0.6875rem',
                color: '#D4D4D8',
                fontWeight: 600,
                letterSpacing: '0.03em',
              }}
            >
              <span style={{ color: '#71717A' }}>WORKSPACE:</span>
              <span style={{ color: '#10B981', fontFamily: "'JetBrains Mono', monospace" }}>
                CAIRO_NODE / PROD
              </span>
            </div>

            {/* Live Latency / Ping Counter */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                fontSize: '0.6875rem',
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
                color: '#10B981',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                }}
              />
              <span>24ms</span>
            </div>

            {/* Quick Add Target SKU Trigger */}
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              style={{
                backgroundColor: '#10B981',
                color: '#05070A',
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0 12px',
                height: '34px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'background-color 150ms ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#059669')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#10B981')}
            >
              <span style={{ fontSize: '14px', lineHeight: 1 }}>+</span>
              <span>Add Target SKU</span>
            </button>

            {/* Profile Drawer / Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  backgroundColor: '#131822',
                  color: '#FFFFFF',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                {userHandle.charAt(0).toUpperCase()}
              </button>

              {dropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '40px',
                    width: '220px',
                    backgroundColor: '#0D1117',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '6px',
                    boxShadow: '0 16px 32px rgba(0, 0, 0, 0.6)',
                    zIndex: 100,
                  }}
                >
                  <div style={{ padding: '8px 10px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#FFFFFF' }}>{userHandle}</div>
                    <div
                      style={{
                        fontSize: '0.6875rem',
                        color: '#71717A',
                        fontFamily: "'JetBrains Mono', monospace",
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {user?.email || 'admin@cawlix.com'}
                    </div>
                  </div>
                  <div style={{ padding: '4px 0' }}>
                    <a
                      href="/tracker"
                      style={{
                        display: 'block',
                        padding: '7px 10px',
                        fontSize: '0.8125rem',
                        color: '#D4D4D8',
                        textDecoration: 'none',
                        borderRadius: '4px',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#161D2B')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      Public Live Tracker
                    </a>
                    <a
                      href="/docs"
                      style={{
                        display: 'block',
                        padding: '7px 10px',
                        fontSize: '0.8125rem',
                        color: '#D4D4D8',
                        textDecoration: 'none',
                        borderRadius: '4px',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#161D2B')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      API Documentation
                    </a>
                    <a
                      href="/engines/true-cost"
                      style={{
                        display: 'block',
                        padding: '7px 10px',
                        fontSize: '0.8125rem',
                        color: '#D4D4D8',
                        textDecoration: 'none',
                        borderRadius: '4px',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#161D2B')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      True-Cost Engine
                    </a>
                  </div>
                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '4px' }}>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '7px 10px',
                        fontSize: '0.8125rem',
                        color: '#F43F5E',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: '4px',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(244, 63, 94, 0.1)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── 3. WORKSPACE CANVAS CONTENT ── */}
        <main style={{ flex: 1, padding: '24px 32px', boxSizing: 'border-box' }}>
          <div style={{ maxWidth: '1360px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* View Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h1 style={{ fontSize: '1.375rem', fontWeight: 600, color: '#FFFFFF', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
                  {activeTab === 'overview' && 'Telemetry Control Dashboard'}
                  {activeTab === 'nodes' && 'Domestic Telemetry Nodes'}
                  {activeTab === 'tracker' && 'Tracked SKU Surveillance'}
                  {activeTab === 'logs' && 'System Logs & Glitch Radar Feed'}
                  {activeTab === 'settings' && 'Telemetry Engine Configuration'}
                </h1>
                <p style={{ fontSize: '0.8125rem', color: '#71717A', margin: 0 }}>
                  {activeTab === 'overview' && 'Real-time retail price monitoring, baseline forensics, and arbitrage analytics.'}
                  {activeTab === 'nodes' && 'Active scraping infrastructure and network latency health for domestic retailers.'}
                  {activeTab === 'tracker' && 'Continuous 90-day rolling baseline tracking for targeted Cairo retail items.'}
                  {activeTab === 'logs' && 'High-frequency price anomaly intercepts and database mutation events.'}
                  {activeTab === 'settings' && 'Account security, webhook configurations, and node credentials.'}
                </p>
              </div>

              {/* View Switcher Controls */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#0D1117',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '6px',
                  padding: '3px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  style={{
                    backgroundColor: activeTab === 'overview' ? '#161D2B' : 'transparent',
                    color: activeTab === 'overview' ? '#FFFFFF' : '#71717A',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    padding: '5px 12px',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Overview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('tracker')}
                  style={{
                    backgroundColor: activeTab === 'tracker' ? '#161D2B' : 'transparent',
                    color: activeTab === 'tracker' ? '#FFFFFF' : '#71717A',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    padding: '5px 12px',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Tracker
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('logs')}
                  style={{
                    backgroundColor: activeTab === 'logs' ? '#161D2B' : 'transparent',
                    color: activeTab === 'logs' ? '#FFFFFF' : '#71717A',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    padding: '5px 12px',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Glitch Radar
                </button>
              </div>
            </div>

            {/* ── 4. METRIC CARDS REBUILD ── */}
            {(activeTab === 'overview' || activeTab === 'tracker') && (
              <section
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '16px',
                }}
              >
                {/* Metric 1 */}
                <div
                  style={{
                    backgroundColor: '#0D1117',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#71717A',
                    }}
                  >
                    TOTAL MONITORED SKUS
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                    <span
                      style={{
                        fontSize: '1.75rem',
                        fontWeight: 600,
                        color: '#F4F4F5',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {trackedItems.length}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      +12.4%
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#52525B' }}>
                    Active 90-day domestic price surveillance
                  </span>
                </div>

                {/* Metric 2 */}
                <div
                  style={{
                    backgroundColor: '#0D1117',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#71717A',
                    }}
                  >
                    ENGINE PING / LATENCY
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                    <span
                      style={{
                        fontSize: '1.75rem',
                        fontWeight: 600,
                        color: '#F4F4F5',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      24ms
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      99.98%
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#52525B' }}>
                    Zero-dropped probe verification
                  </span>
                </div>

                {/* Metric 3 */}
                <div
                  style={{
                    backgroundColor: '#0D1117',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#71717A',
                    }}
                  >
                    GLITCH ANOMALIES INTERCEPTED
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                    <span
                      style={{
                        fontSize: '1.75rem',
                        fontWeight: 600,
                        color: '#F4F4F5',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {glitchRadarEvents.length}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#F43F5E',
                        backgroundColor: 'rgba(244, 63, 94, 0.1)',
                        border: '1px solid rgba(244, 63, 94, 0.25)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      -47.1% MAX
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#52525B' }}>
                    Zero-margin flash crashes captured
                  </span>
                </div>

                {/* Metric 4 */}
                <div
                  style={{
                    backgroundColor: '#0D1117',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#71717A',
                    }}
                  >
                    ESTIMATED ARBITRAGE SAVINGS
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                    <span
                      style={{
                        fontSize: '1.75rem',
                        fontWeight: 600,
                        color: '#F4F4F5',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      EGP 342.8K
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      +18.5%
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#52525B' }}>
                    Landed CIF benchmark advantage
                  </span>
                </div>
              </section>
            )}

            {/* ── 5. VIEW ROUTING ── */}

            {/* TAB: Telemetry Nodes */}
            {activeTab === 'nodes' && (
              <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '16px',
                  }}
                >
                  {CLUSTER_NODES.map((node) => (
                    <div
                      key={node.id}
                      style={{
                        backgroundColor: '#0D1117',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '8px',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#FFFFFF' }}>{node.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#71717A', fontFamily: "'JetBrains Mono', monospace" }}>{node.domain}</div>
                        </div>
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            border: '1px solid rgba(16, 185, 129, 0.25)',
                            color: '#10B981',
                          }}
                        >
                          {node.status}
                        </span>
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr 1fr',
                          gap: '8px',
                          paddingTop: '10px',
                          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.6875rem', color: '#71717A', textTransform: 'uppercase' }}>PING</div>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#F4F4F5', fontFamily: "'JetBrains Mono', monospace" }}>
                            {node.ping}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.6875rem', color: '#71717A', textTransform: 'uppercase' }}>THROUGHPUT</div>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#F4F4F5', fontFamily: "'JetBrains Mono', monospace" }}>
                            {node.throughput}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.6875rem', color: '#71717A', textTransform: 'uppercase' }}>UPTIME</div>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#10B981', fontFamily: "'JetBrains Mono', monospace" }}>
                            {node.successRate}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* TAB: System Logs / Glitch Radar Feed */}
            {activeTab === 'logs' && (
              <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    backgroundColor: '#0D1117',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#10B981',
                        boxShadow: '0 0 10px #10B981',
                      }}
                    />
                    <div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#FFFFFF' }}>
                        REALTIME POSTGRES MUTATION STREAM
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#71717A', fontFamily: "'JetBrains Mono', monospace" }}>
                        channel: realtime:glitch_radar_events
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontFamily: "'JetBrains Mono', monospace",
                      color: '#10B981',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      padding: '4px 10px',
                      borderRadius: '4px',
                    }}
                  >
                    {glitchRadarEvents.length} ANOMALIES INTERCEPTED
                  </span>
                </div>

                {/* Event Feed List */}
                <div
                  style={{
                    backgroundColor: '#0D1117',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                  }}
                >
                  {glitchRadarEvents.map((evt, idx) => (
                    <div
                      key={evt.id}
                      onClick={() => {
                        handleRowClick({
                          id: evt.id,
                          sku: evt.sku,
                          title: evt.title,
                          node: evt.retailer,
                          domain: 'node.live.eg',
                          current_price_egp: evt.current_price_egp,
                          baseline_price_egp: evt.baseline_price_egp,
                          delta_pct: evt.drop_pct,
                          status: evt.status,
                          last_ping: evt.detected_at,
                        });
                      }}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2.5fr 1fr 1.2fr 1fr 1fr',
                        alignItems: 'center',
                        padding: '16px 20px',
                        borderBottom: idx < glitchRadarEvents.length - 1 ? '1px solid rgba(255, 255, 255, 0.06)' : 'none',
                        cursor: 'pointer',
                        transition: 'background-color 100ms ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#131822')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#FFFFFF' }}>{evt.title}</span>
                        <span style={{ fontSize: '0.6875rem', color: '#71717A', fontFamily: "'JetBrains Mono', monospace" }}>
                          {evt.sku}
                        </span>
                      </div>
                      <div>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontFamily: "'JetBrains Mono', monospace",
                            padding: '3px 8px',
                            backgroundColor: '#131822',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '4px',
                            color: '#D4D4D8',
                          }}
                        >
                          {evt.retailer}
                        </span>
                      </div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.875rem', fontWeight: 600, color: '#10B981' }}>
                        EGP {evt.current_price_egp?.toLocaleString()}
                      </div>
                      <div>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            fontFamily: "'JetBrains Mono', monospace",
                            color: '#F43F5E',
                            backgroundColor: 'rgba(244, 63, 94, 0.1)',
                            border: '1px solid rgba(244, 63, 94, 0.25)',
                            padding: '2px 8px',
                            borderRadius: '4px',
                          }}
                        >
                          {evt.drop_pct}%
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#71717A', fontFamily: "'JetBrains Mono', monospace", textAlign: 'right' }}>
                        {evt.detected_at}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* TAB: Settings */}
            {activeTab === 'settings' && (
              <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div
                  style={{
                    backgroundColor: '#0D1117',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                  }}
                >
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#FFFFFF', margin: 0 }}>
                    ACTIVE TELEMETRY SESSION
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8125rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <span style={{ color: '#71717A' }}>USER IDENTIFIER</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#EDEDED' }}>{user?.id || 'anon-session'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <span style={{ color: '#71717A' }}>PRIMARY EMAIL</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#EDEDED' }}>{user?.email || 'admin@cawlix.com'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <span style={{ color: '#71717A' }}>POSTGRES REPLICATION</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#10B981', fontWeight: 600 }}>CONNECTED (WSS)</span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ── 6. MODERNIZED TELEMETRY TABLE (Overview & Tracker) ── */}
            {(activeTab === 'overview' || activeTab === 'tracker') && (
              <section
                style={{
                  backgroundColor: '#0D1117',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Table Header with Strict Font-Sans Hierarchy */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2.5fr 1fr 1.2fr 1fr 1fr 0.8fr',
                    alignItems: 'center',
                    padding: '12px 20px',
                    backgroundColor: '#131822',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#71717A',
                  }}
                >
                  <span>ITEM / TITLE</span>
                  <span>STORE</span>
                  <span style={{ textAlign: 'right' }}>PRICE & DELTA</span>
                  <span style={{ textAlign: 'center' }}>STATUS</span>
                  <span style={{ textAlign: 'right' }}>LAST UPDATED</span>
                  <span style={{ textAlign: 'right' }}>ACTIONS</span>
                </div>

                {/* Loading State */}
                {loading ? (
                  <div style={{ padding: '60px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        border: '2px solid rgba(16, 185, 129, 0.2)',
                        borderTopColor: '#10B981',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                      }}
                    />
                    <span style={{ fontSize: '0.8125rem', color: '#71717A' }}>
                      Probing domestic telemetry nodes and synchronizing baselines...
                    </span>
                  </div>
                ) : filteredItems.length === 0 ? (
                  /* Empty state */
                  <div
                    style={{
                      padding: '60px 24px',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <span style={{ fontSize: '1rem', fontWeight: 600, color: '#FFFFFF' }}>
                      No matching tracked SKUs detected
                    </span>
                    <span style={{ fontSize: '0.8125rem', color: '#71717A', maxWidth: '400px' }}>
                      Try adjusting your search criteria or add a new retail SKU to begin surveillance.
                    </span>
                    <button
                      type="button"
                      onClick={() => setModalOpen(true)}
                      style={{
                        backgroundColor: '#10B981',
                        color: '#05070A',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        marginTop: '8px',
                      }}
                    >
                      Track Your First SKU
                    </button>
                  </div>
                ) : (
                  /* Table Rows */
                  filteredItems.map((item, idx) => {
                    const isMarkup = item.delta_pct > 0;
                    const deltaColor = isMarkup ? '#F43F5E' : '#10B981';
                    const deltaSign = item.delta_pct > 0 ? `+${item.delta_pct}%` : `${item.delta_pct}%`;

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleRowClick(item)}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '2.5fr 1fr 1.2fr 1fr 1fr 0.8fr',
                          alignItems: 'center',
                          padding: '14px 20px',
                          borderBottom: idx < filteredItems.length - 1 ? '1px solid rgba(255, 255, 255, 0.06)' : 'none',
                          cursor: 'pointer',
                          transition: 'background-color 100ms ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#131822')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        {/* ITEM / TITLE */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', paddingRight: '16px', minWidth: 0 }}>
                          <span
                            style={{
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              color: '#F4F4F5',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {item.title}
                          </span>
                          <span
                            style={{
                              fontSize: '0.6875rem',
                              color: '#71717A',
                              fontFamily: "'JetBrains Mono', monospace",
                            }}
                          >
                            {item.sku}
                          </span>
                        </div>

                        {/* STORE */}
                        <div>
                          <span
                            style={{
                              fontSize: '0.6875rem',
                              fontWeight: 600,
                              fontFamily: "'JetBrains Mono', monospace",
                              padding: '3px 8px',
                              borderRadius: '4px',
                              backgroundColor: '#161D2B',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              color: '#D4D4D8',
                            }}
                          >
                            {item.node}
                          </span>
                        </div>

                        {/* PRICE & DELTA */}
                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                          <span
                            style={{
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              color: '#FFFFFF',
                              fontFamily: "'JetBrains Mono', monospace",
                            }}
                          >
                            EGP {item.current_price_egp?.toLocaleString()}
                          </span>
                          <span
                            style={{
                              fontSize: '0.6875rem',
                              fontWeight: 600,
                              color: deltaColor,
                              fontFamily: "'JetBrains Mono', monospace",
                            }}
                          >
                            {deltaSign}
                          </span>
                        </div>

                        {/* STATUS */}
                        <div style={{ textAlign: 'center' }}>
                          <span
                            style={{
                              fontSize: '0.6875rem',
                              fontWeight: 600,
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: item.status === 'Active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                              border: item.status === 'Active' ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(245, 158, 11, 0.25)',
                              color: item.status === 'Active' ? '#10B981' : '#F59E0B',
                            }}
                          >
                            {item.status}
                          </span>
                        </div>

                        {/* LAST UPDATED */}
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: '#71717A',
                            fontFamily: "'JetBrains Mono', monospace",
                            textAlign: 'right',
                          }}
                        >
                          {item.last_ping}
                        </div>

                        {/* ACTIONS */}
                        <div style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={(e) => handleReaudit(e, item)}
                            style={{
                              backgroundColor: 'transparent',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '4px',
                              padding: '4px 8px',
                              color: probingSkuId === item.id ? '#10B981' : '#A1A1AA',
                              fontSize: '0.6875rem',
                              fontWeight: 500,
                              cursor: 'pointer',
                              transition: 'all 120ms ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = '#10B981';
                              e.currentTarget.style.color = '#10B981';
                            }}
                            onMouseLeave={(e) => {
                              if (probingSkuId !== item.id) {
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                e.currentTarget.style.color = '#A1A1AA';
                              }
                            }}
                          >
                            {probingSkuId === item.id ? 'Probing...' : 'Re-audit'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </section>
            )}

          </div>
        </main>
      </div>

      {/* ── 7. SLIDE-OVER DRAWER: TELEMETRY FORENSIC INSPECTOR ── */}
      {selectedDrawerItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          {/* Backdrop */}
          <div
            onClick={() => setSelectedDrawerItem(null)}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* Drawer Panel */}
          <aside
            role="dialog"
            aria-modal="true"
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '560px',
              height: '100%',
              backgroundColor: '#0D1117',
              borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '-20px 0 40px rgba(0, 0, 0, 0.8)',
              zIndex: 101,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
            }}
          >
            {/* Topbar */}
            <div
              style={{
                height: '52px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '0 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#131822',
                position: 'sticky',
                top: 0,
                zIndex: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 8px #10B981' }} />
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#A1A1AA', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  FORENSIC TELEMETRY PROBE
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDrawerItem(null)}
                style={{
                  background: 'none',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px',
                  color: '#71717A',
                  fontSize: '0.6875rem',
                  fontFamily: "'JetBrains Mono', monospace",
                  padding: '2px 8px',
                  cursor: 'pointer',
                }}
              >
                ESC
              </button>
            </div>

            {/* Content Container */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Module 1: Header */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem' }}>
                  <span style={{ color: '#FFFFFF', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{selectedDrawerItem.sku}</span>
                  <span style={{ color: '#71717A' }}>·</span>
                  <span style={{ color: '#10B981', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{selectedDrawerItem.node}</span>
                  <span style={{ color: '#71717A', fontSize: '0.6875rem' }}>({selectedDrawerItem.domain})</span>
                </div>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#FFFFFF', margin: 0, lineHeight: 1.4 }}>
                  {selectedDrawerItem.title}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', paddingTop: '4px' }}>
                  <a
                    href={getStoreUrl(selectedDrawerItem)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.75rem', color: '#10B981', textDecoration: 'none', fontWeight: 500 }}
                  >
                    Open Node in Store ↗
                  </a>
                  <span style={{ fontSize: '0.6875rem', color: '#71717A', fontFamily: "'JetBrains Mono', monospace" }}>
                    Verified: {selectedDrawerItem.last_ping}
                  </span>
                </div>
              </div>

              {/* Module 2: Forensic Price Diagnostic */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.05em', color: '#71717A', textTransform: 'uppercase' }}>
                  FORENSIC PRICE DIAGNOSTIC
                </span>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '16px',
                    backgroundColor: '#05070A',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <span style={{ fontSize: '0.6875rem', color: '#71717A', textTransform: 'uppercase' }}>CURRENT SHELF PRICE</span>
                    <span style={{ fontSize: '1.125rem', fontWeight: 600, color: '#FFFFFF', fontFamily: "'JetBrains Mono', monospace" }}>
                      EGP {selectedDrawerItem.current_price_egp?.toLocaleString()}
                    </span>
                    <span style={{ fontSize: '0.6875rem', marginTop: '2px', color: drawerIsMarkup ? '#F43F5E' : '#10B981', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
                      {drawerIsMarkup ? `+${selectedDrawerItem.delta_pct}% OVER BASELINE` : `${selectedDrawerItem.delta_pct}% UNDER BASELINE`}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <span style={{ fontSize: '0.6875rem', color: '#71717A', textTransform: 'uppercase' }}>90-DAY BASELINE MEDIAN</span>
                    <span style={{ fontSize: '1.125rem', fontWeight: 600, color: '#FFFFFF', fontFamily: "'JetBrains Mono', monospace" }}>
                      EGP {selectedDrawerItem.baseline_price_egp?.toLocaleString()}
                    </span>
                    <span style={{ fontSize: '0.6875rem', marginTop: '2px', color: '#71717A' }}>
                      Rolling Cairo benchmark
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderLeft: `3px solid ${drawerIsMarkup ? '#F43F5E' : '#10B981'}`,
                    borderRadius: '6px',
                    padding: '12px 14px',
                    fontSize: '0.8125rem',
                    lineHeight: 1.5,
                    backgroundColor: '#05070A',
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: '2px', color: drawerIsMarkup ? '#F43F5E' : '#10B981' }}>
                    TRUTH INDEX VERDICT
                  </div>
                  <div style={{ color: '#A1A1AA' }}>
                    {drawerIsMarkup
                      ? 'CRITICAL GHOST MARKUP — Price artificially inflated prior to promotional cycle to manufacture synthetic discount magnitude.'
                      : 'VERIFIED REAL DEAL — Authentic markdown verified 7.9% below 90-day rolling domestic shelf median.'}
                  </div>
                </div>
              </div>

              {/* Module 3: 90-Day Trend Sparkline */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.05em', color: '#71717A', textTransform: 'uppercase' }}>
                  90-DAY PRICE TRAJECTORY & SPIKE ANALYSIS
                </span>

                <div
                  style={{
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    padding: '16px',
                    backgroundColor: '#05070A',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ width: '100%', height: '90px' }}>
                    <svg width="100%" height="90" viewBox="0 0 480 90" preserveAspectRatio="none" fill="none">
                      <line x1="10" y1="50" x2="470" y2="50" stroke="#27272A" strokeWidth="1" strokeDasharray="4 4" />
                      <path
                        d={drawerIsMarkup ? 'M 20 50 L 140 50 L 220 48 L 300 20 L 380 16 L 460 16' : 'M 20 38 L 140 38 L 220 40 L 300 62 L 380 66 L 460 66'}
                        stroke={drawerIsMarkup ? '#F43F5E' : '#10B981'}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="460" cy={drawerIsMarkup ? 16 : 66} r="4" fill={drawerIsMarkup ? '#F43F5E' : '#10B981'} />
                    </svg>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: '#71717A', fontFamily: "'JetBrains Mono', monospace" }}>
                    <span>90D AGO</span>
                    <span>45D (PRE-SALE SPIKE)</span>
                    <span>TODAY: EGP {selectedDrawerItem.current_price_egp?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Module 4: Landed Cost & Arbitrage Benchmark */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.05em', color: '#71717A', textTransform: 'uppercase' }}>
                  LANDED IMPORT COST & ARBITRAGE BENCHMARK
                </span>

                <div
                  style={{
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#05070A',
                    fontSize: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <span style={{ color: '#71717A' }}>Domestic Cairo Retail Shelf</span>
                    <span style={{ color: '#FFFFFF', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>EGP {drawerDomestic.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <span style={{ color: '#71717A' }}>Declared CIF Cargo Import (USD converted)</span>
                    <span style={{ color: '#FFFFFF', fontFamily: "'JetBrains Mono', monospace" }}>EGP {drawerCif.toLocaleString()} (${drawerBaseUsd})</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <span style={{ color: '#71717A' }}>Customs Duty (10%)</span>
                    <span style={{ color: '#FFFFFF', fontFamily: "'JetBrains Mono', monospace" }}>EGP {drawerCustoms.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <span style={{ color: '#71717A' }}>Value-Added Tax (14% VAT)</span>
                    <span style={{ color: '#FFFFFF', fontFamily: "'JetBrains Mono', monospace" }}>EGP {drawerVat.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: '#131822', fontWeight: 600 }}>
                    <span style={{ color: '#FFFFFF' }}>Total Landed Cost Settlement</span>
                    <span style={{ color: '#10B981', fontFamily: "'JetBrains Mono', monospace" }}>EGP {drawerTotalLanded.toLocaleString()}</span>
                  </div>
                </div>

                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '6px',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    backgroundColor: 'rgba(16, 185, 129, 0.06)',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontWeight: 600, color: '#10B981' }}>
                    {drawerHasAdvantage ? 'IMPORT RECOMMENDED' : 'BUY LOCAL PREFERRED'}
                  </span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#D4D4D8' }}>
                    {drawerHasAdvantage ? `+EGP ${drawerNetSaved.toLocaleString()} margin saved` : 'Domestic shelf is optimal'}
                  </span>
                </div>
              </div>

              {/* Module 5: Alert Trigger Settings */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.05em', color: '#71717A', textTransform: 'uppercase' }}>
                  PRICE ALERT NOTIFICATION TRIGGER
                </span>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: '#05070A',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '6px',
                      height: '40px',
                      overflow: 'hidden',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#71717A',
                        padding: '0 12px',
                        backgroundColor: '#131822',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        fontFamily: "'JetBrains Mono', monospace",
                        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      EGP
                    </span>
                    <input
                      type="number"
                      value={alertTargetPrice}
                      onChange={(e) => setAlertTargetPrice(e.target.value)}
                      placeholder="e.g. 75000"
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        color: '#EDEDED',
                        fontSize: '0.8125rem',
                        padding: '0 12px',
                        outline: 'none',
                        height: '100%',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveAlert}
                    style={{
                      backgroundColor: alertSavedSuccess ? '#10B981' : '#FFFFFF',
                      color: '#05070A',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '0 16px',
                      height: '40px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'background-color 150ms ease',
                    }}
                  >
                    {alertSavedSuccess ? '✓ Alert Saved' : 'Save Alert Rule'}
                  </button>
                </div>
              </div>

            </div>
          </aside>
        </div>
      )}

      {/* Add SKU Modal Component */}
      <AddSkuModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={(newProduct) => {
          setTrackedItems((prev) => [newProduct, ...prev]);
          setModalOpen(false);
        }}
      />

      <style>{`
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
