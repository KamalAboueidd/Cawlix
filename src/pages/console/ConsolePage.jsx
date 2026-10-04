import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import AddSkuModal from '../../components/console/AddSkuModal';

const SEED_CATALOG_ITEMS = [
  {
    id: 'seed-1',
    sku: 'caw_sku_981a',
    title: 'MacBook Pro 14" M3 Pro 18GB/512GB (Space Black)',
    node: 'AMZN_EG',
    domain: 'node.amazon.eg',
    current_price_egp: 94500,
    baseline_price_egp: 79800,
    delta_pct: 18.4,
    discount_status: '+18.4%',
    status: 'FLAGGED',
    last_ping: '3m ago',
    created_at: '2026-10-04T08:00:00Z',
  },
  {
    id: 'seed-2',
    sku: 'caw_sku_719b',
    title: 'Apple iPhone 16 Pro Max 256GB Natural Titanium',
    node: 'NOON_EG',
    domain: 'node.noon.eg',
    current_price_egp: 68900,
    baseline_price_egp: 78500,
    delta_pct: -12.2,
    discount_status: '-12.2%',
    status: 'ACTIVE',
    last_ping: '6m ago',
    created_at: '2026-10-04T07:45:00Z',
  },
  {
    id: 'seed-3',
    sku: 'caw_sku_118k',
    title: 'Sony WH-1000XM5 Wireless Noise-Canceling',
    node: 'BTECH_EG',
    domain: 'node.btech.eg',
    current_price_egp: 18900,
    baseline_price_egp: 19500,
    delta_pct: -3.1,
    discount_status: '-3.1%',
    status: 'ACTIVE',
    last_ping: '11m ago',
    created_at: '2026-10-04T07:20:00Z',
  },
  {
    id: 'seed-4',
    sku: 'caw_sku_442e',
    title: 'LG OLED C3 55" 4K Smart Cinema Display',
    node: 'AMZN_EG',
    domain: 'node.amazon.eg',
    current_price_egp: 36999,
    baseline_price_egp: 31400,
    delta_pct: 17.8,
    discount_status: '+17.8%',
    status: 'FLAGGED',
    last_ping: '14m ago',
    created_at: '2026-10-04T06:50:00Z',
  },
  {
    id: 'seed-5',
    sku: 'caw_sku_551r',
    title: 'Samsung Galaxy S24 Ultra 512GB Titanium Gray',
    node: 'RAYA_EG',
    domain: 'node.rayashop.com',
    current_price_egp: 53200,
    baseline_price_egp: 59900,
    delta_pct: -11.2,
    discount_status: '-11.2%',
    status: 'ACTIVE',
    last_ping: '18m ago',
    created_at: '2026-10-04T06:30:00Z',
  },
  {
    id: 'seed-6',
    sku: 'caw_sku_662x',
    title: 'Apple iPad Pro 13" M4 Ultra Retina OLED 256GB',
    node: '2B_EG',
    domain: 'node.2b.com.eg',
    current_price_egp: 58400,
    baseline_price_egp: 51900,
    delta_pct: 12.5,
    discount_status: '+12.5%',
    status: 'FLAGGED',
    last_ping: '22m ago',
    created_at: '2026-10-04T06:10:00Z',
  },
  {
    id: 'seed-7',
    sku: 'caw_sku_883a',
    title: 'Sony Alpha A7 IV Full-Frame Mirrorless Body',
    node: 'AMZN_EG',
    domain: 'node.amazon.eg',
    current_price_egp: 118500,
    baseline_price_egp: 129900,
    delta_pct: -8.8,
    discount_status: '-8.8%',
    status: 'ACTIVE',
    last_ping: '31m ago',
    created_at: '2026-10-04T05:30:00Z',
  },
  {
    id: 'seed-8',
    sku: 'caw_sku_994d',
    title: 'Dyson V15 Detect Absolute Cordless Vacuum',
    node: 'NOON_EG',
    domain: 'node.noon.eg',
    current_price_egp: 42900,
    baseline_price_egp: 36000,
    delta_pct: 19.2,
    discount_status: '+19.2%',
    status: 'FLAGGED',
    last_ping: '45m ago',
    created_at: '2026-10-04T04:45:00Z',
  },
];

