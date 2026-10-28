import { useState, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Bell,
  Mail,
  Zap,
  CheckCircle2,
  Search,
} from 'lucide-react';
import { SEEDED_MASTER_PRODUCTS, PLATFORMS_REGISTRY } from '../../services/marketIntelligenceData.js';
import { useLanguage } from '../../context/LanguageContext';
import CustomDropdown from './CustomDropdown.jsx';

export default function WatchlistManager({ onInspectProduct = null, onShowToast = null }) {
  const { lang, isRtl, t, getRetailerName, formatCurrency } = useLanguage();
  // Pre-seeded trader watchlist rules
  const [watchlist, setWatchlist] = useState([
    {
      id: 'wl-1',
      productId: 'caw_prod_mbp14_m3',
      title: 'Apple MacBook Pro 14" M3 Pro 18GB/512GB (Space Black)',
      brand: 'Apple',
      category: 'Laptops & Computing',
      currentLowestPrice: 54900,
      cheapestPlatform: 'Amazon Egypt',
      targetPrice: 52000,
      stockWatchActive: true,
      emailDispatch: true,
      inAppAlert: true,
      flashCrashAlert: true,
    },
    {
      id: 'wl-2',
      productId: 'caw_prod_ip16pm_256',
      title: 'Apple iPhone 16 Pro Max 256GB Natural Titanium (Domestic Cairo)',
      brand: 'Apple',
      category: 'Smartphones',
      currentLowestPrice: 64500,
      cheapestPlatform: 'Noon Egypt',
      targetPrice: 65000, // Trigger met!
      stockWatchActive: true,
      emailDispatch: true,
      inAppAlert: true,
      flashCrashAlert: true,
    },
    {
      id: 'wl-3',
      productId: 'caw_prod_sony_xm5',
      title: 'Sony WH-1000XM5 Wireless Noise-Canceling Headphones',
      brand: 'Sony',
      category: 'Audio & Wearables',
      currentLowestPrice: 16800,
      cheapestPlatform: 'Tradeline',
      targetPrice: 15500,
      stockWatchActive: false,
      emailDispatch: false,
      inAppAlert: true,
      flashCrashAlert: false,
    },
  ]);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(SEEDED_MASTER_PRODUCTS[0]?.id || '');
  const [targetPriceInput, setTargetPriceInput] = useState('50000');
  const [searchFilter, setSearchFilter] = useState('');

  // Handle adding new SKU to Watchlist
  const handleAddWatchlist = (e) => {
    e.preventDefault();
    const product = SEEDED_MASTER_PRODUCTS.find((p) => p.id === selectedProductId);
    if (!product) return;

    // Calculate current lowest in-stock price
    const activeListings = (product.listings || []).filter(
      (l) => l.current_price > 0 && (l.stock_status === 'IN_STOCK' || l.stock_status === 'LOW_STOCK')
    );
    const lowestListing = activeListings.sort((a, b) => a.current_price - b.current_price)[0];
    const platformMeta = PLATFORMS_REGISTRY.find((p) => p.id === lowestListing?.platform_id);

    const newItem = {
      id: `wl-${Date.now()}`,
      productId: product.id,
      title: product.title,
      brand: product.brand,
      category: product.category,
      currentLowestPrice: lowestListing?.current_price || 60000,
      cheapestPlatform: platformMeta?.name || 'Amazon Egypt',
      targetPrice: parseFloat(targetPriceInput) || 50000,
      stockWatchActive: true,
      emailDispatch: true,
      inAppAlert: true,
      flashCrashAlert: true,
    };

    setWatchlist((prev) => [newItem, ...prev]);
    setAddModalOpen(false);
    if (onShowToast) {
      onShowToast('Watchlist Target Configured', `Active monitoring initiated for ${product.title} at EGP ${newItem.targetPrice.toLocaleString()}`);
    }
  };

  const handleToggleRule = (id, ruleKey) => {
    setWatchlist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [ruleKey]: !item[ruleKey] } : item
      )
    );
  };

  const handleDeleteItem = (id, title) => {
    setWatchlist((prev) => prev.filter((item) => item.id !== id));
    if (onShowToast) {
      onShowToast('Target Removed', `Stopped monitoring for ${title}`);
    }
  };

  // Filter watchlist
  const filteredWatchlist = useMemo(() => {
    if (!searchFilter.trim()) return watchlist;
    const q = searchFilter.toLowerCase().trim();
    return watchlist.filter(
      (i) => i.title.toLowerCase().includes(q) || i.brand.toLowerCase().includes(q)
    );
  }, [watchlist, searchFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ── 1. HEADER CONTROLS ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
          backgroundColor: '#000000',
          border: '1px solid #1F1F1F',
          borderRadius: '8px',
          padding: '12px 16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '240px' }}>
          <Search size={14} color="#666666" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder={isRtl ? 'ابحث في قائمة المتابعة والتنبيهات...' : 'Search tracked watchlist SKUs...'}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#EDEDED',
              fontSize: '0.8125rem',
              outline: 'none',
              width: '100%',
              fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist', sans-serif",
            }}
          />
        </div>

        <button
          type="button"
          onClick={() => setAddModalOpen(true)}
          style={{
            backgroundColor: '#FFFFFF',
            color: '#000000',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 14px',
            fontSize: '0.8125rem',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist', sans-serif",
            transition: 'background-color 120ms ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#EAEAEA')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
        >
          <Plus size={14} />
          <span>{isRtl ? 'إضافة تنبيه سعر مستهدف' : 'Add Target Trigger'}</span>
        </button>
      </div>

      {/* ── 2. WATCHLIST TABLE ── */}
      <div
        style={{
          backgroundColor: '#000000',
          border: '1px solid #1F1F1F',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRtl ? 'right' : 'left', fontSize: '0.8125rem' }}>
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid #1F1F1F',
                  color: '#888888',
                  fontSize: '0.6875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist Mono', monospace",
                }}
              >
                <th style={{ padding: '12px 18px', fontWeight: 500 }}>{isRtl ? 'المنتج قيد المراقبة' : 'Monitored SKU'}</th>
                <th style={{ padding: '12px 18px', fontWeight: 500 }}>{isRtl ? 'أرخص سعر حالياً' : 'Live Best Price'}</th>
                <th style={{ padding: '12px 18px', fontWeight: 500 }}>{isRtl ? 'سعر الشراء المستهدف' : 'Limit Target Price'}</th>
                <th style={{ padding: '12px 18px', fontWeight: 500 }}>{isRtl ? 'فارق الوصول للهدف' : 'Distance to Target'}</th>
                <th style={{ padding: '12px 18px', fontWeight: 500 }}>{isRtl ? 'قنوات التنبيه' : 'Dispatch Channels'}</th>
                <th style={{ padding: '12px 18px', fontWeight: 500, textAlign: isRtl ? 'left' : 'right' }}>{isRtl ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {filteredWatchlist.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: '#666666', fontFamily: "'Geist Mono', monospace" }}>
                    No target rules defined. Click "Add Target Trigger" to start tracking limit orders.
                  </td>
                </tr>
              ) : (
                filteredWatchlist.map((item) => {
                  const isTriggerMet = item.currentLowestPrice <= item.targetPrice;
                  const priceDiff = item.currentLowestPrice - item.targetPrice;
                  const diffPct = ((priceDiff / item.targetPrice) * 100).toFixed(1);

                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: '1px solid #141414',
                        backgroundColor: isTriggerMet ? 'rgba(16, 185, 129, 0.03)' : 'transparent',
                        borderLeft: isTriggerMet ? '3px solid #10B981' : '3px solid transparent',
                        transition: 'background-color 100ms ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isTriggerMet) e.currentTarget.style.backgroundColor = '#070707';
                      }}
                      onMouseLeave={(e) => {
                        if (!isTriggerMet) e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {/* Title & Brand */}
                      <td style={{ padding: '14px 18px', maxWidth: '300px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span
                            style={{
                              fontWeight: 600,
                              color: '#EDEDED',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              fontFamily: "'Geist', sans-serif",
                            }}
                            title={item.title}
                          >
                            {item.title}
                          </span>
                          <span style={{ fontSize: '0.6875rem', color: '#888888', fontFamily: "'Geist Mono', monospace" }}>
                            {item.brand} • {item.category}
                          </span>
                        </div>
                      </td>

                      {/* Current Lowest Price */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#EDEDED', fontFamily: "'Geist Mono', monospace" }}>
                            {formatCurrency(item.currentLowestPrice)}
                          </span>
                          <span style={{ fontSize: '0.6875rem', color: '#10B981', fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist Mono', monospace" }}>
                            {isRtl ? `عبر ${getRetailerName(item.cheapestPlatform, lang)}` : `via ${getRetailerName(item.cheapestPlatform, lang)}`}
                          </span>
                        </div>
                      </td>

                      {/* Limit Target Price */}
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#00DF8F', fontFamily: "'Geist Mono', monospace" }}>
                          {formatCurrency(item.targetPrice)}
                        </span>
                      </td>

                      {/* Distance to Target Status */}
                      <td style={{ padding: '14px 18px' }}>
                        {isTriggerMet ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <CheckCircle2 size={13} color="#10B981" />
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#10B981', fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist Mono', monospace" }}>
                              {isRtl ? `تم الوصول للهدف (وفر ${formatCurrency(Math.abs(priceDiff))})` : `TRIGGER MET (-${formatCurrency(Math.abs(priceDiff))})`}
                            </span>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '0.75rem', color: '#F59E0B', fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist Mono', monospace" }}>
                              +{formatCurrency(priceDiff)} ({diffPct}% {isRtl ? 'أعلى من الهدف' : 'above'})
                            </span>
                            <span style={{ fontSize: '0.625rem', color: '#666666', fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist', sans-serif" }}>
                              {isRtl ? 'أمر شراء معلق في انتظار هبوط السعر' : 'Standing limit order waiting'}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Dispatch Rules Toggle Switches */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {/* Brevo Email Dispatch */}
                          <button
                            type="button"
                            onClick={() => handleToggleRule(item.id, 'emailDispatch')}
                            style={{
                              backgroundColor: 'transparent',
                              border: 'none',
                              color: item.emailDispatch ? '#10B981' : '#71717A',
                              padding: '2px 4px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.6875rem',
                              fontFamily: "'Geist Mono', monospace",
                              transition: 'color 120ms ease, opacity 120ms ease',
                              opacity: item.emailDispatch ? 1 : 0.6,
                            }}
                            title="Brevo Email Webhook Dispatch"
                          >
                            <Mail size={12} />
                            <span>Email</span>
                          </button>

                          {/* In-App Bell */}
                          <button
                            type="button"
                            onClick={() => handleToggleRule(item.id, 'inAppAlert')}
                            style={{
                              backgroundColor: 'transparent',
                              border: 'none',
                              color: item.inAppAlert ? '#10B981' : '#71717A',
                              padding: '2px 4px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.6875rem',
                              fontFamily: "'Geist Mono', monospace",
                              transition: 'color 120ms ease, opacity 120ms ease',
                              opacity: item.inAppAlert ? 1 : 0.6,
                            }}
                            title="Console Bell Notification"
                          >
                            <Bell size={12} />
                            <span>In-App</span>
                          </button>

                          {/* Flash Crash >15% */}
                          <button
                            type="button"
                            onClick={() => handleToggleRule(item.id, 'flashCrashAlert')}
                            style={{
                              backgroundColor: 'transparent',
                              border: 'none',
                              color: item.flashCrashAlert ? '#FB7185' : '#71717A',
                              padding: '2px 4px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.6875rem',
                              fontFamily: "'Geist Mono', monospace",
                              transition: 'color 120ms ease, opacity 120ms ease',
                              opacity: item.flashCrashAlert ? 1 : 0.6,
                            }}
                            title="Flash Crash (>15%) Emergency Intercept"
                          >
                            <Zap size={12} />
                            <span>Crash Alert</span>
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          {onInspectProduct && (
                            <button
                              type="button"
                              onClick={() => onInspectProduct(item.productId)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#10B981',
                                fontSize: '0.6875rem',
                                cursor: 'pointer',
                                padding: '4px',
                                fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist', sans-serif",
                              }}
                            >
                              {isRtl ? 'المصفوفة' : 'Matrix'}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id, item.title)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#666666',
                              cursor: 'pointer',
                              padding: '4px',
                              display: 'flex',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#FB7185')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = '#666666')}
                            title="Delete Target"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 3. ADD TARGET MODAL ── */}
      {addModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#000000',
              border: '1px solid #222222',
              borderRadius: '8px',
              padding: '24px',
              width: '100%',
              maxWidth: '460px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#EDEDED', margin: 0 }}>
                Configure Price Target Trigger
              </h3>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#888888', cursor: 'pointer', fontSize: '1.25rem' }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddWatchlist} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#888888', display: 'block', marginBottom: '6px' }}>
                  Target Product / SKU
                </label>
                <CustomDropdown
                  value={selectedProductId}
                  onChange={setSelectedProductId}
                  isRtl={isRtl}
                  style={{ width: '100%' }}
                  minWidth="100%"
                  options={SEEDED_MASTER_PRODUCTS.map((prod) => ({
                    value: prod.id,
                    label: `${prod.title} (${prod.brand})`,
                  }))}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#888888', display: 'block', marginBottom: '6px' }}>
                  Limit Target Price (EGP)
                </label>
                <input
                  type="number"
                  value={targetPriceInput}
                  onChange={(e) => setTargetPriceInput(e.target.value)}
                  placeholder="e.g. 52000"
                  required
                  style={{
                    width: '100%',
                    backgroundColor: '#0A0A0A',
                    border: '1px solid #222222',
                    color: '#EDEDED',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '0.8125rem',
                    fontFamily: "'Geist Mono', monospace",
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  style={{
                    backgroundColor: '#111111',
                    border: '1px solid #222222',
                    color: '#888888',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: '#000000',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Save Target Trigger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
