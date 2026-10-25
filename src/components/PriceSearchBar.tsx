import React, { useState, useCallback } from 'react';
import { Search, Zap } from 'lucide-react';
import type { RetailerId } from '@shared/types/index';

const RETAILERS = [
  { id: 'amazon_eg' as RetailerId, name: 'Amazon EG' },
  { id: 'btech' as RetailerId, name: 'B.TECH' },
  { id: 'noon_eg' as RetailerId, name: 'Noon' },
  { id: 'tradeline' as RetailerId, name: 'TradeLine' },
  { id: 'carrefour_eg' as RetailerId, name: 'Carrefour' },
  { id: 'jumia_eg' as RetailerId, name: 'Jumia' },
  { id: 'raneen' as RetailerId, name: 'Raneen' },
  { id: '2b' as RetailerId, name: '2B' },
  { id: 'hisense_eg' as RetailerId, name: 'Hisense' },
  { id: 'hyper_one' as RetailerId, name: 'Hyper One' },
  { id: 'amazon_us' as RetailerId, name: 'Amazon US' },
  { id: 'newegg' as RetailerId, name: 'Newegg' },
];

import { searchLocalMasterProducts } from '../services/productResolver';
import { PLATFORMS_REGISTRY } from '../services/marketIntelligenceData';

interface SearchResult {
  retailer: string;
  price: number;
  delta: number;
  inStock: boolean;
}

function searchVerifiedCatalog(query: string): SearchResult[] {
  if (!query.trim()) return [];
  const matches = searchLocalMasterProducts(query);
  if (matches.length === 0) return [];

  const product = matches[0];
  const listings = (product.platform_listings || []).filter((l: any) => l.current_price > 0);
  if (listings.length === 0) return [];

  const minPrice = Math.min(...listings.map((l: any) => l.current_price));

  return listings.map((l: any) => {
    const platform = PLATFORMS_REGISTRY.find((p) => p.id === l.platform_id);
    const diffPct = minPrice > 0 ? parseFloat((((l.current_price - minPrice) / minPrice) * 100).toFixed(1)) : 0;
    return {
      retailer: platform ? platform.name : l.platform_id,
      price: l.current_price,
      delta: diffPct,
      inStock: l.stock_status === 'IN_STOCK' || l.stock_status === 'LOW_STOCK',
    };
  }).sort((a: SearchResult, b: SearchResult) => a.price - b.price);
}

export default function PriceSearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    setIsSearching(true);
    await new Promise((r) => setTimeout(r, 200));
    setResults(searchVerifiedCatalog(q));
    setIsSearching(false);
    setHasSearched(true);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch(query);
  };

  const cheapest = results[0];

  return (
    <div style={{ width: '100%', maxWidth: '720px', margin: '0 auto' }}>
      {/* Search Input */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          transition: 'border-color 150ms ease',
        }}
      >
        <div style={{ padding: '0 14px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
          <Search size={16} strokeWidth={1.5} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search product — e.g. iPhone 15 Pro, RTX 4090, Samsung QD-OLED…"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.9375rem',
            padding: '14px 0',
          }}
        />
        <div style={{ padding: '0 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '2px 6px', borderRadius: '4px' }}>
            ↵ ENTER
          </span>
          <button
            onClick={() => handleSearch(query)}
            disabled={isSearching}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {isSearching ? (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem' }}>PROBING…</span>
            ) : (
              <>
                <Zap size={12} strokeWidth={1.5} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem' }}>PROBE</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Retailer chips */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '12px' }}>
        {RETAILERS.slice(0, 8).map((r) => (
          <span
            key={r.id}
            className="badge badge-neutral"
            style={{ fontSize: '0.625rem', cursor: 'default' }}
          >
            {r.name}
          </span>
        ))}
        <span className="badge badge-neutral" style={{ fontSize: '0.625rem' }}>+4 more</span>
      </div>

      {/* Results table */}
      {hasSearched && results.length > 0 && (
        <div
          className="card"
          style={{ marginTop: '16px', overflow: 'hidden' }}
        >
          <div
            style={{
              padding: '10px 16px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {results.length} retailers probed · best price highlighted
            </span>
          </div>
          <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
            {results.map((r, i) => {
              const isBest = i === 0;
              const isPositive = r.delta > 0;
              return (
                <div
                  key={r.retailer}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto auto auto',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '10px 16px',
                    borderBottom: i < results.length - 1 ? '1px solid var(--border)' : 'none',
                    background: isBest ? 'var(--brand-tint)' : 'transparent',
                    transition: 'background 150ms ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isBest && <span className="badge badge-brand" style={{ fontSize: '0.55rem' }}>BEST</span>}
                    <span style={{ fontSize: '0.875rem', color: isBest ? 'var(--brand)' : 'var(--text-primary)', fontWeight: isBest ? 500 : 400 }}>
                      {r.retailer}
                    </span>
                    {!r.inStock && <span className="badge badge-danger" style={{ fontSize: '0.55rem' }}>OOS</span>}
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: isBest ? 'var(--brand)' : 'var(--text-primary)', fontWeight: 500 }}>
                    EGP {r.price.toLocaleString('en-EG')}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: isPositive ? 'var(--danger)' : 'var(--success)' }}>
                    {isPositive ? '+' : ''}{r.delta}%
                  </span>
                  <button className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                    Probe
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {hasSearched && results.length === 0 && (
        <div
          className="card"
          style={{
            marginTop: '16px',
            padding: '24px 16px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.875rem',
          }}
        >
          عفواً، هذا المنتج غير مدرج في كتالوج الأجهزة المعتمدة حالياً.
        </div>
      )}
    </div>
  );
}
