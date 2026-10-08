/**
 * CAWLIX CENTRAL ARABIC DICTIONARY (src/locales/ar.js)
 * Exhaustive bilingual localization dictionary for Egyptian merchants, shoppers, and analysts.
 */

export const ar = {
  // Navigation & Shell
  nav: {
    telemetryFleet: "أسطول الرصد والمتابعة",
    overview: "لوحة التحكم الشاملة",
    marketMatrix: "مصفوفة الـ 12 متجر",
    arbitrageEngine: "محرك فروق الأسعار وفرص التوفير",
    retailerHealth: "حالة وسرعة استجابة المتاجر",
    glitchRadar: "رادار التلاعب والخصومات الوهمية",
    watchlist: "قائمة المراقبة والتنبيهات المخصصة",
    reports: "التقارير واستخراج البيانات",
    systemLogs: "سجلات النظام والعمليات",
    settings: "الإعدادات العامة",
    searchPlaceholder: "ابحث باسم المنتج، الموديل، الباركود الدولي، أو اسم المتجر... (اضغط / أو Cmd+K)",
    runAudit: "فحص وتحديث جميع المتاجر الآن",
    auditingProgress: "جاري فحص المتاجر ({current}/{total})...",
    auditSuccess: "تم تحديث جميع الأسعار بنجاح",
    fleetAuditDone: "اكتمل فحص ومسح شبكة المتاجر الـ 12 بنجاح",
    addNewSku: "إضافة منتج للمراقبة",
    allNodesOnline: "جميع المتاجر متصلة لحظياً",
    liveTelemetry: "رصد أسعار حي ومباشر",
    consoleBreadcrumb: "منصة المراقبة اللحظية",
    accountSecurity: "أمان الحساب والتحقق",
    signOut: "تسجيل الخروج",
    langToggle: "🇸🇦 عربي / 🇬🇧 English",
    langToggleLabel: "تغيير اللغة"
  },

  // 12 Egyptian Retailers
  retailers: {
    AMZN_EG: "أمازون مصر",
    NOON_EG: "نون مصر",
    BTECH_EG: "بي تك",
    TRADELINE: "تريد لاين",
    TRADELINE_EG: "تريد لاين",
    JUMIA_EG: "جوميا مصر",
    "2B_EG": "تو بي مصر",
    TWOB_EG: "تو بي مصر",
    RAYA_EG: "راية شوب",
    ELARABY_EG: "مجموعة العربي",
    DUBAI_PHONE: "دبي فون",
    DUBAI_PHONE_EG: "دبي فون",
    DREAM_2000: "دريم 2000",
    DREAM2000_EG: "دريم 2000",
    VODAFONE_EG: "فودافون شوب مصر",
    CARREFOUR_EG: "كارفور مصر",
    generic: "متجر محلي معتمد"
  },

  // Metrics & KPI Cards
  kpis: {
    monitoredSkus: "المنتجات قيد التتبع",
    monitoredSkusSub: "تتبع لحظي للأسعار على مدار 90 يوماً",
    activeRetailers: "المتاجر المصرية المتصلة",
    activeRetailersSub: "ربط لحظي مع أشهر 12 منصة تجارة إلكترونية",
    glitchesIntercepted: "التلاعبات والعروض المرصودة",
    glitchesInterceptedSub: "تخفيضات وهمية أو هبوط مفاجئ في الأسعار",
    arbitrageSavings: "إجمالي وفر الأسعار بالسوق",
    arbitrageSavingsSub: "فارق السعر المتاح للشراء بأرخص سعر ممكن",
    baselineMedian: "متوسط سعر السوق الفعلي (آخر 90 يوم)",
    allTimeLow: "أدنى سعر تاريخي تم تسجيله",
    trueSavings: "صافي التوفير الحقيقي",
    truthIndex: "مؤشر نزاهة الخصم",
    marketSpread: "متوسط الفارق السعري",
    liveNodes: "نقطة رصد متصلة"
  },

  // Comparison Matrix & Table
  matrix: {
    title: "مصفوفة مقارنة الأسعار الشاملة (12 منصة تجارة إلكترونية)",
    subtitle: "فحص ومقارنة الأسعار اللحظية والمخزون والضمان ومؤشر النزاهة لأفضل الأجهزة الإلكترونية في مصر.",
    columns: {
      retailer: "المتجر والمنصة",
      currentPrice: "السعر الحالي والتغير",
      originalPrice: "السعر قبل الخصم",
      discount: "نسبة الخصم",
      stock: "حالة المخزون",
      rating: "التقييم والمراجعات",
      warranty: "الضمان المعتمد",
      materials: "الخامات والمواصفات",
      actions: "الإجراءات والروابط",
      integrity: "نزاهة العرض",
      landedCost: "التكلفة النهائية الواصلة",
      lastScraped: "آخر تحديث"
    },
    badges: {
      bestDeal: "أرخص سعر لدى {retailer}",
      inStock: "متوفر بالمخزون",
      lowStock: "متبقي قطع محدودة ({count})",
      outOfStock: "غير متوفر حالياً",
      ghostMarkup: "تنبيه: خصم وهمي (تم رفع السعر قبل التخفيض)",
      genuineDiscount: "خصم حقيقي مؤكد (أقل من متوسط السوق)",
      ntraApproved: "معتمد رسمياً من الجهاز القومي لتنظيم الاتصالات (NTRA)",
      imported: "وارد خارجي / بدون ضمان محلي معتمد",
      officialWarranty: "ضمان محلي رسمي معتمد",
      verifiedSeller: "بائع رسمي موثوق",
      unverifiedSeller: "تاجر طرف ثالث"
    },
    actions: {
      reAudit: "فحص وتحديث السعر الآن",
      syncing: "جاري الفحص المباشر...",
      visitStore: "شراء مباشرة من المتجر الرسمي",
      acquireVia: "شراء عبر {retailer}",
      addToWatchlist: "إضافة لقائمة المراقبة",
      setPriceTarget: "تحديد سعر مستهدف للتنبيه",
      inspectSku: "فحص المنحنى والمواصفات",
      filterAll: "كافة المنتجات",
      filterInStock: "المتوفر بالمخزون فقط",
      filterDeals: "العروض الحقيقية المؤكدة فقط"
    },
    searchPlaceholder: "ابحث في المتاجر أو الأسعار أو الضمان..."
  },

  // Specifications & Materials
  specs: {
    title: "المواصفات الفنية ومطابقة الجودة",
    chassis: "خامة الهيكل والإطار",
    frontGlass: "زجاج الشاشة والحماية",
    backGlass: "خامة الظهر الخلفي",
    thermal: "نظام التبريد الداخلي",
    waterResistance: "مقاومة الماء والغبار",
    processor: "المعالج ووحدة المعالجة",
    weight: "الوزن الصافي",
    durabilityScore: "مؤشر الصلابة ومقاومة الصدمات",
    scratchScore: "مؤشر مقاومة الخدوش",
    batteryHealth: "سعة البطارية والشحن",
    cellularNetwork: "دعم شبكات المحمول المصرية"
  },

  // Watchlist & Alerts
  alerts: {
    title: "مركز التنبيهات وإشعارات الأسعار",
    noAlerts: "لا توجد تنبيهات جديدة حالياً",
    targetTrigger: "تنبيه السعر المستهدف",
    targetPriceLabel: "أبلغني عندما يصل السعر إلى:",
    targetPricePlaceholder: "أدخل السعر المطلوب بالجنيه (مثلاً: 35,000)",
    saveRule: "حفظ ومتابعة المنتج",
    savingRule: "جاري الحفظ والربط...",
    ruleSaved: "تمت إضافة المنتج لقائمة المراقبة بنجاح",
    emailNotice: "إرسال إشعار فوري إلى بريدك الإلكتروني عبر Brevo",
    markAllRead: "تحديد الكل كمقروء",
    clearAll: "مسح جميع الإشعارات",
    unread: "غير مقروء",
    activeTargets: "تنبيهات أسعار نشطة",
    dropDetected: "هبوط سعري مرصود",
    flashCrash: "انهيار سعري لحظي",
    anomalousDrop: "فارق سعري استثنائي"
  },

  // Arbitrage Engine
  arbitrage: {
    title: "محرك فروق الأسعار وفرص التجارة (12 متجر مصري)",
    subtitle: "رصد فوري لأكبر فوارق الأسعار بين المتاجر لنفس المنتج، لحساب هامش التوفير والربح عند الشراء من أرخص منصة.",
    spreadLeaders: "قائمة المنتجات ذات أعلى فوارق أسعار",
    buyFrom: "اشترِ بأرخص سعر من",
    benchmarkRetailer: "أعلى سعر بالسوق لدى",
    grossSpread: "فارق السعر الصافي",
    marginPercent: "نسبة هامش التوفير",
    netProfit: "هامش الربح بعد مصاريف الشحن",
    acquireButton: "شراء وتوفير الفارق الآن",
    minSpreadFilter: "الحد الأدنى للفارق: {amount} ج.م",
    filterCategory: "تصنيف المنتجات",
    allCategories: "جميع الأقسام",
    topSpreadNotice: "فرصة توفير استثنائية متاحة الآن بالسوق المصري"
  },

  // Retailer Health & Telemetry Nodes
  health: {
    title: "حالة وسرعة استجابة شبكة المتاجر الـ 12",
    subtitle: "مراقبة مستمرة لسرعة استجابة (Ping) المتاجر المصرية ومعدل نجاح الفحص ودرجة نزاهة الأسعار.",
    fleetPingAvg: "متوسط سرعة استجابة المتاجر",
    truthScoreAvg: "متوسط مؤشر النزاهة 90 يوم",
    onlineNodes: "المتاجر المتصلة والمستقرة",
    pingMs: "{ms} مللي ثانية",
    uptimePercent: "نسبة الجاهزية {pct}%",
    statusOnline: "متصل ويعمل بكفاءة",
    statusSlow: "استجابة بطيئة / قيد الملاحظة",
    statusDown: "غير متاح مؤقتاً",
    recheckFleet: "فحص سرعة استجابة المتاجر الآن",
    rechecking: "جاري فحص سرعة الاستجابة...",
    requestsPerMin: "{count} فحص/دقيقة",
    integrityGrade: "تقييم النزاهة: {grade}"
  },

  // Glitch Radar & Truth Forensics
  radar: {
    title: "رادار فحص التلاعب بالأسعار والخصومات الوهمية",
    subtitle: "نظام تدقيق جنائي يكشف المتاجر التي رفعت أسعارها قبل موسم الخصومات للإيهام بنسب تخفيض غير حقيقية.",
    interceptLog: "سجل التلاعبات المكتشفة لحظياً",
    averageGhostMarkup: "متوسط رفع السعر الوهمي",
    deceptionDelta: "الفارق بين الخصم المعلن والحقيقي",
    cpaCompliance: "مطابقة قانون حماية المستهلك 181/2018",
    lawComplianceNotice: "توثيق رسمي مطابق للمادتين 9 و 10 من قانون حماية المستهلك المصري",
    verifiedEvidence: "الدليل الرقمي الموثق",
    realPriceWas: "السعر الحقيقي قبل الرفع",
    claimedPriceWas: "السعر المزعوم المكتوب",
    actualShelfPrice: "السعر الفعلي الآن",
    claimedVsRealDiscount: "{claimed}% معلن مقابل {real}% حقيقي",
    auditNodeNow: "فحص وتحديث السعر الآن",
    auditingNode: "جاري فحص المتجر...",
    filterSeverity: "مستوى الخطورة",
    allSeverities: "كافة المستويات",
    severityCritical: "تلاعب حرج",
    severityHigh: "تلاعب مرتفع",
    severityMedium: "ملاحظة متوسطة",
    zeroAnomalies: "لا توجد تلاعبات مرصودة حالياً، كافة الأسعار متطابقة مع المعايير."
  },

  // Reports & Data Exports
  reports: {
    title: "محركات استخراج وتصدير بيانات السوق المصري",
    subtitle: "تحميل بيانات ومصفوفات أسعار السوق المباشرة بصيغ قياسية لأنظمة الـ ERP والشركات.",
    exportCsv: "تصدير ملف المنتجات المراقبة (CSV)",
    exportJson: "تصدير سجل فروق الأسعار (JSON)",
    printAudit: "طباعة تقرير الفحص والنزاهة",
    exportingCsv: "جاري استخراج ملف CSV...",
    exportingJson: "جاري استخراج ملف JSON...",
    exportScope: "نطاق التصدير",
    allCategories: "كل الأقسام",
    inStockOnly: "المنتجات المتوفرة فقط",
    officialReportTitle: "تقرير نزاهة أسعار التجزئة ومكافحة الخصومات الوهمية بمصر",
    officialReportSubtitle: "فحص شامل لحماية المستهلك عبر أكبر 12 منصة تجارة إلكترونية بمصر طبقاً للقانون 181 لسنة 2018.",
    reportRef: "رقم التوثيق: CWX-AUD-2026-Q4-EG",
    generatedDate: "تاريخ الاستخراج: {date}",
    windowRolling: "فترة الفحص: آخر 90 يوماً متواصلة",
    scorecardSection: "1. تقرير نزاهة أسعار المتاجر المصرية (آخر 90 يوماً)",
    interceptSection: "2. سجل رصد التلاعب: الأسعار الوهمية والخصومات المصطنعة",
    hashVerification: "سجل بيانات موثق ومفحوص تقنياً"
  },

  // SKU Inspector Drawer
  drawer: {
    title: "فحص وتدقيق المنتج",
    retailPrice: "سعر الرف الحالي بالمتجر",
    genuineBaseline: "متوسط سعر السوق الحقيقي (آخر 90 يوم)",
    ghostMarkupAlert: "تنبيه: خصم وهمي (رفع السعر قبل التخفيض)",
    genuineDiscountConfirmed: "تخفيض حقيقي ومؤكد من سعر السوق",
    landedCostBreakdown: "تفاصيل التكلفة النهائية الواصلة (EGP)",
    basePrice: "سعر المنتج الأساسي",
    vatNotice: "شامل ضريبة القيمة المضافة 14%",
    shippingCost: "مصاريف الشحن والتوصيل",
    freeShipping: "شحن مجاني متوفر",
    authenticityNotice: "منتج أصلي 100% مضمون من المتجر الرسمي",
    cpaProtected: "معتمد ومحمي بموجب قانون حماية المستهلك المصري",
    setTargetPrice: "راقب هذا المنتج وسجل تنبيهاً سعرياً",
    targetPriceLabel: "حدد السعر المستهدف للشراء (ج.م):",
    saveTargetButton: "حفظ وتفعيل التنبيه",
    savingTarget: "جاري حفظ التنبيه...",
    targetActiveMsg: "سيتم تنبيهك فور وصول السعر لهذا المستوى.",
    reAuditProduct: "↻ فحص وتحديث السعر الآن"
  },

  // Add SKU Modal
  modal: {
    addTitle: "إضافة منتج جديد للمراقبة والتتبع اللحظي",
    addSubtitle: "أدخل رابط المنتج أو رقمه التسلسلي لبدء تتبعه عبر الـ 12 منصة تجارة إلكترونية مصرية.",
    productTitleLabel: "اسم المنتج والموديل",
    productTitlePlaceholder: "مثال: iPhone 16 Pro Max 256GB Natural Titanium",
    categoryLabel: "القسم",
    brandLabel: "العلامة التجارية",
    barcodeLabel: "الباركود الدولي (EAN-13)",
    barcodePlaceholder: "مثال: 6221000123456",
    retailerUrlLabel: "رابط صفحة المنتج بالمتجر",
    retailerUrlPlaceholder: "https://www.amazon.eg/dp/... أو noon.com/egypt-en/...",
    trackingFrequency: "تردد التحديث التلقائي",
    freq15m: "كل 15 دقيقة (موصى به للسلع سريعة التغير)",
    freq1h: "كل ساعة",
    freq6h: "كل 6 ساعات",
    submitButton: "بدء مراقبة المنتج الآن",
    submitting: "جاري الفحص والربط مع المتاجر...",
    cancelButton: "إلغاء",
    successMsg: "تمت إضافة المنتج بنجاح وجاري فحص أسعاره عبر الـ 12 متجر"
  },

  // Tooltips & Help Explainers
  tooltips: {
    truthIndex: "هذا المؤشر يفحص إذا كان الخصم حقيقياً أم قام المتجر برفع السعر مؤخراً لإيهامك بالتخفيض.",
    baselineMedian: "متوسط السعر العادل للمنتج في السوق المصري بناءً على تتبع الأسعار خلال الـ 90 يوماً الماضية.",
    arbitrageMargin: "نسبة الوفر أو المكسب المتاح عند الشراء من أرخص متجر ومقارنته بأعلى سعر بالسوق.",
    retailerHealth: "متابعة لحظية لسرعة تجاوب مواقع المتاجر المصرية والتأكد من دقة الأسعار وتحديثها.",
    landedCost: "إجمالي المبلغ الفعلي الذي ستدفعه شاملاً سعر المنتج، الضريبة 14%، ومصاريف الشحن للباب."
  },

  // Common UI Elements & Formats
  common: {
    egp: "ج.م",
    egpSuffix: "ج.م",
    usd: "دولار",
    percent: "%",
    inStock: "متوفر بالمخزون",
    outOfStock: "غير متوفر",
    loading: "جاري التحميل...",
    error: "حدث خطأ غير متوقع",
    retry: "إعادة المحاولة",
    save: "حفظ",
    saved: "تم الحفظ",
    cancel: "إلغاء",
    delete: "حذف",
    confirm: "تأكيد",
    close: "إغلاق",
    view: "عرض",
    details: "التفاصيل",
    refresh: "تحديث",
    search: "بحث",
    filter: "تصفية",
    all: "الكل",
    active: "نشط",
    inactive: "غير نشط",
    justNow: "الآن",
    minutesAgo: "منذ {count} دقيقة",
    hoursAgo: "منذ {count} ساعة",
    daysAgo: "منذ {count} يوم",
    success: "تمت العملية بنجاح"
  }
};
