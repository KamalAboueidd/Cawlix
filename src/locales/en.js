/**
 * CAWLIX CENTRAL ENGLISH DICTIONARY (src/locales/en.js)
 * Exhaustive bilingual localization dictionary for international analysts, traders, and shoppers.
 */

export const en = {
  // Navigation & Shell
  nav: {
    telemetryFleet: "Telemetry Fleet",
    overview: "Overview / Nodes",
    marketMatrix: "Market Matrix (12 Platforms)",
    arbitrageEngine: "Arbitrage Engine",
    retailerHealth: "Retailer Health & Latency",
    glitchRadar: "Glitch Radar & Forensics",
    watchlist: "Watchlist & Targets",
    reports: "Export & Reports",
    systemLogs: "System & Audit Logs",
    settings: "Settings",
    searchPlaceholder: "Search SKU title, model, barcode, or retail node... (Press / or Cmd+K)",
    runAudit: "Run Fleet Audit",
    auditingProgress: "Auditing platforms ({current}/{total})...",
    auditSuccess: "All platform prices audited successfully",
    fleetAuditDone: "12-node domestic fleet audit finished successfully",
    addNewSku: "Add Monitored SKU",
    allNodesOnline: "All Domestic Nodes Online",
    liveTelemetry: "Live Telemetry Feed",
    consoleBreadcrumb: "Telemetry Console",
    accountSecurity: "Account Security & Authentication",
    signOut: "Sign Out",
    langToggle: "🇸🇦 عربي / 🇬🇧 English",
    langToggleLabel: "Toggle Language"
  },

  // 12 Egyptian Retailers
  retailers: {
    AMZN_EG: "Amazon Egypt",
    NOON_EG: "Noon Egypt",
    BTECH_EG: "B.TECH",
    TRADELINE: "Tradeline",
    TRADELINE_EG: "Tradeline",
    JUMIA_EG: "Jumia Egypt",
    "2B_EG": "2B Egypt",
    TWOB_EG: "2B Egypt",
    RAYA_EG: "Raya Shop",
    ELARABY_EG: "El Araby Group",
    DUBAI_PHONE: "Dubai Phone",
    DUBAI_PHONE_EG: "Dubai Phone",
    DREAM_2000: "Dream 2000",
    DREAM2000_EG: "Dream 2000",
    VODAFONE_EG: "Vodafone Egypt",
    CARREFOUR_EG: "Carrefour Egypt",
    generic: "Verified Domestic Retailer"
  },

  // Metrics & KPI Cards
  kpis: {
    monitoredSkus: "Monitored SKUs",
    monitoredSkusSub: "Real-time pricing tracking over rolling 90 days",
    activeRetailers: "Active Domestic Retailers",
    activeRetailersSub: "Live connection across 12 domestic commerce nodes",
    glitchesIntercepted: "Intercepted Price Glitches",
    glitchesInterceptedSub: "Deceptive markups and flash pricing anomalies",
    arbitrageSavings: "Estimated Arbitrage Savings",
    arbitrageSavingsSub: "Total spread between lowest and highest nodes",
    baselineMedian: "90D Baseline Median Price",
    allTimeLow: "All-Time Low Price",
    trueSavings: "Net Economic Savings",
    truthIndex: "Discount Truth Index",
    marketSpread: "Average Price Spread",
    liveNodes: "live nodes"
  },

  // Comparison Matrix & Table
  matrix: {
    title: "12-Platform Market Comparison Matrix",
    subtitle: "Real-time price spreads, stock telemetry, warranty status, and discount truth scores across Egypt's domestic market.",
    columns: {
      retailer: "Retailer & Node",
      currentPrice: "Current Price & Delta",
      originalPrice: "Claimed Was Price",
      discount: "Discount",
      stock: "Stock Telemetry",
      rating: "Rating & Reviews",
      warranty: "Official Warranty",
      materials: "Build & Materials",
      actions: "Actions",
      integrity: "Truth Score",
      landedCost: "Landed Cost",
      lastScraped: "Audited"
    },
    badges: {
      bestDeal: "Cheapest at {retailer}",
      inStock: "In Stock",
      lowStock: "Low Stock ({count} left)",
      outOfStock: "Out of Stock",
      ghostMarkup: "Alert: Ghost Markup (Pre-promo price jack)",
      genuineDiscount: "Genuine Discount (Below 90D baseline)",
      ntraApproved: "NTRA Egypt Telecom Approved",
      imported: "Imported / No Domestic Warranty",
      officialWarranty: "Official Domestic Warranty",
      verifiedSeller: "Verified Official Seller",
      unverifiedSeller: "Third-Party Merchant"
    },
    actions: {
      reAudit: "Re-audit Node Price",
      syncing: "Auditing Node...",
      visitStore: "Acquire via Official Retailer",
      acquireVia: "Acquire via {retailer}",
      addToWatchlist: "Add to Watchlist",
      setPriceTarget: "Set Price Target",
      inspectSku: "Inspect Curve & Telemetry",
      filterAll: "All Monitored Products",
      filterInStock: "In-Stock Only",
      filterDeals: "Verified Deals Only"
    },
    searchPlaceholder: "Filter nodes, pricing, or warranty terms..."
  },

  // Specifications & Materials
  specs: {
    title: "Technical Specifications & Hardware Audit",
    chassis: "Chassis & Frame Material",
    frontGlass: "Front Glass Protection",
    backGlass: "Back Glass Finish",
    thermal: "Internal Thermal Dissipation",
    waterResistance: "Ingress Protection (Water/Dust)",
    processor: "Processor & SoC",
    weight: "Net Weight",
    durabilityScore: "Durability & Drop Index",
    scratchScore: "Scratch Resistance Index",
    batteryHealth: "Battery Capacity & Charging",
    cellularNetwork: "Egyptian Cellular Band Support"
  },

  // Watchlist & Alerts
  alerts: {
    title: "Notification Center & Alert Triggers",
    noAlerts: "No new price alerts or anomalies at this time",
    targetTrigger: "Target Price Trigger",
    targetPriceLabel: "Alert me when price drops to:",
    targetPricePlaceholder: "Enter target price in EGP (e.g. 35,000)",
    saveRule: "Save Watchlist Target",
    savingRule: "Saving Alert Rule...",
    ruleSaved: "Product added to watchlist and alert rule registered",
    emailNotice: "Instant notification dispatched via Brevo Email",
    markAllRead: "Mark All Read",
    clearAll: "Clear All Alerts",
    unread: "Unread",
    activeTargets: "Active Watchlist Targets",
    dropDetected: "Price Drop Intercepted",
    flashCrash: "Flash Crash Detected",
    anomalousDrop: "Exceptional Arbitrage Spread"
  },

  // Arbitrage Engine
  arbitrage: {
    title: "Arbitrage Spread & Profit Engine (12 Domestic Nodes)",
    subtitle: "Real-time spread detection identifying buy-low opportunities across Egypt's 12 major commerce platforms.",
    spreadLeaders: "Spread Leaderboards (Top Arbitrage Opportunities)",
    buyFrom: "Acquire Best Price via",
    benchmarkRetailer: "Highest Market Benchmark at",
    grossSpread: "Gross Price Spread",
    marginPercent: "Arbitrage Margin",
    netProfit: "Net Margin After Logistics",
    acquireButton: "Capture Spread via Cheapest Node",
    minSpreadFilter: "Min Spread: {amount} EGP",
    filterCategory: "Product Category",
    allCategories: "All Categories",
    topSpreadNotice: "High-yield arbitrage spread active in Egyptian market"
  },

  // Retailer Health & Telemetry Nodes
  health: {
    title: "Retailer Health, Latency & Node Telemetry",
    subtitle: "Continuous ping benchmarking, audit throughput, and 90-day truth compliance across all 12 domestic platforms.",
    fleetPingAvg: "Average Fleet Ping Latency",
    truthScoreAvg: "90-Day Market Truth Score",
    onlineNodes: "Healthy Domestic Nodes",
    pingMs: "{ms} ms",
    uptimePercent: "Uptime {pct}%",
    statusOnline: "Operational & Responsive",
    statusSlow: "High Latency / Under Observation",
    statusDown: "Unresponsive / Offline",
    recheckFleet: "Recheck Node Latency Now",
    rechecking: "Probing Node Latency...",
    requestsPerMin: "{count} req/min",
    integrityGrade: "Integrity Grade: {grade}"
  },

  // Glitch Radar & Truth Forensics
  radar: {
    title: "Glitch Radar & Forensic Price Deception Audit",
    subtitle: "Forensic audit system identifying artificial reference price inflation and fake pre-promotional discounts.",
    interceptLog: "Real-Time Intercept Stream",
    averageGhostMarkup: "Average Ghost Markup Spike",
    deceptionDelta: "Advertised vs Real Discount Delta",
    cpaCompliance: "CPA Egypt Law 181/2018 Compliance",
    lawComplianceNotice: "Cryptographic evidence log conforming to Articles 9 & 10 of Egyptian Consumer Protection Law",
    verifiedEvidence: "Forensic Evidence Log",
    realPriceWas: "Genuine 30D Base Price",
    claimedPriceWas: "Claimed Was / Shelf Price",
    actualShelfPrice: "Current Active Shelf Price",
    claimedVsRealDiscount: "{claimed}% claimed vs {real}% real",
    auditNodeNow: "Re-audit Node Price",
    auditingNode: "Auditing Node...",
    filterSeverity: "Severity Filter",
    allSeverities: "All Severities",
    severityCritical: "CRITICAL",
    severityHigh: "HIGH",
    severityMedium: "MEDIUM",
    zeroAnomalies: "Zero deceptive pricing anomalies currently detected. All nodes conform to baseline standards."
  },

  // Reports & Data Exports
  reports: {
    title: "Enterprise Market Exports & Audit Reports",
    subtitle: "Download high-precision price datasets formatted for enterprise ERPs, trading models, and CPA compliance.",
    exportCsv: "Export Monitored SKUs (CSV)",
    exportJson: "Export Arbitrage Log (JSON)",
    printAudit: "Print Official Audit Report",
    exportingCsv: "Generating CSV...",
    exportingJson: "Generating JSON...",
    exportScope: "Export Scope",
    allCategories: "All Categories",
    inStockOnly: "In-Stock Listings Only",
    officialReportTitle: "Egyptian Retail Price Integrity & Anti-Deception Audit",
    officialReportSubtitle: "Comprehensive consumer protection audit covering Egypt's top 12 electronic commerce platforms.",
    reportRef: "REF: CWX-AUD-2026-Q4-EG",
    generatedDate: "Generated: {date}",
    windowRolling: "Audit Window: Rolling 90 Days",
    scorecardSection: "1. Domestic Retailer Price Integrity Scorecard (90 Days)",
    interceptSection: "2. Forensic Intercept Log: Artificial Anchor Prices & Ghost Markups",
    hashVerification: "CRYPTOGRAPHIC HASH VERIFIED TELEMETRY SNAPSHOT"
  },

  // SKU Inspector Drawer
  drawer: {
    title: "SKU Forensic Telemetry & Cost Breakdown",
    retailPrice: "Current Shelf Price",
    genuineBaseline: "Genuine Market Median (90D)",
    ghostMarkupAlert: "Alert: Ghost Markup (Pre-promo price jack)",
    genuineDiscountConfirmed: "Genuine Verified Markdown from Median",
    landedCostBreakdown: "Landed Cost Breakdown (EGP)",
    basePrice: "Base Product Price",
    vatNotice: "Inclusive of 14% Egyptian VAT",
    shippingCost: "Domestic Shipping Fee",
    freeShipping: "Free Shipping Available",
    authenticityNotice: "100% Authentic Guaranteed via Official Retailer",
    cpaProtected: "Protected under Egyptian Consumer Protection Law 181/2018",
    setTargetPrice: "Track SKU & Register Target Price",
    targetPriceLabel: "Set Target Purchase Price (EGP):",
    saveTargetButton: "Save Alert Trigger",
    savingTarget: "Saving Alert Rule...",
    targetActiveMsg: "You will be alerted immediately when the price drops to this level.",
    reAuditProduct: "↻ Re-audit Node Price Now"
  },

  // Add SKU Modal
  modal: {
    addTitle: "Add New Monitored SKU to Telemetry Fleet",
    addSubtitle: "Enter product URL or barcode to initiate continuous scraping across 12 domestic Egyptian retailers.",
    productTitleLabel: "Product Title & Model",
    productTitlePlaceholder: "e.g. iPhone 16 Pro Max 256GB Natural Titanium",
    categoryLabel: "Category",
    brandLabel: "Brand",
    barcodeLabel: "Barcode (EAN-13)",
    barcodePlaceholder: "e.g. 6221000123456",
    retailerUrlLabel: "Product URL on Store",
    retailerUrlPlaceholder: "https://www.amazon.eg/dp/... or noon.com/egypt-en/...",
    trackingFrequency: "Telemetry Scraping Interval",
    freq15m: "Every 15 minutes (Recommended for volatile items)",
    freq1h: "Every 1 hour",
    freq6h: "Every 6 hours",
    submitButton: "Initiate Fleet Monitoring",
    submitting: "Auditing & Connecting Nodes...",
    cancelButton: "Cancel",
    successMsg: "Product registered successfully. Initial scraping started across 12 domestic retailers."
  },

  // Tooltips & Help Explainers
  tooltips: {
    truthIndex: "This metric detects whether an advertised discount is genuine or if the store artificially inflated the price beforehand.",
    baselineMedian: "The genuine median market price for this product in Egypt calculated over the past 90 rolling days.",
    arbitrageMargin: "The percentage savings or profit available when buying from the cheapest node compared to the market benchmark.",
    retailerHealth: "Live telemetry measuring platform ping latency, HTTP responsiveness, and catalog freshness.",
    landedCost: "The all-inclusive amount you will actually pay, including product price, 14% VAT, and door-to-door delivery."
  },

  // Common UI Elements & Formats
  common: {
    egp: "EGP",
    egpSuffix: "EGP",
    usd: "USD",
    percent: "%",
    inStock: "In Stock",
    outOfStock: "Out of Stock",
    loading: "Loading...",
    error: "An unexpected error occurred",
    retry: "Retry",
    save: "Save",
    saved: "Saved",
    cancel: "Cancel",
    delete: "Delete",
    confirm: "Confirm",
    close: "Close",
    view: "View",
    details: "Details",
    refresh: "Refresh",
    search: "Search",
    filter: "Filter",
    all: "All",
    active: "Active",
    inactive: "Inactive",
    justNow: "Just now",
    minutesAgo: "{count}m ago",
    hoursAgo: "{count}h ago",
    daysAgo: "{count}d ago",
    success: "Operation completed successfully"
  }
};
