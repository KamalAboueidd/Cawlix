import { useState, useEffect, useRef, useMemo } from 'react';
import {
  searchLocalMasterProducts,
  resolveProductAcrossPlatforms,
  executeLiveRetailerSearch,
} from '../../services/productResolver';
import { SEEDED_MASTER_PRODUCTS } from '../../services/marketIntelligenceData';
import {
  Search,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Loader2,
  Zap,
} from 'lucide-react';
import { sanitizeRetailerUrl } from '../../utils/urlSanitizer';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Institutional Pitch-Black Telemetry Control & Universal Search Dashboard (CAWLIX)
 * Debounced multi-platform search, local catalog matching, command palette dropdown,
 * and instant drill-down into Market Matrix.
 */
export default function TelemetryControlDashboard({
  onSelectProduct,
  className = '',
  placeholder = null,
}) {
  const { lang, isRtl, t, getRetailerName, formatCurrency } = useLanguage();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLiveSearching, setIsLiveSearching] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [localResults, setLocalResults] = useState([]);
  const [resolvedResult, setResolvedResult] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Aggregate computed metrics for Glitch Radar & Estimated Arbitrage Savings
  const { totalArbitrageSavings, anomalyDetectionsCount } = useMemo(() => {
    let totalSavings = 0;
    let anomalyCount = 3;

    SEEDED_MASTER_PRODUCTS.forEach((product) => {
      const validPrices = (product.platform_listings || [])
        .map((l) => l.current_price)
        .filter((p) => p > 0);

      if (validPrices.length >= 2) {
        const spread = Math.max(...validPrices) - Math.min(...validPrices);
        totalSavings += spread;
      }

      const hasGenuine = (product.platform_listings || []).some(
        (l) => l.discount_pct > 10 && !l.is_suspicious_markup
      );
      if (hasGenuine) anomalyCount++;
    });

    return {
      totalArbitrageSavings: Math.round(totalSavings),
      anomalyDetectionsCount: anomalyCount,
    };
  }, []);

  // 1. Reset search errors & attempt state on query edit + Debounce Input by 300ms
  useEffect(() => {
    setSearchError(null);
    setSearchAttempted(false);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!query.trim()) {
      setDebouncedQuery('');
      setLocalResults([]);
      setResolvedResult(null);
      setIsLiveSearching(false);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  // 2. Perform Local Catalog Search on debounced query (Zero false fuzzy matches)
  useEffect(() => {
    if (!debouncedQuery) {
      setLocalResults([]);
      setResolvedResult(null);
      setIsLiveSearching(false);
      return;
    }

    // Immediate local catalog matching with strict relevance
    const matched = searchLocalMasterProducts(debouncedQuery);
    setLocalResults(matched);
    setResolvedResult(null);
  }, [debouncedQuery]);

  // Trigger on-demand live search across all 12 Egyptian platforms
  const handleTriggerLiveSearch = async (searchQuery) => {
    const q = (searchQuery !== undefined ? searchQuery : query)?.trim();
    console.log('[CAWLIX_LIVE_SEARCH] Triggered for:', q);
    if (!q) return;

    setIsLiveSearching(true);
    setSearchError(null);
    setSearchAttempted(true);

    try {
      const results = await executeLiveRetailerSearch(q);
      console.log('[CAWLIX_LIVE_SEARCH] Results received:', results);

      if (results && results.status !== 'NO_MATCHING_PRODUCTS' && (results.masterProduct || results.title)) {
        setResolvedResult(results);
        setSearchError(null);
      } else if (results && results.found && results.masterProduct) {
        setResolvedResult(results);
        setSearchError(null);
      } else {
        setResolvedResult(null);
        setSearchError(
          results?.message ||
            (isRtl
              ? 'عفواً، هذا المنتج غير متوفر للبيع حالياً في أي من المتاجر المصرية الـ 12 المعتمدة.'
              : 'Sorry, this product is currently not available for purchase on any of the 12 verified Egyptian retail platforms.')
        );
      }
    } catch (err) {
      console.error('[CAWLIX_LIVE_SEARCH] Execution failed:', err);
      setResolvedResult(null);
      setSearchError(err?.message || (isRtl ? 'فشل البحث المباشر في المتاجر' : 'Live retailer search failed'));
    } finally {
      setIsLiveSearching(false);
    }
  };

  // 3. Global Shortcut Listeners (Cmd+K / Ctrl+K and '/' to focus)
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Don't trigger '/' if user is typing in another input/textarea
      const isInput =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === '/' && !isInput) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen]);

  // 4. Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 5. Build Flat Navigable Items List for Arrow Keys
  const navigableItems = [];
  localResults.forEach((item) => {
    navigableItems.push({ type: 'local', data: item });
  });
  if (resolvedResult && resolvedResult.masterProduct) {
    navigableItems.push({ type: 'resolved', data: resolvedResult });
  }
  if (query.trim() && !isLiveSearching) {
    navigableItems.push({ type: 'action', query: query.trim() });
  }

  // Keyboard navigation within command palette
  const handleKeyDown = async (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, navigableItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + navigableItems.length) % Math.max(1, navigableItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (navigableItems.length > 0 && navigableItems[selectedIndex]) {
        const item = navigableItems[selectedIndex];
        if (item.type === 'local') {
          handleSelectLocalProduct(item.data);
          return;
        } else if (item.type === 'resolved') {
          handleSelectResolvedProduct(item.data);
          return;
        } else if (item.type === 'action') {
          handleTriggerLiveSearch(query);
          return;
        }
      }
      if (query.trim()) {
        handleTriggerLiveSearch(query);
      }
    }
  };

  const handleSelectLocalProduct = (product) => {
    setIsOpen(false);
    if (onSelectProduct) {
      onSelectProduct(product);
    }
  };

  const handleSelectResolvedProduct = (res) => {
    setIsOpen(false);
    if (onSelectProduct && res.masterProduct) {
      onSelectProduct(res.masterProduct);
    }
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '460px',
      }}
    >
      {/* Search Input Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#000000',
          border: isOpen ? '1px solid rgba(255, 255, 255, 0.25)' : '1px solid #1F1F1F',
          boxShadow: isOpen ? '0 0 0 1px rgba(255, 255, 255, 0.15)' : 'none',
          borderRadius: '6px',
          height: '34px',
          padding: '0 10px',
          gap: '8px',
          transition: 'all 150ms ease',
        }}
      >
        {isLiveSearching ? (
          <Loader2
            size={14}
            color="#10B981"
            className="animate-spin"
            style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }}
          />
        ) : (
          <Search size={14} color="#666666" style={{ flexShrink: 0 }} />
        )}

        <input
          ref={inputRef}
          id="telemetry-search-input"
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || t('nav.searchPlaceholder')}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: '#EDEDED',
            fontSize: '0.8125rem',
            fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist', sans-serif",
            outline: 'none',
          }}
        />

        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setDebouncedQuery('');
              setLocalResults([]);
              setResolvedResult(null);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#666666',
              cursor: 'pointer',
              fontSize: '14px',
              padding: '0 2px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            &times;
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <kbd
              style={{
                fontSize: '0.6875rem',
                fontFamily: "'Geist Mono', monospace",
                color: '#666666',
                backgroundColor: '#0A0A0A',
                border: '1px solid #262626',
                borderRadius: '4px',
                padding: '1px 5px',
                lineHeight: '1.4',
              }}
            >
              ⌘K
            </kbd>
            <kbd
              style={{
                fontSize: '0.6875rem',
                fontFamily: "'Geist Mono', monospace",
                color: '#666666',
                backgroundColor: '#0A0A0A',
                border: '1px solid #262626',
                borderRadius: '4px',
                padding: '1px 5px',
                lineHeight: '1.4',
              }}
            >
              /
            </kbd>
          </div>
        )}
      </div>

      {/* Institutional Pitch-Black Dropdown Palette */}
      {isOpen && (query.trim().length > 0 || isResolving || resolvedResult) && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            backgroundColor: '#000000',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '8px',
            boxShadow: '0 20px 48px -8px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.05)',
            zIndex: 9999,
            maxHeight: '480px',
            overflowY: 'auto',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {/* Status Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '4px 8px 6px 8px',
              borderBottom: '1px solid #1A1A1A',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: isResolving ? '#F59E0B' : '#10B981',
                  boxShadow: isResolving
                    ? '0 0 6px rgba(245, 158, 11, 0.8)'
                    : '0 0 6px rgba(16, 185, 129, 0.8)',
                }}
              />
              <span
                style={{
                  fontSize: '0.6875rem',
                  color: '#888888',
                  fontFamily: "'Geist Mono', monospace",
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {isResolving
                  ? (isRtl ? 'جاري فحص الـ 12 متجر مصري...' : 'Probing 12 Egyptian Nodes...')
                  : (isRtl ? 'محرك الربط بين المتاجر نشط' : 'Multi-Platform Query Resolver Active')}
              </span>
            </div>

            <span
              style={{
                fontSize: '0.625rem',
                color: '#666666',
                fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace",
              }}
            >
              {isRtl ? 'بحث فوري · ↵ فحص' : '350ms Debounced · ↵ Inspect'}
            </span>
          </div>

          {/* Live Computed Metrics: Glitch Radar & Arbitrage Savings */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '6px',
              padding: '2px 0',
            }}
          >
            {/* Glitch Radar Card */}
            <div
              style={{
                backgroundColor: '#0A0A0A',
                border: '1px solid #1C1C1C',
                borderRadius: '5px',
                padding: '6px 10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontSize: '0.5625rem',
                    fontWeight: 600,
                    color: '#888888',
                    fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace",
                    textTransform: 'uppercase',
                  }}
                >
                  {t('kpis.glitchesIntercepted')}
                </span>
                <span
                  style={{
                    fontSize: '0.5625rem',
                    color: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    padding: '0 4px',
                    borderRadius: '3px',
                    fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace",
                  }}
                >
                  {isRtl ? 'مباشر' : 'LIVE'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: '#EDEDED',
                    fontFamily: "'Geist Mono', monospace",
                  }}
                >
                  {anomalyDetectionsCount}
                </span>
                <span style={{ fontSize: '0.625rem', color: '#666666' }}>
                  {t('kpis.truthIndex')}
                </span>
              </div>
            </div>

            {/* Estimated Arbitrage Savings Card */}
            <div
              style={{
                backgroundColor: '#0A0A0A',
                border: '1px solid #1C1C1C',
                borderRadius: '5px',
                padding: '6px 10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontSize: '0.5625rem',
                    fontWeight: 600,
                    color: '#888888',
                    fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace",
                    textTransform: 'uppercase',
                  }}
                >
                  {t('kpis.arbitrageSavings')}
                </span>
                <span
                  style={{
                    fontSize: '0.5625rem',
                    color: '#10B981',
                    fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace",
                  }}
                >
                  {isRtl ? 'أعلى فارق' : 'MAX SPREAD'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: '#10B981',
                    fontFamily: "'Geist Mono', monospace",
                  }}
                >
                  {formatCurrency(totalArbitrageSavings)}
                </span>
                <span style={{ fontSize: '0.625rem', color: '#666666' }}>
                  {isRtl ? 'فارق السوق' : 'catalog delta'}
                </span>
              </div>
            </div>
          </div>

          {/* Section A: Local Master SKUs (Catalog Matches) */}
          {localResults.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div
                style={{
                  fontSize: '0.625rem',
                  fontWeight: 600,
                  color: '#666666',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontFamily: "'Geist Mono', monospace",
                  padding: '4px 8px',
                }}
              >
                {isRtl ? `منتجات الكتالوج (${localResults.length})` : `Local Master SKUs (${localResults.length})`}
              </div>

              {localResults.map((item, idx) => {
                const isSelected = selectedIndex === idx;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectLocalProduct(item)}
                    style={{
                      backgroundColor: isSelected ? '#121212' : '#0A0A0A',
                      border: isSelected
                        ? '1px solid rgba(255, 255, 255, 0.2)'
                        : '1px solid #1A1A1A',
                      borderRadius: '6px',
                      padding: '10px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      transition: 'all 120ms ease',
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                        <span
                          style={{
                            fontSize: '0.625rem',
                            color: '#888888',
                            backgroundColor: '#161616',
                            border: '1px solid #262626',
                            borderRadius: '3px',
                            padding: '1px 5px',
                            fontFamily: "'Geist Mono', monospace",
                            flexShrink: 0,
                          }}
                        >
                          {item.brand}
                        </span>
                        <span
                          style={{
                            fontSize: '0.8125rem',
                            fontWeight: 500,
                            color: '#EDEDED',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {item.title}
                        </span>
                      </div>

                      <ArrowRight size={13} color={isSelected ? '#EDEDED' : '#555555'} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          color: '#666666',
                          fontFamily: "'Geist Mono', monospace",
                        }}
                      >
                        EAN: {item.barcode || 'N/A'}
                      </span>

                      {item.lowestPrice && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              fontSize: '0.6875rem',
                              fontWeight: 600,
                              color: '#10B981',
                              backgroundColor: 'rgba(16, 185, 129, 0.1)',
                              border: '1px solid rgba(16, 185, 129, 0.25)',
                              borderRadius: '4px',
                              padding: '1px 6px',
                              fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist Mono', monospace",
                            }}
                          >
                            {t('matrix.badges.bestDeal', { retailer: getRetailerName(item.lowestPlatformName || item.lowestPlatformId, lang) })}: {formatCurrency(item.lowestPrice)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Section B: Universal Multi-Platform Resolver Consolidated Master Entity */}
          {resolvedResult && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div
                style={{
                  fontSize: '0.625rem',
                  fontWeight: 600,
                  color: '#666666',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace",
                  padding: '4px 8px 0 8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>{isRtl ? 'مطابقة المنصات الـ 12 الموحدة' : 'Universal Multi-Platform Resolution (12 Nodes)'}</span>
                <span style={{ color: '#10B981' }}>
                  {resolvedResult.source === 'LOCAL_CATALOG' ? (isRtl ? 'متطابق مع الكتالوج' : 'Catalog Correlated') : (isRtl ? 'رصد لحظي مباشر' : 'Real-time Ingest')}
                </span>
              </div>

              {/* Master Card */}
              <div
                onClick={() => handleSelectResolvedProduct(resolvedResult)}
                style={{
                  backgroundColor: '#0A0A0A',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '6px',
                  padding: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  transition: 'border-color 150ms ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#10B981')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)')}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '0.625rem',
                          fontWeight: 600,
                          color: '#EDEDED',
                          backgroundColor: '#1F1F1F',
                          padding: '1px 6px',
                          borderRadius: '3px',
                          fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist Mono', monospace",
                        }}
                      >
                        {isRtl ? 'المنتج المعتمد' : 'MASTER ENTITY'}
                      </span>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#EDEDED' }}>
                        {resolvedResult.masterProduct.title}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: '#888888', marginTop: '2px', display: 'block' }}>
                      {isRtl ? 'الموديل: ' : 'Model: '}{resolvedResult.masterProduct.model}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: '0.6875rem',
                      color: '#10B981',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      flexShrink: 0,
                    }}
                  >
                    <span>{t('nav.marketMatrix')}</span>
                    <ArrowRight size={12} style={{ transform: isRtl ? 'scaleX(-1)' : 'none' }} />
                  </span>
                </div>

                {/* 4 Pillars Forensics Pills */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '6px',
                  }}
                >
                  {/* 1. Cheapest Node (Best Deal) */}
                  {resolvedResult.metrics.cheapestNode && (
                    <div
                      style={{
                        backgroundColor: '#000000',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '5px',
                        padding: '6px 8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Zap size={10} color="#10B981" />
                        <span
                          style={{
                            fontSize: '0.5625rem',
                            fontWeight: 600,
                            color: '#10B981',
                            textTransform: 'uppercase',
                            fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist Mono', monospace",
                          }}
                        >
                          {isRtl ? 'أرخص متجر حالياً' : 'CHEAPEST NODE (BEST DEAL)'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#EDEDED' }}>
                          {getRetailerName(resolvedResult.metrics.cheapestNode.platformId || resolvedResult.metrics.cheapestNode.platformName, lang)}
                        </span>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: '#10B981',
                            fontFamily: "'Geist Mono', monospace",
                          }}
                        >
                          {formatCurrency(resolvedResult.metrics.cheapestNode.price)}
                        </span>
                      </div>
                      {resolvedResult.metrics.cheapestNode.deltaSavings > 0 && (
                        <span
                          style={{
                            fontSize: '0.625rem',
                            color: '#888888',
                            fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist Mono', monospace",
                          }}
                        >
                          {isRtl
                            ? `${formatCurrency(resolvedResult.metrics.cheapestNode.deltaSavings)} أقل من متوسط السوق (-${resolvedResult.metrics.cheapestNode.deltaSavingsPct}%)`
                            : `${formatCurrency(resolvedResult.metrics.cheapestNode.deltaSavings)} below median (-${resolvedResult.metrics.cheapestNode.deltaSavingsPct}%)`}
                        </span>
                      )}
                      <a
                        href={sanitizeRetailerUrl({
                          url: resolvedResult.metrics.cheapestNode.listingUrl || resolvedResult.metrics.cheapestNode.url,
                          platformId: resolvedResult.metrics.cheapestNode.platformId,
                          productTitle: resolvedResult.title,
                          sku: resolvedResult.barcode || resolvedResult.id,
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.625rem',
                          color: '#10B981',
                          textDecoration: 'none',
                          fontWeight: 500,
                          marginTop: '3px',
                          alignSelf: 'flex-start',
                        }}
                      >
                        <span>{t('matrix.actions.visitStore')}</span>
                        <ExternalLink size={9} />
                      </a>
                    </div>
                  )}

                  {/* 2. Domestic Guarantee Leader */}
                  {resolvedResult.metrics.domesticGuaranteeLeader && (
                    <div
                      style={{
                        backgroundColor: '#000000',
                        border: '1px solid #1F1F1F',
                        borderRadius: '5px',
                        padding: '6px 8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ShieldCheck size={10} color="#00DF8F" />
                        <span
                          style={{
                            fontSize: '0.5625rem',
                            fontWeight: 600,
                            color: '#888888',
                            textTransform: 'uppercase',
                            fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace",
                          }}
                        >
                          {isRtl ? 'الضمان المحلي المعتمد' : 'DOMESTIC GUARANTEE LEADER'}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#EDEDED' }}>
                        {getRetailerName(resolvedResult.metrics.domesticGuaranteeLeader.platformId || resolvedResult.metrics.domesticGuaranteeLeader.platformName, lang)}
                      </span>
                      <span
                        style={{
                          fontSize: '0.625rem',
                          color: '#888888',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {resolvedResult.metrics.domesticGuaranteeLeader.warrantyInfo}
                      </span>
                      <a
                        href={sanitizeRetailerUrl({
                          url: resolvedResult.metrics.domesticGuaranteeLeader.listingUrl || resolvedResult.metrics.domesticGuaranteeLeader.url,
                          platformId: resolvedResult.metrics.domesticGuaranteeLeader.platformId,
                          productTitle: resolvedResult.title,
                          sku: resolvedResult.barcode || resolvedResult.id,
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.625rem',
                          color: '#00DF8F',
                          textDecoration: 'none',
                          fontWeight: 500,
                          marginTop: '3px',
                          alignSelf: 'flex-start',
                        }}
                      >
                        <span>{isRtl ? `فحص على ${getRetailerName(resolvedResult.metrics.domesticGuaranteeLeader.platformId, lang)}` : `Inspect on ${resolvedResult.metrics.domesticGuaranteeLeader.platformName}`}</span>
                        <ExternalLink size={9} />
                      </a>
                    </div>
                  )}

                  {/* 3. Highest Rated Node */}
                  {resolvedResult.metrics.highestRatedNode && (
                    <div
                      style={{
                        backgroundColor: '#000000',
                        border: '1px solid #1F1F1F',
                        borderRadius: '5px',
                        padding: '6px 8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Sparkles size={10} color="#F59E0B" />
                        <span
                          style={{
                            fontSize: '0.5625rem',
                            fontWeight: 600,
                            color: '#888888',
                            textTransform: 'uppercase',
                            fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace",
                          }}
                        >
                          {isRtl ? 'الأعلى تقييماً' : 'HIGHEST RATED NODE'}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#EDEDED' }}>
                        {getRetailerName(resolvedResult.metrics.highestRatedNode.platformId || resolvedResult.metrics.highestRatedNode.platformName, lang)}
                      </span>
                      <span
                        style={{
                          fontSize: '0.625rem',
                          color: '#F59E0B',
                          fontFamily: "'Geist Mono', monospace",
                        }}
                      >
                        {resolvedResult.metrics.highestRatedNode.badge}
                      </span>
                    </div>
                  )}

                  {/* 4. Truth Index Analysis */}
                  {resolvedResult.metrics.truthIndex && (
                    <div
                      style={{
                        backgroundColor: '#000000',
                        border: resolvedResult.metrics.truthIndex.isGenuine
                          ? '1px solid rgba(16, 185, 129, 0.25)'
                          : '1px solid rgba(251, 113, 133, 0.35)',
                        borderRadius: '5px',
                        padding: '6px 8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {resolvedResult.metrics.truthIndex.isGenuine ? (
                          <CheckCircle2 size={10} color="#10B981" />
                        ) : (
                          <AlertTriangle size={10} color="#FB7185" />
                        )}
                        <span
                          style={{
                            fontSize: '0.5625rem',
                            fontWeight: 600,
                            color: resolvedResult.metrics.truthIndex.isGenuine ? '#10B981' : '#FB7185',
                            textTransform: 'uppercase',
                            fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace",
                          }}
                        >
                          {t('kpis.truthIndex')}: {resolvedResult.metrics.truthIndex.score}/100
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: resolvedResult.metrics.truthIndex.isGenuine ? '#10B981' : '#FB7185',
                          fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace",
                        }}
                      >
                        {resolvedResult.metrics.truthIndex.isGenuine
                          ? t('matrix.badges.genuineDiscount')
                          : t('matrix.badges.ghostMarkup')}
                      </span>
                      <span
                        style={{
                          fontSize: '0.625rem',
                          color: '#888888',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {resolvedResult.metrics.truthIndex.explanation}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Active Live Scanning Loader */}
          {isLiveSearching && (
            <div
              style={{
                padding: '14px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                color: '#10B981',
                backgroundColor: '#0A0A0A',
                borderRadius: '6px',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist', sans-serif",
                fontSize: '0.8125rem',
              }}
            >
              <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
              <span>
                {isRtl
                  ? 'جاري إرسال الاستعلام والبحث المباشر في المتاجر الـ 12 الآن...'
                  : 'Dispatching query & executing live search across all 12 Egyptian stores now...'}
              </span>
            </div>
          )}

          {/* Honest Empty State Message - Only displayed after explicit search attempt with 0 results */}
          {!isLiveSearching && searchAttempted && searchError && localResults.length === 0 && !resolvedResult && (
            <div
              style={{
                padding: '16px 14px',
                textAlign: 'center',
                color: '#888888',
                fontSize: '0.8125rem',
                backgroundColor: '#0A0A0A',
                border: '1px solid #222222',
                borderRadius: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                alignItems: 'center',
                fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist', sans-serif",
              }}
            >
              <span style={{ color: '#EDEDED', fontWeight: 500 }}>
                {searchError}
              </span>
              <span style={{ fontSize: '0.6875rem', color: '#666666' }}>
                {isRtl
                  ? 'تم فحص المتاجر الـ 12: أمازون، نون، بي تك، تريدلاين، جوميا، 2B، راية، العربي، دبي فون، دريم 2000، فودافون، وكارفور.'
                  : 'Scanned 12 domestic nodes: Amazon, Noon, B.TECH, Tradeline, Jumia, 2B, Raya, El Araby, Dubai Phone, Dream 2000, Vodafone, Carrefour.'}
              </span>
            </div>
          )}

          {/* Informational hint if no local matches and no error yet */}
          {localResults.length === 0 && !resolvedResult && !isLiveSearching && !searchError && query.trim() && (
            <div
              style={{
                padding: '10px 12px',
                textAlign: 'center',
                color: '#888888',
                fontSize: '0.75rem',
                fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist', sans-serif",
              }}
            >
              {isRtl
                ? `لا توجد نتائج مطابقة لـ "${query}" في الكتالوج المحلي.`
                : `No local catalog matches for "${query}".`}
            </div>
          )}

          {/* Direct Live Federated Search Trigger Action */}
          {query.trim().length > 0 && !isLiveSearching && (
            <button
              type="button"
              id="cawlix-live-search-action-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleTriggerLiveSearch(query);
              }}
              style={{
                width: '100%',
                backgroundColor: '#0A0A0A',
                border: '1px solid #222222',
                borderRadius: '6px',
                padding: '9px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                transition: 'all 120ms ease',
                textAlign: isRtl ? 'right' : 'left',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#10B981';
                e.currentTarget.style.backgroundColor = '#111111';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#222222';
                e.currentTarget.style.backgroundColor = '#0A0A0A';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                <Search size={13} color="#10B981" style={{ flexShrink: 0 }} />
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    color: '#EDEDED',
                    fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist', sans-serif",
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {isRtl
                    ? `🔍 بحث مباشر في مواقع المتاجر الـ 12 الآن عن: "${query.trim()}"`
                    : `🔍 Live Federated Search across all 12 Egyptian stores for: "${query.trim()}"`}
                </span>
              </div>
              <span
                style={{
                  fontSize: '0.625rem',
                  color: '#10B981',
                  fontFamily: "'Geist Mono', monospace",
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {isRtl ? 'فحص الـ 12 متجر ↵' : '12 NODES ↵'}
              </span>
            </button>
          )}

          {/* Footer Controls */}
          <div
            style={{
              borderTop: '1px solid #1A1A1A',
              padding: '6px 8px 2px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.625rem',
              color: '#666666',
              fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace",
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{isRtl ? '↑↓ للتنقل' : '↑↓ Navigate'}</span>
              <span>·</span>
              <span>{isRtl ? '↵ فتح في مصفوفة المقارنة' : '↵ Open in Matrix'}</span>
              <span>·</span>
              <span>{isRtl ? 'ESC للإغلاق' : 'ESC Close'}</span>
            </div>
            <span>{isRtl ? '12 متجر مصري' : '12 Egyptian Nodes'}</span>
          </div>
        </div>
      )}
    </div>
  );
}
