import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import AddSkuModal from '../../components/console/AddSkuModal';
import MultiPlatformIntelligence from '../../components/console/MultiPlatformIntelligence';
import TelemetryControlDashboard from '../../components/console/TelemetryControlDashboard';
import Sidebar from '../../components/console/Sidebar';
import ArbitrageEngine from '../../components/console/ArbitrageEngine';
import RetailerHealth from '../../components/console/RetailerHealth';
import TruthForensics from '../../components/console/TruthForensics';
import WatchlistManager from '../../components/console/WatchlistManager';
import ExportsReports from '../../components/console/ExportsReports';
import { runFleetAudit, startBackgroundWorker, stopBackgroundWorker } from '../../services/telemetryWorker';
import { SEEDED_MASTER_PRODUCTS } from '../../services/marketIntelligenceData';
import { auditProductListing } from '../../services/auditDispatcher';
import { sanitizeRetailerUrl } from '../../utils/urlSanitizer';

const VALID_CONSOLE_TABS = [
  'overview',
  'intelligence',
  'arbitrage',
  'retailer-health',
  'forensics',
  'watchlist',
  'reports',
  'nodes',
  'tracker',
  'logs',
  'settings',
  'analytics',
];

// Domestic telemetry nodes cluster definitions
const CLUSTER_NODES = [
  { id: 'AMZN_EG', name: 'Amazon Egypt Node', domain: 'amazon.eg', status: 'ONLINE', ping: '18ms', throughput: '420 req/m', successRate: '99.9%' },
  { id: 'NOON_EG', name: 'Noon Egypt Node', domain: 'noon.com/egypt', status: 'ONLINE', ping: '22ms', throughput: '380 req/m', successRate: '99.7%' },
  { id: 'BTECH_EG', name: 'B.TECH Telemetry Node', domain: 'btech.com', status: 'ONLINE', ping: '29ms', throughput: '195 req/m', successRate: '99.4%' },
  { id: '2B_EG', name: '2B Hardware Node', domain: '2b.com.eg', status: 'ONLINE', ping: '34ms', throughput: '140 req/m', successRate: '98.9%' },
  { id: 'RAYA_EG', name: 'Raya Shop Probe', domain: 'rayashop.com', status: 'ONLINE', ping: '26ms', throughput: '165 req/m', successRate: '99.2%' },
];

