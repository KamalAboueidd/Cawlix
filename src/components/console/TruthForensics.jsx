import { useState, useMemo } from 'react';
import {
  Radar,
  ShieldAlert,
  TrendingUp,
  Search,
  CheckCircle2,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { SEEDED_MASTER_PRODUCTS, PLATFORMS_REGISTRY } from '../../services/marketIntelligenceData.js';

export default function TruthForensics({ onInspectProduct = null, onShowToast = null }) {
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [selectedRetailer, setSelectedRetailer] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [reVerifyingId, setReVerifyingId] = useState(null);

  // Pre-seeded Forensic Anomalies intercepted across Egyptian retailers
  const [anomalies] = useState([
    {
      id: 'RADAR-EG-901',
      productId: 'caw_prod_ip16pm_256',
      title: 'Apple iPhone 16 Pro Max 256GB Natural Titanium',
      retailerId: 'JUMIA_EG',
      retailerName: 'Jumia Egypt',
      anomalyType: 'GHOST_MARKUP',
      description: 'Reference "Was" price artificially inflated by 16.5% 3 days before promotional campaign.',
      advertisedOriginalPrice: 78500,
      genuineBaselinePrice: 67900,
      currentActivePrice: 66999,
      advertisedDiscountPct: 14.6,
      realEconomicDiscountPct: 1.3,
      inflationAmount: 10600,
      severity: 'CRITICAL',
      detectedAt: '2 hours ago',
      verifiedEvidence: 'Historical price baseline locked at 67,900 EGP for 42 consecutive days prior.',
    },
    {
      id: 'RADAR-EG-902',
      productId: 'caw_prod_s24u_512',
      title: 'Samsung Galaxy S24 Ultra 512GB Titanium Gray',
      retailerId: 'CARREFOUR_EG',
      retailerName: 'Carrefour Egypt',
      anomalyType: 'ARTIFICIAL_ANCHOR',
      description: 'Fictitious strikethrough price that was never offered on active domestic catalog.',
      advertisedOriginalPrice: 65999,
      genuineBaselinePrice: 54500,
      currentActivePrice: 53999,
      advertisedDiscountPct: 18.2,
      realEconomicDiscountPct: 0.9,
      inflationAmount: 11499,
      severity: 'CRITICAL',
      detectedAt: '4 hours ago',
      verifiedEvidence: 'Zero platform transactions logged at 65,999 EGP in past 90 days.',
    },
    {
      id: 'RADAR-EG-903',
      productId: 'caw_prod_mbp14_m3',
      title: 'Apple MacBook Pro 14" M3 Pro 18GB/512GB (Space Black)',
      retailerId: 'DREAM_2000',
      retailerName: 'Dream 2000',
      anomalyType: 'PRE_PROMO_JACKUP',
      description: 'Shelf price hiked by 4,000 EGP on Monday, then discounted by 4,200 EGP on Friday.',
      advertisedOriginalPrice: 59900,
      genuineBaselinePrice: 55900,
      currentActivePrice: 55700,
      advertisedDiscountPct: 7.0,
      realEconomicDiscountPct: 0.4,
      inflationAmount: 4000,
      severity: 'HIGH',
      detectedAt: '7 hours ago',
      verifiedEvidence: 'Rapid oscillation spike detected 48 hours prior to banner announcement.',
    },
    {
      id: 'RADAR-EG-904',
      productId: 'caw_prod_ps5_slim',
      title: 'Sony PlayStation 5 Slim Digital Edition (1TB SSD)',
      retailerId: 'DUBAI_PHONE',
      retailerName: 'Dubai Phone',
      anomalyType: 'PHANTOM_STOCK_DUMP',
      description: 'Extreme advertised discount on out-of-stock SKU used as search bait.',
      advertisedOriginalPrice: 32000,
      genuineBaselinePrice: 28900,
      currentActivePrice: 24999,
      advertisedDiscountPct: 21.9,
      realEconomicDiscountPct: 13.5,
      inflationAmount: 3100,
      severity: 'MEDIUM',
      detectedAt: '12 hours ago',
      verifiedEvidence: 'Checkout payload returns instant "OUT_OF_STOCK" on step 2.',
    },
    {
      id: 'RADAR-EG-905',
      productId: 'caw_prod_delonghi_dedica',
      title: 'DeLonghi Dedica Deluxe EC685.M Pump Espresso Machine',
      retailerId: 'NOON_EG',
      retailerName: 'Noon Egypt',
      anomalyType: 'THIRD_PARTY_SPIKE',
      description: 'Marketplace seller anchor price exceeds official local distributor MSRP by 28%.',
      advertisedOriginalPrice: 13900,
      genuineBaselinePrice: 9900,
      currentActivePrice: 9699,
      advertisedDiscountPct: 30.2,
      realEconomicDiscountPct: 2.0,
      inflationAmount: 4000,
      severity: 'MEDIUM',
      detectedAt: '1 day ago',
      verifiedEvidence: 'Official distributor MSRP verified at 9,999 EGP.',
    },
    {
      id: 'RADAR-EG-906',
      productId: 'caw_prod_airpods_pro2',
      title: 'Apple AirPods Pro (2nd Generation with USB-C)',
      retailerId: '2B_EG',
      retailerName: '2B Egypt',
      anomalyType: 'GHOST_MARKUP',
      description: 'Strikethrough baseline inflated prior to weekend tech flash sale.',
      advertisedOriginalPrice: 15400,
      genuineBaselinePrice: 12900,
      currentActivePrice: 12699,
      advertisedDiscountPct: 17.5,
      realEconomicDiscountPct: 1.6,
      inflationAmount: 2500,
      severity: 'LOW',
      detectedAt: '2 days ago',
      verifiedEvidence: 'Baseline verified against 12 platforms aggregate.',
    },
  ]);

  // Filtering
  const filteredAnomalies = useMemo(() => {
    return anomalies.filter((item) => {
      if (filterSeverity !== 'ALL' && item.severity !== filterSeverity) {
        return false;
      }
      if (selectedRetailer !== 'ALL' && item.retailerId !== selectedRetailer) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.retailerName.toLowerCase().includes(q) ||
          item.anomalyType.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [anomalies, filterSeverity, selectedRetailer, searchQuery]);

  // Handle re-verification probe
  const handleReVerify = (anomalyId) => {
    setReVerifyingId(anomalyId);
    setTimeout(() => {
      setReVerifyingId(null);
      if (onShowToast) {
        onShowToast(`Forensic re-audit complete: Anomaly ${anomalyId} evidence re-confirmed and locked.`, 'success');
      }
    }, 1000);
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'CRITICAL':
        return { color: '#FB7185', bg: 'rgba(251, 113, 133, 0.1)', border: 'rgba(251, 113, 133, 0.25)' };
      case 'HIGH':
        return { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.25)' };
      case 'MEDIUM':
        return { color: '#EAB308', bg: 'rgba(234, 179, 8, 0.1)', border: 'rgba(234, 179, 8, 0.25)' };
      default:
        return { color: '#888888', bg: 'rgba(136, 136, 136, 0.1)', border: 'rgba(136, 136, 136, 0.2)' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Radar Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
        }}
      >
        <div
          style={{
            background: '#0A0A0A',
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
              Active Radar Intercepts
            </span>
            <Radar size={14} color="#FB7185" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#FB7185', fontFamily: "'Geist Mono', monospace" }}>
              {anomalies.length}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#FB7185', fontFamily: "'Geist', sans-serif" }}>
              2 Critical
            </span>
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#666666' }}>
            Flagged across 12 domestic retailers
          </div>
        </div>

        <div
          style={{
            background: '#0A0A0A',
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
              Average Anchor Markup
            </span>
            <TrendingUp size={14} color="#F59E0B" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#F59E0B', fontFamily: "'Geist Mono', monospace" }}>
              +16.4%
            </span>
            <span style={{ fontSize: '0.75rem', color: '#888888', fontFamily: "'Geist Mono', monospace" }}>
              ~6,500 EGP
            </span>
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#666666' }}>
            Artificial inflation before advertised discount
          </div>
        </div>

        <div
          style={{
            background: '#0A0A0A',
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
              Claimed vs Real Delta
            </span>
            <ShieldAlert size={14} color="#EDEDED" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#EDEDED', fontFamily: "'Geist Mono', monospace" }}>
              15.8%
            </span>
            <span style={{ fontSize: '0.75rem', color: '#FB7185', fontFamily: "'Geist', sans-serif" }}>
              vs 1.2% actual
            </span>
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#666666' }}>
            Deceptive delta between claim and real baseline
          </div>
        </div>

        <div
          style={{
            background: '#0A0A0A',
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
              CPA Legal Compliance
            </span>
            <CheckCircle2 size={14} color="#10B981" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#10B981', fontFamily: "'Geist Mono', monospace" }}>
              100%
            </span>
            <span style={{ fontSize: '0.75rem', color: '#10B981', fontFamily: "'Geist', sans-serif" }}>
              Evidence Logged
            </span>
          </div>
          <div style={{ fontSize: '0.6875rem', color: '#666666' }}>
            Meets Egyptian Law 181/2018 standards
          </div>
        </div>
      </div>

      {/* Control Filter Bar */}
      <div
        style={{
          background: '#0A0A0A',
          border: '1px solid #1F1F1F',
          borderRadius: '8px',
          padding: '14px 18px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', flex: 1 }}>
          {/* Search Input */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#050505',
              border: '1px solid #222222',
              borderRadius: '6px',
              padding: '6px 10px',
              minWidth: '240px',
            }}
          >
            <Search size={14} color="#666666" />
            <input
              type="text"
              placeholder="Search anomalies, SKUs, or retail nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#EDEDED',
                fontSize: '0.8125rem',
                fontFamily: "'Geist', sans-serif",
                width: '100%',
              }}
            />
          </div>

          {/* Severity Filter Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                style={{
                  background: filterSeverity === sev ? '#1A1A1A' : 'transparent',
                  color: filterSeverity === sev ? '#EDEDED' : '#888888',
                  border: '1px solid',
                  borderColor: filterSeverity === sev ? '#333333' : '#1A1A1A',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '0.6875rem',
                  cursor: 'pointer',
                  fontFamily: "'Geist', sans-serif",
                  transition: 'all 0.15s ease',
                }}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Retailer Selector Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.75rem', color: '#666666' }}>Retailer:</span>
          <select
            value={selectedRetailer}
            onChange={(e) => setSelectedRetailer(e.target.value)}
            style={{
              background: '#111111',
              color: '#EDEDED',
              border: '1px solid #222222',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '0.75rem',
              outline: 'none',
              fontFamily: "'Geist', sans-serif",
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Retailers (12)</option>
            {PLATFORMS_REGISTRY.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Anomalies Forensic Stream List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredAnomalies.length === 0 ? (
          <div
            style={{
              background: '#0A0A0A',
              border: '1px solid #1F1F1F',
              borderRadius: '8px',
              padding: '48px 24px',
              textAlign: 'center',
              color: '#888888',
            }}
          >
            <CheckCircle2 size={32} color="#10B981" style={{ margin: '0 auto 12px auto' }} />
            <div style={{ fontSize: '0.9375rem', color: '#EDEDED', fontWeight: 500, marginBottom: '4px' }}>
              Zero Anomalies Matching Filter
            </div>
            <div style={{ fontSize: '0.8125rem' }}>
              All monitored platforms currently conform to verified historical pricing baselines.
            </div>
          </div>
        ) : (
          filteredAnomalies.map((item) => {
            const sevBadge = getSeverityBadge(item.severity);
            const isReVerifying = reVerifyingId === item.id;

            return (
              <div
                key={item.id}
                style={{
                  background: '#0A0A0A',
                  border: '1px solid #1F1F1F',
                  borderRadius: '8px',
                  padding: '18px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  transition: 'border-color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#2A2A2A';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#1F1F1F';
                }}
              >
                {/* Header row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        fontFamily: "'Geist Mono', monospace",
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        color: sevBadge.color,
                        background: sevBadge.bg,
                        border: `1px solid ${sevBadge.border}`,
                        padding: '2px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      {item.severity}
                    </span>

                    <span style={{ fontSize: '0.8125rem', color: '#EDEDED', fontWeight: 600 }}>
                      {item.retailerName}
                    </span>

                    <span style={{ fontSize: '0.6875rem', color: '#666666', fontFamily: "'Geist Mono', monospace" }}>
                      ID: {item.id}
                    </span>

                    <span style={{ fontSize: '0.6875rem', color: '#666666' }}>•</span>

                    <span style={{ fontSize: '0.6875rem', color: '#888888' }}>
                      {item.detectedAt}
                    </span>
                  </div>

                  {/* Violation badge */}
                  <div
                    style={{
                      fontFamily: "'Geist Mono', monospace",
                      fontSize: '0.6875rem',
                      color: '#F59E0B',
                      background: 'rgba(245, 158, 11, 0.08)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      border: '1px solid rgba(245, 158, 11, 0.2)',
                    }}
                  >
                    VIOLATION: {item.anomalyType}
                  </div>
                </div>

                {/* SKU Title & Explanation */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <h3
                    style={{
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      color: '#EDEDED',
                      margin: 0,
                      letterSpacing: '-0.01em',
                      cursor: onInspectProduct ? 'pointer' : 'default',
                    }}
                    onClick={() => {
                      if (onInspectProduct) {
                        const matched = SEEDED_MASTER_PRODUCTS.find((p) => p.id === item.productId);
                        if (matched) onInspectProduct(matched);
                      }
                    }}
                  >
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: '#AAAAAA', margin: 0, lineHeight: 1.4 }}>
                    {item.description}
                  </p>
                </div>

                {/* Quantitative Comparison Matrix */}
                <div
                  style={{
                    background: '#050505',
                    border: '1px solid #141414',
                    borderRadius: '6px',
                    padding: '12px 16px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '12px',
                    fontFamily: "'Geist Mono', monospace",
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.6875rem', color: '#666666' }}>Claimed Was Price</div>
                    <div style={{ fontSize: '0.9375rem', color: '#888888', textDecoration: 'line-through' }}>
                      EGP {item.advertisedOriginalPrice.toLocaleString()}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.6875rem', color: '#10B981' }}>Genuine 30D Baseline</div>
                    <div style={{ fontSize: '0.9375rem', color: '#10B981', fontWeight: 600 }}>
                      EGP {item.genuineBaselinePrice.toLocaleString()}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.6875rem', color: '#666666' }}>Current Active Price</div>
                    <div style={{ fontSize: '0.9375rem', color: '#EDEDED', fontWeight: 600 }}>
                      EGP {item.currentActivePrice.toLocaleString()}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.6875rem', color: '#FB7185' }}>Advertised vs Real Discount</div>
                    <div style={{ fontSize: '0.9375rem', color: '#FB7185', fontWeight: 600 }}>
                      {item.advertisedDiscountPct}% <span style={{ color: '#666666', fontWeight: 400 }}>claimed</span> / {item.realEconomicDiscountPct}% <span style={{ color: '#10B981', fontWeight: 400 }}>real</span>
                    </div>
                  </div>
                </div>

                {/* Evidence & Action Row */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    paddingTop: '6px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#888888' }}>
                    <ShieldAlert size={14} color="#F59E0B" />
                    <span>Evidence: </span>
                    <span style={{ color: '#EDEDED' }}>{item.verifiedEvidence}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => handleReVerify(item.id)}
                      disabled={isReVerifying}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        background: '#111111',
                        border: '1px solid #222222',
                        borderRadius: '4px',
                        color: '#EDEDED',
                        fontSize: '0.75rem',
                        cursor: isReVerifying ? 'not-allowed' : 'pointer',
                        fontFamily: "'Geist', sans-serif",
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isReVerifying) e.currentTarget.style.borderColor = '#10B981';
                      }}
                      onMouseLeave={(e) => {
                        if (!isReVerifying) e.currentTarget.style.borderColor = '#222222';
                      }}
                    >
                      <RefreshCw size={12} className={isReVerifying ? 'animate-spin' : ''} />
                      <span>{isReVerifying ? 'Auditing Node...' : 'Re-Audit Node'}</span>
                    </button>

                    {onInspectProduct && (
                      <button
                        onClick={() => {
                          const matched = SEEDED_MASTER_PRODUCTS.find((p) => p.id === item.productId);
                          if (matched) onInspectProduct(matched);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          background: '#EDEDED',
                          border: '1px solid #FFFFFF',
                          borderRadius: '4px',
                          color: '#000000',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontFamily: "'Geist', sans-serif",
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <Eye size={12} color="#000000" />
                        <span>Inspect Curve</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
