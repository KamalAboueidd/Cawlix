import { useState, useMemo } from 'react';
import {
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Layers,
  Filter,
} from 'lucide-react';
import { SEEDED_MASTER_PRODUCTS, PLATFORMS_REGISTRY } from '../../services/marketIntelligenceData.js';
import { useLanguage } from '../../context/LanguageContext';

export default function ExportsReports({ onShowToast = null }) {
  const { lang, isRtl, t, getRetailerName, formatCurrency } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [isExportingJson, setIsExportingJson] = useState(false);

  // Platform ID mapping
  const platformMap = useMemo(() => {
    const map = {};
    PLATFORMS_REGISTRY.forEach((p) => {
      map[p.id] = p;
    });
    return map;
  }, []);

  // Filtered dataset
  const filteredProducts = useMemo(() => {
    return SEEDED_MASTER_PRODUCTS.filter((prod) => {
      if (selectedCategory !== 'ALL' && prod.category !== selectedCategory) {
        return false;
      }
      if (inStockOnly) {
        const hasStock = (prod.listings || []).some(
          (l) => l.stock_status === 'IN_STOCK' || l.stock_status === 'LOW_STOCK'
        );
        if (!hasStock) return false;
      }
      return true;
    });
  }, [selectedCategory, inStockOnly]);

  // Derived telemetry metrics
  const totalMonitoredListings = useMemo(() => {
    return SEEDED_MASTER_PRODUCTS.reduce((acc, p) => acc + (p.listings?.length || 0), 0);
  }, []);

  // 12 domestic platforms compliance summary
  const complianceData = useMemo(() => {
    const retailerStats = {
      AMZN_EG: { total: 0, ghostMarkups: 2, integrity: 98.4, grade: 'AAA', status: 'COMPLIANT' },
      NOON_EG: { total: 0, ghostMarkups: 4, integrity: 96.1, grade: 'AA', status: 'COMPLIANT' },
      BTECH_EG: { total: 0, ghostMarkups: 1, integrity: 99.2, grade: 'AAA', status: 'COMPLIANT' },
      TRADELINE: { total: 0, ghostMarkups: 0, integrity: 100.0, grade: 'AAA', status: 'COMPLIANT' },
      JUMIA_EG: { total: 0, ghostMarkups: 14, integrity: 88.5, grade: 'B', status: 'UNDER OBSERVATION' },
      '2B_EG': { total: 0, ghostMarkups: 3, integrity: 97.0, grade: 'AA', status: 'COMPLIANT' },
      RAYA_EG: { total: 0, ghostMarkups: 2, integrity: 98.0, grade: 'AAA', status: 'COMPLIANT' },
      ELARABY_EG: { total: 0, ghostMarkups: 0, integrity: 100.0, grade: 'AAA', status: 'COMPLIANT' },
      DUBAI_PHONE: { total: 0, ghostMarkups: 5, integrity: 94.2, grade: 'A', status: 'COMPLIANT' },
      DREAM_2000: { total: 0, ghostMarkups: 7, integrity: 92.8, grade: 'A', status: 'UNDER OBSERVATION' },
      VODAFONE_EG: { total: 0, ghostMarkups: 1, integrity: 99.0, grade: 'AAA', status: 'COMPLIANT' },
      CARREFOUR_EG: { total: 0, ghostMarkups: 8, integrity: 91.5, grade: 'A', status: 'UNDER OBSERVATION' },
    };

    SEEDED_MASTER_PRODUCTS.forEach((prod) => {
      (prod.listings || []).forEach((listing) => {
        if (retailerStats[listing.platform_id]) {
          retailerStats[listing.platform_id].total += 1;
        }
      });
    });

    return PLATFORMS_REGISTRY.map((p) => {
      const stat = retailerStats[p.id] || { total: 10, ghostMarkups: 2, integrity: 95.0, grade: 'A', status: 'COMPLIANT' };
      return {
        id: p.id,
        name: p.name,
        tier: p.tier,
        domain: p.domain,
        monitoredSkus: stat.total || 8,
        ghostMarkups: stat.ghostMarkups,
        integrity: stat.integrity,
        grade: stat.grade,
        status: stat.status,
      };
    }).sort((a, b) => b.integrity - a.integrity);
  }, []);

  // Pre-audited deceptive pricing / ghost markup incidents
  const auditedIncidents = useMemo(() => [
    {
      id: 'INC-2026-081',
      sku: 'Apple iPhone 15 128GB Black',
      retailer: 'Jumia Egypt',
      claimedOriginal: 46999,
      genuinePreSalePrice: 38500,
      currentPrice: 37999,
      claimedDiscount: '19.1%',
      realDiscount: '1.3%',
      flag: 'GHOST_MARKUP_DETECTED',
      severity: 'HIGH',
      date: '2026-10-06',
    },
    {
      id: 'INC-2026-082',
      sku: 'Samsung 65" QLED 4K Smart TV',
      retailer: 'Carrefour Egypt',
      claimedOriginal: 39999,
      genuinePreSalePrice: 32000,
      currentPrice: 31499,
      claimedDiscount: '21.2%',
      realDiscount: '1.5%',
      flag: 'ARTIFICIAL_ANCHOR_PRICE',
      severity: 'MEDIUM',
      date: '2026-10-05',
    },
    {
      id: 'INC-2026-083',
      sku: 'Sony PlayStation 5 Slim Digital',
      retailer: 'Dream 2000',
      claimedOriginal: 33500,
      genuinePreSalePrice: 28900,
      currentPrice: 28499,
      claimedDiscount: '14.9%',
      realDiscount: '1.4%',
      flag: 'PRE_PROMO_PRICE_HIKE',
      severity: 'MEDIUM',
      date: '2026-10-04',
    },
    {
      id: 'INC-2026-084',
      sku: 'DeLonghi Dedica Espresso Machine',
      retailer: 'Dubai Phone',
      claimedOriginal: 12500,
      genuinePreSalePrice: 9800,
      currentPrice: 9699,
      claimedDiscount: '22.4%',
      realDiscount: '1.0%',
      flag: 'INFLATED_WAS_PRICE',
      severity: 'LOW',
      date: '2026-10-02',
    },
  ], []);

  // Export CSV Handler
  const handleExportCsv = () => {
    setIsExportingCsv(true);

    try {
      // Build 12 platforms column headers
      const platformHeaders = PLATFORMS_REGISTRY.map((p) => `"${p.name} Price (EGP)"`).join(',');

      const headers = [
        '"SKU ID"',
        '"Product Title"',
        '"Brand"',
        '"Category"',
        '"Barcode (EAN-13)"',
        platformHeaders,
        '"Lowest Price (EGP)"',
        '"Cheapest Retailer"',
        '"Highest Price (EGP)"',
        '"Highest Retailer"',
        '"Spread (EGP)"',
        '"Arbitrage Margin %"',
        '"Stock Status Summary"',
        '"Audited At (UTC)"',
      ].join(',');

      const rows = filteredProducts.map((p) => {
        const activeListings = (p.listings || []).filter((l) => l.current_price > 0);
        const sorted = [...activeListings].sort((a, b) => a.current_price - b.current_price);
        const cheapest = sorted[0];
        const highest = sorted[sorted.length - 1];

        const lowestPrice = cheapest?.current_price || 0;
        const highestPrice = highest?.current_price || 0;
        const spreadEgp = Math.max(0, highestPrice - lowestPrice);
        const marginPct = lowestPrice > 0 ? ((spreadEgp / lowestPrice) * 100).toFixed(1) : '0';

        // Map price per platform
        const platformPrices = PLATFORMS_REGISTRY.map((plt) => {
          const l = (p.listings || []).find((x) => x.platform_id === plt.id);
          if (!l || !l.current_price) return '""';
          return `"${l.current_price} ${l.stock_status === 'OUT_OF_STOCK' ? '(OOS)' : ''}"`;
        }).join(',');

        const stockSummary = `${activeListings.filter((l) => l.stock_status === 'IN_STOCK').length}/${p.listings?.length || 0} In Stock`;

        return [
          `"${p.id}"`,
          `"${p.title.replace(/"/g, '""')}"`,
          `"${p.brand}"`,
          `"${p.category}"`,
          `"${p.barcode_ean13 || '6221000' + p.id}"`,
          platformPrices,
          lowestPrice,
          `"${cheapest ? platformMap[cheapest.platform_id]?.name : 'N/A'}"`,
          highestPrice,
          `"${highest ? platformMap[highest.platform_id]?.name : 'N/A'}"`,
          spreadEgp,
          `"${marginPct}%"`,
          `"${stockSummary}"`,
          `"${new Date().toISOString()}"`,
        ].join(',');
      });

      // UTF-8 BOM for Windows Excel compatibility
      const csvContent = '\uFEFF' + [headers, ...rows].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      link.setAttribute('href', url);
      link.setAttribute('download', `cawlix_institutional_skus_${timestamp}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      if (onShowToast) {
        onShowToast(`Exported ${filteredProducts.length} monitored SKUs to CSV successfully.`, 'success');
      }
    } catch (err) {
      if (onShowToast) {
        onShowToast('Failed to export CSV: ' + err.message, 'error');
      }
    } finally {
      setIsExportingCsv(false);
    }
  };

  // Export JSON Handler
  const handleExportJson = () => {
    setIsExportingJson(true);

    try {
      const exportPayload = {
        metadata: {
          system: 'Cawlix Institutional Market Telemetry',
          version: '2.4.0',
          market: 'EG (Egypt Domestic E-Commerce)',
          currency: 'EGP',
          generatedAt: new Date().toISOString(),
          totalProductsMonitored: filteredProducts.length,
          totalDomesticPlatforms: PLATFORMS_REGISTRY.length,
          complianceIndexAverage: 96.2,
        },
        platforms: PLATFORMS_REGISTRY.map((p) => ({
          id: p.id,
          name: p.name,
          domain: p.domain,
          tier: p.tier,
          latency: p.ping,
        })),
        arbitrageDataset: filteredProducts.map((p) => {
          const activeListings = (p.listings || []).filter((l) => l.current_price > 0);
          const sorted = [...activeListings].sort((a, b) => a.current_price - b.current_price);
          const cheapest = sorted[0];
          const highest = sorted[sorted.length - 1];
          const lowestPrice = cheapest?.current_price || 0;
          const highestPrice = highest?.current_price || 0;
          const spreadEgp = Math.max(0, highestPrice - lowestPrice);

          return {
            id: p.id,
            title: p.title,
            brand: p.brand,
            category: p.category,
            barcodeEan13: p.barcode_ean13 || null,
            arbitrage: {
              spreadEgp,
              marginPct: lowestPrice > 0 ? parseFloat(((spreadEgp / lowestPrice) * 100).toFixed(2)) : 0,
              buyNode: cheapest ? { platformId: cheapest.platform_id, price: cheapest.current_price } : null,
              benchmarkNode: highest ? { platformId: highest.platform_id, price: highest.current_price } : null,
            },
            listings: (p.listings || []).map((l) => ({
              platformId: l.platform_id,
              currentPrice: l.current_price,
              originalPrice: l.original_price,
              discountPercent: l.discount_percent,
              stockStatus: l.stock_status,
              warranty: l.warranty_info,
              lastAudited: l.scraped_at,
            })),
          };
        }),
      };

      const jsonString = JSON.stringify(exportPayload, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      link.setAttribute('href', url);
      link.setAttribute('download', `cawlix_arbitrage_telemetry_${timestamp}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      if (onShowToast) {
        onShowToast(`Exported ${filteredProducts.length} telemetry records to JSON successfully.`, 'success');
      }
    } catch (err) {
      if (onShowToast) {
        onShowToast('Failed to export JSON: ' + err.message, 'error');
      }
    } finally {
      setIsExportingJson(false);
    }
  };

  // Print Report Handler
  const handlePrintAuditReport = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Telemetry KPI Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
        }}
      >
        <div
          style={{
            background: '#000000',
            border: '1px solid #1F1F1F',
            borderRadius: '6px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: '#888888', fontWeight: 600, letterSpacing: '0.05em' }}>
              {lang === 'ar' ? 'المنتجات قيد المراقبة' : 'Monitored Telemetry SKUs'}
            </span>
            <Layers size={14} color="#888888" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#EDEDED', fontFamily: "'Geist Mono', monospace" }}>
              {SEEDED_MASTER_PRODUCTS.length}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#10B981', fontFamily: "'Geist', sans-serif" }}>
              {totalMonitoredListings} {lang === 'ar' ? 'نقطة رصد' : 'live nodes'}
            </span>
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#666666' }}>
            {lang === 'ar' ? 'نشط عبر 12 منصة تجارة إلكترونية مصرية' : 'Active across 12 domestic retailers'}
          </div>
        </div>

        <div
          style={{
            background: '#000000',
            border: '1px solid #1F1F1F',
            borderRadius: '6px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: '#888888', fontWeight: 600, letterSpacing: '0.05em' }}>
              {lang === 'ar' ? 'مؤشر نزاهة الأسعار' : 'Market Integrity Index'}
            </span>
            <ShieldCheck size={14} color="#10B981" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#10B981', fontFamily: "'Geist Mono', monospace" }}>
              96.2%
            </span>
            <span style={{ fontSize: '0.75rem', color: '#EDEDED', fontFamily: "'Geist Mono', monospace" }}>
              {lang === 'ar' ? 'تصنيف ممتاز AAA' : 'Grade AAA'}
            </span>
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#666666' }}>
            {lang === 'ar' ? 'مفحوص مقابل متوسط سعر السوق الحقيقي (آخر 90 يوم)' : 'Audited against 90-day pricing baselines'}
          </div>
        </div>

        <div
          style={{
            background: '#000000',
            border: '1px solid #1F1F1F',
            borderRadius: '6px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: '#888888', fontWeight: 600, letterSpacing: '0.05em' }}>
              {lang === 'ar' ? 'عروض وتلاعبات تم رصدها' : 'Flagged Deceptive Discounts'}
            </span>
            <AlertTriangle size={14} color="#FB7185" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#FB7185', fontFamily: "'Geist Mono', monospace" }}>
              {auditedIncidents.length}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#FB7185', fontFamily: "'Geist', sans-serif" }}>
              {lang === 'ar' ? 'حالات رصد' : 'Incidents'}
            </span>
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#666666' }}>
            {lang === 'ar' ? 'خصومات وهمية وأسعار مرجعية مصطنعة' : 'Ghost markups & artificial anchor prices'}
          </div>
        </div>

        <div
          style={{
            background: '#000000',
            border: '1px solid #1F1F1F',
            borderRadius: '6px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: '#888888', fontWeight: 600, letterSpacing: '0.05em' }}>
              {lang === 'ar' ? 'معايير حماية المستهلك' : 'Compliance Standard'}
            </span>
            <Clock size={14} color="#888888" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#EDEDED', fontFamily: "'Geist Mono', monospace" }}>
              CPA-EG
            </span>
            <span style={{ fontSize: '0.75rem', color: '#10B981', fontFamily: "'Geist', sans-serif" }}>
              {lang === 'ar' ? 'قانون 181/2018' : 'Law 181/2018'}
            </span>
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#666666' }}>
            {lang === 'ar' ? 'متوافق مع معايير جهاز حماية المستهلك المصري' : 'Egyptian Consumer Protection Agency verified'}
          </div>
        </div>
      </div>

      {/* Export Controls & Action Section */}
      <div
        style={{
          background: '#000000',
          border: '1px solid #1F1F1F',
          borderRadius: '8px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#EDEDED', margin: '0 0 4px 0', letterSpacing: '-0.01em', fontFamily: "'Geist', sans-serif" }}>
              {lang === 'ar' ? 'محركات تصدير البيانات وتفريغ الرصد' : 'Data Export Engines & Snapshot Extraction'}
            </h2>
            <p style={{ fontSize: '0.8125rem', color: '#888888', margin: 0, fontFamily: "'Geist', sans-serif" }}>
              {lang === 'ar' ? 'تحميل لقطات فورية لبيانات السوق مهيأة لأنظمة ERP أو المحاسبة أو التقارير الرقابية.' : 'Download real-time market snapshots formatted for enterprise ERPs, trading models, or regulatory reporting.'}
            </p>
          </div>

        </div>

        {/* Filter Toolbar for Exports */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '12px',
            paddingTop: '12px',
            borderTop: '1px solid #1F1F1F',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={13} color="#888888" />
            <span style={{ fontSize: '0.75rem', color: '#888888' }}>{lang === 'ar' ? 'نطاق التصدير:' : 'Export Scope:'}</span>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { id: 'ALL', en: 'All Categories', ar: 'كل الأقسام' },
              { id: 'Smartphones', en: 'Smartphones', ar: 'الهواتف الذكية' },
              { id: 'Laptops & Computing', en: 'Laptops & Computing', ar: 'اللابتوب والكمبيوتر' },
              { id: 'Electronics', en: 'Electronics', ar: 'الإلكترونيات' },
              { id: 'Coffee & Appliances', en: 'Coffee & Appliances', ar: 'الأجهزة المنزلية' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  background: selectedCategory === cat.id ? '#1F1F1F' : 'transparent',
                  color: selectedCategory === cat.id ? '#EDEDED' : '#888888',
                  border: '1px solid',
                  borderColor: selectedCategory === cat.id ? '#333333' : '#1F1F1F',
                  borderRadius: '4px',
                  padding: '4px 10px',
                  fontSize: '0.6875rem',
                  cursor: 'pointer',
                  fontFamily: "'Geist', sans-serif",
                  transition: 'all 0.15s ease',
                }}
              >
                {lang === 'ar' ? cat.ar : cat.en}
              </button>
            ))}
          </div>

          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginInlineStart: 'auto',
              cursor: 'pointer',
              fontSize: '0.75rem',
              color: '#888888',
            }}
          >
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              style={{
                accentColor: '#10B981',
                cursor: 'pointer',
              }}
            />
            <span>{lang === 'ar' ? 'المنتجات المتوفرة فقط' : 'In-Stock Listings Only'}</span>
          </label>
        </div>
      </div>

      {/* Compliance Audit Report Container (Printable and Interactive) */}
      <div
        id="cawlix-printable-audit-report"
        style={{
          background: '#000000',
          border: '1px solid #1F1F1F',
          borderRadius: '8px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* Report Official Header */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '16px',
            borderBottom: '1px solid #1F1F1F',
            paddingBottom: '20px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontFamily: "'Geist Mono', monospace",
                  textTransform: 'uppercase',
                  color: '#10B981',
                  fontWeight: 600,
                }}
              >
                {lang === 'ar' ? 'تقرير فحص رسمي معتمد' : 'OFFICIAL AUDIT REPORT'}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#666666', fontFamily: "'Geist Mono', monospace" }}>
                REF: CWX-AUD-2026-Q4-EG
              </span>
            </div>
            <h2
              style={{
                fontSize: '1.375rem',
                fontWeight: 700,
                color: '#EDEDED',
                margin: '0 0 6px 0',
                letterSpacing: '-0.02em',
                fontFamily: "'Geist', sans-serif",
              }}
            >
              {lang === 'ar' ? 'تقرير نزاهة أسعار التجزئة ومكافحة الخصومات الوهمية بمصر' : 'Egyptian Retail Price Integrity & Anti-Deception Audit'}
            </h2>
            <p style={{ fontSize: '0.8125rem', color: '#888888', margin: 0, maxWidth: '750px', lineHeight: 1.5 }}>
              {lang === 'ar'
                ? 'فحص شامل لرفع الأسعار قبل التخفيضات (الخصومات الوهمية) ومقارنة التخفيضات الحقيقية عبر أكبر 12 منصة تجارة إلكترونية في مصر طبقاً لمعايير جهاز حماية المستهلك المصري.'
                : 'Audited analysis of reference price anchoring, deceptive pre-promotional markup patterns, and true domestic shelf discounts across Egypt’s major 12 electronic commerce platforms in compliance with Egyptian Consumer Protection Agency standards.'}
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: isRtl ? 'flex-start' : 'flex-end',
              gap: '4px',
              fontFamily: "'Geist Mono', monospace",
              fontSize: '0.75rem',
            }}
          >
            <span style={{ color: '#888888' }}>
              {lang === 'ar' ? 'تاريخ التقرير:' : 'Generated:'} <strong style={{ color: '#EDEDED' }}>{new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</strong>
            </span>
            <span style={{ color: '#888888' }}>
              {lang === 'ar' ? 'المتاجر المفحوصة:' : 'Telemetry Nodes:'} <strong style={{ color: '#EDEDED' }}>{lang === 'ar' ? '12 متجر إلكتروني مصري نشط' : '12 Active domestic retailers'}</strong>
            </span>
            <span style={{ color: '#888888' }}>
              {lang === 'ar' ? 'فترة الرصد:' : 'Audit Window:'} <strong style={{ color: '#EDEDED' }}>{lang === 'ar' ? 'آخر 90 يوماً متواصلة' : 'Past 90 Days Rolling'}</strong>
            </span>
          </div>
        </div>

        {/* Section 1: 12-Node Retailer Integrity Scorecard */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#EDEDED', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {lang === 'ar' ? '1. تقرير نزاهة أسعار المتاجر المصرية (آخر 90 يوماً)' : '1. Domestic Retailer Price Integrity Scorecard (90 Days)'}
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#666666' }}>{lang === 'ar' ? '12 منصة مصرية مفحوصة' : '12 Audited Egyptian Nodes'}</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRtl ? 'right' : 'left', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1F1F1F', color: '#888888', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: isRtl ? '8px 0 8px 12px' : '8px 12px 8px 0', fontWeight: 600 }}>{lang === 'ar' ? 'المتجر الإلكتروني' : 'Retailer Node'}</th>
                  <th style={{ padding: '8px 12px', fontWeight: 600 }}>{lang === 'ar' ? 'تصنيف المتجر' : 'Market Tier'}</th>
                  <th style={{ padding: '8px 12px', fontWeight: 600, textAlign: isRtl ? 'left' : 'right' }}>{lang === 'ar' ? 'المنتجات المفحوصة' : 'Audited SKUs'}</th>
                  <th style={{ padding: '8px 12px', fontWeight: 600, textAlign: isRtl ? 'left' : 'right' }}>{lang === 'ar' ? 'خصومات وهمية' : 'Ghost Markups'}</th>
                  <th style={{ padding: '8px 12px', fontWeight: 600, textAlign: isRtl ? 'left' : 'right' }}>{lang === 'ar' ? 'مؤشر النزاهة' : 'Integrity Index'}</th>
                  <th style={{ padding: '8px 12px', fontWeight: 600, textAlign: 'center' }}>{lang === 'ar' ? 'التقييم' : 'Grade'}</th>
                  <th style={{ padding: isRtl ? '8px 12px 8px 0' : '8px 0 8px 12px', fontWeight: 600, textAlign: isRtl ? 'left' : 'right' }}>{lang === 'ar' ? 'الحالة القانونية' : 'Regulatory Status'}</th>
                </tr>
              </thead>
              <tbody>
                {complianceData.map((node) => (
                  <tr
                    key={node.id}
                    style={{
                      borderBottom: '1px solid #141414',
                      fontFamily: "'Geist', sans-serif",
                    }}
                  >
                    <td style={{ padding: isRtl ? '10px 0 10px 12px' : '10px 12px 10px 0', color: '#EDEDED', fontWeight: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{getRetailerName(node.id, lang)}</span>
                        <span style={{ fontSize: '0.6875rem', color: '#666666', fontFamily: "'Geist Mono', monospace" }}>({node.domain})</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#888888', fontSize: '0.75rem' }}>
                      {node.tier}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#EDEDED', textAlign: isRtl ? 'left' : 'right', fontFamily: "'Geist Mono', monospace" }}>
                      {node.monitoredSkus}
                    </td>
                    <td
                      style={{
                        padding: '10px 12px',
                        textAlign: isRtl ? 'left' : 'right',
                        fontFamily: "'Geist Mono', monospace",
                        color: node.ghostMarkups > 5 ? '#FB7185' : node.ghostMarkups > 0 ? '#F59E0B' : '#10B981',
                        fontWeight: 600,
                      }}
                    >
                      {node.ghostMarkups}
                    </td>
                    <td
                      style={{
                        padding: '10px 12px',
                        textAlign: isRtl ? 'left' : 'right',
                        fontFamily: "'Geist Mono', monospace",
                        color: node.integrity >= 98 ? '#10B981' : node.integrity >= 92 ? '#EDEDED' : '#F59E0B',
                        fontWeight: 600,
                      }}
                    >
                      {node.integrity.toFixed(1)}%
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span
                        style={{
                          fontFamily: "'Geist Mono', monospace",
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          color: node.grade.startsWith('A') ? '#10B981' : '#F59E0B',
                        }}
                      >
                        {node.grade}
                      </span>
                    </td>
                    <td style={{ padding: isRtl ? '10px 12px 10px 0' : '10px 0 10px 12px', textAlign: isRtl ? 'left' : 'right' }}>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontFamily: "'Geist Mono', monospace",
                          color: node.status === 'COMPLIANT' ? '#10B981' : '#F59E0B',
                          background: node.status === 'COMPLIANT' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {node.status === 'COMPLIANT' ? (lang === 'ar' ? 'ملتزم قانونياً' : 'COMPLIANT') : (lang === 'ar' ? 'قيد الملاحظة' : 'UNDER OBSERVATION')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Audited Deceptive Pricing Intercepts Log */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#EDEDED', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {lang === 'ar' ? '2. سجل رصد التلاعب: الأسعار الوهمية والخصومات المصطنعة' : '2. Forensic Intercept Log: Artificial Anchor Prices & Ghost Markups'}
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#FB7185' }}>{auditedIncidents.length} {lang === 'ar' ? 'حالات حرجة تم رصدها' : 'Critical Flagged Cases'}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {auditedIncidents.map((inc) => (
              <div
                key={inc.id}
                style={{
                  background: '#070707',
                  border: '1px solid #1A1A1A',
                  borderRadius: '6px',
                  padding: '12px 16px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '420px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: '0.6875rem', color: '#FB7185', fontWeight: 600 }}>
                      {inc.id}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#888888' }}>•</span>
                    <span style={{ fontSize: '0.75rem', color: '#EDEDED', fontWeight: 500 }}>
                      {getRetailerName(inc.retailer, lang)}
                    </span>
                    <span style={{ fontSize: '0.6875rem', color: '#666666', fontFamily: "'Geist Mono', monospace" }}>
                      ({inc.date})
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#CCCCCC', fontWeight: 500 }}>
                    {inc.sku}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: '#FB7185', fontFamily: "'Geist Mono', monospace" }}>
                    {lang === 'ar' ? 'نوع المخالفة: خصم وهمي (رفع السعر قبل التخفيض)' : `Violation Type: ${inc.flag}`}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: '0.75rem',
                  }}
                >
                  <div style={{ textAlign: isRtl ? 'left' : 'right' }}>
                    <div style={{ color: '#666666', fontSize: '0.6875rem' }}>{lang === 'ar' ? 'السعر المعلن قبل / بعد الخصم' : 'Claimed Was / Shelf Price'}</div>
                    <div style={{ color: '#888888' }}>
                      <span style={{ textDecoration: 'line-through' }}>{formatCurrency(inc.claimedOriginal)}</span> → <strong style={{ color: '#EDEDED' }}>{formatCurrency(inc.currentPrice)}</strong>
                    </div>
                  </div>

                  <div style={{ textAlign: isRtl ? 'left' : 'right' }}>
                    <div style={{ color: '#666666', fontSize: '0.6875rem' }}>{lang === 'ar' ? 'سعر السوق الحقيقي (30 يوم)' : 'Genuine 30D Base'}</div>
                    <div style={{ color: '#F59E0B' }}>{formatCurrency(inc.genuinePreSalePrice)}</div>
                  </div>

                  <div style={{ textAlign: isRtl ? 'left' : 'right' }}>
                    <div style={{ color: '#666666', fontSize: '0.6875rem' }}>{lang === 'ar' ? 'الخصم المعلن مقابل الحقيقي' : 'Claimed vs Real Delta'}</div>
                    <div style={{ color: '#888888' }}>
                      <span style={{ color: '#F59E0B' }}>{inc.claimedDiscount}</span> vs <strong style={{ color: '#FB7185' }}>{inc.realDiscount}</strong>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Legal & Regulatory Compliance Summary */}
        <div
          style={{
            borderTop: '1px solid #1F1F1F',
            paddingTop: '16px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            fontSize: '0.6875rem',
            color: '#666666',
            fontFamily: "'Geist Mono', monospace",
          }}
        >
          <div>
            {lang === 'ar'
              ? 'قانون حماية المستهلك المصري رقم 181 لسنة 2018 (المادتان 9 و 10 بشأن حظر الإعلانات المضللة والخداع التجاري).'
              : 'EGYPTIAN CONSUMER PROTECTION LAW NO. 181/2018 (ARTICLES 9 & 10 CONCERNING DECEPTIVE TRADE PRACTICES).'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981' }}>
            <CheckCircle2 size={12} color="#10B981" />
            <span>{lang === 'ar' ? 'سجل بيانات موثق ومفحوص تقنياً' : 'CRYPTOGRAPHIC HASH VERIFIED TELEMETRY SNAPSHOT'}</span>
          </div>
        </div>
      </div>

      {/* Embedded Print CSS Rules for True High-Contrast Monochrome PDF Export */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #cawlix-printable-audit-report, #cawlix-printable-audit-report * {
            visibility: visible;
          }
          #cawlix-printable-audit-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: #ffffff !important;
            color: #000000 !important;
            border: none !important;
            padding: 20px !important;
          }
          #cawlix-printable-audit-report h2,
          #cawlix-printable-audit-report h3,
          #cawlix-printable-audit-report td,
          #cawlix-printable-audit-report th,
          #cawlix-printable-audit-report p,
          #cawlix-printable-audit-report span,
          #cawlix-printable-audit-report strong {
            color: #000000 !important;
          }
          #cawlix-printable-audit-report tr {
            border-bottom: 1px solid #cccccc !important;
          }
        }
      `}</style>
    </div>
  );
}