export default function ConsolePage() {
  const { signOut } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hard BFCache / Browser Back button defense: redirect immediately if unauthenticated
  useEffect(() => {
    const enforceSessionBoundary = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!data?.session) {
          window.location.replace('/login');
        }
      } catch {
        window.location.replace('/login');
      }
    };

    window.addEventListener('pageshow', enforceSessionBoundary);
    window.addEventListener('popstate', enforceSessionBoundary);

    return () => {
      window.removeEventListener('pageshow', enforceSessionBoundary);
      window.removeEventListener('popstate', enforceSessionBoundary);
    };
  }, []);

  const [trackedItems, setTrackedItems] = useState([]);

  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const paramTab = new URLSearchParams(window.location.search).get('tab');
      if (paramTab && VALID_CONSOLE_TABS.includes(paramTab)) {
        return paramTab;
      }
      if (window.location.pathname.includes('/intelligence')) return 'intelligence';
    }
    return 'overview';
  });

  // Synchronize activeTab with URL query parameter & browser history navigation
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tabId);
      window.history.pushState({}, '', url.toString());
    }
  };

  useEffect(() => {
    const syncTabFromUrl = () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const paramTab = params.get('tab');
        if (paramTab && VALID_CONSOLE_TABS.includes(paramTab)) {
          setActiveTab(paramTab);
        }
      }
    };
    window.addEventListener('popstate', syncTabFromUrl);
    return () => window.removeEventListener('popstate', syncTabFromUrl);
  }, []);

  const [modalOpen, setModalOpen] = useState(false);
  const [probingSkuId, setProbingSkuId] = useState(null);
  const [flashingSkuIds, setFlashingSkuIds] = useState({});
  const [skuErrorMap, setSkuErrorMap] = useState({});
  const [reAuditToast, setReAuditToast] = useState(null);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [selectedIntelligenceProduct, setSelectedIntelligenceProduct] = useState(null);
  const [selectedIntelligenceProductId, setSelectedIntelligenceProductId] = useState(null);
  const [fleetAuditProgress, setFleetAuditProgress] = useState(null);
  const [fleetAuditCompleted, setFleetAuditCompleted] = useState(false);

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

  // Password & Linked Accounts Management State
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [googleLinking, setGoogleLinking] = useState(false);
  const [googleLinkMsg, setGoogleLinkMsg] = useState('');

  const refreshUserData = async () => {
    try {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      }
    } catch (err) {
      console.error('Failed to refresh user credentials:', err);
    }
  };

  const handleSuggestPassword = () => {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghijkmnopqrstuvwxyz';
    const numbers = '23456789';
    const symbols = '!@#$%^&*-_+=';
    const pick = (c) => c[Math.floor(Math.random() * c.length)];
    const res = [pick(upper), pick(lower), pick(numbers), pick(symbols)];
    const all = upper + lower + numbers + symbols;
    for (let i = 0; i < 12; i++) res.push(pick(all));
    for (let i = res.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [res[i], res[j]] = [res[j], res[i]];
    }
    const strong = res.join('');
    setNewPassword(strong);
    setConfirmPassword(strong);
    setShowNewPassword(true);
    setShowConfirmPassword(true);
    setPasswordError('');
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(strong).catch(() => {});
    }
  };

  // Background telemetry worker scheduled runner
  useEffect(() => {
    startBackgroundWorker(300000, { userEmail: user?.email });
    return () => stopBackgroundWorker();
  }, [user?.email]);

  // Fleet Audit Trigger Handler
  const handleRunFleetAudit = async () => {
    if (fleetAuditProgress) return;
    setFleetAuditCompleted(false);
    setFleetAuditProgress({ current: 0, total: 12, percent: 0, activeNode: 'INIT', status: 'STARTING' });

    try {
      await runFleetAudit({
        userEmail: user?.email,
        onProgress: (p) => {
          setFleetAuditProgress(p);
        },
      });

      setFleetAuditCompleted(true);
      setReAuditToast({
        type: 'success',
        message: 'Fleet Audit completed across 12 domestic nodes. Pricing telemetry refreshed.',
      });
      setTimeout(() => setReAuditToast(null), 3500);
      setTimeout(() => {
        setFleetAuditProgress(null);
        setFleetAuditCompleted(false);
      }, 3000);
    } catch (err) {
      console.error('[Fleet Audit Error]:', err);
      setReAuditToast({
        type: 'error',
        message: `Fleet Audit halted: ${err.message || 'Network error'}`,
      });
      setTimeout(() => setReAuditToast(null), 4000);
      setFleetAuditProgress(null);
    }
  };

  // Dynamically computed metrics for Glitch Radar & Arbitrage Savings
  const { totalArbitrageSavingsEgp, anomalyDetectionsCount } = useMemo(() => {
    let totalSavings = 0;
    let anomalyCount = glitchRadarEvents.length;

    trackedItems.forEach((item) => {
      const current = item.current_price_egp || 0;
      const baseline = item.baseline_price_egp || current;
      if (baseline > current) {
        totalSavings += baseline - current;
      }
      if (item.delta_pct && item.delta_pct < -10) {
        anomalyCount++;
      }
    });

    SEEDED_MASTER_PRODUCTS.forEach((product) => {
      const validPrices = (product.platform_listings || [])
        .map((l) => l.current_price)
        .filter((p) => p > 0);

      if (validPrices.length >= 2) {
        const spread = Math.max(...validPrices) - Math.min(...validPrices);
        totalSavings += spread;
      }
    });

    return {
      totalArbitrageSavingsEgp: Math.round(totalSavings),
      anomalyDetectionsCount: anomalyCount,
    };
  }, [trackedItems, glitchRadarEvents]);

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: '#27272A' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    if (score <= 1) return { score: 1, label: 'Weak', color: '#FB7185' };
    if (score <= 3) return { score: 2, label: 'Moderate', color: '#FBBF24' };
    return { score: 3, label: 'Strong', color: '#34D399' };
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (passwordLoading) return;
    setPasswordError('');
    setPasswordSuccess('');

    if (!newPassword || newPassword.length < 8) {
      setPasswordError('Password must contain at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match. Please verify both fields.');
      return;
    }

    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setPasswordError(error.message || 'Failed to update password.');
      } else {
        setPasswordSuccess('✓ Password set successfully. You can now log in using either Google or your email and password.');
        await refreshUserData();
        setTimeout(() => {
          setPasswordModalOpen(false);
          setNewPassword('');
          setConfirmPassword('');
          setPasswordSuccess('');
          setPasswordError('');
        }, 1500);
      }
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleConnectGoogle = async () => {
    if (googleLinking) return;
    setGoogleLinking(true);
    setGoogleLinkMsg('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.href,
        },
      });
      if (error) {
        setGoogleLinkMsg(error.message || 'Failed to initiate Google link.');
        setGoogleLinking(false);
      }
    } catch (err) {
      setGoogleLinkMsg(err.message || 'Failed to initiate Google link.');
      setGoogleLinking(false);
    }
  };

  // Live Supabase data hydration & Glitch Radar realtime channel
  useEffect(() => {
    let active = true;

    async function loadConsoleData() {
      setLoading(true);
      try {
        const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
        if (sessionErr || !sessionData?.session) {
          window.location.replace('/login');
          return;
        }

        const { data: userData } = await supabase.auth.getUser();
        const activeUser = userData?.user || sessionData.session.user;
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

  // Keyboard navigation (Escape to close drawer, Command+K to search)
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
    try {
      await signOut();
    } catch {
      await supabase.auth.signOut();
      window.location.replace('/login');
    }
  };

  // Helper for external store links across Egyptian platforms
  const getStoreUrl = (item) => {
    if (!item) return '#';
    return sanitizeRetailerUrl({
      url: item.url || item.product_url || item.source_url || item.affiliate_url,
      platformId: item.node || item.retailer || item.domain || item.platform_id,
      productTitle: item.title || item.name,
      sku: item.sku || item.model,
    });
  };

  const handleReaudit = async (e, item) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const itemId = item.id || item.sku;
    setProbingSkuId(itemId);
    setSkuErrorMap((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });

    const productUrl = getStoreUrl(item);
    const platformSlug = item.node || item.retailer_id || item.domain || 'AMZN_EG';

    try {
      const telemetry = await auditProductListing(
        item.id || item.sku,
        productUrl,
        platformSlug,
        { previousPrice: item.current_price_egp }
      );

      // Play subtle emerald flash animation on the updated price cell
      setFlashingSkuIds((prev) => ({ ...prev, [itemId]: true }));
      setTimeout(() => {
        setFlashingSkuIds((prev) => {
          const next = { ...prev };
          delete next[itemId];
          return next;
        });
      }, 2600);

      // Instantly update item price, delta, and last updated time in state
      setTrackedItems((prev) =>
        prev.map((i) => {
          if (i.id === item.id || i.sku === item.sku) {
            const newPrice = telemetry.currentPrice;
            const baseline = i.baseline_price_egp || newPrice;
            const newDelta = baseline > 0 ? parseFloat((((newPrice - baseline) / baseline) * 100).toFixed(1)) : 0;
            return {
              ...i,
              current_price_egp: newPrice,
              delta_pct: newDelta,
              last_ping: 'just now',
              status: telemetry.statusText || 'Active',
            };
          }
          return i;
        })
      );

      // Update drawer item if currently open
      if (selectedDrawerItem && (selectedDrawerItem.id === item.id || selectedDrawerItem.sku === item.sku)) {
        setSelectedDrawerItem((prev) => {
          if (!prev) return null;
          const newPrice = telemetry.currentPrice;
          const baseline = prev.baseline_price_egp || newPrice;
          const newDelta = baseline > 0 ? parseFloat((((newPrice - baseline) / baseline) * 100).toFixed(1)) : 0;
          return {
            ...prev,
            current_price_egp: newPrice,
            delta_pct: newDelta,
            last_ping: 'just now',
            status: telemetry.statusText || 'Active',
          };
        });
      }

      // Show subtle non-intrusive notification toast
      setReAuditToast({
        type: 'success',
        message: `Audited ${item.title?.split(' ')[0] || 'SKU'} ${item.title?.split(' ')[1] || ''}: EGP ${telemetry.currentPrice.toLocaleString()} (${telemetry.priceDeltaPct >= 0 ? '+' : ''}${telemetry.priceDeltaPct}%)`,
      });
      setTimeout(() => setReAuditToast(null), 3500);
    } catch (err) {
      console.error('[Re-audit Pipeline Error]:', err);
      setSkuErrorMap((prev) => ({
        ...prev,
        [itemId]: err?.message || 'Node connection timed out',
      }));
      setReAuditToast({
        type: 'error',
        message: `Failed to probe ${item.node}: ${err?.message || 'Connection timed out'}`,
      });
      setTimeout(() => setReAuditToast(null), 4000);
    } finally {
      setProbingSkuId(null);
    }
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

  // Identity metadata computation
  const identities = user?.identities || [];
  const googleIdentity = identities.find((id) => id.provider === 'google');
  const isGoogleConnected = Boolean(googleIdentity || user?.app_metadata?.providers?.includes('google'));
  const googleEmail = googleIdentity?.identity_data?.email || (isGoogleConnected ? user?.email : null);

  const emailIdentity = identities.find((id) => id.provider === 'email');
  const isEmailPasswordActive = Boolean(emailIdentity || user?.app_metadata?.providers?.includes('email'));
  const primaryEmail = user?.email || emailIdentity?.identity_data?.email || 'admin@cawlix.com';
  const userHandle =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    (primaryEmail ? primaryEmail.split('@')[0] : 'Kamal Aboueid');
  const pwdStrength = getPasswordStrength(newPassword);

  const handleRowClick = (item) => {
    setSelectedDrawerItem(item);
    setAlertTargetPrice(item.target_price ? String(item.target_price) : '');
  };

  const filteredItems = useMemo(() => {
    return trackedItems;
  }, [trackedItems]);

  const handleSaveAlert = async () => {
    if (!selectedDrawerItem) return;
    try {
      if (selectedDrawerItem.watchlist_id) {
        await supabase
          .from('user_watchlists')
          .update({ target_price: alertTargetPrice ? parseFloat(alertTargetPrice) : null })
          .eq('id', selectedDrawerItem.watchlist_id);
      }
      setAlertSavedSuccess(true);
      setTimeout(() => setAlertSavedSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save alert rule:', err);
    }
  };

  const handleInspectProduct = (product) => {
    if (!product) return;
    setSelectedIntelligenceProduct(product);
    setSelectedIntelligenceProductId(product.id);
    handleTabChange('intelligence');
    const mainEl = document.getElementById('cawlix-main-workspace');
    if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      style={{
        height: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden',
        backgroundColor: '#000000',
        color: '#EDEDED',
        fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        display: 'flex',
      }}
    >
      {/* ── 1. INSTITUTIONAL PITCH-BLACK SIDEBAR NAVIGATION ── */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        trackedCount={trackedItems.length}
        anomalyCount={anomalyDetectionsCount}
        watchlistCount={4}
        userHandle={userHandle}
        userEmail={user?.email || 'kamalaboueidd@gmail.com'}
        userAvatar={null}
        realtimeConnected={realtimeConnected}
        onSignOut={handleSignOut}
        onShowToast={(msg, type) => {
          setReAuditToast({
            id: Date.now(),
            title: 'Telemetry Console',
            message: msg,
            type: type || 'success',
          });
          setTimeout(() => setReAuditToast(null), 3500);
        }}
        onInspectProduct={handleInspectProduct}
      />

      {/* ── 2. MAIN APPLICATION WORKSPACE (SCROLLS INDEPENDENTLY) ── */}
      <div
        id="cawlix-main-workspace"
        style={{
          flex: 1,
          height: '100vh',
          maxHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          backgroundColor: '#000000',
        }}
      >
        {/* Topbar: Vercel Border (#1F1F1F) */}
        <header
          style={{
            height: '56px',
            backgroundColor: '#000000',
            borderBottom: '1px solid #1F1F1F',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            position: 'sticky',
            top: 0,
            zIndex: 30,
            boxSizing: 'border-box',
          }}
        >
          {/* Breadcrumb Workspace Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#EDEDED' }}>
              All Monitored SKUs
            </span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#666666" strokeWidth="2">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>

          {/* Universal Real-Time Search & Multi-Platform Command Palette */}
          <TelemetryControlDashboard
            onSelectProduct={(product) => {
              if (!product) return;
              setSelectedIntelligenceProduct(product);
              setSelectedIntelligenceProductId(product.id);
              handleTabChange('intelligence');
              const mainEl = document.getElementById('cawlix-main-workspace');
              if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />

          {/* Topbar Right Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Run Fleet Audit Manual Trigger Button */}
            <button
              type="button"
              onClick={handleRunFleetAudit}
              disabled={Boolean(fleetAuditProgress)}
              style={{
                backgroundColor: fleetAuditCompleted ? 'rgba(16, 185, 129, 0.15)' : '#0A0A0A',
                color: fleetAuditCompleted ? '#10B981' : fleetAuditProgress ? '#F59E0B' : '#EDEDED',
                fontSize: '0.8125rem',
                fontWeight: 500,
                padding: '6px 12px',
                borderRadius: '6px',
                border: fleetAuditCompleted
                  ? '1px solid #10B981'
                  : fleetAuditProgress
                  ? '1px solid rgba(245, 158, 11, 0.4)'
                  : '1px solid #222222',
                cursor: fleetAuditProgress ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 150ms ease',
                fontFamily: "'Geist', sans-serif",
              }}
              title="Trigger background telemetry audit across all 12 Egyptian nodes"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke={fleetAuditCompleted ? '#10B981' : fleetAuditProgress ? '#F59E0B' : '#888888'}
                strokeWidth="2"
                style={{ animation: fleetAuditProgress ? 'spin 1s linear infinite' : 'none' }}
              >
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
              <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: '0.75rem' }}>
                {fleetAuditCompleted
                  ? 'Fleet Audited ✓'
                  : fleetAuditProgress
                  ? `Auditing ${fleetAuditProgress.current}/${fleetAuditProgress.total} nodes...`
                  : 'Run Fleet Audit'}
              </span>
            </button>

            {/* Iconic Vercel High-Contrast Action Button */}
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#000000',
                fontSize: '0.8125rem',
                fontWeight: 500,
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'background-color 150ms ease',
                fontFamily: "'Geist', sans-serif",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#EAEAEA')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
            >
              <span style={{ fontSize: '14px', lineHeight: 1 }}>+</span>
              <span>Add Target SKU</span>
            </button>
          </div>
        </header>

        {/* ── 3. WORKSPACE CANVAS CONTENT ── */}
        <main style={{ flex: 1, padding: '24px 28px', boxSizing: 'border-box' }}>
          <div style={{ maxWidth: '1360px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* View Header with Subdued Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#EDEDED', margin: '0 0 4px 0', letterSpacing: '-0.02em', fontFamily: "'Geist', sans-serif" }}>
                  {activeTab === 'overview' && 'Telemetry Control Dashboard'}
                  {activeTab === 'intelligence' && 'Multi-Platform E-Commerce Intelligence'}
                  {activeTab === 'arbitrage' && 'Cross-Retailer Arbitrage Engine'}
                  {activeTab === 'retailer-health' && 'Retailer Infrastructure & Latency Radar'}
                  {activeTab === 'forensics' && 'Truth Forensics & Glitch Radar'}
                  {activeTab === 'watchlist' && 'Custom Watchlist & Target Price Triggers'}
                  {activeTab === 'reports' && 'Intelligence Exports & Compliance Audit Reports'}
                  {activeTab === 'analytics' && 'Price Analytics & Arbitrage Matrix'}
                  {activeTab === 'nodes' && 'Domestic Telemetry Nodes'}
                  {activeTab === 'tracker' && 'Tracked SKU Surveillance'}
                  {activeTab === 'logs' && 'System Logs & Glitch Radar Feed'}
                  {activeTab === 'settings' && 'Telemetry Engine Configuration'}
                </h1>
                <p style={{ fontSize: '0.8125rem', color: '#888888', margin: 0 }}>
                  {activeTab === 'overview' && 'Real-time retail price monitoring, baseline forensics, and arbitrage analytics.'}
                  {activeTab === 'intelligence' && 'Unified comparison matrix, fake-discount forensic auditor, and material specs across 12 Egyptian platforms.'}
                  {activeTab === 'arbitrage' && 'Automated domestic shelf divergence discovery calculating real-time margin spreads across 12 verified Egyptian platforms.'}
                  {activeTab === 'retailer-health' && 'Real-time probe health, schema extraction vectors, and 90-day truth integrity scores across all 12 domestic Egyptian retailers.'}
                  {activeTab === 'forensics' && 'Automated interception of artificial reference price inflation, ghost markups, and deceptive discount anomalies.'}
                  {activeTab === 'watchlist' && 'Algorithmic limit order monitoring, real-time inventory restock interception, and multi-channel notification dispatch rules.'}
                  {activeTab === 'reports' && 'Machine-readable arbitrage feeds, raw cross-retailer CSV exports, and official price integrity audit reports.'}
                  {activeTab === 'analytics' && 'Multi-retailer price variance distribution, algorithmic margin tracking, and buy-box arbitrage windows.'}
                  {activeTab === 'nodes' && 'Active scraping infrastructure and network latency health for domestic retailers.'}
                  {activeTab === 'tracker' && 'Continuous 90-day rolling baseline tracking for targeted Cairo retail items.'}
                  {activeTab === 'logs' && 'High-frequency price anomaly intercepts and database mutation events.'}
                  {activeTab === 'settings' && 'Account security, webhook configurations, and node credentials.'}
                </p>
              </div>

              {/* View Switcher Controls (Subdued Vercel Segmented Bar) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#000000',
                  borderRadius: '6px',
                  border: '1px solid #1F1F1F',
                  padding: '2px',
                }}
              >
                <button
                  type="button"
                  onClick={() => handleTabChange('overview')}
                  style={{
                    backgroundColor: activeTab === 'overview' ? '#161616' : 'transparent',
                    color: activeTab === 'overview' ? '#EDEDED' : '#888888',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    padding: '4px 10px',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 120ms ease',
                    fontFamily: "'Geist', sans-serif",
                  }}
                >
                  Overview
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('intelligence')}
                  style={{
                    backgroundColor: activeTab === 'intelligence' ? '#161616' : 'transparent',
                    color: activeTab === 'intelligence' ? '#EDEDED' : '#888888',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    padding: '4px 10px',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 120ms ease',
                    fontFamily: "'Geist', sans-serif",
                  }}
                >
                  Market Matrix
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('analytics')}
                  style={{
                    backgroundColor: activeTab === 'analytics' ? '#161616' : 'transparent',
                    color: activeTab === 'analytics' ? '#EDEDED' : '#888888',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    padding: '4px 10px',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 120ms ease',
                    fontFamily: "'Geist', sans-serif",
                  }}
                >
                  Analytics
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('tracker')}
                  style={{
                    backgroundColor: activeTab === 'tracker' ? '#161616' : 'transparent',
                    color: activeTab === 'tracker' ? '#EDEDED' : '#888888',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    padding: '4px 10px',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 120ms ease',
                    fontFamily: "'Geist', sans-serif",
                  }}
                >
                  Tracker
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('logs')}
                  style={{
                    backgroundColor: activeTab === 'logs' ? '#161616' : 'transparent',
                    color: activeTab === 'logs' ? '#EDEDED' : '#888888',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    padding: '4px 10px',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 120ms ease',
                    fontFamily: "'Geist', sans-serif",
                  }}
                >
                  Glitch Radar
                </button>
              </div>
            </div>

            {/* ── 4. METRIC CARDS (Vercel #000000 + 1px solid #1F1F1F) ── */}
            {(activeTab === 'overview' || activeTab === 'tracker') && (
              <section
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '14px',
                }}
              >
                {/* Metric 1 */}
                <div
                  style={{
                    backgroundColor: '#000000',
                    border: '1px solid #1F1F1F',
                    borderRadius: '8px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#888888',
                    }}
                  >
                    TOTAL MONITORED SKUS
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                    <span
                      style={{
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        color: '#EDEDED',
                        fontFamily: "'Geist Mono', monospace",
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {trackedItems.length}
                    </span>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 500,
                        color: '#00DF8F',
                        backgroundColor: '#0A0A0A',
                        border: '1px solid #222222',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontFamily: "'Geist Mono', monospace",
                      }}
                    >
                      +12.4%
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#666666' }}>
                    Active 90-day price baseline monitoring
                  </span>
                </div>

                {/* Metric 2 */}
                <div
                  style={{
                    backgroundColor: '#000000',
                    border: '1px solid #1F1F1F',
                    borderRadius: '8px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#888888',
                    }}
                  >
                    DOMESTIC RETAILERS MONITORED
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                    <span
                      style={{
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        color: '#EDEDED',
                        fontFamily: "'Geist Mono', monospace",
                        letterSpacing: '-0.02em',
                      }}
                    >
                      6
                    </span>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 500,
                        color: '#0070F3',
                        backgroundColor: '#0A0A0A',
                        border: '1px solid #222222',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontFamily: "'Geist Mono', monospace",
                      }}
                    >
                      100% ACTIVE
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#666666' }}>
                    Amazon, Noon, B.TECH, 2B, Raya & Jumia
                  </span>
                </div>

                {/* Metric 3 */}
                <div
                  style={{
                    backgroundColor: '#000000',
                    border: '1px solid #1F1F1F',
                    borderRadius: '8px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#888888',
                    }}
                  >
                    GLITCH ANOMALIES INTERCEPTED
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                    <span
                      style={{
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        color: '#EDEDED',
                        fontFamily: "'Geist Mono', monospace",
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {anomalyDetectionsCount}
                    </span>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 500,
                        color: '#FB7185',
                        backgroundColor: '#0A0A0A',
                        border: '1px solid #222222',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontFamily: "'Geist Mono', monospace",
                      }}
                    >
                      -47.1% MAX
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#666666' }}>
                    Zero-margin flash crashes captured
                  </span>
                </div>

                {/* Metric 4 */}
                <div
                  style={{
                    backgroundColor: '#000000',
                    border: '1px solid #1F1F1F',
                    borderRadius: '8px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#888888',
                    }}
                  >
                    ESTIMATED ARBITRAGE SAVINGS
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                    <span
                      style={{
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        color: '#EDEDED',
                        fontFamily: "'Geist Mono', monospace",
                        letterSpacing: '-0.02em',
                      }}
                    >
                      EGP {(totalArbitrageSavingsEgp / 1000).toFixed(1)}K
                    </span>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 500,
                        color: '#00DF8F',
                        backgroundColor: '#0A0A0A',
                        border: '1px solid #222222',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontFamily: "'Geist Mono', monospace",
                      }}
                    >
                      +18.5%
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#666666' }}>
                    Landed CIF benchmark advantage
                  </span>
                </div>
              </section>
            )}

            {/* ── 5. TAB VIEWS ── */}

            {/* TAB: Multi-Platform Market Matrix (12 Egyptian Platforms) */}
            {activeTab === 'intelligence' && (
              <MultiPlatformIntelligence
                defaultProductId={selectedIntelligenceProductId}
                resolvedProduct={selectedIntelligenceProduct}
              />
            )}

            {/* TAB: Cross-Retailer Arbitrage Engine */}
            {activeTab === 'arbitrage' && (
              <ArbitrageEngine
                onInspectProduct={handleInspectProduct}
                onShowToast={(msg, type) => {
                  setReAuditToast({
                    id: Date.now(),
                    title: 'Arbitrage Engine',
                    message: msg,
                    type: type || 'success',
                  });
                  setTimeout(() => setReAuditToast(null), 3500);
                }}
              />
            )}

            {/* TAB: Retailer Infrastructure & Latency Radar */}
            {activeTab === 'retailer-health' && (
              <RetailerHealth
                onShowToast={(msg, type) => {
                  setReAuditToast({
                    id: Date.now(),
                    title: 'Retailer Health',
                    message: msg,
                    type: type || 'success',
                  });
                  setTimeout(() => setReAuditToast(null), 3500);
                }}
              />
            )}

            {/* TAB: Truth Forensics & Glitch Radar */}
            {activeTab === 'forensics' && (
              <TruthForensics
                onInspectProduct={handleInspectProduct}
                onShowToast={(msg, type) => {
                  setReAuditToast({
                    id: Date.now(),
                    title: 'Truth Forensics',
                    message: msg,
                    type: type || 'success',
                  });
                  setTimeout(() => setReAuditToast(null), 3500);
                }}
              />
            )}

            {/* TAB: Custom Watchlist & Price Targets */}
            {activeTab === 'watchlist' && (
              <WatchlistManager
                onInspectProduct={handleInspectProduct}
                onShowToast={(msg, type) => {
                  setReAuditToast({
                    id: Date.now(),
                    title: 'Watchlist',
                    message: msg,
                    type: type || 'success',
                  });
                  setTimeout(() => setReAuditToast(null), 3500);
                }}
              />
            )}

            {/* TAB: Intelligence Exports & Audit Reports */}
            {activeTab === 'reports' && (
              <ExportsReports
                onShowToast={(msg, type) => {
                  setReAuditToast({
                    id: Date.now(),
                    title: 'Audit Reports',
                    message: msg,
                    type: type || 'success',
                  });
                  setTimeout(() => setReAuditToast(null), 3500);
                }}
              />
            )}

            {/* TAB: Price Analytics & Domestic Arbitrage Trends */}
            {activeTab === 'analytics' && (
              <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Analytics Key Performance Indices */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: '14px',
                  }}
                >
                  <div
                    style={{
                      backgroundColor: '#000000',
                      border: '1px solid #1F1F1F',
                      borderRadius: '8px',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <span style={{ fontSize: '0.6875rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#888888' }}>
                      MAX MARKET DIVERGENCE
                    </span>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 600, color: '#10B981', fontFamily: "'Geist Mono', monospace" }}>
                        34.8%
                      </span>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 500, color: '#10B981', fontFamily: "'Geist Mono', monospace" }}>
                        LIVE
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#666666' }}>
                      Peak spread across Egyptian platforms
                    </span>
                  </div>

                  <div
                    style={{
                      backgroundColor: '#000000',
                      border: '1px solid #1F1F1F',
                      borderRadius: '8px',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <span style={{ fontSize: '0.6875rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#888888' }}>
                      BUY-BOX LEADER (FREQUENCY)
                    </span>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 600, color: '#EDEDED', fontFamily: "'Geist Mono', monospace" }}>
                        Amazon EG
                      </span>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 500, color: '#00DF8F', fontFamily: "'Geist Mono', monospace" }}>
                        61.5% SHARE
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#666666' }}>
                      Lowest domestic shelf price probability
                    </span>
                  </div>

                  <div
                    style={{
                      backgroundColor: '#000000',
                      border: '1px solid #1F1F1F',
                      borderRadius: '8px',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <span style={{ fontSize: '0.6875rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#888888' }}>
                      VOLATILITY INDEX (24H)
                    </span>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 600, color: '#F59E0B', fontFamily: "'Geist Mono', monospace" }}>
                        ± 14.2%
                      </span>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 500, color: '#F59E0B', fontFamily: "'Geist Mono', monospace" }}>
                        ELEVATED
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#666666' }}>
                      Retailer dynamic repricing speed
                    </span>
                  </div>

                  <div
                    style={{
                      backgroundColor: '#000000',
                      border: '1px solid #1F1F1F',
                      borderRadius: '8px',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <span style={{ fontSize: '0.6875rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#888888' }}>
                      CUMULATIVE ARBITRAGE POOL
                    </span>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: 600, color: '#EDEDED', fontFamily: "'Geist Mono', monospace" }}>
                        EGP 42,950
                      </span>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 500, color: '#10B981', fontFamily: "'Geist Mono', monospace" }}>
                        +22.4%
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#666666' }}>
                      Total price delta captured across catalog
                    </span>
                  </div>
                </div>

                {/* Retailer Price War Competitiveness Spectrum */}
                <div
                  style={{
                    backgroundColor: '#000000',
                    border: '1px solid #1F1F1F',
                    borderRadius: '8px',
                    padding: '22px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#EDEDED', margin: 0, letterSpacing: '-0.01em' }}>
                        Domestic Price Competitiveness & Buy-Box Dominance
                      </h3>
                      <p style={{ fontSize: '0.8125rem', color: '#888888', margin: '4px 0 0 0' }}>
                        Real-time win-rate calculating which Egyptian platform offers the confirmed lowest authentic shelf price.
                      </p>
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: '#00DF8F', fontFamily: "'Geist Mono', monospace" }}>
                      12 RETAILERS INDEXED
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '8px' }}>
                    {[
                      { name: 'Amazon Egypt (amazon.eg)', share: 61.5, avgDiscount: '14.8%', status: 'Dominant Best Deal' },
                      { name: 'Noon Egypt (noon.com/egypt)', share: 23.1, avgDiscount: '11.2%', status: 'Competitive Flash Sales' },
                      { name: 'B.TECH (btech.com)', share: 7.7, avgDiscount: '6.4%', status: 'Installment Parity' },
                      { name: '2B Egypt (2b.com.eg)', share: 4.2, avgDiscount: '5.1%', status: 'Niche Hardware Leader' },
                      { name: 'Raya Shop (rayashop.com)', share: 3.5, avgDiscount: '4.8%', status: 'Domestic Warranty Premium' },
                    ].map((item) => (
                      <div key={item.name} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem' }}>
                          <span style={{ color: '#EDEDED', fontWeight: 500 }}>{item.name}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontFamily: "'Geist Mono', monospace", fontSize: '0.75rem' }}>
                            <span style={{ color: '#888888' }}>Avg Markdown: {item.avgDiscount}</span>
                            <span style={{ color: '#EDEDED', fontWeight: 600 }}>{item.share}%</span>
                          </div>
                        </div>
                        <div style={{ height: '6px', backgroundColor: '#141414', borderRadius: '3px', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${item.share}%`,
                              backgroundColor: item.share > 50 ? '#10B981' : item.share > 20 ? '#FFE600' : '#38BDF8',
                              borderRadius: '3px',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* TAB: Telemetry Nodes */}
            {activeTab === 'nodes' && (
              <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '14px',
                  }}
                >
                  {CLUSTER_NODES.map((node) => (
                    <div
                      key={node.id}
                      style={{
                        backgroundColor: '#000000',
                        border: '1px solid #1F1F1F',
                        borderRadius: '8px',
                        padding: '18px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#EDEDED', fontFamily: "'Geist', sans-serif" }}>
                            {node.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#888888', fontFamily: "'Geist Mono', monospace", marginTop: '2px' }}>
                            {node.domain}
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: '0.625rem',
                            fontWeight: 500,
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            backgroundColor: '#0A0A0A',
                            border: '1px solid #222222',
                            color: '#00DF8F',
                            fontFamily: "'Geist Mono', monospace",
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
                          paddingTop: '12px',
                          borderTop: '1px solid #1F1F1F',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.6875rem', color: '#666666', textTransform: 'uppercase', fontFamily: "'Geist', sans-serif" }}>
                            PING
                          </div>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#EDEDED', fontFamily: "'Geist Mono', monospace", marginTop: '2px' }}>
                            {node.ping}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.6875rem', color: '#666666', textTransform: 'uppercase', fontFamily: "'Geist', sans-serif" }}>
                            THROUGHPUT
                          </div>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#EDEDED', fontFamily: "'Geist Mono', monospace", marginTop: '2px' }}>
                            {node.throughput}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.6875rem', color: '#666666', textTransform: 'uppercase', fontFamily: "'Geist', sans-serif" }}>
                            UPTIME
                          </div>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#00DF8F', fontFamily: "'Geist Mono', monospace", marginTop: '2px' }}>
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
              <section style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    backgroundColor: '#000000',
                    border: '1px solid #1F1F1F',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: '#00DF8F',
                      }}
                    />
                    <div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#EDEDED', fontFamily: "'Geist', sans-serif" }}>
                        REALTIME POSTGRES MUTATION STREAM
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: '#888888', fontFamily: "'Geist Mono', monospace" }}>
                        channel: realtime:glitch_radar_events
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontFamily: "'Geist Mono', monospace",
                      color: '#EDEDED',
                      backgroundColor: '#0A0A0A',
                      border: '1px solid #222222',
                      padding: '3px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    {glitchRadarEvents.length} ANOMALIES INTERCEPTED
                  </span>
                </div>

                {/* Event Feed List in Vercel Table Style */}
                <div
                  style={{
                    backgroundColor: '#000000',
                    border: '1px solid #1F1F1F',
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
                        padding: '13px 18px',
                        borderBottom: idx < glitchRadarEvents.length - 1 ? '1px solid #1F1F1F' : 'none',
                        cursor: 'pointer',
                        transition: 'background-color 100ms ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0D0D0D')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingRight: '12px', minWidth: 0 }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#EDEDED', fontFamily: "'Geist', sans-serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {evt.title}
                        </span>
                        <span style={{ fontSize: '0.6875rem', color: '#888888', fontFamily: "'Geist Mono', monospace" }}>
                          {evt.sku}
                        </span>
                      </div>
                      <div>
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontFamily: "'Geist Mono', monospace",
                            padding: '2px 8px',
                            backgroundColor: '#0A0A0A',
                            border: '1px solid #222222',
                            borderRadius: '4px',
                            color: '#888888',
                          }}
                        >
                          {evt.retailer}
                        </span>
                      </div>
                      <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: '0.875rem', fontWeight: 500, color: '#EDEDED' }}>
                        EGP {evt.current_price_egp?.toLocaleString()}
                      </div>
                      <div>
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 500,
                            fontFamily: "'Geist Mono', monospace",
                            color: '#FB7185',
                            backgroundColor: '#0A0A0A',
                            border: '1px solid #222222',
                            padding: '2px 8px',
                            borderRadius: '4px',
                          }}
                        >
                          {evt.drop_pct}%
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#666666', fontFamily: "'Geist Mono', monospace", textAlign: 'right' }}>
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
                {/* 1. Authentication & Linked Accounts Card */}
                <div
                  style={{
                    backgroundColor: '#000000',
                    border: '1px solid #1F1F1F',
                    borderRadius: '8px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <h3 style={{ fontSize: '0.9375rem', fontWeight: 500, color: '#EDEDED', margin: 0, fontFamily: "'Geist', sans-serif" }}>
                        Authentication & Connected Accounts
                      </h3>
                      <p style={{ fontSize: '0.8125rem', color: '#888888', marginTop: '4px', marginBottom: 0, fontFamily: "'Geist', sans-serif" }}>
                        Linking multiple sign-in methods allows redundant access to your Cawlix workspace.
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontFamily: "'Geist Mono', monospace",
                        padding: '3px 8px',
                        borderRadius: '4px',
                        backgroundColor: '#0A0A0A',
                        border: '1px solid #222222',
                        color: '#888888',
                      }}
                    >
                      {identities.length} {identities.length === 1 ? 'PROVIDER LINKED' : 'PROVIDERS LINKED'}
                    </span>
                  </div>

                  {/* Provider List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* Provider 1: Email / Password */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 16px',
                        backgroundColor: '#0A0A0A',
                        border: '1px solid #1F1F1F',
                        borderRadius: '6px',
                        gap: '14px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '6px',
                            backgroundColor: '#000000',
                            border: '1px solid #222222',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#EDEDED',
                            flexShrink: 0,
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#EDEDED', fontFamily: "'Geist', sans-serif" }}>
                              Email & Password
                            </span>
                            <span
                              style={{
                                fontSize: '0.6875rem',
                                fontWeight: 500,
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontFamily: "'Geist Mono', monospace",
                                backgroundColor: '#000000',
                                color: isEmailPasswordActive ? '#10B981' : '#666666',
                                border: isEmailPasswordActive ? '1px solid #222222' : '1px solid #1F1F1F',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              {isEmailPasswordActive && <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#10B981' }} />}
                              {isEmailPasswordActive ? 'Active' : 'Unset'}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#888888', fontFamily: "'Geist Mono', monospace", marginTop: '2px' }}>
                            {primaryEmail}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setPasswordError('');
                          setPasswordSuccess('');
                          setNewPassword('');
                          setConfirmPassword('');
                          setPasswordModalOpen(true);
                        }}
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          backgroundColor: '#000000',
                          border: '1px solid #222222',
                          borderRadius: '6px',
                          color: '#EDEDED',
                          cursor: 'pointer',
                          transition: 'all 120ms ease',
                          fontFamily: "'Geist', sans-serif",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#111111';
                          e.currentTarget.style.borderColor = '#333333';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#000000';
                          e.currentTarget.style.borderColor = '#222222';
                        }}
                      >
                        {isEmailPasswordActive ? 'Update Password' : 'Set Password'}
                      </button>
                    </div>

                    {/* Provider 2: Google OAuth */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 16px',
                        backgroundColor: '#0A0A0A',
                        border: '1px solid #1F1F1F',
                        borderRadius: '6px',
                        gap: '14px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '6px',
                            backgroundColor: '#000000',
                            border: '1px solid #222222',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                          </svg>
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#EDEDED', fontFamily: "'Geist', sans-serif" }}>
                              Google OAuth
                            </span>
                            <span
                              style={{
                                fontSize: '0.6875rem',
                                fontWeight: 500,
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontFamily: "'Geist Mono', monospace",
                                backgroundColor: '#000000',
                                color: isGoogleConnected ? '#10B981' : '#666666',
                                border: isGoogleConnected ? '1px solid #222222' : '1px solid #1F1F1F',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                              }}
                            >
                              {isGoogleConnected ? (
                                <>
                                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
                                  <span>Connected {googleEmail ? `(${googleEmail})` : ''}</span>
                                </>
                              ) : (
                                'Not connected'
                              )}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#888888', fontFamily: "'Geist Mono', monospace", marginTop: '2px' }}>
                            {isGoogleConnected ? 'Seamless 1-click single sign-on enabled' : 'Not linked to this session'}
                          </div>
                        </div>
                      </div>

                      <div>
                        {isGoogleConnected ? (
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              backgroundColor: '#000000',
                              border: '1px solid #222222',
                              color: '#00DF8F',
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              fontFamily: "'Geist Mono', monospace",
                            }}
                          >
                            <span>✓</span>
                            <span>Verified</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={googleLinking}
                            onClick={handleConnectGoogle}
                            style={{
                              padding: '6px 14px',
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              backgroundColor: '#FFFFFF',
                              border: 'none',
                              borderRadius: '6px',
                              color: '#000000',
                              cursor: googleLinking ? 'not-allowed' : 'pointer',
                              opacity: googleLinking ? 0.6 : 1,
                              transition: 'opacity 150ms ease',
                              fontFamily: "'Geist', sans-serif",
                            }}
                          >
                            {googleLinking ? 'Connecting...' : 'Connect Google'}
                          </button>
                        )}
                      </div>
                    </div>

                    {googleLinkMsg && (
                      <div
                        style={{
                          fontSize: '0.8125rem',
                          color: '#FB7185',
                          backgroundColor: '#0A0A0A',
                          border: '1px solid #222222',
                          borderRadius: '6px',
                          padding: '10px 12px',
                          fontFamily: "'Geist', sans-serif",
                        }}
                      >
                        {googleLinkMsg}
                      </div>
                    )}
                  </div>

                  {/* Redundant Access Guarantee Box */}
                  <div
                    style={{
                      backgroundColor: '#000000',
                      border: '1px solid #1F1F1F',
                      borderRadius: '6px',
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                    }}
                  >
                    <span style={{ fontSize: '1.125rem', lineHeight: 1 }}>🛡️</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#EDEDED', fontFamily: "'Geist', sans-serif" }}>
                        Redundant Access Guarantee
                      </span>
                      <p style={{ fontSize: '0.75rem', color: '#888888', margin: 0, lineHeight: 1.5, fontFamily: "'Geist', sans-serif" }}>
                        By linking both Google OAuth and Email/Password credentials, you maintain dual redundant access to the Cawlix Telemetry Console. If Google OAuth experiences downtime or identity token invalidation, you can immediately sign in using your direct password hash without disruption.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Active Telemetry Session Card */}
                <div
                  style={{
                    backgroundColor: '#000000',
                    border: '1px solid #1F1F1F',
                    borderRadius: '8px',
                    padding: '22px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                  }}
                >
                  <h3 style={{ fontSize: '0.875rem', fontWeight: 500, color: '#EDEDED', margin: 0, fontFamily: "'Geist', sans-serif" }}>
                    ACTIVE TELEMETRY SESSION
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8125rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1F1F1F' }}>
                      <span style={{ color: '#666666', fontFamily: "'Geist', sans-serif" }}>USER IDENTIFIER</span>
                      <span style={{ fontFamily: "'Geist Mono', monospace", color: '#EDEDED' }}>{user?.id || 'anon-session'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1F1F1F' }}>
                      <span style={{ color: '#666666', fontFamily: "'Geist', sans-serif" }}>PRIMARY EMAIL</span>
                      <span style={{ fontFamily: "'Geist Mono', monospace", color: '#EDEDED' }}>{user?.email || 'admin@cawlix.com'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1F1F1F' }}>
                      <span style={{ color: '#666666', fontFamily: "'Geist', sans-serif" }}>POSTGRES REPLICATION</span>
                      <span style={{ fontFamily: "'Geist Mono', monospace", color: '#00DF8F', fontWeight: 500 }}>CONNECTED (WSS)</span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ── 6. VERCEL TELEMETRY TABLE (Overview & Tracker) ── */}
            {(activeTab === 'overview' || activeTab === 'tracker') && (
              <section
                style={{
                  backgroundColor: '#000000',
                  border: '1px solid #1F1F1F',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Table Header: Authentic Vercel Subtle Row */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2.5fr 1fr 1.2fr 1fr 1fr 0.8fr',
                    alignItems: 'center',
                    padding: '11px 18px',
                    backgroundColor: '#000000',
                    borderBottom: '1px solid #1F1F1F',
                    fontSize: '0.6875rem',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#888888',
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
                  <div style={{ padding: '60px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        border: '2px solid rgba(255, 255, 255, 0.2)',
                        borderTopColor: '#FFFFFF',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                      }}
                    />
                    <span style={{ fontSize: '0.8125rem', color: '#666666' }}>
                      Probing domestic nodes...
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
                    <span style={{ fontSize: '0.9375rem', fontWeight: 500, color: '#EDEDED' }}>
                      No matching tracked SKUs detected
                    </span>
                    <span style={{ fontSize: '0.8125rem', color: '#666666', maxWidth: '380px' }}>
                      Add a new domestic SKU to begin 90-day forensic price tracking.
                    </span>
                    <button
                      type="button"
                      onClick={() => setModalOpen(true)}
                      style={{
                        backgroundColor: '#FFFFFF',
                        color: '#000000',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        padding: '6px 14px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        marginTop: '4px',
                        fontFamily: "'Geist', sans-serif",
                      }}
                    >
                      Track Your First SKU
                    </button>
                  </div>
                ) : (
                  /* Table Rows: Vercel Micro-Border (#1F1F1F) + Subtle Hover */
                  filteredItems.map((item, idx) => {
                    const isMarkup = item.delta_pct > 0;
                    const deltaColor = isMarkup ? '#FB7185' : '#00DF8F';
                    const deltaSign = item.delta_pct > 0 ? `+${item.delta_pct}%` : `${item.delta_pct}%`;

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleRowClick(item)}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '2.5fr 1fr 1.2fr 1fr 1fr 0.8fr',
                          alignItems: 'center',
                          padding: '13px 18px',
                          borderBottom: idx < filteredItems.length - 1 ? '1px solid #1F1F1F' : 'none',
                          cursor: 'pointer',
                          transition: 'background-color 100ms ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0D0D0D')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        {/* ITEM / TITLE */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingRight: '16px', minWidth: 0 }}>
                          <span
                            style={{
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              color: '#EDEDED',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              letterSpacing: '-0.01em',
                              fontFamily: "'Geist', sans-serif",
                            }}
                          >
                            {item.title}
                          </span>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              color: '#888888',
                              fontFamily: "'Geist Mono', monospace",
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
                              fontWeight: 500,
                              fontFamily: "'Geist Mono', monospace",
                              padding: '2px 7px',
                              borderRadius: '4px',
                              backgroundColor: '#0A0A0A',
                              border: '1px solid #222222',
                              color: '#888888',
                            }}
                          >
                            {item.node}
                          </span>
                        </div>

                        {/* PRICE & DELTA */}
                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: flashingSkuIds[item.id] ? '2px 8px' : '0',
                              borderRadius: '4px',
                              backgroundColor: flashingSkuIds[item.id] ? 'rgba(16, 185, 129, 0.18)' : 'transparent',
                              border: flashingSkuIds[item.id] ? '1px solid #10B981' : '1px solid transparent',
                              transition: 'all 240ms ease',
                            }}
                          >
                            <span
                              style={{
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                color: flashingSkuIds[item.id] ? '#10B981' : '#EDEDED',
                                fontFamily: "'Geist Mono', monospace",
                                transition: 'color 240ms ease',
                              }}
                            >
                              EGP {item.current_price_egp?.toLocaleString()}
                            </span>
                            {flashingSkuIds[item.id] && (
                              <span
                                style={{
                                  fontSize: '0.625rem',
                                  fontWeight: 600,
                                  color: '#10B981',
                                  backgroundColor: 'rgba(16, 185, 129, 0.25)',
                                  padding: '1px 5px',
                                  borderRadius: '3px',
                                  fontFamily: "'Geist Mono', monospace",
                                  letterSpacing: '0.04em',
                                }}
                              >
                                LIVE
                              </span>
                            )}
                          </div>
                          <span
                            style={{
                              fontSize: '0.6875rem',
                              fontWeight: 500,
                              color: deltaColor,
                              fontFamily: "'Geist Mono', monospace",
                            }}
                          >
                            {deltaSign}
                          </span>
                        </div>

                        {/* STATUS (Iconic Vercel Checkmark Circle) */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <div
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              border: '1px solid #222222',
                              backgroundColor: '#0A0A0A',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0070F3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                          <span
                            style={{
                              fontSize: '0.6875rem',
                              fontFamily: "'Geist Mono', monospace",
                              color: '#888888',
                            }}
                          >
                            {item.status}
                          </span>
                        </div>

                        {/* LAST UPDATED */}
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: '#666666',
                            fontFamily: "'Geist Mono', monospace",
                            textAlign: 'right',
                          }}
                        >
                          {item.last_ping}
                        </div>

                        {/* ACTIONS: Vercel Ghost Button & Re-Audit Status */}
                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          <button
                            type="button"
                            disabled={probingSkuId === item.id}
                            onClick={(e) => handleReaudit(e, item)}
                            style={{
                              backgroundColor: probingSkuId === item.id ? '#121212' : 'transparent',
                              border: probingSkuId === item.id ? '1px solid #10B981' : '1px solid #222222',
                              borderRadius: '6px',
                              padding: '4px 10px',
                              color: probingSkuId === item.id ? '#10B981' : '#888888',
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              cursor: probingSkuId === item.id ? 'wait' : 'pointer',
                              transition: 'all 120ms ease',
                              fontFamily: "'Geist', sans-serif",
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                            onMouseEnter={(e) => {
                              if (probingSkuId !== item.id) {
                                e.currentTarget.style.backgroundColor = '#111111';
                                e.currentTarget.style.borderColor = '#333333';
                                e.currentTarget.style.color = '#EDEDED';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (probingSkuId !== item.id) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.borderColor = '#222222';
                                e.currentTarget.style.color = '#888888';
                              }
                            }}
                          >
                            {probingSkuId === item.id ? (
                              <>
                                <svg
                                  width="11"
                                  height="11"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  style={{ animation: 'spin 0.8s linear infinite' }}
                                >
                                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                </svg>
                                <span>Syncing...</span>
                              </>
                            ) : (
                              <span>Re-audit</span>
                            )}
                          </button>

                          {/* Crisp non-intrusive error notification badge without crashing table */}
                          {skuErrorMap[item.id] && (
                            <span
                              title={skuErrorMap[item.id]}
                              style={{
                                fontSize: '0.625rem',
                                color: '#FB7185',
                                backgroundColor: 'rgba(251, 113, 133, 0.1)',
                                border: '1px solid rgba(251, 113, 133, 0.25)',
                                padding: '1px 5px',
                                borderRadius: '3px',
                                fontFamily: "'Geist Mono', monospace",
                                maxWidth: '120px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              ⚠ Retry needed
                            </span>
                          )}
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

      {/* ── 7. SLIDE-OVER DRAWER: PURE BLACK TELEMETRY INSPECTOR ── */}
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
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(6px)',
            }}
          />

          {/* Drawer Panel */}
          <aside
            role="dialog"
            aria-modal="true"
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '540px',
              height: '100%',
              backgroundColor: '#000000',
              borderLeft: '1px solid #1F1F1F',
              boxShadow: '-20px 0 40px rgba(0, 0, 0, 0.9)',
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
                height: '50px',
                borderBottom: '1px solid #1F1F1F',
                padding: '0 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#000000',
                position: 'sticky',
                top: 0,
                zIndex: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#00DF8F' }} />
                <span style={{ fontSize: '0.6875rem', fontWeight: 500, color: '#888888', letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: "'Geist', sans-serif" }}>
                  FORENSIC TELEMETRY PROBE
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDrawerItem(null)}
                style={{
                  background: 'none',
                  border: '1px solid #222222',
                  borderRadius: '4px',
                  color: '#888888',
                  fontSize: '0.6875rem',
                  fontFamily: "'Geist Mono', monospace",
                  padding: '2px 7px',
                  cursor: 'pointer',
                  transition: 'all 120ms ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#EDEDED';
                  e.currentTarget.style.borderColor = '#333333';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#888888';
                  e.currentTarget.style.borderColor = '#222222';
                }}
              >
                ESC
              </button>
            </div>

            {/* Content Container */}
            <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              {/* Module 1: Header */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '18px', borderBottom: '1px solid #1F1F1F' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem' }}>
                  <span style={{ color: '#EDEDED', fontWeight: 500, fontFamily: "'Geist Mono', monospace" }}>{selectedDrawerItem.sku}</span>
                  <span style={{ color: '#444444' }}>·</span>
                  <span style={{ color: '#888888', fontWeight: 500, fontFamily: "'Geist Mono', monospace" }}>{selectedDrawerItem.node}</span>
                  <span style={{ color: '#666666', fontSize: '0.6875rem', fontFamily: "'Geist Mono', monospace" }}>({selectedDrawerItem.domain})</span>
                </div>
                <h2 style={{ fontSize: '1.0625rem', fontWeight: 500, color: '#EDEDED', margin: 0, lineHeight: 1.4, fontFamily: "'Geist', sans-serif" }}>
                  {selectedDrawerItem.title}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', paddingTop: '4px' }}>
                  <a
                    href={getStoreUrl(selectedDrawerItem)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{ fontSize: '0.75rem', color: '#EDEDED', textDecoration: 'underline', fontWeight: 500, fontFamily: "'Geist', sans-serif" }}
                  >
                    Inspect on {selectedDrawerItem.node || 'Retailer'} ↗
                  </a>
                  <span style={{ fontSize: '0.6875rem', color: '#666666', fontFamily: "'Geist Mono', monospace" }}>
                    Verified: {selectedDrawerItem.last_ping}
                  </span>
                </div>

                {/* Direct Action: Re-Audit Node & Inspect 12 Platforms Matrix */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    disabled={probingSkuId === (selectedDrawerItem.id || selectedDrawerItem.sku)}
                    onClick={(e) => handleReaudit(e, selectedDrawerItem)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      backgroundColor: probingSkuId === (selectedDrawerItem.id || selectedDrawerItem.sku) ? '#141414' : '#000000',
                      border: probingSkuId === (selectedDrawerItem.id || selectedDrawerItem.sku) ? '1px solid #10B981' : '1px solid #2A2A2A',
                      color: probingSkuId === (selectedDrawerItem.id || selectedDrawerItem.sku) ? '#10B981' : '#EDEDED',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      borderRadius: '6px',
                      cursor: probingSkuId === (selectedDrawerItem.id || selectedDrawerItem.sku) ? 'wait' : 'pointer',
                      fontFamily: "'Geist', sans-serif",
                      transition: 'all 120ms ease',
                    }}
                    onMouseEnter={(e) => {
                      if (probingSkuId !== (selectedDrawerItem.id || selectedDrawerItem.sku)) {
                        e.currentTarget.style.backgroundColor = '#111111';
                        e.currentTarget.style.borderColor = '#333333';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (probingSkuId !== (selectedDrawerItem.id || selectedDrawerItem.sku)) {
                        e.currentTarget.style.backgroundColor = '#000000';
                        e.currentTarget.style.borderColor = '#2A2A2A';
                      }
                    }}
                  >
                    {probingSkuId === (selectedDrawerItem.id || selectedDrawerItem.sku) ? (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}>
                          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                        <span>Syncing...</span>
                      </>
                    ) : (
                      <span>↻ Re-audit Node</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDrawerItem(null);
                      setActiveTab('intelligence');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#10B981',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontFamily: "'Geist', sans-serif",
                      transition: 'all 150ms ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.18)';
                      e.currentTarget.style.borderColor = '#10B981';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                    }}
                  >
                    <span>12-Platform Matrix</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Module 2: Forensic Price Diagnostic */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 500, letterSpacing: '0.05em', color: '#888888', textTransform: 'uppercase', fontFamily: "'Geist', sans-serif" }}>
                  FORENSIC PRICE DIAGNOSTIC
                </span>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '14px',
                    border: '1px solid #1F1F1F',
                    borderRadius: '8px',
                    padding: '16px',
                    backgroundColor: '#000000',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '0.6875rem', color: '#666666', textTransform: 'uppercase', fontFamily: "'Geist', sans-serif" }}>CURRENT SHELF PRICE</span>
                    <span style={{ fontSize: '1.125rem', fontWeight: 500, color: '#EDEDED', fontFamily: "'Geist Mono', monospace" }}>
                      EGP {selectedDrawerItem.current_price_egp?.toLocaleString()}
                    </span>
                    <span style={{ fontSize: '0.6875rem', marginTop: '2px', color: drawerIsMarkup ? '#FB7185' : '#00DF8F', fontFamily: "'Geist Mono', monospace", fontWeight: 500 }}>
                      {drawerIsMarkup ? `+${selectedDrawerItem.delta_pct}% OVER BASELINE` : `${selectedDrawerItem.delta_pct}% UNDER BASELINE`}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '0.6875rem', color: '#666666', textTransform: 'uppercase', fontFamily: "'Geist', sans-serif" }}>90-DAY BASELINE MEDIAN</span>
                    <span style={{ fontSize: '1.125rem', fontWeight: 500, color: '#EDEDED', fontFamily: "'Geist Mono', monospace" }}>
                      EGP {selectedDrawerItem.baseline_price_egp?.toLocaleString()}
                    </span>
                    <span style={{ fontSize: '0.6875rem', marginTop: '2px', color: '#666666', fontFamily: "'Geist', sans-serif" }}>
                      Rolling Cairo benchmark
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    border: '1px solid #1F1F1F',
                    borderLeft: `3px solid ${drawerIsMarkup ? '#FB7185' : '#00DF8F'}`,
                    borderRadius: '6px',
                    padding: '12px 14px',
                    fontSize: '0.8125rem',
                    lineHeight: 1.5,
                    backgroundColor: '#000000',
                  }}
                >
                  <div style={{ fontWeight: 500, marginBottom: '2px', color: drawerIsMarkup ? '#FB7185' : '#00DF8F', fontFamily: "'Geist', sans-serif" }}>
                    TRUTH INDEX VERDICT
                  </div>
                  <div style={{ color: '#888888', fontFamily: "'Geist', sans-serif" }}>
                    {drawerIsMarkup
                      ? 'CRITICAL GHOST MARKUP — Price artificially inflated prior to promotional cycle to manufacture synthetic discount magnitude.'
                      : 'VERIFIED REAL DEAL — Authentic markdown verified below 90-day rolling domestic shelf median.'}
                  </div>
                </div>
              </div>

              {/* Module 3: 90-Day Trend Sparkline */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 500, letterSpacing: '0.05em', color: '#888888', textTransform: 'uppercase', fontFamily: "'Geist', sans-serif" }}>
                  90-DAY PRICE TRAJECTORY & SPIKE ANALYSIS
                </span>

                <div
                  style={{
                    border: '1px solid #1F1F1F',
                    borderRadius: '8px',
                    padding: '14px',
                    backgroundColor: '#000000',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ width: '100%', height: '80px' }}>
                    <svg width="100%" height="80" viewBox="0 0 480 80" preserveAspectRatio="none" fill="none">
                      <line x1="10" y1="45" x2="470" y2="45" stroke="#1F1F1F" strokeWidth="1" strokeDasharray="4 4" />
                      <path
                        d={drawerIsMarkup ? 'M 20 45 L 140 45 L 220 44 L 300 18 L 380 14 L 460 14' : 'M 20 34 L 140 34 L 220 36 L 300 56 L 380 60 L 460 60'}
                        stroke={drawerIsMarkup ? '#FB7185' : '#00DF8F'}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="460" cy={drawerIsMarkup ? 14 : 60} r="3.5" fill={drawerIsMarkup ? '#FB7185' : '#00DF8F'} />
                    </svg>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: '#666666', fontFamily: "'Geist Mono', monospace" }}>
                    <span>90D AGO</span>
                    <span>45D (PRE-SALE SPIKE)</span>
                    <span>TODAY: EGP {selectedDrawerItem.current_price_egp?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Module 4: Landed Cost & Arbitrage Benchmark */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 500, letterSpacing: '0.05em', color: '#888888', textTransform: 'uppercase', fontFamily: "'Geist', sans-serif" }}>
                  LANDED IMPORT COST & ARBITRAGE BENCHMARK
                </span>

                <div
                  style={{
                    border: '1px solid #1F1F1F',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#000000',
                    fontSize: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 12px', borderBottom: '1px solid #1F1F1F' }}>
                    <span style={{ color: '#888888', fontFamily: "'Geist', sans-serif" }}>Domestic Cairo Retail Shelf</span>
                    <span style={{ color: '#EDEDED', fontFamily: "'Geist Mono', monospace", fontWeight: 500 }}>EGP {drawerDomestic.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 12px', borderBottom: '1px solid #1F1F1F' }}>
                    <span style={{ color: '#888888', fontFamily: "'Geist', sans-serif" }}>Declared CIF Cargo Import (USD converted)</span>
                    <span style={{ color: '#EDEDED', fontFamily: "'Geist Mono', monospace" }}>EGP {drawerCif.toLocaleString()} (${drawerBaseUsd})</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 12px', borderBottom: '1px solid #1F1F1F' }}>
                    <span style={{ color: '#888888', fontFamily: "'Geist', sans-serif" }}>Customs Duty (10%)</span>
                    <span style={{ color: '#EDEDED', fontFamily: "'Geist Mono', monospace" }}>EGP {drawerCustoms.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 12px', borderBottom: '1px solid #1F1F1F' }}>
                    <span style={{ color: '#888888', fontFamily: "'Geist', sans-serif" }}>Value-Added Tax (14% VAT)</span>
                    <span style={{ color: '#EDEDED', fontFamily: "'Geist Mono', monospace" }}>EGP {drawerVat.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 12px', backgroundColor: '#0A0A0A', fontWeight: 500 }}>
                    <span style={{ color: '#EDEDED', fontFamily: "'Geist', sans-serif" }}>Total Landed Cost Settlement</span>
                    <span style={{ color: '#EDEDED', fontFamily: "'Geist Mono', monospace" }}>EGP {drawerTotalLanded.toLocaleString()}</span>
                  </div>
                </div>

                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid #1F1F1F',
                    backgroundColor: '#000000',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontWeight: 500, color: drawerHasAdvantage ? '#00DF8F' : '#EDEDED', fontFamily: "'Geist', sans-serif" }}>
                    {drawerHasAdvantage ? 'IMPORT RECOMMENDED' : 'BUY LOCAL PREFERRED'}
                  </span>
                  <span style={{ fontFamily: "'Geist Mono', monospace", color: '#888888' }}>
                    {drawerHasAdvantage ? `+EGP ${drawerNetSaved.toLocaleString()} margin saved` : 'Domestic shelf is optimal'}
                  </span>
                </div>
              </div>

              {/* Module 5: Alert Trigger Settings */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '0.6875rem', fontWeight: 500, letterSpacing: '0.05em', color: '#888888', textTransform: 'uppercase', fontFamily: "'Geist', sans-serif" }}>
                  PRICE ALERT NOTIFICATION TRIGGER
                </span>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: '#000000',
                      border: '1px solid #1F1F1F',
                      borderRadius: '6px',
                      height: '38px',
                      overflow: 'hidden',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        color: '#666666',
                        padding: '0 12px',
                        backgroundColor: '#0A0A0A',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        fontFamily: "'Geist Mono', monospace",
                        borderRight: '1px solid #1F1F1F',
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
                        fontFamily: "'Geist Mono', monospace",
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveAlert}
                    style={{
                      backgroundColor: alertSavedSuccess ? '#00DF8F' : '#FFFFFF',
                      color: '#000000',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      padding: '0 14px',
                      height: '38px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'background-color 150ms ease',
                      fontFamily: "'Geist', sans-serif",
                    }}
                  >
                    {alertSavedSuccess ? '✓ Saved' : 'Save Alert Rule'}
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

      {/* Password Management Modal */}
      {passwordModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            boxSizing: 'border-box',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !passwordLoading) {
              setPasswordModalOpen(false);
            }
          }}
        >
          <div
            style={{
              backgroundColor: '#000000',
              border: '1px solid #1F1F1F',
              borderRadius: '8px',
              maxWidth: '440px',
              width: '100%',
              padding: '24px',
              boxSizing: 'border-box',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.95)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ fontSize: '1.0625rem', fontWeight: 500, color: '#EDEDED', margin: 0, fontFamily: "'Geist', sans-serif" }}>
                  {isEmailPasswordActive ? 'Change Password' : 'Set Direct Password'}
                </h2>
                <p style={{ fontSize: '0.8125rem', color: '#888888', marginTop: '4px', marginBottom: 0, fontFamily: "'Geist', sans-serif" }}>
                  {isEmailPasswordActive
                    ? 'Enter a new master password for email credential login.'
                    : 'Set a direct password so you can log in with both Google and email.'}
                </p>
              </div>
              <button
                type="button"
                disabled={passwordLoading}
                onClick={() => setPasswordModalOpen(false)}
                aria-label="Close"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#666666',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  padding: '4px',
                  lineHeight: 1,
                  transition: 'color 120ms ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#EDEDED')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#666666')}
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSavePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* New Password */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label
                    htmlFor="settings-new-password"
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      color: '#666666',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      margin: 0,
                      fontFamily: "'Geist', sans-serif",
                    }}
                  >
                    NEW PASSWORD
                  </label>
                  <button
                    type="button"
                    onClick={handleSuggestPassword}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#00DF8F',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      padding: 0,
                      textDecoration: 'underline',
                      fontFamily: "'Geist', sans-serif",
                    }}
                  >
                    Suggest Strong
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    id="settings-new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPasswordError('');
                    }}
                    placeholder="••••••••••••"
                    style={{
                      backgroundColor: '#000000',
                      border: '1px solid #1F1F1F',
                      color: '#EDEDED',
                      fontSize: '0.875rem',
                      padding: '0 40px 0 12px',
                      height: '40px',
                      borderRadius: '6px',
                      outline: 'none',
                      width: '100%',
                      boxSizing: 'border-box',
                      transition: 'border-color 150ms ease',
                      fontFamily: "'Geist Mono', monospace",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#333333')}
                    onBlur={(e) => (e.target.style.borderColor = '#1F1F1F')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#666666',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {showNewPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {newPassword && (
                  <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                      <div
                        style={{
                          height: '3px',
                          flex: 1,
                          borderRadius: '2px',
                          backgroundColor: pwdStrength.score >= 1 ? pwdStrength.color : '#1F1F1F',
                          transition: 'background-color 200ms ease',
                        }}
                      />
                      <div
                        style={{
                          height: '3px',
                          flex: 1,
                          borderRadius: '2px',
                          backgroundColor: pwdStrength.score >= 2 ? pwdStrength.color : '#1F1F1F',
                          transition: 'background-color 200ms ease',
                        }}
                      />
                      <div
                        style={{
                          height: '3px',
                          flex: 1,
                          borderRadius: '2px',
                          backgroundColor: pwdStrength.score >= 3 ? pwdStrength.color : '#1F1F1F',
                          transition: 'background-color 200ms ease',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: pwdStrength.color, fontWeight: 500, fontFamily: "'Geist Mono', monospace" }}>
                      {pwdStrength.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label
                  htmlFor="settings-confirm-password"
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: '#666666',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                    display: 'block',
                    fontFamily: "'Geist', sans-serif",
                  }}
                >
                  CONFIRM PASSWORD
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="settings-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setPasswordError('');
                    }}
                    placeholder="••••••••••••"
                    style={{
                      backgroundColor: '#000000',
                      border: '1px solid #1F1F1F',
                      color: '#EDEDED',
                      fontSize: '0.875rem',
                      padding: '0 40px 0 12px',
                      height: '40px',
                      borderRadius: '6px',
                      outline: 'none',
                      width: '100%',
                      boxSizing: 'border-box',
                      transition: 'border-color 150ms ease',
                      fontFamily: "'Geist Mono', monospace",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#333333')}
                    onBlur={(e) => (e.target.style.borderColor = '#1F1F1F')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#666666',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {showConfirmPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {passwordError && (
                <div
                  style={{
                    fontSize: '0.8125rem',
                    color: '#FB7185',
                    backgroundColor: '#0A0A0A',
                    border: '1px solid #222222',
                    borderRadius: '6px',
                    padding: '10px 12px',
                    lineHeight: 1.5,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    fontFamily: "'Geist', sans-serif",
                  }}
                >
                  <span style={{ fontSize: '0.95rem', lineHeight: 1.2, flexShrink: 0 }}>✕</span>
                  <div style={{ wordBreak: 'break-word' }}>{passwordError}</div>
                </div>
              )}

              {passwordSuccess && (
                <div
                  style={{
                    fontSize: '0.8125rem',
                    color: '#00DF8F',
                    backgroundColor: '#0A0A0A',
                    border: '1px solid #222222',
                    borderRadius: '6px',
                    padding: '10px 12px',
                    lineHeight: 1.5,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    fontFamily: "'Geist', sans-serif",
                  }}
                >
                  <span style={{ fontSize: '0.95rem', lineHeight: 1.2, flexShrink: 0 }}>✓</span>
                  <div style={{ wordBreak: 'break-word' }}>{passwordSuccess}</div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  disabled={passwordLoading}
                  onClick={() => setPasswordModalOpen(false)}
                  style={{
                    padding: '7px 14px',
                    fontSize: '0.8125rem',
                    backgroundColor: 'transparent',
                    border: '1px solid #222222',
                    color: '#888888',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 120ms ease',
                    fontFamily: "'Geist', sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#EDEDED';
                    e.currentTarget.style.borderColor = '#333333';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#888888';
                    e.currentTarget.style.borderColor = '#222222';
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  style={{
                    padding: '7px 16px',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    backgroundColor: '#FFFFFF',
                    border: 'none',
                    color: '#000000',
                    borderRadius: '6px',
                    cursor: passwordLoading ? 'not-allowed' : 'pointer',
                    opacity: passwordLoading ? 0.6 : 1,
                    transition: 'opacity 150ms ease',
                    fontFamily: "'Geist', sans-serif",
                  }}
                >
                  {passwordLoading ? 'Saving...' : 'Save Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Real-time Re-Audit Toast Notification */}
      {reAuditToast && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: '#0A0A0A',
            border: reAuditToast.type === 'error' ? '1px solid rgba(251, 113, 133, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '8px',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 16px 36px rgba(0, 0, 0, 0.95)',
            fontFamily: "'Geist', sans-serif",
            fontSize: '0.8125rem',
            color: '#EDEDED',
          }}
        >
          <span style={{ color: reAuditToast.type === 'error' ? '#FB7185' : '#10B981', fontWeight: 600 }}>
            {reAuditToast.type === 'error' ? '⚠' : '✓'}
          </span>
          <span>{reAuditToast.message}</span>
        </div>
      )}

      <style>{`
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(0.85); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}
      </style>
    </div>
  );
}
