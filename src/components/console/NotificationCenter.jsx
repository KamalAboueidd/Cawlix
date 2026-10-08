import { useState, useEffect, useRef } from 'react';
import {
  getAlerts,
  markAlertRead,
  markAllAlertsRead,
  clearAllAlerts,
  subscribeToAlerts,
} from '../../services/alertEngine.js';
import {
  Bell,
  Check,
  Trash2,
  TrendingDown,
  AlertTriangle,
  Zap,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

/**
 * Institutional Pitch-Black Notification Center (CAWLIX)
 * Displays real-time price drop alerts, All-Time Lows (ATL), and Arbitrage Anomalies.
 */
export default function NotificationCenter({ onInspectProduct = null }) {
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
      {/* Header Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          borderRadius: '6px',
          backgroundColor: isOpen ? '#161616' : '#0A0A0A',
          border: isOpen ? '1px solid #333333' : '1px solid #1F1F1F',
          color: unreadCount > 0 ? '#EDEDED' : '#888888',
          cursor: 'pointer',
          transition: 'all 150ms ease',
        }}
        aria-label="Price Drop Notifications"
        title="Price Drop & Arbitrage Alerts"
      >
        <Bell size={15} />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              backgroundColor: '#10B981',
              color: '#000000',
              fontSize: '0.625rem',
              fontWeight: 700,
              fontFamily: "'Geist Mono', monospace",
              borderRadius: '9999px',
              minWidth: '15px',
              height: '15px',
              padding: '0 4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 8px rgba(16, 185, 129, 0.7)',
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
            top: 'calc(100% + 8px)',
            right: 0,
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
                  fontFamily: "'Geist Mono', monospace",
                  textTransform: 'uppercase',
                }}
              >
                TELEMETRY ALERTS
              </span>
              {unreadCount > 0 && (
                <span
                  style={{
                    fontSize: '0.625rem',
                    color: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    fontFamily: "'Geist Mono', monospace",
                  }}
                >
                  {unreadCount} UNREAD
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
                  }}
                  title="Mark all as read"
                >
                  <Check size={12} color="#10B981" />
                  <span>Mark Read</span>
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
                  title="Clear all alerts"
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
                  fontFamily: "'Geist Mono', monospace",
                }}
              >
                No active price anomalies detected.
                <br />
                Fleet telemetry continuously surveilling 12 nodes.
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
                            fontFamily: "'Geist Mono', monospace",
                          }}
                        >
                          {alert.retailerName}
                        </span>

                        <span
                          style={{
                            fontSize: '0.625rem',
                            fontWeight: 600,
                            color: accentColor,
                            backgroundColor: isCrash
                              ? 'rgba(251, 113, 133, 0.1)'
                              : 'rgba(16, 185, 129, 0.1)',
                            border: `1px solid ${
                              isCrash ? 'rgba(251, 113, 133, 0.25)' : 'rgba(16, 185, 129, 0.25)'
                            }`,
                            padding: '1px 6px',
                            borderRadius: '3px',
                            fontFamily: "'Geist Mono', monospace",
                          }}
                        >
                          {isATL
                            ? 'ALL-TIME LOW (ATL)'
                            : isCrash
                            ? `PRICE CRASH (-${alert.savingsPct}%)`
                            : `MEDIAN ARBITRAGE (-${alert.savingsPct}%)`}
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
                            EGP {alert.oldPrice.toLocaleString()}
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
                          EGP {alert.newPrice.toLocaleString()}
                        </span>
                        <span
                          style={{
                            fontSize: '0.625rem',
                            color: '#10B981',
                            fontFamily: "'Geist Mono', monospace",
                          }}
                        >
                          (Save EGP {alert.savingsEgp.toLocaleString()})
                        </span>
                      </div>

                      <span
                        style={{
                          fontSize: '0.6875rem',
                          color: '#888888',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                      >
                        <span>Inspect</span>
                        <ArrowRight size={10} />
                      </span>
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
              fontFamily: "'Geist Mono', monospace",
            }}
          >
            <span>Live Brevo SMTP Connected</span>
            <span>12 Egyptian Nodes</span>
          </div>
        </div>
      )}
    </div>
  );
}