const I18N = {
  en: {
    navTracker: 'Telemetry Tracker',
    navDocs: 'API Documentation',
    navTrueCost: 'True-Cost Engine',
    btnSignOut: 'Sign Out',
    tabOverview: 'Overview',
    tabWatchlist: 'Watchlist',
    tabRadar: 'Radar',
    tabSettings: 'Settings',
    searchPlaceholder: 'Search tracked SKUs, nodes, or retailers...',
    btnAddSku: 'Add Target SKU',
    colTitle: 'ITEM / TITLE',
    colStore: 'STORE',
    colPrice: 'PRICE',
    colDelta: '90D BASELINE DELTA',
    colTime: 'LAST CHECK',
    colAction: 'ACTION',
    btnReaudit: 'Re-audit',
    probing: 'Probing...',
    noItems: '— No matching tracked SKUs detected —',
    justNow: 'just now',
    drawerLiveTelemetry: 'LIVE TELEMETRY PROBE',
    openNode: 'Open Node in Store ↗',
    telemetryVerified: 'Telemetry verified:',
    modDiagnostic: 'FORENSIC PRICE DIAGNOSTIC',
    currentShelfPrice: 'CURRENT SHELF PRICE',
    baselineMedian: '90-DAY BASELINE MEDIAN',
    overBaseline: 'OVER 90D BASELINE',
    underBaseline: 'UNDER 90D BASELINE',
    verdictLabel: 'TRUTH INDEX VERDICT',
    verdictFakeMarkup: 'CRITICAL GHOST MARKUP — Price artificially inflated 14 days ago before promotional window to manufacture synthetic discount magnitude.',
    verdictRealDeal: 'VERIFIED REAL DEAL — Authentic price markdown, established 12.2% below the 90-day rolling domestic median.',
    modHistoryTrend: '90-DAY PRICE TRAJECTORY & SPIKE ANALYSIS',
    axisStart: '90D AGO',
    axisPreSale: '45D (PRE-SALE SPIKE)',
    axisNow: 'TODAY (PROBED)',
    modLandedCost: 'LANDED IMPORT COST & ARBITRAGE BENCHMARK',
    rowDomesticRetail: 'Domestic Cairo Retail Shelf',
    rowCifImport: 'Declared CIF Cargo Import (USD converted)',
    rowCustomsDuty: 'Statutory Customs Duty (HS Code Verified)',
    rowVat: 'Statutory Value-Added Tax (14% VAT)',
    rowBankFx: 'Banking FX Spread & Settlement (3%)',
    rowTotalLanded: 'Total Landed Cost Settlement',
    verdictImportRec: 'IMPORT RECOMMENDED',
    verdictDomesticRec: 'BUY LOCAL PREFERRED',
    savingsText: 'arbitrage margin saved via direct landed import',
    modAlertSettings: 'PRICE ALERT NOTIFICATION TRIGGER',
    saveAlertRule: 'Save Alert Rule',
    alertSaved: '✓ Alert Saved to Watchlist',
  },
  ar: {
    navTracker: 'متتبع الأسعار اللحظي',
    navDocs: 'توثيق واجهة البرمجة (API)',
    navTrueCost: 'حاسبة التكلفة الحقيقية',
    btnSignOut: 'تسجيل الخروج',
    tabOverview: 'نظرة عامة',
    tabWatchlist: 'المراقبة',
    tabRadar: 'الرادار',
    tabSettings: 'الإعدادات',
    searchPlaceholder: 'بحث في المنتجات المراقبة أو المتاجر...',
    btnAddSku: 'إضافة كود SKU',
    colTitle: 'المنتج / العنوان',
    colStore: 'المتجر',
    colPrice: 'السعر',
    colDelta: 'تغير خط الأساس (90 يوم)',
    colTime: 'آخر فحص',
    colAction: 'الإجراء',
    btnReaudit: 'إعادة الفحص',
    probing: 'جارِ الفحص...',
    noItems: '— لم يتم العثور على منتجات مطابقة —',
    justNow: 'الآن',
    drawerLiveTelemetry: 'فحص التتبع اللحظي الحي',
    openNode: 'فتح العقدة في المتجر ↗',
    telemetryVerified: 'تم التحقق من البيانات:',
    modDiagnostic: 'التدقيق الجنائي لخط الأساس السعري',
    currentShelfPrice: 'سعر الرف الحالي',
    baselineMedian: 'متوسط خط الأساس (90 يوم)',
    overBaseline: 'زيادة عن خط الأساس',
    underBaseline: 'خصم حقيقي عن خط الأساس',
    verdictLabel: 'حكم مؤشر الشفافية السعرية',
    verdictFakeMarkup: 'زيادة وهمية محققة — تم رفع السعر عمداً قبل موسم التخفيضات بـ 14 يوماً لاصطناع نسبة خصم خادعة.',
    verdictRealDeal: 'خصم حقيقي موثق — انخفاض سعري حقيقي عن متوسط سعر الرف المعتاد لـ 90 يوماً.',
    modHistoryTrend: 'مسار تقلبات الأسعار خلال 90 يوماً ورصد القفزات',
    axisStart: 'منذ 90 يوماً',
    axisPreSale: 'قبل 45 يوماً (قفزة التضخيم)',
    axisNow: 'اليوم (السعر المفحوص)',
    modLandedCost: 'تكلفة الوصول الجمركي وفروق التحكيم التجاري',
    rowDomesticRetail: 'سعر الرف المحلي في مصر',
    rowCifImport: 'تكلفة الشحن والقيمة CIF المستوردة',
    rowCustomsDuty: 'الرسوم الجمركية المقررة وفق بند HS',
    rowVat: 'ضريبة القيمة المضافة القانونية (14%)',
    rowBankFx: 'عمولة تدبير العملة وفروق التسوية (3%)',
    rowTotalLanded: 'إجمالي تكلفة الوصول الفعلية',
    verdictImportRec: 'يُنصح بالاستيراد المباشر',
    verdictDomesticRec: 'الشراء المحلي أفضل',
    savingsText: 'وفر مالي محقق عبر محاكاة الاستيراد',
    modAlertSettings: 'ضبط إشعارات تنبيه انخفاض السعر',
    saveAlertRule: 'حفظ قاعدة التنبيه',
    alertSaved: '✓ تم الحفظ في قائمة المراقبة',
  },
};

