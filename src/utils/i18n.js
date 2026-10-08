/**
 * DUAL-LANGUAGE LOCALIZATION & EGYPTIAN MARKET TERMINOLOGY (CAWLIX)
 * Provides seamless AR/EN localization, RTL support, and practical Egyptian market translations.
 */

// ── 1. NATIVE EGYPTIAN RETAILER IDENTITIES ────────────────────────────────────
export const RETAILER_NAMES = {
  AMZN_EG: { ar: 'أمازون مصر', en: 'Amazon Egypt' },
  NOON_EG: { ar: 'نون مصر', en: 'Noon Egypt' },
  BTECH_EG: { ar: 'بي تك', en: 'B.TECH' },
  TRADELINE: { ar: 'تريد لاين', en: 'Tradeline' },
  TRADELINE_EG: { ar: 'تريد لاين', en: 'Tradeline' },
  JUMIA_EG: { ar: 'جوميا مصر', en: 'Jumia Egypt' },
  '2B_EG': { ar: 'تو بي مصر', en: '2B Egypt' },
  TWOB_EG: { ar: 'تو بي مصر', en: '2B Egypt' },
  RAYA_EG: { ar: 'راية شوب', en: 'Raya Shop' },
  ELARABY_EG: { ar: 'مجموعة العربي', en: 'El Araby Group' },
  DUBAI_PHONE: { ar: 'دبي فون', en: 'Dubai Phone' },
  DUBAI_PHONE_EG: { ar: 'دبي فون', en: 'Dubai Phone' },
  DREAM_2000: { ar: 'دريم 2000', en: 'Dream 2000' },
  DREAM2000_EG: { ar: 'دريم 2000', en: 'Dream 2000' },
  VODAFONE_EG: { ar: 'فودافون شوب مصر', en: 'Vodafone Egypt' },
  CARREFOUR_EG: { ar: 'كارفور مصر', en: 'Carrefour Egypt' },
};

/**
 * Resolves localized retailer brand name safely from any platform slug or name string.
 * @param {string} slugOrName - e.g. 'AMZN_EG', 'noon', 'btech'
 * @param {'ar'|'en'} lang
 * @returns {string}
 */
export function getRetailerName(slugOrName, lang = 'ar') {
  if (!slugOrName) return lang === 'ar' ? 'متجر محلي' : 'Domestic Retailer';
  const raw = String(slugOrName).toUpperCase().trim();

  if (RETAILER_NAMES[raw]) {
    return RETAILER_NAMES[raw][lang] || RETAILER_NAMES[raw].ar;
  }

  // Flexible substring resolution
  if (raw.includes('AMAZON') || raw.includes('AMZN')) return RETAILER_NAMES.AMZN_EG[lang];
  if (raw.includes('NOON')) return RETAILER_NAMES.NOON_EG[lang];
  if (raw.includes('BTECH') || raw.includes('B.TECH')) return RETAILER_NAMES.BTECH_EG[lang];
  if (raw.includes('TRADELINE')) return RETAILER_NAMES.TRADELINE[lang];
  if (raw.includes('JUMIA')) return RETAILER_NAMES.JUMIA_EG[lang];
  if (raw.includes('2B') || raw.includes('TWOB')) return RETAILER_NAMES['2B_EG'][lang];
  if (raw.includes('RAYA')) return RETAILER_NAMES.RAYA_EG[lang];
  if (raw.includes('ELARABY') || raw.includes('EL ARABY') || raw.includes('ARABY')) return RETAILER_NAMES.ELARABY_EG[lang];
  if (raw.includes('DUBAI')) return RETAILER_NAMES.DUBAI_PHONE[lang];
  if (raw.includes('DREAM')) return RETAILER_NAMES.DREAM_2000[lang];
  if (raw.includes('VODAFONE')) return RETAILER_NAMES.VODAFONE_EG[lang];
  if (raw.includes('CARREFOUR')) return RETAILER_NAMES.CARREFOUR_EG[lang];

  return slugOrName;
}

