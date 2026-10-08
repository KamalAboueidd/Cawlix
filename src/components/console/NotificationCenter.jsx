import { useState, useEffect, useRef } from 'react';
import {
  markAlertRead,
  markAllAlertsRead,
  clearAllAlerts,
  subscribeToAlerts,
} from '../../services/alertEngine.js';
import {
  Bell,
  Check,
  Trash2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { sanitizeRetailerUrl } from '../../utils/urlSanitizer.js';
import { useLanguage } from '../../context/LanguageContext.jsx';

/**
 * Institutional Pitch-Black Notification Center (CAWLIX)
 * Displays real-time price drop alerts, All-Time Lows (ATL), and Arbitrage Anomalies.
 */
export default function NotificationCenter({ onInspectProduct = null, placement = 'bottom' }) {
  const { lang, isRtl, t, formatCurrency, getRetailerName } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const containerRef = useRef(null);

  // Subscribe to real-time alerts
  useEffect(() => {
    const unsubscribe = subscribeToAlerts((updatedAlerts) => {
      setAlerts(updatedAlerts);
    });
    return () => unsubscribe();
  }, []);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = alerts.filter((a) => !a.read).length;

  const handleAlertClick = (alert) => {
    markAlertRead(alert.id);
    if (onInspectProduct) {
      onInspectProduct(alert.productId);
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Header Bell Trigger Button (Borderless & Background-free) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          backgroundColor: 'transparent',
          border: 'none',
          color: unreadCount > 0 ? '#10B981' : '#888888',
          cursor: 'pointer',
          padding: 0,
          transition: 'all 150ms ease',
        }}
        aria-label="Price Drop Notifications"
        title="Price Drop & Arbitrage Alerts"
      >
        <Bell size={16} />

        {/* Unread Simple Clean Green Indicator */}
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-1px',
              right: '-3px',
              color: '#10B981',
              fontSize: '0.625rem',
              fontWeight: 700,
              fontFamily: "'Geist Mono', monospace",
              lineHeight: 1,
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* Pitch-Black Dropdown Palette */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            ...(placement === 'top'
              ? { bottom: 'calc(100% + 12px)', left: 0 }
              : { top: 'calc(100% + 8px)', right: 0 }),
            width: '380px',
            maxWidth: '90vw',
            backgroundColor: '#000000',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '8px',
            boxShadow: '0 20px 48px -8px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.05)',
            zIndex: 99999,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderBottom: '1px solid #1A1A1A',
              backgroundColor: '#050505',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#EDEDED',
                  letterSpacing: '0.04em',
                  fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace",
                  textTransform: 'uppercase',
                }}
              >
                {t('alerts.title')}
              </span>
              {unreadCount > 0 && (
                <span
                  style={{
                    fontSize: '0.6875rem',
                    color: '#10B981',
                    fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace",
                    fontWeight: 600,
                  }}
                >
                  {unreadCount} {t('alerts.unread')}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAlertsRead}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#888888',
                    cursor: 'pointer',
                    fontSize: '0.6875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist', sans-serif",
                  }}
                  title={t('alerts.markAllRead')}
                >
                  <Check size={12} color="#10B981" />
                  <span>{t('alerts.markAllRead')}</span>
                </button>
              )}
              {alerts.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllAlerts}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#666666',
                    cursor: 'pointer',
                    padding: '2px 4px',
                  }}
                  title={t('alerts.clearAll')}
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Alerts List */}
          <div
            style={{
              maxHeight: '400px',
              overflowY: 'auto',
              padding: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            {alerts.length === 0 ? (
              <div
                style={{
                  padding: '32px 16px',
                  textAlign: 'center',
                  color: '#666666',
                  fontSize: '0.75rem',
                  fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace",
                }}
              >
                {t('alerts.noAlerts')}
              </div>
            ) : (
              alerts.map((alert) => {
                const isATL = alert.type === 'ALL_TIME_LOW';
                const isCrash = alert.type === 'PRICE_CRASH';
                const accentColor = isCrash ? '#FB7185' : '#10B981';

                return (
                  <div
                    key={alert.id}
                    onClick={() => handleAlertClick(alert)}
                    style={{
                      backgroundColor: alert.read ? '#0A0A0A' : '#101010',
                      border: alert.read
                        ? '1px solid #1A1A1A'
                        : `1px solid ${isCrash ? 'rgba(251, 113, 133, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                      borderRadius: '6px',
                      padding: '10px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      transition: 'all 120ms ease',
                      opacity: alert.read ? 0.75 : 1,
                      fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist', sans-serif",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#141414')}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = alert.read ? '#0A0A0A' : '#101010')
                    }
                  >
                    {/* Top Row: Retailer & Anomaly Pill */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            fontSize: '0.625rem',
                            fontWeight: 600,
                            color: '#EDEDED',
                            backgroundColor: '#1E1E1E',
                            border: '1px solid #2B2B2B',
                            padding: '1px 5px',
                            borderRadius: '3px',
                            fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace",
                          }}
                        >
                          {getRetailerName(alert.retailerName || alert.retailerId)}
                        </span>

                        <span
                          style={{
                            fontSize: '0.625rem',
                            fontWeight: 600,
                            color: accentColor,
                            fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace",
                          }}
                        >
                          {isATL
                            ? t('kpis.allTimeLow')
                            : isCrash
                            ? `${t('alerts.flashCrash')} (-${alert.savingsPct}%)`
                            : `${t('alerts.anomalousDrop')} (-${alert.savingsPct}%)`}
                        </span>
                      </div>

                      <span
                        style={{
                          fontSize: '0.625rem',
                          color: '#666666',
                          fontFamily: "'Geist Mono', monospace",
                        }}
                      >
                        {alert.timestamp}
                      </span>
                    </div>

                    {/* Product Title */}
                    <div
                      style={{
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        color: '#EDEDED',
                        lineHeight: 1.35,
                      }}
                    >
                      {alert.productTitle}
                    </div>

                    {/* Price Comparison & Action */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                        {alert.oldPrice > 0 && (
                          <span
                            style={{
                              fontSize: '0.6875rem',
                              color: '#666666',
                              textDecoration: 'line-through',
                              fontFamily: "'Geist Mono', monospace",
                            }}
                          >
                            {formatCurrency(alert.oldPrice)}
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: '0.875rem',
                            fontWeight: 700,
                            color: accentColor,
                            fontFamily: "'Geist Mono', monospace",
                          }}
                        >
                          {formatCurrency(alert.newPrice)}
                        </span>
                        <span
                          style={{
                            fontSize: '0.625rem',
                            color: '#10B981',
                            fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace",
                          }}
                        >
                          ({isRtl ? 'وفر' : 'Save'} {formatCurrency(alert.savingsEgp)})
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            color: '#888888',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          <span>{t('matrix.actions.inspectSku')}</span>
                          <ArrowRight size={10} style={{ transform: isRtl ? 'scaleX(-1)' : 'none' }} />
                        </span>

                        <a
                          href={sanitizeRetailerUrl({
                            url: alert.listingUrl || alert.productUrl,
                            platformId: alert.retailerId || alert.retailerName,
                            productTitle: alert.productTitle,
                            sku: alert.sku || alert.productId,
                          })}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          title={t('matrix.actions.visitStore')}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '3px 6px',
                            borderRadius: '3px',
                            backgroundColor: '#161616',
                            border: '1px solid #282828',
                            color: '#EDEDED',
                            textDecoration: 'none',
                            fontSize: '0.625rem',
                            transition: 'all 120ms ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#10B981';
                            e.currentTarget.style.color = '#10B981';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#282828';
                            e.currentTarget.style.color = '#EDEDED';
                          }}
                        >
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '8px 12px',
              borderTop: '1px solid #1A1A1A',
              backgroundColor: '#050505',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.625rem',
              color: '#666666',
              fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace",
            }}
          >
            <span>{t('alerts.emailNotice')}</span>
            <span>{isRtl ? '12 متجر مصري متصل' : '12 Egyptian Nodes'}</span>
          </div>
        </div>
      )}
    </div>
  );
}
