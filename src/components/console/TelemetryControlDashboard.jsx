import { useState, useEffect, useRef } from 'react';
import {
  searchLocalMasterProducts,
  resolveProductAcrossPlatforms,
} from '../../services/productResolver';
import {
  Search,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Layers,
  CheckCircle2,
  Clock,
  Loader2,
  Zap,
} from 'lucide-react';

/**
 * Institutional Pitch-Black Telemetry Control & Universal Search Dashboard (CAWLIX)
 * Debounced multi-platform search, local catalog matching, command palette dropdown,
 * and instant drill-down into Market Matrix.
 */
export default function TelemetryControlDashboard({
  onSelectProduct,
  className = '',
  placeholder = 'Search SKUs, domestic nodes, or retailers...',
}) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [localResults, setLocalResults] = useState([]);
  const [resolvedResult, setResolvedResult] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // 1. Debounce Input by 350ms
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!query.trim()) {
      setDebouncedQuery('');
      setLocalResults([]);
      setResolvedResult(null);
      setIsResolving(false);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 350);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  // 2. Perform Local Catalog Search & Multi-Platform Resolution on debounced query
  useEffect(() => {
    if (!debouncedQuery) {
      setLocalResults([]);
      setResolvedResult(null);
      setIsResolving(false);
      return;
    }

    // Step A: Immediate local catalog matching
    const matched = searchLocalMasterProducts(debouncedQuery);
    setLocalResults(matched);

    // Step B: If no local master matches found, trigger live multi-platform resolver
    let isCancelled = false;
    async function triggerResolver() {
      setIsResolving(true);
      try {
        const result = await resolveProductAcrossPlatforms(debouncedQuery);
        if (!isCancelled) {
          setResolvedResult(result);
        }
      } catch (err) {
        console.error('[Universal Resolver Error]:', err);
      } finally {
        if (!isCancelled) {
          setIsResolving(false);
        }
      }
    }

    triggerResolver();

    return () => {
      isCancelled = true;
    };
  }, [debouncedQuery]);

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
  if (resolvedResult) {
    navigableItems.push({ type: 'resolved', data: resolvedResult });
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
        } else {
          handleSelectResolvedProduct(item.data);
        }
      } else if (query.trim()) {
        // Explicitly trigger resolver on enter
        setIsResolving(true);
        try {
          const res = await resolveProductAcrossPlatforms(query.trim());
          setResolvedResult(res);
          handleSelectResolvedProduct(res);
        } catch (err) {
          console.error('Enter resolver execution error:', err);
        } finally {
          setIsResolving(false);
        }
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
        {isResolving ? (
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
          placeholder={placeholder}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: '#EDEDED',
            fontSize: '0.8125rem',
            fontFamily: "'Geist', sans-serif",
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
                  ? 'Probing 12 Egyptian Nodes...'
                  : 'Multi-Platform Query Resolver Active'}
              </span>
            </div>

            <span
              style={{
                fontSize: '0.625rem',
                color: '#666666',
                fontFamily: "'Geist Mono', monospace",
              }}
            >
              350ms Debounced · ↵ Inspect
            </span>
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
                Local Master SKUs ({localResults.length})
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
                              fontFamily: "'Geist Mono', monospace",
                            }}
                          >
                            Cheapest at {item.lowestPlatformName || item.lowestPlatformId}: EGP{' '}
                            {item.lowestPrice.toLocaleString()}
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
                  fontFamily: "'Geist Mono', monospace",
                  padding: '4px 8px 0 8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>Universal Multi-Platform Resolution (12 Nodes)</span>
                <span style={{ color: '#10B981' }}>
                  {resolvedResult.source === 'LOCAL_CATALOG' ? 'Catalog Correlated' : 'Real-time Ingest'}
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
                          fontFamily: "'Geist Mono', monospace",
                        }}
                      >
                        MASTER ENTITY
                      </span>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#EDEDED' }}>
                        {resolvedResult.masterProduct.title}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: '#888888', marginTop: '2px', display: 'block' }}>
                      Model: {resolvedResult.masterProduct.model}
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
                    <span>Market Matrix</span>
                    <ArrowRight size={12} />
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
                            fontFamily: "'Geist Mono', monospace",
                          }}
                        >
                          CHEAPEST NODE (BEST DEAL)
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#EDEDED' }}>
                          {resolvedResult.metrics.cheapestNode.platformName}
                        </span>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: '#10B981',
                            fontFamily: "'Geist Mono', monospace",
                          }}
                        >
                          EGP {resolvedResult.metrics.cheapestNode.price.toLocaleString()}
                        </span>
                      </div>
                      {resolvedResult.metrics.cheapestNode.deltaSavings > 0 && (
                        <span
                          style={{
                            fontSize: '0.625rem',
                            color: '#888888',
                            fontFamily: "'Geist Mono', monospace",
                          }}
                        >
                          EGP {resolvedResult.metrics.cheapestNode.deltaSavings.toLocaleString()} below median (-
                          {resolvedResult.metrics.cheapestNode.deltaSavingsPct}%)
                        </span>
                      )}
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
                            fontFamily: "'Geist Mono', monospace",
                          }}
                        >
                          DOMESTIC GUARANTEE LEADER
                        </span>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#EDEDED' }}>
                        {resolvedResult.metrics.domesticGuaranteeLeader.platformName}
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
                            fontFamily: "'Geist Mono', monospace",
                          }}
                        >
                          HIGHEST RATED NODE
                        </span>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#EDEDED' }}>
                        {resolvedResult.metrics.highestRatedNode.platformName}
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
                            fontFamily: "'Geist Mono', monospace",
                          }}
                        >
                          TRUTH INDEX: {resolvedResult.metrics.truthIndex.score}/100
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: resolvedResult.metrics.truthIndex.isGenuine ? '#10B981' : '#FB7185',
                          fontFamily: "'Geist Mono', monospace",
                        }}
                      >
                        {resolvedResult.metrics.truthIndex.isGenuine
                          ? 'Authentic Markdown'
                          : 'Ghost Markup Detected'}
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

          {/* Empty State / Prompt */}
          {localResults.length === 0 && !resolvedResult && !isResolving && query.trim() && (
            <div
              style={{
                padding: '16px 12px',
                textAlign: 'center',
                color: '#666666',
                fontSize: '0.8125rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                alignItems: 'center',
              }}
            >
              <span>No exact SKU matches in catalog for "{query}".</span>
              <button
                type="button"
                onClick={async () => {
                  setIsResolving(true);
                  try {
                    const res = await resolveProductAcrossPlatforms(query.trim());
                    setResolvedResult(res);
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setIsResolving(false);
                  }
                }}
                style={{
                  backgroundColor: '#111111',
                  border: '1px solid #333333',
                  borderRadius: '5px',
                  color: '#EDEDED',
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Zap size={12} color="#10B981" />
                <span>Execute Universal Multi-Platform Resolution</span>
              </button>
            </div>
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
              fontFamily: "'Geist Mono', monospace",
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>↑↓ Navigate</span>
              <span>·</span>
              <span>↵ Open in Matrix</span>
              <span>·</span>
              <span>ESC Close</span>
            </div>
            <span>12 Egyptian Nodes</span>
          </div>
        </div>
      )}
    </div>
  );
}