// ── 2. COMPREHENSIVE TRANSLATIONS DICTIONARY ─────────────────────────────────
export const TRANSLATIONS = {
  // Navigation & Tabs
  nav_overview: { ar: 'نظرة عامة ومراقبة الأجهزة', en: 'Overview / Telemetry Fleet' },
  nav_matrix: { ar: 'مصفوفة مقارنة المنصات الـ 12', en: 'Market Matrix (12 Platforms)' },
  nav_arbitrage: { ar: 'محرك فروق الأسعار وفرص التوفير', en: 'Arbitrage Engine' },
  nav_retailer_health: { ar: 'حالة وسرعة تحديث المتاجر', en: 'Retailer Health & Latency' },
  nav_forensics: { ar: 'رادار فحص التلاعب والخصومات الوهمية', en: 'Glitch Radar & Forensics' },
  nav_watchlist: { ar: 'قائمة المتابعة والتنبيهات المخصصة', en: 'Watchlist & Targets' },
  nav_reports: { ar: 'تقارير السوق واستخراج البيانات', en: 'Market Reports & Exports' },
  nav_nodes: { ar: 'عقد وفروع الرصد', en: 'Domestic Telemetry Nodes' },
  nav_logs: { ar: 'سجل العمليات والتدقيق', en: 'Audit & Telemetry Logs' },
  nav_settings: { ar: 'الإعدادات والملف الشخصي', en: 'Account Settings' },

  // Sectors in Sidebar
  sector_fleet: { ar: 'أسطول المراقبة والرصد', en: 'TELEMETRY FLEET' },
  sector_arbitrage: { ar: 'فروق الأسعار وتحليل التلاعب', en: 'MARKET ARBITRAGE & FORENSICS' },
  sector_personal: { ar: 'المتابعة الشخصية والتقارير', en: 'PERSONAL & EXPORTS' },
  sector_system: { ar: 'إدارة النظام والشبكة', en: 'SYSTEM & LOGS' },

  // Jargon Demystification (Egyptian Market Terms)
  arbitrage_margin: { ar: 'فارق السعر ومكسب التجارة', en: 'Arbitrage Margin Spread' },
  ghost_markup: { ar: 'خصم وهمي (رفع السعر قبل التخفيض)', en: 'Ghost Markup / Fake Discount' },
  baseline_median: { ar: 'متوسط سعر السوق الحقيقي (آخر 90 يوم)', en: '90D Baseline Median Price' },
  cheapest_node: { ar: 'أرخص متجر حالياً', en: 'Cheapest Retailer' },
  reaudit_node: { ar: 'فحص وتحديث السعر الآن', en: 'Re-audit Price Now' },
  glitch_radar: { ar: 'رادار العروض والتلاعب بالأسعار', en: 'Glitch Radar' },
  retailer_node_health: { ar: 'حالة المتاجر وسرعة التحديث', en: 'Retailer Node Health' },
  watchlist_targets: { ar: 'قائمة المراقبة والتنبيهات', en: 'Watchlist & Targets' },

  // KPI Headers & Summary Cards
  monitored_skus: { ar: 'المنتجات قيد المراقبة', en: 'Monitored SKUs' },
  active_domestic_retailers: { ar: 'المتاجر المصرية المتصلة', en: 'Active Domestic Retailers' },
  intercepted_price_glitches: { ar: 'عروض وتلاعبات تم رصدها', en: 'Intercepted Price Glitches' },
  estimated_arbitrage_savings: { ar: 'إجمالي وفر الأسعار المتاح بالسوق', en: 'Estimated Market Savings' },
  total_savings_subtext: { ar: 'إجمالي الوفر المحسوب من فارق الأسعار بين المتاجر الـ 12', en: 'Total spread across 12 domestic Egyptian retailers' },

  // Header & Search
  search_placeholder: { ar: 'ابحث عن اسم المنتج، الموديل، الباركود، أو المتجر...', en: 'Search SKUs, domestic nodes, or retailers...' },
  run_fleet_audit: { ar: 'تحديث وفحص جميع المتاجر الآن', en: 'Run Fleet Audit' },
  auditing_fleet: { ar: 'جاري فحص المتاجر...', en: 'Auditing Fleet...' },
  audit_complete: { ar: 'اكتمل الفحص بنجاح', en: 'Fleet Audit Complete' },
  all_monitored_skus: { ar: 'كافة المنتجات المراقبة', en: 'All Monitored SKUs' },
  notifications: { ar: 'الإشعارات والتنبيهات', en: 'Notifications' },
  sign_out: { ar: 'تسجيل الخروج', en: 'Sign Out' },

  // Actions & Buttons
  visit_store: { ar: 'زيارة المتجر', en: 'Visit Store' },
  acquire_via: { ar: 'شراء عبر', en: 'Acquire via' },
  inspect: { ar: 'فحص ومطابقة', en: 'Inspect' },
  direct_store_link: { ar: 'رابط المتجر المباشر', en: 'Direct Store Link' },
  inspect_on: { ar: 'معاينة على متجر', en: 'Inspect on' },
  add_to_watchlist: { ar: 'راقب هذا المنتج', en: 'Add to Watchlist' },
  in_watchlist: { ar: 'مضاف للمراقبة ✓', en: 'In Watchlist ✓' },
  target_price_alert: { ar: 'السعر المستهدف للتنبيه', en: 'Target Alert Price' },
  set_price_target: { ar: 'تفعيل تنبيه السعر', en: 'Set Target Price' },
  save_alert_rule: { ar: 'حفظ تنبيه السعر', en: 'Save Price Alert' },
  alert_saved_success: { ar: 'تم تفعيل التنبيه بنجاح ✓', en: 'Alert Rule Saved ✓' },
  reauditing: { ar: 'جاري التدقيق...', en: 'Auditing...' },

  // Status & Stock
  in_stock: { ar: 'متوفر', en: 'In Stock' },
  out_of_stock: { ar: 'غير متوفر', en: 'Out of Stock' },
  low_stock: { ar: 'كمية محدودة', en: 'Low Stock' },
  truth_index: { ar: 'مؤشر مصداقية الخصم', en: 'Truth Index' },
  egp: { ar: 'ج.م', en: 'EGP' },
  price: { ar: 'السعر', en: 'Price' },
  current_price: { ar: 'السعر الحالي', en: 'Current Price' },
  original_price: { ar: 'السعر قبل الخصم', en: 'Original Price' },
  baseline_price: { ar: 'السعر المرجعي (90 يوم)', en: '90D Baseline Price' },
  discount: { ar: 'الخصم', en: 'Discount' },
  spread: { ar: 'فارق السعر', en: 'Price Spread' },
  savings: { ar: 'الوفر المتاح', en: 'Savings Potential' },
  platform: { ar: 'المنصة', en: 'Platform' },
  rating: { ar: 'التقييم', en: 'Rating' },
  reviews: { ar: 'تقييم ومراجعة', en: 'reviews' },
  warranty: { ar: 'الضمان', en: 'Warranty' },
  last_ping: { ar: 'آخر تحديث', en: 'Last Updated' },
  sku: { ar: 'كود المنتج', en: 'SKU' },
  brand: { ar: 'العلامة التجارية', en: 'Brand' },
  model: { ar: 'الموديل', en: 'Model' },

  // Anomaly Types
  anomaly_ghost_markup: { ar: 'خصم وهمي (رفع السعر قبل العرض)', en: 'Ghost Markup' },
  anomaly_artificial_anchor: { ar: 'سعر مرجعي مصطنع لم يعرض بالسوق', en: 'Artificial Anchor' },
  anomaly_pre_promo_jackup: { ar: 'رفع متعمد للسعر قبل الحملة الترويجية', en: 'Pre-Promo Jackup' },
  anomaly_phantom_stock: { ar: 'عرض وهمي على منتج غير متوفر للترويج', en: 'Phantom Stock Bait' },
  anomaly_third_party_spike: { ar: 'سعر مبالغ فيه من بائع طرف ثالث', en: 'Third-Party Spike' },
  anomaly_flash_crash: { ar: 'نزول حاد ومفاجئ في السعر', en: 'Price Flash Crash' },

  // Severities
  severity_critical: { ar: 'تلاعب حرج', en: 'CRITICAL' },
  severity_high: { ar: 'تلاعب مرتفع', en: 'HIGH' },
  severity_medium: { ar: 'تنبيه متوسط', en: 'MEDIUM' },
  severity_opportunity: { ar: 'فرصة توفير ممتازة', en: 'OPPORTUNITY' },

  // Tooltip Explanations
  tip_truth_index: {
    ar: 'هذا المؤشر يفحص إذا كان الخصم حقيقياً أم قام المتجر برفع السعر مؤخراً لإيهامك بالتخفيض.',
    en: 'Evaluates whether the discount is genuine or if the merchant recently inflated the price to feign a markdown.',
  },
  tip_baseline_median: {
    ar: 'متوسط الأسعار المسجلة في السوق المصري خلال آخر 90 يوم، لمعرفة ما إذا كان السعر الحالي رخيصاً أم غالياً.',
    en: 'The genuine 90-day median shelf price across domestic Egyptian retailers to detect true market value.',
  },
  tip_arbitrage_margin: {
    ar: 'الفارق بين أعلى وأرخص متجر في مصر لنفس المنتج، وهو مكسب التاجر أو وفر المشتري الذكي.',
    en: 'The active price spread between the lowest and highest domestic retailer for this exact SKU.',
  },
  tip_glitch_radar: {
    ar: 'نظام رصد فوري يكشف التلاعب بالأسعار، مثل الخصومات الوهمية أو النزول المفاجئ في الأسعار.',
    en: 'Real-time telemetry intercepting artificial markups, phantom inventory, and price crash anomalies.',
  },
  tip_retailer_health: {
    ar: 'سرعة استجابة سيرفرات المتجر المصري ومدى دقة وتحديث الأسعار المسجلة عليه.',
    en: 'Live telemetry ping latency, catalog throughput, and data fidelity score for Egyptian retailer endpoints.',
  },
};

/**
 * Translates a key with fallback.
 * @param {string} key
 * @param {'ar'|'en'} lang
 * @param {string} [fallback]
 * @returns {string}
 */
export function t(key, lang = 'ar', fallback = '') {
  if (TRANSLATIONS[key]) {
    return TRANSLATIONS[key][lang] || TRANSLATIONS[key].ar || fallback || key;
  }
  return fallback || key;
}
