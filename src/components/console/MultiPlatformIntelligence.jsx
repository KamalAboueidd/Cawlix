import { useState, useMemo, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import {
  PLATFORMS_REGISTRY,
  SEEDED_MASTER_PRODUCTS,
  getMarketIntelligenceProducts,
  evaluateDiscountIntegrity,
} from '../../services/marketIntelligenceData';
import { auditProductListing } from '../../services/auditDispatcher';
import { sanitizeRetailerUrl } from '../../utils/urlSanitizer';
import {
  AlertTriangle,
  ExternalLink,
  Layers,
  Sparkles,
  CheckCircle2,
  Search,
  RefreshCw,
  BookmarkCheck,
  HelpCircle,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { addToUserWatchlist } from '../../services/dataWiringService.js';
import { supabase } from '../../lib/supabaseClient.js';

export default function MultiPlatformIntelligence({
  defaultProductId = null,
  resolvedProduct = null,
}) {
  const { lang, t, isRtl, getRetailerName, formatCurrency } = useLanguage();
  const [products, setProducts] = useState(SEEDED_MASTER_PRODUCTS);
  const [selectedProductId, setSelectedProductId] = useState(defaultProductId || SEEDED_MASTER_PRODUCTS[0].id);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('90D'); // '30D' | '60D' | '90D'
  const [stockFilter, setStockFilter] = useState('ALL'); // 'ALL' | 'IN_STOCK' | 'DEALS_ONLY'
  const [platformSearch, setPlatformSearch] = useState('');
  const [probingListingId, setProbingListingId] = useState(null);
  const [flashingListingIds, setFlashingListingIds] = useState({});
  const [auditToast, setAuditToast] = useState(null);

  // Sync resolvedProduct prop when passed from universal search
  useEffect(() => {
    if (resolvedProduct && resolvedProduct.id) {
      setProducts((prev) => {
        const exists = prev.some((p) => p.id === resolvedProduct.id);
        return exists
          ? prev.map((p) => (p.id === resolvedProduct.id ? resolvedProduct : p))
          : [resolvedProduct, ...prev];
      });
      setSelectedProductId(resolvedProduct.id);
    }
  }, [resolvedProduct]);

  useEffect(() => {
    if (defaultProductId) {
      setSelectedProductId(defaultProductId);
    }
  }, [defaultProductId]);

  // Handle direct re-audit on a specific platform listing
  const handleReAuditListing = async (listing) => {
    const listingKey = listing.platform_id || listing.id;
    if (probingListingId) return;
    setProbingListingId(listingKey);
    try {
      const telemetry = await auditProductListing(
        listing.id || `${activeProduct?.id}_${listing.platform_id}`,
        listing.listing_url || listing.url,
        listing.platform_id,
        { previousPrice: listing.current_price }
      );

      setFlashingListingIds((prev) => ({ ...prev, [listingKey]: true }));
      setTimeout(() => {
        setFlashingListingIds((prev) => ({ ...prev, [listingKey]: false }));
      }, 2400);

      setProducts((prev) =>
        prev.map((p) => {
          if (!activeProduct || p.id !== activeProduct.id) return p;
          const updatedListings = (p.platform_listings || []).map((l) => {
            if (l.platform_id === listing.platform_id) {
              return {
                ...l,
                current_price: telemetry.currentPrice,
                original_price: telemetry.originalPrice || l.original_price,
                stock_status: telemetry.inStock ? 'IN_STOCK' : 'OUT_OF_STOCK',
                rating: telemetry.rating || l.rating,
                reviews_count: telemetry.reviewsCount || l.reviews_count,
                warranty_info: telemetry.warrantyInfo || l.warranty_info,
                scraped_at: 'just now',
                isAudited: true,
              };
            }
            return l;
          });
          return { ...p, platform_listings: updatedListings };
        })
      );

      setAuditToast({
        type: 'success',
        message: `Audited ${listing.name}: EGP ${telemetry.currentPrice.toLocaleString()} (${telemetry.priceDeltaPct >= 0 ? '+' : ''}${telemetry.priceDeltaPct}%)`,
      });
      setTimeout(() => setAuditToast(null), 3500);
    } catch (err) {
      console.error('[Platform Card Re-Audit Error]:', err);
      setAuditToast({
        type: 'error',
        message: `Probe failed for ${listing.name}: ${err?.message || 'Connection timed out'}`,
      });
      setTimeout(() => setAuditToast(null), 4000);
    } finally {
      setProbingListingId(null);
    }
  };

  const handleWatchlistToggle = async (product, listing = null) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) {
        setAuditToast({
          type: 'error',
          message: isRtl ? 'يرجى تسجيل الدخول لإضافة المنتج لقائمة المراقبة والتنبيهات' : 'Authentication required to watch SKU',
        });
        setTimeout(() => setAuditToast(null), 3000);
        return;
      }

      const targetVal = listing?.current_price
        ? Math.round(listing.current_price * 0.95)
        : Math.round((product?.current_price || 50000) * 0.95);

      await addToUserWatchlist({
        userId: user.id,
        sku: product.barcode || product.id,
        productId: product.id,
        targetPrice: targetVal,
      });

      setAuditToast({
        type: 'success',
        message: isRtl
          ? `تم تفعيل مراقبة (${product.title}) عند سعر هدف ${targetVal.toLocaleString()} ج.م`
          : `Active tracking initiated for ${product.title} at EGP ${targetVal.toLocaleString()}`,
      });
      setTimeout(() => setAuditToast(null), 3500);
    } catch (err) {
      console.warn('Watchlist toggle error:', err);
    }
  };

  // Load live Supabase data on mount
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const liveProducts = await getMarketIntelligenceProducts();
        if (liveProducts && liveProducts.length > 0) {
          setProducts(liveProducts);
          if (!defaultProductId && !selectedProductId) {
            setSelectedProductId(liveProducts[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching market intelligence data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [defaultProductId]);

  // Current active product
  const activeProduct = useMemo(() => {
    return products.find((p) => p.id === selectedProductId) || products[0];
  }, [products, selectedProductId]);

  // Merged platform listings with registry details
  const enrichedListings = useMemo(() => {
    if (!activeProduct) return [];

    const listingsMap = new Map();
    (activeProduct.platform_listings || []).forEach((item) => {
      listingsMap.set(item.platform_id, item);
    });

    return PLATFORMS_REGISTRY.map((platform) => {
      const listing = listingsMap.get(platform.id) || {
        platform_id: platform.id,
        current_price: 0,
        original_price: 0,
        discount_pct: 0,
        stock_status: 'OUT_OF_STOCK',
        rating: 0,
        reviews_count: 0,
        warranty_info: 'Platform status unavailable',
        material_notes: 'Listing not currently indexed',
        listing_url: platform.url,
      };

      return {
        ...platform,
        ...listing,
        hasListing: listing.current_price > 0,
      };
    });
  }, [activeProduct]);

  // Identify lowest price listing among in-stock items
  const lowestInStockListing = useMemo(() => {
    const validInStock = enrichedListings.filter(
      (item) => (item.stock_status === 'IN_STOCK' || item.stock_status === 'LOW_STOCK') && item.current_price > 0
    );
    if (!validInStock.length) return null;
    return [...validInStock].sort((a, b) => a.current_price - b.current_price)[0];
  }, [enrichedListings]);

  // Identify highest price listing among in-stock items for spread calculation
  const highestInStockListing = useMemo(() => {
    const validInStock = enrichedListings.filter(
      (item) => (item.stock_status === 'IN_STOCK' || item.stock_status === 'LOW_STOCK') && item.current_price > 0
    );
    if (!validInStock.length) return null;
    return [...validInStock].sort((a, b) => b.current_price - a.current_price)[0];
  }, [enrichedListings]);

  // Calculate market price spread (Arbitrage gap)
  const priceSpread = useMemo(() => {
    if (!lowestInStockListing || !highestInStockListing) return 0;
    return Math.max(0, highestInStockListing.current_price - lowestInStockListing.current_price);
  }, [lowestInStockListing, highestInStockListing]);

  // Truth index / Fake-discount detector verdict
  const discountVerdict = useMemo(() => {
    return evaluateDiscountIntegrity(activeProduct, lowestInStockListing);
  }, [activeProduct, lowestInStockListing]);

  // Filtered listings for Central Comparison Matrix
  const displayedListings = useMemo(() => {
    let list = [...enrichedListings];

    if (stockFilter === 'IN_STOCK') {
      list = list.filter((i) => i.stock_status === 'IN_STOCK' || i.stock_status === 'LOW_STOCK');
    } else if (stockFilter === 'DEALS_ONLY') {
      list = list.filter((i) => i.discount_pct > 0 && i.current_price > 0);
    }

    if (platformSearch.trim()) {
      const q = platformSearch.toLowerCase().trim();
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.domain.toLowerCase().includes(q) ||
          (i.warranty_info && i.warranty_info.toLowerCase().includes(q)) ||
          (i.material_notes && i.material_notes.toLowerCase().includes(q))
      );
    }

    // Sort: In-Stock first (sorted by price ascending), then Out of Stock
    return list.sort((a, b) => {
      const aInStock = (a.stock_status === 'IN_STOCK' || a.stock_status === 'LOW_STOCK') && a.current_price > 0;
      const bInStock = (b.stock_status === 'IN_STOCK' || b.stock_status === 'LOW_STOCK') && b.current_price > 0;

      if (aInStock && !bInStock) return -1;
      if (!aInStock && bInStock) return 1;
      if (aInStock && bInStock) return a.current_price - b.current_price;
      return 0;
    });
  }, [enrichedListings, stockFilter, platformSearch]);

  // Slice price history based on selected time range
  const chartData = useMemo(() => {
    if (!activeProduct?.price_history) return [];
    const allPoints = activeProduct.price_history;
    if (timeRange === '30D') {
      return allPoints.slice(-4);
    }
    if (timeRange === '60D') {
      return allPoints.slice(-6);
    }
    return allPoints;
  }, [activeProduct, timeRange]);

  // Top tracked platforms for multi-line comparison in Recharts
  const activeComparisonPlatforms = useMemo(() => {
    const candidateIds = ['AMZN_EG', 'NOON_EG', 'BTECH_EG', 'TRADELINE', 'JUMIA_EG', 'RAYA_EG'];
    return candidateIds.filter((id) => enrichedListings.some((l) => l.platform_id === id && l.current_price > 0));
  }, [enrichedListings]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        width: '100%',
        backgroundColor: '#000000',
        color: '#EDEDED',
        fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* ── TOP BAR: MASTER PRODUCT SELECTOR & TELEMETRY CLUSTER STATUS ── */}
      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          borderBottom: '1px solid #1F1F1F',
          paddingBottom: '20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                padding: '2px 8px',
                borderRadius: '4px',
                letterSpacing: '0.04em',
                fontFamily: "'Geist Mono', monospace",
              }}
            >
              12 DOMESTIC NODES SYNCHRONIZED
            </span>
            <span style={{ fontSize: '0.75rem', color: '#666666' }}>·</span>
            <span style={{ fontSize: '0.75rem', color: '#888888', fontFamily: "'Geist Mono', monospace" }}>
              Active Cairo & Giza Shelf Audits
            </span>
          </div>

          {/* Quick Refresh Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                display: 'inline-block',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
                boxShadow: '0 0 6px rgba(16, 185, 129, 0.6)',
              }}
            />
            <span style={{ fontSize: '0.6875rem', color: '#888888', fontFamily: "'Geist Mono', monospace" }}>
              {loading ? 'SYNCING CATALOG...' : 'REALTIME WEBSOCKET FEED'}
            </span>
          </div>
        </div>

        {/* Master Product Selection Pills (Vercel Tabs) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '4px',
          }}
        >
          {products.map((item) => {
            const isSelected = item.id === selectedProductId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedProductId(item.id)}
                style={{
                  backgroundColor: isSelected ? '#161616' : '#000000',
                  color: isSelected ? '#EDEDED' : '#888888',
                  border: isSelected ? '1px solid #333333' : '1px solid #1F1F1F',
                  padding: '7px 14px',
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                  fontWeight: isSelected ? 600 : 400,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 120ms ease',
                  fontFamily: "'Geist', sans-serif",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.borderColor = '#2A2A2A';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.borderColor = '#1F1F1F';
                }}
              >
                <span>{item.title.split(' ')[0]} {item.model || item.title.split(' ')[1]}</span>
                {isSelected && (
                  <span
                    style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      backgroundColor: '#10B981',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── PRODUCT HERO HEADER & SUMMARY METRICS BANNER ── */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Product Identity Card */}
        <div
          style={{
            gridColumn: 'span 2',
            backgroundColor: '#0A0A0A',
            border: '1px solid #1F1F1F',
            borderRadius: '8px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: '#888888',
                  fontFamily: "'Geist Mono', monospace",
                }}
              >
                {activeProduct.brand} · {activeProduct.category}
              </span>
              <span style={{ fontSize: '0.6875rem', color: '#555555' }}>|</span>
              <span
                style={{
                  fontSize: '0.6875rem',
                  color: '#888888',
                  fontFamily: "'Geist Mono', monospace",
                }}
              >
                BARCODE: {activeProduct.barcode}
              </span>
            </div>

            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: '#EDEDED',
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              {activeProduct.title}
            </h2>

            <p style={{ fontSize: '0.8125rem', color: '#888888', margin: 0, lineHeight: 1.5 }}>
              {activeProduct.material_summary}
            </p>
          </div>

          {/* Quick specs pill strip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingTop: '6px' }}>
            {activeProduct.specifications?.water_resistance && (
              <span
                style={{
                  fontSize: '0.6875rem',
                  color: '#EDEDED',
                  backgroundColor: '#000000',
                  border: '1px solid #1F1F1F',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontFamily: "'Geist Mono', monospace",
                }}
              >
                {activeProduct.specifications.water_resistance.split('(')[0].trim()}
              </span>
            )}
            {activeProduct.specifications?.chassis_material && (
              <span
                style={{
                  fontSize: '0.6875rem',
                  color: '#EDEDED',
                  backgroundColor: '#000000',
                  border: '1px solid #1F1F1F',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontFamily: "'Geist Mono', monospace",
                }}
              >
                {activeProduct.specifications.chassis_material.split('(')[0].trim()}
              </span>
            )}
            {activeProduct.specifications?.weight && (
              <span
                style={{
                  fontSize: '0.6875rem',
                  color: '#888888',
                  backgroundColor: '#000000',
                  border: '1px solid #1F1F1F',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontFamily: "'Geist Mono', monospace",
                }}
              >
                {t('specs.weight')}: {activeProduct.specifications.weight.split('(')[0].trim()}
              </span>
            )}
          </div>
        </div>

        {/* Lowest Price ("Best Deal") Stat Card */}
        <div
          style={{
            backgroundColor: '#0A0A0A',
            border: '1px solid #10B981',
            borderRadius: '8px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '10px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle Emerald glow backdrop */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '120px',
              height: '120px',
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, rgba(0, 0, 0, 0) 70%)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: '#10B981',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace",
              }}
            >
              {isRtl ? 'أفضل وأرخص سعر بالسوق' : 'BEST DEAL IN MARKET'}
            </span>
            {lowestInStockListing && (
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#10B981',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace",
                }}
              >
                {t('matrix.badges.bestDeal', { retailer: getRetailerName(lowestInStockListing.platform_id || lowestInStockListing.name) }, `Cheapest at ${lowestInStockListing.name}`)}
              </span>
            )}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span
                style={{
                  fontSize: '1.875rem',
                  fontWeight: 700,
                  color: '#10B981',
                  fontFamily: "'Geist Mono', monospace",
                  letterSpacing: '-0.03em',
                }}
              >
                {lowestInStockListing ? formatCurrency(lowestInStockListing.current_price) : 'N/A'}
              </span>
              {lowestInStockListing?.discount_pct > 0 && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: '#888888',
                    textDecoration: 'line-through',
                    fontFamily: "'Geist Mono', monospace",
                  }}
                >
                  {formatCurrency(lowestInStockListing.original_price)}
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#888888', fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist', sans-serif" }}>
              {lowestInStockListing ? (isRtl ? `يشمل الضمان المعتمد: ${lowestInStockListing.warranty_info}` : `Includes official ${lowestInStockListing.warranty_info}`) : (isRtl ? 'جاري فحص وتحديث المتاجر...' : 'Currently monitoring nodes')}
            </span>
          </div>

          {lowestInStockListing && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <a
                href={sanitizeRetailerUrl({
                  url: lowestInStockListing.listing_url || lowestInStockListing.url || lowestInStockListing.product_url,
                  platformId: lowestInStockListing.platform_id,
                  productTitle: activeProduct.title,
                  sku: activeProduct.barcode || activeProduct.id,
                })}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.75rem',
                  color: '#EDEDED',
                  textDecoration: 'none',
                  fontWeight: 500,
                  padding: '6px 10px',
                  borderRadius: '5px',
                  backgroundColor: '#000000',
                  border: '1px solid #1F1F1F',
                  transition: 'border-color 150ms ease',
                  fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist', sans-serif",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#10B981')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#1F1F1F')}
              >
                <span>{isRtl ? `زيارة ${getRetailerName(lowestInStockListing.platform_id || lowestInStockListing.name)}` : `Direct Link to ${lowestInStockListing.name}`}</span>
                <ExternalLink size={12} color="#10B981" />
              </a>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleWatchlistToggle(activeProduct, lowestInStockListing);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.75rem',
                  color: '#10B981',
                  fontWeight: 500,
                  padding: '6px 10px',
                  borderRadius: '5px',
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                  fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist', sans-serif",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.16)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.08)')}
              >
                <BookmarkCheck size={12} color="#10B981" />
                <span>{t('matrix.actions.addToWatchlist')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Arbitrage Spread Stat Card */}
        <div
          style={{
            backgroundColor: '#0A0A0A',
            border: '1px solid #1F1F1F',
            borderRadius: '8px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: '#888888',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace",
              }}
            >
              {t('kpis.arbitrageSavings')}
            </span>
            <span
              style={{
                fontSize: '0.6875rem',
                color: '#00DF8F',
                fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace",
              }}
            >
              {isRtl ? 'أعلى فارق بالسوق' : 'Max Delta'}
            </span>
          </div>

          <div>
            <div
              style={{
                fontSize: '1.75rem',
                fontWeight: 600,
                color: '#EDEDED',
                fontFamily: "'Geist Mono', monospace",
                letterSpacing: '-0.02em',
              }}
            >
              {formatCurrency(priceSpread)}
            </div>
            <span style={{ fontSize: '0.75rem', color: '#888888', fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist', sans-serif" }}>
              {t('kpis.arbitrageSavingsSub')}
            </span>
          </div>

          <div
            style={{
              fontSize: '0.6875rem',
              color: '#666666',
              fontFamily: "'Geist Mono', monospace",
            }}
          >
            {isRtl
              ? `النطاق: من ${formatCurrency(lowestInStockListing?.current_price)} إلى ${formatCurrency(highestInStockListing?.current_price)}`
              : `Range: ${formatCurrency(lowestInStockListing?.current_price)} – ${formatCurrency(highestInStockListing?.current_price)}`}
          </div>
        </div>
      </section>

      {/* ── DELIVERABLE A: CENTRAL PRODUCT COMPARISON MATRIX (ITEM INSPECTOR VIEW) ── */}
      <section
        style={{
          backgroundColor: '#0A0A0A',
          border: '1px solid #1F1F1F',
          borderRadius: '8px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Table Controls & Filter Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #1F1F1F',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3
              style={{
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: '#EDEDED',
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              {t('matrix.title', 'Central Comparison Matrix')}
            </h3>
            <span
              style={{
                fontSize: '0.6875rem',
                color: '#888888',
                backgroundColor: '#000000',
                border: '1px solid #1F1F1F',
                padding: '2px 8px',
                borderRadius: '4px',
                fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace",
              }}
            >
              {isRtl ? `${displayedListings.length} من أصل 12 متجر مصري` : `${displayedListings.length} of 12 Platforms`}
            </span>
          </div>

          {/* Filter and Search Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Filter segmented buttons */}
            <div
              style={{
                display: 'flex',
                backgroundColor: '#000000',
                border: '1px solid #1F1F1F',
                borderRadius: '6px',
                padding: '2px',
              }}
            >
              <button
                type="button"
                onClick={() => setStockFilter('ALL')}
                style={{
                  backgroundColor: stockFilter === 'ALL' ? '#161616' : 'transparent',
                  color: stockFilter === 'ALL' ? '#EDEDED' : '#888888',
                  fontSize: '0.6875rem',
                  fontWeight: 500,
                  padding: '3px 9px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist', sans-serif",
                }}
              >
                {t('matrix.actions.filterAll', 'All (12)')}
              </button>
              <button
                type="button"
                onClick={() => setStockFilter('IN_STOCK')}
                style={{
                  backgroundColor: stockFilter === 'IN_STOCK' ? '#161616' : 'transparent',
                  color: stockFilter === 'IN_STOCK' ? '#EDEDED' : '#888888',
                  fontSize: '0.6875rem',
                  fontWeight: 500,
                  padding: '3px 9px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist', sans-serif",
                }}
              >
                {t('matrix.actions.filterInStock', 'In Stock Only')}
              </button>
              <button
                type="button"
                onClick={() => setStockFilter('DEALS_ONLY')}
                style={{
                  backgroundColor: stockFilter === 'DEALS_ONLY' ? '#161616' : 'transparent',
                  color: stockFilter === 'DEALS_ONLY' ? '#EDEDED' : '#888888',
                  fontSize: '0.6875rem',
                  fontWeight: 500,
                  padding: '3px 9px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist', sans-serif",
                }}
              >
                {t('matrix.actions.filterDeals', 'Deals Only')}
              </button>
            </div>

            {/* Platform filter search input */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#000000',
                border: '1px solid #1F1F1F',
                borderRadius: '6px',
                padding: '4px 8px',
                gap: '6px',
                width: '180px',
              }}
            >
              <Search size={12} color="#666666" />
              <input
                type="text"
                placeholder={t('matrix.searchPlaceholder', 'Filter platform...')}
                value={platformSearch}
                onChange={(e) => setPlatformSearch(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#EDEDED',
                  fontSize: '0.75rem',
                  outline: 'none',
                  width: '100%',
                  fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist', sans-serif",
                  textAlign: isRtl ? 'right' : 'left',
                }}
              />
              {platformSearch && (
                <button
                  type="button"
                  onClick={() => setPlatformSearch('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#666666',
                    cursor: 'pointer',
                    fontSize: '12px',
                    padding: 0,
                  }}
                >
                  &times;
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Matrix Table */}
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '0.8125rem',
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: '#000000',
                  borderBottom: '1px solid #1F1F1F',
                  color: '#888888',
                  fontSize: '0.6875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace",
                  textAlign: isRtl ? 'right' : 'left',
                }}
              >
                <th style={{ padding: '12px 18px', fontWeight: 500 }}>{t('matrix.columns.retailer')}</th>
                <th style={{ padding: '12px 18px', fontWeight: 500 }}>{t('matrix.columns.currentPrice')}</th>
                <th style={{ padding: '12px 18px', fontWeight: 500 }}>{t('matrix.columns.discount')}</th>
                <th style={{ padding: '12px 18px', fontWeight: 500 }}>{t('matrix.columns.stock')}</th>
                <th style={{ padding: '12px 18px', fontWeight: 500 }}>{t('matrix.columns.rating')}</th>
                <th style={{ padding: '12px 18px', fontWeight: 500 }}>{t('matrix.columns.warranty')}</th>
                <th style={{ padding: '12px 18px', fontWeight: 500 }}>{t('matrix.columns.materials')}</th>
                <th style={{ padding: '12px 18px', fontWeight: 500, textAlign: isRtl ? 'left' : 'right' }}>{t('matrix.columns.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {displayedListings.map((item) => {
                const isLowest = lowestInStockListing && item.platform_id === lowestInStockListing.platform_id;
                const isOutOfStock = item.stock_status === 'OUT_OF_STOCK' || item.current_price === 0;
                const isLowStock = item.stock_status === 'LOW_STOCK';

                return (
                  <tr
                    key={item.platform_id}
                    style={{
                      borderBottom: '1px solid #141414',
                      backgroundColor: isLowest ? 'rgba(16, 185, 129, 0.04)' : '#000000',
                      borderLeft: isLowest ? '3px solid #10B981' : '3px solid transparent',
                      opacity: isOutOfStock ? 0.45 : 1,
                      transition: 'background-color 120ms ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isLowest) e.currentTarget.style.backgroundColor = '#0A0A0A';
                    }}
                    onMouseLeave={(e) => {
                      if (!isLowest) e.currentTarget.style.backgroundColor = '#000000';
                    }}
                  >
                    {/* Platform details */}
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontWeight: 600,
                              color: isOutOfStock ? '#777777' : '#EDEDED',
                              letterSpacing: '-0.01em',
                            }}
                          >
                            {item.name}
                          </span>
                          {isLowest && (
                            <span
                              style={{
                                fontSize: '0.6875rem',
                                fontWeight: 600,
                                color: '#10B981',
                                letterSpacing: '0.01em',
                                fontFamily: "'Geist Mono', monospace",
                              }}
                            >
                              Cheapest at {item.name}
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.6875rem', color: '#666666', fontFamily: "'Geist Mono', monospace" }}>
                            {item.domain}
                          </span>
                          <span style={{ fontSize: '0.625rem', color: '#444444' }}>•</span>
                          <span style={{ fontSize: '0.625rem', color: '#666666', fontFamily: "'Geist Mono', monospace" }}>
                            {item.ping}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Current Price (EGP, Tabular Nums) */}
                    <td style={{ padding: '14px 18px' }}>
                      {item.current_price > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span
                            style={{
                              fontSize: isLowest ? '1.0625rem' : '0.9375rem',
                              fontWeight: isLowest ? 700 : 600,
                              color: isLowest ? '#10B981' : '#EDEDED',
                              fontFamily: "'Geist Mono', monospace",
                              letterSpacing: '-0.02em',
                            }}
                          >
                            {formatCurrency(item.current_price)}
                          </span>
                          <span style={{ fontSize: '0.6875rem', color: '#666666' }}>
                            {isLowest ? (isRtl ? '★ أرخص سعر' : '★ Best Deal') : (isRtl ? 'سعر الرف' : 'Shelf listing')}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: '#555555', fontFamily: "'Geist Mono', monospace", fontSize: '0.75rem' }}>
                          —
                        </span>
                      )}
                    </td>

                    {/* Original Price & Discount % Badge */}
                    <td style={{ padding: '14px 18px' }}>
                      {item.current_price > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {item.discount_pct > 0 ? (
                            <>
                              <span
                                style={{
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  color: item.is_suspicious_markup ? '#FB7185' : '#10B981',
                                  fontFamily: "'Geist Mono', monospace",
                                }}
                              >
                                -{item.discount_pct}%
                              </span>
                              <span
                                style={{
                                  fontSize: '0.75rem',
                                  color: '#666666',
                                  textDecoration: 'line-through',
                                  fontFamily: "'Geist Mono', monospace",
                                }}
                              >
                                {formatCurrency(item.original_price)}
                              </span>
                            </>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#666666', fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace" }}>
                              {isRtl ? 'سعر قياسي' : 'Standard Price'}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: '#555555', fontSize: '0.75rem' }}>—</span>
                      )}
                    </td>

                    {/* Stock Status */}
                    <td style={{ padding: '14px 18px' }}>
                      {isOutOfStock ? (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            color: '#666666',
                            textDecoration: 'line-through',
                            fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace",
                          }}
                        >
                          {t('matrix.badges.outOfStock')}
                        </span>
                      ) : isLowStock ? (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            color: '#F59E0B',
                            fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace",
                          }}
                        >
                          {t('matrix.badges.lowStock', { count: 3 })}
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            color: '#10B981',
                            fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace",
                          }}
                        >
                          {t('matrix.badges.inStock')}
                        </span>
                      )}
                    </td>

                    {/* Rating & Reviews */}
                    <td style={{ padding: '14px 18px' }}>
                      {item.rating > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: '#F59E0B', fontSize: '0.75rem' }}>★</span>
                          <span
                            style={{
                              fontWeight: 600,
                              color: '#EDEDED',
                              fontFamily: "'Geist Mono', monospace",
                            }}
                          >
                            {item.rating.toFixed(1)}
                          </span>
                          <span style={{ fontSize: '0.6875rem', color: '#666666', fontFamily: "'Geist Mono', monospace" }}>
                            ({item.reviews_count.toLocaleString()})
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: '#555555', fontSize: '0.75rem' }}>No reviews</span>
                      )}
                    </td>

                    {/* Warranty */}
                    <td style={{ padding: '14px 18px', maxWidth: '180px' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: isOutOfStock ? '#666666' : '#BBBBBB',
                          lineHeight: 1.4,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {item.warranty_info}
                      </span>
                    </td>

                    {/* Material & Edition Summary Notes */}
                    <td style={{ padding: '14px 18px', maxWidth: '200px' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: isOutOfStock ? '#666666' : '#888888',
                          lineHeight: 1.4,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {item.material_notes}
                      </span>
                    </td>

                    {/* Action */}
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                        {/* Live Re-Audit Trigger */}
                        <button
                          type="button"
                          onClick={() => handleReAuditListing(item)}
                          disabled={probingListingId === (item.platform_id || item.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.6875rem',
                            color: probingListingId === (item.platform_id || item.id)
                              ? '#F59E0B'
                              : flashingListingIds[item.platform_id || item.id]
                              ? '#10B981'
                              : '#EDEDED',
                            backgroundColor: '#0A0A0A',
                            border: probingListingId === (item.platform_id || item.id)
                              ? '1px solid rgba(245, 158, 11, 0.4)'
                              : flashingListingIds[item.platform_id || item.id]
                              ? '1px solid #10B981'
                              : '1px solid #222222',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            cursor: probingListingId === (item.platform_id || item.id) ? 'not-allowed' : 'pointer',
                            fontFamily: "'Geist Mono', monospace",
                            transition: 'all 120ms ease',
                          }}
                          onMouseEnter={(e) => {
                            if (!probingListingId) e.currentTarget.style.borderColor = '#444444';
                          }}
                          onMouseLeave={(e) => {
                            if (!probingListingId && !flashingListingIds[item.platform_id || item.id]) {
                              e.currentTarget.style.borderColor = '#222222';
                            }
                          }}
                        >
                          <RefreshCw
                            size={10}
                            style={{
                              animation: probingListingId === (item.platform_id || item.id) ? 'spin 1s linear infinite' : 'none',
                            }}
                            color={
                              probingListingId === (item.platform_id || item.id)
                                ? '#F59E0B'
                                : flashingListingIds[item.platform_id || item.id]
                                ? '#10B981'
                                : '#888888'
                            }
                          />
                          <span>
                            {probingListingId === (item.platform_id || item.id)
                              ? (isRtl ? 'جاري الفحص...' : 'Probing...')
                              : flashingListingIds[item.platform_id || item.id]
                              ? (isRtl ? 'تم الفحص ✓' : 'Audited ✓')
                              : (isRtl ? 'فحص وتحديث' : 'Re-audit')}
                          </span>
                        </button>

                        <a
                          href={sanitizeRetailerUrl({
                            url: item.listing_url || item.url || item.product_url,
                            platformId: item.platform_id,
                            productTitle: activeProduct.title,
                            sku: activeProduct.barcode || activeProduct.id,
                          })}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.75rem',
                            color: isLowest ? '#10B981' : isOutOfStock ? '#666666' : '#EDEDED',
                            textDecoration: 'none',
                            fontWeight: 500,
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: isLowest ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid #222222',
                            backgroundColor: '#000000',
                            transition: 'all 120ms ease',
                            fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist', sans-serif",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = isLowest ? '#10B981' : '#444444';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = isLowest ? 'rgba(16, 185, 129, 0.4)' : '#222222';
                          }}
                        >
                          <span>{isRtl ? 'زيارة المتجر' : 'Visit Store'}</span>
                          <ExternalLink size={10} />
                        </a>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWatchlistToggle(activeProduct, item);
                          }}
                          title={isRtl ? 'راقب هذا المنتج وحدد سعراً مستهدفاً' : 'Add to Watchlist'}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.75rem',
                            color: '#888888',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: '1px solid #222222',
                            backgroundColor: '#000000',
                            cursor: 'pointer',
                            transition: 'all 120ms ease',
                            fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist', sans-serif",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#10B981';
                            e.currentTarget.style.color = '#10B981';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#222222';
                            e.currentTarget.style.color = '#888888';
                          }}
                        >
                          <BookmarkCheck size={10} />
                          <span>{isRtl ? 'مراقبة' : 'Watch'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── DELIVERABLE B: PRICE HISTORY & FAKE-DISCOUNT DETECTOR CHART ── */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Time-Series Price Fluctuation Chart */}
        <div
          style={{
            gridColumn: 'span 2',
            backgroundColor: '#0A0A0A',
            border: '1px solid #1F1F1F',
            borderRadius: '8px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* Header & 30D/60D/90D Toggle */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3
                  style={{
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    color: '#EDEDED',
                    margin: 0,
                    letterSpacing: '-0.01em',
                    fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist', sans-serif",
                  }}
                >
                  {isRtl ? 'منحنى تتبع أسعار المنتج عبر المتاجر المصرية' : 'Cross-Platform Price History Trajectory'}
                </h3>
                <span
                  style={{
                    fontSize: '0.625rem',
                    color: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace",
                  }}
                >
                  {t('nav.liveTelemetry')}
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#888888', margin: '4px 0 0 0', fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist', sans-serif" }}>
                {isRtl
                  ? 'رصد ومقارنة أسعار الرف اللحظية عبر المنصات المصرية مقابل متوسط سعر السوق لـ 90 يوماً'
                  : 'Auditing shelf price fluctuations across domestic platforms vs. 90-day baseline median'}
              </p>
            </div>

            {/* Timeframe Selector */}
            <div
              style={{
                display: 'flex',
                backgroundColor: '#000000',
                border: '1px solid #1F1F1F',
                borderRadius: '6px',
                padding: '2px',
              }}
            >
              {['30D', '60D', '90D'].map((range) => {
                const isSelected = timeRange === range;
                const rangeLabel = isRtl
                  ? (range === '30D' ? '30 يوم' : range === '60D' ? '60 يوم' : '90 يوم')
                  : range;
                return (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setTimeRange(range)}
                    style={{
                      backgroundColor: isSelected ? '#161616' : 'transparent',
                      color: isSelected ? '#EDEDED' : '#888888',
                      fontSize: '0.6875rem',
                      fontWeight: isSelected ? 600 : 400,
                      padding: '4px 10px',
                      borderRadius: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace",
                    }}
                  >
                    {rangeLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recharts High-Contrast Pitch-Black LineChart */}
          <div style={{ width: '100%', height: '280px', marginTop: '8px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#555555"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#222222' }}
                  fontFamily="'Geist Mono', monospace"
                />
                <YAxis
                  stroke="#555555"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#222222' }}
                  domain={['auto', 'auto']}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                  fontFamily="'Geist Mono', monospace"
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div
                          style={{
                            backgroundColor: '#000000',
                            border: '1px solid #2A2A2A',
                            borderRadius: '6px',
                            padding: '10px 14px',
                            boxShadow: '0 12px 24px rgba(0, 0, 0, 0.8)',
                            fontSize: '0.75rem',
                            fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace",
                            direction: isRtl ? 'rtl' : 'ltr',
                          }}
                        >
                          <div style={{ color: '#888888', marginBottom: '6px', fontWeight: 500 }}>
                            {label}
                          </div>
                          {payload.map((entry) => (
                            <div
                              key={entry.dataKey}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: '16px',
                                color: entry.color,
                                padding: '2px 0',
                              }}
                            >
                              <span>{entry.name}:</span>
                              <span style={{ fontWeight: 600 }}>{formatCurrency(entry.value)}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                {/* 90-Day Baseline Median Reference Line */}
                <ReferenceLine
                  y={discountVerdict.baselineMedian}
                  stroke="#444444"
                  strokeDasharray="4 4"
                  label={{
                    value: isRtl ? `متوسط السوق: ${formatCurrency(discountVerdict.baselineMedian)}` : `Baseline Median ${formatCurrency(discountVerdict.baselineMedian)}`,
                    fill: '#888888',
                    fontSize: 10,
                    position: 'insideTopRight',
                  }}
                />

                {/* Platform specific lines */}
                {activeComparisonPlatforms.includes('AMZN_EG') && (
                  <Line
                    type="monotone"
                    dataKey="AMZN_EG"
                    name={getRetailerName('AMZN_EG')}
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#10B981', strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                )}
                {activeComparisonPlatforms.includes('NOON_EG') && (
                  <Line
                    type="monotone"
                    dataKey="NOON_EG"
                    name={getRetailerName('NOON_EG')}
                    stroke="#FFE600"
                    strokeWidth={1.5}
                    dot={{ r: 2.5, fill: '#FFE600', strokeWidth: 0 }}
                  />
                )}
                {activeComparisonPlatforms.includes('BTECH_EG') && (
                  <Line
                    type="monotone"
                    dataKey="BTECH_EG"
                    name={getRetailerName('BTECH_EG')}
                    stroke="#38BDF8"
                    strokeWidth={1.5}
                    dot={{ r: 2.5, fill: '#38BDF8', strokeWidth: 0 }}
                  />
                )}
                {activeComparisonPlatforms.includes('TRADELINE') && (
                  <Line
                    type="monotone"
                    dataKey="TRADELINE"
                    name={getRetailerName('TRADELINE')}
                    stroke="#A78BFA"
                    strokeWidth={1.5}
                    dot={{ r: 2.5, fill: '#A78BFA', strokeWidth: 0 }}
                  />
                )}
                {activeComparisonPlatforms.includes('JUMIA_EG') && (
                  <Line
                    type="monotone"
                    dataKey="JUMIA_EG"
                    name={getRetailerName('JUMIA_EG')}
                    stroke="#FB7185"
                    strokeWidth={1.5}
                    dot={{ r: 2.5, fill: '#FB7185', strokeWidth: 0 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Chart Legend Strip */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              flexWrap: 'wrap',
              borderTop: '1px solid #191919',
              paddingTop: '12px',
              fontSize: '0.6875rem',
              color: '#888888',
              fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace",
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
              <span>{getRetailerName('AMZN_EG')} ({isRtl ? 'الأرخص' : 'Lowest'})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FFE600' }} />
              <span>{getRetailerName('NOON_EG')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#38BDF8' }} />
              <span>{getRetailerName('BTECH_EG')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FB7185' }} />
              <span>{getRetailerName('JUMIA_EG')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '2px', backgroundColor: '#555555' }} />
              <span>{t('kpis.baselineMedian')}</span>
            </div>
          </div>
        </div>

        {/* Fake-Discount Detector Verdict Panel */}
        <div
          style={{
            backgroundColor: '#000000',
            border: '1px solid #1F1F1F',
            borderRadius: '8px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: discountVerdict.isGenuine ? '#10B981' : '#FB7185',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace",
                }}
              >
                {t('radar.title', 'محرك كشف التلاعب بالأسعار')}
              </span>
              <span
                style={{
                  fontSize: '0.6875rem',
                  color: '#888888',
                  fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace",
                }}
              >
                {t('kpis.truthIndex')}: {discountVerdict.score}/100
              </span>
            </div>

            {/* Verdict Minimalist Presentation */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '4px 0',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: discountVerdict.isGenuine ? '#10B981' : '#FB7185',
                  fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace",
                  letterSpacing: '0.02em',
                }}
              >
                {discountVerdict.isGenuine ? (
                  <CheckCircle2 size={16} color="#10B981" />
                ) : (
                  <AlertTriangle size={16} color="#FB7185" />
                )}
                <span>
                  {discountVerdict.isGenuine
                    ? t('matrix.badges.genuineDiscount', 'خصم حقيقي مؤكد (أقل من متوسط السوق)')
                    : t('matrix.badges.ghostMarkup', 'تنبيه: خصم وهمي (تم رفع السعر قبل التخفيض)')}
                </span>
              </div>
              <p
                style={{
                  fontSize: '0.8125rem',
                  color: '#EDEDED',
                  margin: 0,
                  lineHeight: 1.5,
                  fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist', sans-serif",
                }}
              >
                {isRtl
                  ? (discountVerdict.isGenuine
                      ? `سعر العرض الحالي يقل بمقدار ${formatCurrency(discountVerdict.netGenuineSaving)} عن متوسط سعر السوق الفعلي لآخر 90 يوماً.`
                      : `تم رصد زيادة مصطنعة في السعر المرجعي بنسبة ${discountVerdict.preSpikeInflatedPct}% قبل إعلان الخصم.`)
                  : discountVerdict.explanation}
              </p>
            </div>
          </div>

          {/* Forensics Metric Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              borderTop: '1px solid #1F1F1F',
              paddingTop: '14px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '0.625rem', color: '#666666', fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace" }}>
                {t('kpis.baselineMedian')}
              </span>
              <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#EDEDED', fontFamily: "'Geist Mono', monospace" }}>
                {formatCurrency(discountVerdict.baselineMedian)}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '0.625rem', color: '#666666', fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace" }}>
                {t('kpis.allTimeLow')}
              </span>
              <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#10B981', fontFamily: "'Geist Mono', monospace" }}>
                {formatCurrency(discountVerdict.lowestEver)}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '0.625rem', color: '#666666', fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace" }}>
                {t('radar.averageGhostMarkup')}
              </span>
              <span
                style={{
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  color: discountVerdict.preSpikeInflatedPct > 0 ? '#FB7185' : '#00DF8F',
                  fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace",
                }}
              >
                {discountVerdict.preSpikeInflatedPct > 0
                  ? (isRtl ? `+${discountVerdict.preSpikeInflatedPct}% رفع مصطنع` : `+${discountVerdict.preSpikeInflatedPct}% Artificial`)
                  : (isRtl ? '0.0% (نظيف وطبيعي)' : '0.0% (Clean)')}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '0.625rem', color: '#666666', fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace" }}>
                {t('kpis.trueSavings')}
              </span>
              <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#10B981', fontFamily: "'Geist Mono', monospace" }}>
                {formatCurrency(discountVerdict.netGenuineSaving)}
              </span>
            </div>
          </div>

          <div
            style={{
              padding: '8px 10px',
              backgroundColor: '#000000',
              border: '1px solid #1F1F1F',
              borderRadius: '6px',
              fontSize: '0.6875rem',
              color: '#888888',
              lineHeight: 1.4,
              fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist', sans-serif",
            }}
          >
            {isRtl ? (
              <span>🛡 <strong>درع كاوليكس للتدقيق الجنائي:</strong> مطابقة رقمية مستمرة لأسعار الرف مع منافذ الاستيراد الرسمية ومنحنيات أسعار السوق المصري لـ 90 يوماً.</span>
            ) : (
              <span>🛡 <strong>Cawlix Forensics Guard:</strong> Continuously correlates seller list prices against NTRA official import manifests & 90-day domestic price curves.</span>
            )}
          </div>
        </div>
      </section>

      {/* ── DELIVERABLE C: SPECIFICATIONS & MATERIAL BREAKDOWN CARD ── */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Specifications Key-Value Grid */}
        <div
          style={{
            gridColumn: 'span 2',
            backgroundColor: '#0A0A0A',
            border: '1px solid #1F1F1F',
            borderRadius: '8px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={16} color="#EDEDED" />
              <h3
                style={{
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  color: '#EDEDED',
                  margin: 0,
                  letterSpacing: '-0.01em',
                  fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist', sans-serif",
                }}
              >
                {t('specs.title', 'المواصفات الفنية ومطابقة الجودة')}
              </h3>
            </div>
            <span
              style={{
                fontSize: '0.6875rem',
                color: '#888888',
                fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace",
              }}
            >
              {isRtl ? 'المواصفات المعتمدة' : 'master_products.specifications'}
            </span>
          </div>

          {/* Structured Key-Value Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '12px',
            }}
          >
            {Object.entries(activeProduct.specifications || {}).map(([key, value]) => {
              const specLabelMap = {
                chassis_material: t('specs.chassis', 'خامة الهيكل والإطار'),
                front_glass: t('specs.frontGlass', 'زجاج الشاشة والحماية'),
                back_glass: t('specs.backGlass', 'خامة الظهر الخلفي'),
                thermal_system: t('specs.thermal', 'نظام التبريد الداخلي'),
                water_resistance: t('specs.waterResistance', 'مقاومة الماء والغبار'),
                processor: t('specs.processor', 'المعالج ووحدة المعالجة'),
                weight: t('specs.weight', 'الوزن الصافي'),
                durability_score: t('specs.durabilityScore', 'مؤشر الصلابة ومقاومة الصدمات'),
                scratch_score: t('specs.scratchScore', 'مؤشر مقاومة الخدوش'),
              };
              const formattedKey = specLabelMap[key] || key
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (c) => c.toUpperCase());
              return (
                <div
                  key={key}
                  style={{
                    backgroundColor: '#000000',
                    border: '1px solid #1F1F1F',
                    borderRadius: '6px',
                    padding: '10px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      color: '#666666',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace",
                    }}
                  >
                    {formattedKey}
                  </span>
                  <span
                    style={{
                      fontSize: '0.8125rem',
                      color: '#EDEDED',
                      fontWeight: 500,
                      lineHeight: 1.4,
                      fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist', sans-serif",
                    }}
                  >
                    {String(value)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Verified Material Composition & User-Sentiment Consensus Chip */}
        <div
          style={{
            backgroundColor: '#0A0A0A',
            border: '1px solid #1F1F1F',
            borderRadius: '8px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: '#888888',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace",
                }}
              >
                {isRtl ? 'مطابقة الخامات وجودة التصنيع' : 'MATERIAL & QUALITY CONSENSUS'}
              </span>
              <span
                style={{
                  fontSize: '0.6875rem',
                  color: '#10B981',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace",
                }}
              >
                {isRtl ? 'خامات أصلية معتمدة' : 'VERIFIED AUTHENTIC'}
              </span>
            </div>

            {/* High-Contrast Summary Chip */}
            <div
              style={{
                backgroundColor: '#000000',
                border: '1px solid #222222',
                borderRadius: '6px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="#10B981" />
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#EDEDED', fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist', sans-serif" }}>
                  {isRtl ? 'ملخص الخامات وتفاصيل الهيكل' : 'Verified Material Summary'}
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#BBBBBB', margin: 0, lineHeight: 1.5, fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist', sans-serif" }}>
                {activeProduct.material_summary}
              </p>
            </div>

            {/* User Sentiment Quality Consensus */}
            {activeProduct.sentiment_consensus && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#888888', fontWeight: 500, fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist', sans-serif" }}>
                    {isRtl ? 'تقييم ومراجعات المشترين الموثقة' : 'Shopper Sentiment Consensus'}
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: '#666666', fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace" }}>
                    {isRtl ? `بناءً على ${activeProduct.sentiment_consensus.total_shopper_reviews?.toLocaleString()} فحص ومراجعة` : `Based on ${activeProduct.sentiment_consensus.total_shopper_reviews?.toLocaleString()} audits`}
                  </span>
                </div>

                {/* Progress Meters */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Durability */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: '#CCCCCC', marginBottom: '4px', fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist', sans-serif" }}>
                      <span>{t('specs.durabilityScore', 'مؤشر الصلابة والمتانة')}</span>
                      <span style={{ color: '#10B981', fontFamily: "'Geist Mono', monospace" }}>
                        {activeProduct.sentiment_consensus.durability_consensus}%
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '4px', backgroundColor: '#1A1A1A', borderRadius: '2px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${activeProduct.sentiment_consensus.durability_consensus}%`,
                          height: '100%',
                          backgroundColor: '#10B981',
                        }}
                      />
                    </div>
                  </div>

                  {/* Scratch Resistance */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: '#CCCCCC', marginBottom: '4px', fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist', sans-serif" }}>
                      <span>{t('specs.scratchScore', 'مقاومة الخدوش وجودة الطلاء')}</span>
                      <span style={{ color: '#38BDF8', fontFamily: "'Geist Mono', monospace" }}>
                        {activeProduct.sentiment_consensus.finish_scratch_resistance}%
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '4px', backgroundColor: '#1A1A1A', borderRadius: '2px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${activeProduct.sentiment_consensus.finish_scratch_resistance}%`,
                          height: '100%',
                          backgroundColor: '#38BDF8',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Sentiment summary quote */}
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#888888',
                    fontStyle: 'italic',
                    lineHeight: 1.45,
                    borderLeft: isRtl ? 'none' : '2px solid #2E2E2E',
                    borderRight: isRtl ? '2px solid #2E2E2E' : 'none',
                    paddingLeft: isRtl ? 0 : '10px',
                    paddingRight: isRtl ? '10px' : 0,
                    marginTop: '4px',
                    fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist', sans-serif",
                  }}
                >
                  "{activeProduct.sentiment_consensus.verdict_summary}"
                </div>
              </div>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.6875rem',
              color: '#666666',
              borderTop: '1px solid #1F1F1F',
              paddingTop: '10px',
              fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace",
            }}
          >
            <span>{isRtl ? 'المتاجر المفحوصة: 12 متجر مصري' : 'PLATFORMS COMPARED: 12'}</span>
            <span>{t('matrix.badges.ntraApproved')}</span>
          </div>
        </div>
      </section>

      {/* Realtime Re-Audit Toast Notification */}
      {auditToast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#000000',
            border: auditToast.type === 'success' ? '1px solid #10B981' : '1px solid #FB7185',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.8)',
            borderRadius: '6px',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 99999,
            fontSize: '0.8125rem',
            color: '#EDEDED',
            fontFamily: "'Geist', sans-serif",
          }}
        >
          {auditToast.type === 'success' ? (
            <CheckCircle2 size={16} color="#10B981" />
          ) : (
            <AlertTriangle size={16} color="#FB7185" />
          )}
          <span>{auditToast.message}</span>
        </div>
      )}
    </div>
  );
}