export default function ConsolePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackedItems, setTrackedItems] = useState(SEED_CATALOG_ITEMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [probingSkuId, setProbingSkuId] = useState(null);

  // Drawer Inspection State
  const [selectedDrawerItem, setSelectedDrawerItem] = useState(null);
  const [alertTargetPrice, setAlertTargetPrice] = useState('');
  const [alertSavedSuccess, setAlertSavedSuccess] = useState(false);

  // Theme & Language State
  const [theme, setTheme] = useState(() => localStorage.getItem('cawlix-theme') || 'dark');
  const [lang, setLang] = useState(() => localStorage.getItem('cawlix-lang') || 'en');

  useEffect(() => {
    localStorage.setItem('cawlix-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('cawlix-lang', lang);
  }, [lang]);

  // Session check
  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!data?.session) {
          window.location.href = '/login';
          return;
        }
        setUser(data.session.user);

        const { data: items } = await supabase.from('tracked_products').select('*');
        if (items && items.length > 0) {
          const existingIds = new Set(items.map((d) => d.sku));
          const merged = [...items];
          SEED_CATALOG_ITEMS.forEach((seed) => {
            if (!existingIds.has(seed.sku)) {
              merged.push(seed);
            }
          });
          setTrackedItems(merged);
        } else {
          setTrackedItems(SEED_CATALOG_ITEMS);
        }
      } catch {
        setTrackedItems(SEED_CATALOG_ITEMS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Close drawer on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedDrawerItem) {
        setSelectedDrawerItem(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDrawerItem]);

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
      // Fallback simulation
    }

    setTimeout(() => {
      setProbingSkuId(null);
      const pingText = lang === 'ar' ? 'الآن' : 'just now';
      setTrackedItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, last_ping: pingText } : i))
      );
      if (selectedDrawerItem && selectedDrawerItem.id === item.id) {
        setSelectedDrawerItem((prev) => (prev ? { ...prev, last_ping: pingText } : null));
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

  const isRtl = lang === 'ar';
  const isDark = theme === 'dark';
  const t = I18N[lang] || I18N.en;

  // Exact Design System Tokens
  const colors = isDark
    ? {
        bg: '#000000',
        surface: '#0a0a0a',
        surfaceHover: '#121212',
        border: 'rgba(255, 255, 255, 0.08)',
        borderHover: 'rgba(255, 255, 255, 0.2)',
        textPrimary: '#ededed',
        textMuted: '#888888',
        textSubtle: '#525252',
        accent: '#3ecf8e',
        btnBg: '#ffffff',
        btnText: '#000000',
      }
    : {
        bg: '#ffffff',
        surface: '#fafafa',
        surfaceHover: '#f0f0f0',
        border: 'rgba(0, 0, 0, 0.08)',
        borderHover: 'rgba(0, 0, 0, 0.2)',
        textPrimary: '#111111',
        textMuted: '#666666',
        textSubtle: '#999999',
        accent: '#059669',
        btnBg: '#000000',
        btnText: '#ffffff',
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

  const userHandle = user?.email ? user.email.split('@')[0] : 'kamal-core';

  // Helper for store URL
  const getStoreUrl = (item) => {
    if (item.node.includes('AMZN')) return `https://www.amazon.eg/dp/${item.sku.replace('caw_sku_', 'B0')}`;
    if (item.node.includes('NOON')) return `https://www.noon.com/egypt-en/p-${item.sku}/`;
    if (item.node.includes('BTECH')) return `https://btech.com/en/${item.sku}`;
    if (item.node.includes('2B')) return `https://2b.com.eg/en/catalogsearch/result/?q=${item.sku}`;
    return `https://www.rayashop.com/en/search?q=${item.sku}`;
  };

  // Landed Cost parameters for active item
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
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        minHeight: '100vh',
        backgroundColor: colors.bg,
        color: colors.textPrimary,
        fontFamily: isRtl
          ? "'Cairo', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          : 'var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
        transition: 'background-color 150ms ease, color 150ms ease',
      }}
    >
      {/* ── Row 1: Brand & Scope + Utilities ── */}
      <header
        style={{
          height: '48px',
          borderBottom: `1px solid ${colors.border}`,
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: colors.bg,
          boxSizing: 'border-box',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <a
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              textDecoration: 'none',
              color: colors.textPrimary,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke={colors.textPrimary} strokeWidth="1.25" strokeOpacity="0.3" />
              <circle cx="12" cy="12" r="5" stroke={colors.textPrimary} strokeWidth="1.25" strokeOpacity="0.6" />
              <circle cx="12" cy="12" r="1.5" fill={colors.textPrimary} />
              <line x1="12" y1="12" x2="19" y2="5" stroke={colors.textPrimary} strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '-0.015em', fontFamily: 'var(--font-mono, monospace)' }}>
              Cawlix
            </span>
          </a>

          <span style={{ color: colors.textSubtle, fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>/</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '3px 6px', borderRadius: '4px', cursor: 'default' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: colors.textMuted }} />
            <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: colors.textPrimary, fontFamily: 'var(--font-mono, monospace)' }}>
              {userHandle}
            </span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: colors.textSubtle }}>
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </div>
        </div>

        {/* Utilities: Theme Toggle + Language Switcher + User Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Discrete Theme Toggle (Sun/Moon icon + text) */}
          <button
            type="button"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            title="Toggle Theme"
            aria-label="Toggle Theme"
            style={{
              background: 'transparent',
              border: `1px solid ${colors.border}`,
              color: colors.textMuted,
              fontSize: '11px',
              padding: '3px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            {isDark ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            )}
            <span>{isDark ? 'Dark' : 'Light'}</span>
          </button>

          {/* Instant Language Switcher (EN | عربي) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              border: `1px solid ${colors.border}`,
              borderRadius: '4px',
              padding: '2px 6px',
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            <button
              type="button"
              onClick={() => setLang('en')}
              style={{
                background: 'transparent',
                border: 'none',
                color: !isRtl ? colors.textPrimary : colors.textSubtle,
                fontWeight: !isRtl ? 600 : 400,
                cursor: 'pointer',
                fontSize: '11px',
                padding: '1px 3px',
              }}
            >
              EN
            </button>
            <span style={{ color: colors.border, userSelect: 'none' }}>|</span>
            <button
              type="button"
              onClick={() => setLang('ar')}
              style={{
                background: 'transparent',
                border: 'none',
                color: isRtl ? colors.textPrimary : colors.textSubtle,
                fontWeight: isRtl ? 600 : 400,
                cursor: 'pointer',
                fontSize: '11px',
                padding: '1px 3px',
              }}
            >
              عربي
            </button>
          </div>

          <div style={{ width: '1px', height: '14px', backgroundColor: colors.border }} />

          {/* User Avatar */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                border: `1px solid ${colors.border}`,
                backgroundColor: colors.surface,
                color: colors.textPrimary,
                fontSize: '11px',
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
                  right: isRtl ? 'auto' : 0,
                  left: isRtl ? 0 : 'auto',
                  top: '32px',
                  width: '200px',
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  padding: '4px',
                  boxShadow: '0 12px 24px rgba(0, 0, 0, 0.4)',
                  zIndex: 100,
                  textAlign: isRtl ? 'right' : 'left',
                }}
              >
                <div style={{ padding: '6px 8px', fontSize: '10px', color: colors.textMuted, fontFamily: 'var(--font-mono, monospace)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.email || 'developer@cawlix.com'}
                </div>
                <div style={{ height: '1px', backgroundColor: colors.border, margin: '3px 0' }} />
                <a href="/tracker" style={{ display: 'block', padding: '6px 8px', fontSize: '12px', color: colors.textPrimary, textDecoration: 'none', borderRadius: '4px' }}>
                  {t.navTracker}
                </a>
                <a href="/docs" style={{ display: 'block', padding: '6px 8px', fontSize: '12px', color: colors.textPrimary, textDecoration: 'none', borderRadius: '4px' }}>
                  {t.navDocs}
                </a>
                <a href="/engines/true-cost" style={{ display: 'block', padding: '6px 8px', fontSize: '12px', color: colors.textPrimary, textDecoration: 'none', borderRadius: '4px' }}>
                  {t.navTrueCost}
                </a>
                <div style={{ height: '1px', backgroundColor: colors.border, margin: '3px 0' }} />
                <button
                  type="button"
                  onClick={handleSignOut}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'inherit',
                    padding: '6px 8px',
                    fontSize: '12px',
                    color: '#ef4444',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '4px',
                  }}
                >
                  {t.btnSignOut}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Row 2: Borderless Text Tabs (Overview, Watchlist, Radar, Settings) ── */}
      <nav
        style={{
          borderBottom: `1px solid ${colors.border}`,
          padding: '0 24px',
          backgroundColor: colors.bg,
        }}
        aria-label="Console Navigation"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', overflowX: 'auto' }}>
          {[
            { id: 'overview', label: t.tabOverview },
            { id: 'watchlist', label: t.tabWatchlist },
            { id: 'radar', label: t.tabRadar },
            { id: 'settings', label: t.tabSettings },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '12px',
                color: activeTab === tab.id ? colors.textPrimary : colors.textMuted,
                fontWeight: activeTab === tab.id ? 500 : 400,
                padding: '10px 0',
                cursor: 'pointer',
                borderBottom: activeTab === tab.id ? `2px solid ${colors.textPrimary}` : '2px solid transparent',
                transition: 'color 120ms ease, border-color 120ms ease',
                whiteSpace: 'nowrap',
                outline: 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Body: Canvas ── */}
      <main style={{ flex: 1, backgroundColor: colors.bg, padding: '24px', boxSizing: 'border-box' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Flat Command Search Bar + High-Contrast Primary Button */}
          <section style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flex: 1,
                maxWidth: '480px',
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: '6px',
                height: '36px',
                padding: '0 12px',
                gap: '8px',
                boxSizing: 'border-box',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.textSubtle} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  color: colors.textPrimary,
                  fontSize: '11px',
                  outline: 'none',
                  height: '100%',
                  fontFamily: 'var(--font-mono, monospace)',
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'transparent', border: 'none', color: colors.textSubtle, fontSize: '14px', cursor: 'pointer' }}
                >
                  &times;
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setModalOpen(true)}
              style={{
                backgroundColor: colors.btnBg,
                color: colors.btnText,
                fontSize: '11px',
                fontWeight: 600,
                padding: '0 14px',
                height: '36px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'var(--font-mono, monospace)',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ fontSize: '14px', lineHeight: 1 }}>+</span>
              <span>{t.btnAddSku}</span>
            </button>
          </section>

          {/* Unadorned Tracked Items List */}
          <section style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Table Header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '2.2fr 1fr 1.2fr 1.2fr 1fr 0.8fr',
                alignItems: 'center',
                padding: '8px 12px',
                borderBottom: `1px solid ${colors.border}`,
                fontSize: '10px',
                color: colors.textSubtle,
                letterSpacing: '0.05em',
                fontFamily: 'var(--font-mono, monospace)',
              }}
            >
              <span>{t.colTitle}</span>
              <span>{t.colStore}</span>
              <span style={{ textAlign: isRtl ? 'left' : 'right' }}>{t.colPrice}</span>
              <span style={{ textAlign: isRtl ? 'left' : 'right' }}>{t.colDelta}</span>
              <span style={{ textAlign: isRtl ? 'left' : 'right' }}>{t.colTime}</span>
              <span style={{ textAlign: isRtl ? 'left' : 'right' }}>{t.colAction}</span>
            </div>

            {loading ? (
              <div style={{ padding: '36px 0', textAlign: 'center', color: colors.textSubtle, fontSize: '11px', fontFamily: 'var(--font-mono, monospace)' }}>
                CONNECTING TO PROBE NETWORK...
              </div>
            ) : filteredItems.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: colors.textSubtle, fontSize: '11px', fontFamily: 'var(--font-mono, monospace)' }}>
                {t.noItems}
              </div>
            ) : (
              filteredItems.map((item) => {
                const isMarkup = item.delta_pct > 0;
                const deltaColor = isMarkup ? '#ef4444' : colors.accent;
                const deltaSign = item.delta_pct > 0 ? `+${item.delta_pct}%` : `${item.delta_pct}%`;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleRowClick(item)}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2.2fr 1fr 1.2fr 1.2fr 1fr 0.8fr',
                      alignItems: 'center',
                      padding: '14px 12px',
                      borderBottom: `1px solid ${colors.border}`,
                      cursor: 'pointer',
                      transition: 'background-color 100ms ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = colors.surfaceHover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0, paddingRight: isRtl ? 0 : '12px', paddingLeft: isRtl ? '12px' : 0 }}>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: colors.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.title}
                      </span>
                      <span style={{ fontSize: '10px', color: colors.textSubtle, fontFamily: 'var(--font-mono, monospace)' }}>
                        {item.sku}
                      </span>
                    </div>

                    <div style={{ fontSize: '11px', color: colors.textMuted, fontFamily: 'var(--font-mono, monospace)' }}>
                      {item.node}
                    </div>

                    <div style={{ fontSize: '13px', fontWeight: 600, color: colors.textPrimary, textAlign: isRtl ? 'left' : 'right', fontFamily: 'var(--font-mono, monospace)' }}>
                      EGP {item.current_price_egp.toLocaleString()}
                    </div>

                    {/* Single subtle monospace text delta: NO boxes, NO pills! */}
                    <div style={{ fontSize: '11px', fontWeight: 600, color: deltaColor, textAlign: isRtl ? 'left' : 'right', fontFamily: 'var(--font-mono, monospace)' }}>
                      {deltaSign}
                    </div>

                    <div style={{ fontSize: '11px', color: colors.textMuted, textAlign: isRtl ? 'left' : 'right', fontFamily: 'var(--font-mono, monospace)' }}>
                      {item.last_ping}
                    </div>

                    <div style={{ textAlign: isRtl ? 'left' : 'right' }}>
                      <button
                        type="button"
                        onClick={(e) => handleReaudit(e, item)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: probingSkuId === item.id ? colors.accent : colors.textSubtle,
                          fontSize: '11px',
                          cursor: 'pointer',
                          padding: '2px 0',
                          fontFamily: 'var(--font-mono, monospace)',
                        }}
                      >
                        {probingSkuId === item.id ? t.probing : t.btnReaudit}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </section>

        </div>
      </main>

      {/* ── Slide-Over Drawer: Telemetry Inspector ── */}
      {selectedDrawerItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            justifyContent: isRtl ? 'flex-start' : 'flex-end',
          }}
        >
          {/* Backdrop */}
          <div
            onClick={() => setSelectedDrawerItem(null)}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
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
              maxWidth: '580px',
              height: '100%',
              backgroundColor: colors.surface,
              borderLeft: isRtl ? 'none' : `1px solid ${colors.border}`,
              borderRight: isRtl ? `1px solid ${colors.border}` : 'none',
              boxShadow: isRtl ? '20px 0 40px rgba(0,0,0,0.45)' : '-20px 0 40px rgba(0,0,0,0.45)',
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
                height: '48px',
                borderBottom: `1px solid ${colors.border}`,
                padding: '0 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: colors.surface,
                position: 'sticky',
                top: 0,
                zIndex: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '10px', color: colors.textMuted, fontFamily: 'var(--font-mono, monospace)', letterSpacing: '0.06em' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: colors.accent, boxShadow: `0 0 8px ${colors.accent}` }} />
                <span>{t.drawerLiveTelemetry}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDrawerItem(null)}
                title="Close (Esc)"
                style={{
                  background: 'transparent',
                  border: `1px solid ${colors.border}`,
                  color: colors.textMuted,
                  fontSize: '10px',
                  fontWeight: 600,
                  padding: '2px 7px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono, monospace)',
                }}
              >
                ESC
              </button>
            </div>

            {/* Content Container */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Module 1: Header */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '20px', borderBottom: `1px solid ${colors.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontFamily: 'var(--font-mono, monospace)' }}>
                  <span style={{ color: colors.textPrimary, fontWeight: 600 }}>{selectedDrawerItem.sku}</span>
                  <span>·</span>
                  <span style={{ color: colors.accent }}>{selectedDrawerItem.node}</span>
                  <span style={{ color: colors.textSubtle }}>({selectedDrawerItem.domain})</span>
                </div>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: colors.textPrimary, margin: 0, lineHeight: 1.35, letterSpacing: '-0.015em' }}>
                  {selectedDrawerItem.title}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', paddingTop: '4px', flexWrap: 'wrap' }}>
                  <a
                    href={getStoreUrl(selectedDrawerItem)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '11px', color: colors.textPrimary, textDecoration: 'none', borderBottom: `1px solid ${colors.borderHover}`, fontFamily: 'var(--font-mono, monospace)' }}
                  >
                    {t.openNode}
                  </a>
                  <span style={{ fontSize: '10px', color: colors.textSubtle, fontFamily: 'var(--font-mono, monospace)' }}>
                    {t.telemetryVerified} {selectedDrawerItem.last_ping}
                  </span>
                </div>
              </div>

              {/* Module 2: Forensic Price Diagnostic */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={{ fontSize: '10px', letterSpacing: '0.06em', color: colors.textSubtle, fontFamily: 'var(--font-mono, monospace)' }}>
                  {t.modDiagnostic}
                </span>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', border: `1px solid ${colors.border}`, borderRadius: '6px', padding: '14px 16px', backgroundColor: colors.bg }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <span style={{ fontSize: '10px', color: colors.textMuted, fontFamily: 'var(--font-mono, monospace)' }}>{t.currentShelfPrice}</span>
                    <span style={{ fontSize: '1.05rem', fontWeight: 600, color: colors.textPrimary, fontFamily: 'var(--font-mono, monospace)' }}>
                      EGP {selectedDrawerItem.current_price_egp.toLocaleString()}
                    </span>
                    <span style={{ fontSize: '10px', marginTop: '2px', color: drawerIsMarkup ? '#ef4444' : colors.accent, fontFamily: 'var(--font-mono, monospace)' }}>
                      {drawerIsMarkup ? `+${selectedDrawerItem.delta_pct}% ${t.overBaseline}` : `${selectedDrawerItem.delta_pct}% ${t.underBaseline}`}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <span style={{ fontSize: '10px', color: colors.textMuted, fontFamily: 'var(--font-mono, monospace)' }}>{t.baselineMedian}</span>
                    <span style={{ fontSize: '1.05rem', fontWeight: 600, color: colors.textPrimary, fontFamily: 'var(--font-mono, monospace)' }}>
                      EGP {selectedDrawerItem.baseline_price_egp.toLocaleString()}
                    </span>
                    <span style={{ fontSize: '10px', marginTop: '2px', color: colors.textSubtle, fontFamily: 'var(--font-mono, monospace)' }}>
                      90-day median rolling baseline
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    border: `1px solid ${colors.border}`,
                    borderLeft: isRtl ? `1px solid ${colors.border}` : `3px solid ${drawerIsMarkup ? '#ef4444' : colors.accent}`,
                    borderRight: isRtl ? `3px solid ${drawerIsMarkup ? '#ef4444' : colors.accent}` : `1px solid ${colors.border}`,
                    borderRadius: '6px',
                    padding: '12px 14px',
                    fontSize: '11px',
                    lineHeight: 1.5,
                    backgroundColor: colors.bg,
                    fontFamily: 'var(--font-mono, monospace)',
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: '2px', color: drawerIsMarkup ? '#ef4444' : colors.accent }}>
                    {t.verdictLabel}
                  </div>
                  <div style={{ color: colors.textMuted }}>
                    {drawerIsMarkup ? t.verdictFakeMarkup : t.verdictRealDeal}
                  </div>
                </div>
              </div>

              {/* Module 3: Price History Trend (90-Day Sparkline) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={{ fontSize: '10px', letterSpacing: '0.06em', color: colors.textSubtle, fontFamily: 'var(--font-mono, monospace)' }}>
                  {t.modHistoryTrend}
                </span>

                <div style={{ border: `1px solid ${colors.border}`, borderRadius: '6px', padding: '16px', backgroundColor: colors.bg, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ width: '100%', height: '100px' }}>
                    <svg width="100%" height="100" viewBox="0 0 480 100" preserveAspectRatio="none" fill="none">
                      <line x1="10" y1="55" x2="470" y2="55" stroke={colors.textSubtle} strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.5" />
                      <text x="14" y="49" fill={colors.textSubtle} fontSize="9" fontFamily="monospace">
                        MEDIAN BASELINE: EGP {selectedDrawerItem.baseline_price_egp.toLocaleString()}
                      </text>
                      <path
                        d={drawerIsMarkup ? 'M 20 55 L 140 55 L 220 54 L 300 24 L 380 20 L 460 20' : 'M 20 40 L 140 40 L 220 42 L 300 68 L 380 72 L 460 72'}
                        stroke={drawerIsMarkup ? '#ef4444' : colors.accent}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="460" cy={drawerIsMarkup ? 20 : 72} r="4" fill={drawerIsMarkup ? '#ef4444' : colors.accent} />
                      <circle cx="460" cy={drawerIsMarkup ? 20 : 72} r="8" stroke={drawerIsMarkup ? '#ef4444' : colors.accent} strokeWidth="1.2" strokeOpacity="0.4" />
                    </svg>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: colors.textSubtle, fontFamily: 'var(--font-mono, monospace)' }}>
                    <span>{t.axisStart}</span>
                    <span>{t.axisPreSale}</span>
                    <span>{t.axisNow}: EGP {selectedDrawerItem.current_price_egp.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Module 4: Landed Cost & Arbitrage Benchmark */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={{ fontSize: '10px', letterSpacing: '0.06em', color: colors.textSubtle, fontFamily: 'var(--font-mono, monospace)' }}>
                  {t.modLandedCost}
                </span>

                <div style={{ border: `1px solid ${colors.border}`, borderRadius: '6px', overflow: 'hidden', backgroundColor: colors.bg, fontSize: '11px', fontFamily: 'var(--font-mono, monospace)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 14px', borderBottom: `1px solid ${colors.border}` }}>
                    <span style={{ color: colors.textMuted }}>{t.rowDomesticRetail}</span>
                    <span style={{ color: colors.textPrimary }}>EGP {drawerDomestic.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 14px', borderBottom: `1px solid ${colors.border}` }}>
                    <span style={{ color: colors.textMuted }}>{t.rowCifImport}</span>
                    <span style={{ color: colors.textPrimary }}>EGP {drawerCif.toLocaleString()} (${drawerBaseUsd})</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 14px', borderBottom: `1px solid ${colors.border}` }}>
                    <span style={{ color: colors.textMuted }}>{t.rowCustomsDuty}</span>
                    <span style={{ color: colors.textPrimary }}>EGP {drawerCustoms.toLocaleString()} (10%)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 14px', borderBottom: `1px solid ${colors.border}` }}>
                    <span style={{ color: colors.textMuted }}>{t.rowVat}</span>
                    <span style={{ color: colors.textPrimary }}>EGP {drawerVat.toLocaleString()} (14%)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 14px', borderBottom: `1px solid ${colors.border}` }}>
                    <span style={{ color: colors.textMuted }}>{t.rowBankFx}</span>
                    <span style={{ color: colors.textPrimary }}>EGP {drawerBankFx.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 14px', backgroundColor: colors.surface, fontWeight: 600 }}>
                    <span style={{ color: colors.textPrimary }}>{t.rowTotalLanded}</span>
                    <span style={{ color: colors.textPrimary }}>EGP {drawerTotalLanded.toLocaleString()}</span>
                  </div>
                </div>

                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '6px',
                    border: `1px solid ${colors.border}`,
                    fontSize: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: drawerHasAdvantage ? colors.accent : colors.textPrimary,
                    backgroundColor: colors.bg,
                    fontFamily: 'var(--font-mono, monospace)',
                  }}
                >
                  <span style={{ fontWeight: 700 }}>{drawerHasAdvantage ? t.verdictImportRec : t.verdictDomesticRec}</span>
                  <span>
                    {drawerHasAdvantage ? `+EGP ${drawerNetSaved.toLocaleString()} ${t.savingsText}` : 'Direct domestic purchase is cost-optimal'}
                  </span>
                </div>
              </div>

              {/* Module 5: Alert Trigger Settings */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={{ fontSize: '10px', letterSpacing: '0.06em', color: colors.textSubtle, fontFamily: 'var(--font-mono, monospace)' }}>
                  {t.modAlertSettings}
                </span>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: colors.bg,
                      border: `1px solid ${colors.border}`,
                      borderRadius: '6px',
                      height: '38px',
                      overflow: 'hidden',
                    }}
                  >
                    <span style={{ fontSize: '11px', fontWeight: 600, color: colors.textSubtle, padding: '0 12px', backgroundColor: colors.surface, height: '100%', display: 'flex', alignItems: 'center', borderRight: isRtl ? 'none' : `1px solid ${colors.border}`, borderLeft: isRtl ? `1px solid ${colors.border}` : 'none', fontFamily: 'var(--font-mono, monospace)' }}>
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
                        color: colors.textPrimary,
                        fontSize: '11px',
                        padding: '0 12px',
                        outline: 'none',
                        height: '100%',
                        fontFamily: 'var(--font-mono, monospace)',
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveAlert}
                    style={{
                      backgroundColor: alertSavedSuccess ? colors.accent : colors.btnBg,
                      color: alertSavedSuccess ? '#000000' : colors.btnText,
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '0 16px',
                      height: '38px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 140ms ease',
                      whiteSpace: 'nowrap',
                      fontFamily: 'var(--font-mono, monospace)',
                    }}
                  >
                    {alertSavedSuccess ? t.alertSaved : t.saveAlertRule}
                  </button>
                </div>
              </div>

            </div>
          </aside>
        </div>
      )}

      {/* Add SKU Modal */}
      <AddSkuModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={(newProduct) => {
          setTrackedItems((prev) => [newProduct, ...prev]);
          setModalOpen(false);
        }}
      />
    </div>
  );
}
