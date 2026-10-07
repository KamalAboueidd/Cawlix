import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

const DOMESTIC_NODES = [
  { id: 'AMZN_EG', label: 'AMZN_EG', domain: 'node.amazon.eg' },
  { id: 'NOON_EG', label: 'NOON_EG', domain: 'node.noon.eg' },
  { id: 'BTECH_EG', label: 'BTECH_EG', domain: 'node.btech.eg' },
  { id: '2B_EG', label: '2B_EG', domain: 'node.2b.com.eg' },
  { id: 'RAYA_EG', label: 'RAYA_EG', domain: 'node.rayashop.com' },
];

export default function AddSkuModal({ isOpen, onClose, onSuccess }) {
  const [skuUrl, setSkuUrl] = useState('');
  const [selectedNode, setSelectedNode] = useState('AMZN_EG');
  const [targetAlertPrice, setTargetAlertPrice] = useState('');
  const [glitchRadarEnabled, setGlitchRadarEnabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Auto-detect retailer node from pasted URL
  const handleUrlChange = (e) => {
    const val = e.target.value;
    setSkuUrl(val);
    setErrorMsg('');

    const lower = val.toLowerCase();
    if (lower.includes('amazon.eg') || lower.includes('amzn.')) {
      setSelectedNode('AMZN_EG');
    } else if (lower.includes('noon.com')) {
      setSelectedNode('NOON_EG');
    } else if (lower.includes('btech.com')) {
      setSelectedNode('BTECH_EG');
    } else if (lower.includes('2b.com.eg')) {
      setSelectedNode('2B_EG');
    } else if (lower.includes('rayashop.com')) {
      setSelectedNode('RAYA_EG');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const rawVal = skuUrl.trim();
    if (!rawVal) {
      setErrorMsg('Please enter a retail URL or canonical SKU identifier.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      // Derive canonical SKU and title
      let canonicalSku = rawVal;
      let title = rawVal;

      if (rawVal.includes('amazon.eg') || rawVal.includes('/dp/')) {
        const asinMatch = rawVal.match(/\/dp\/([A-Z0-9]{10})/i) || rawVal.match(/\/gp\/product\/([A-Z0-9]{10})/i);
        const asin = asinMatch ? asinMatch[1].toUpperCase() : `AMZN_${Date.now().toString().slice(-6)}`;
        canonicalSku = `caw_sku_${asin.toLowerCase()}`;
        title = `Amazon Product Telemetry (${asin})`;
      } else if (rawVal.includes('noon.com')) {
        const noonMatch = rawVal.match(/\/([A-Z0-9_-]+)\/p\/?/i) || rawVal.match(/\/p-([0-9]+)/i);
        const code = noonMatch ? noonMatch[1].slice(0, 10).toUpperCase() : `NOON_${Date.now().toString().slice(-6)}`;
        canonicalSku = `caw_sku_${code.toLowerCase()}`;
        title = `Noon Product Telemetry (${code})`;
      } else {
        canonicalSku = rawVal.startsWith('caw_') ? rawVal : `caw_sku_${rawVal.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase().slice(0, 16)}`;
        title = `Tracked Item (${canonicalSku})`;
      }

      const activeDomain = DOMESTIC_NODES.find((n) => n.id === selectedNode)?.domain || 'node.amazon.eg';

      // Estimate prices based on alert threshold or baseline
      const alertNum = parseFloat(targetAlertPrice);
      const estimatedShelfPrice = alertNum > 0 ? Math.round(alertNum * 1.08) : 29900;
      const baseline = Math.round(estimatedShelfPrice * 0.94);
      const delta = parseFloat((((estimatedShelfPrice - baseline) / baseline) * 100).toFixed(1));

      // 1. Get active session user
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUser = sessionData?.session?.user;
      const currentUserId = currentUser?.id || 'usr_core_kamal';

      // 2. Resolve existing tracked_product or insert new
      let productRecord = null;
      try {
        const { data: existingProduct } = await supabase
          .from('tracked_products')
          .select('*')
          .eq('sku', canonicalSku)
          .maybeSingle();

        if (existingProduct) {
          productRecord = existingProduct;
        } else {
          const newProductPayload = {
            sku: canonicalSku,
            title,
            node: selectedNode,
            domain: activeDomain,
            current_price_egp: estimatedShelfPrice,
            baseline_price_egp: baseline,
            delta_pct: delta,
            discount_status: delta > 0 ? `MARKUP (+${delta}%)` : `VERIFIED DEAL (${delta}%)`,
            status: delta > 5 ? 'FLAGGED' : 'ACTIVE',
            last_ping: 'just now',
            created_at: new Date().toISOString(),
          };

          const { data: insertedProduct, error: insertProdErr } = await supabase
            .from('tracked_products')
            .insert(newProductPayload)
            .select()
            .maybeSingle();

          if (insertProdErr) {
            console.warn('tracked_products insert note:', insertProdErr);
          }
          productRecord = insertedProduct || { id: `tp-${Date.now()}`, ...newProductPayload };
        }
      } catch (prodErr) {
        console.warn('Error resolving tracked_product:', prodErr);
      }

      const finalProduct = productRecord || {
        id: `tp-${Date.now()}`,
        sku: canonicalSku,
        title,
        node: selectedNode,
        domain: activeDomain,
        current_price_egp: estimatedShelfPrice,
        baseline_price_egp: baseline,
        delta_pct: delta,
        discount_status: delta > 0 ? `MARKUP (+${delta}%)` : `VERIFIED DEAL (${delta}%)`,
        status: delta > 5 ? 'FLAGGED' : 'ACTIVE',
        last_ping: 'just now',
        created_at: new Date().toISOString(),
      };

      // 3. Link into user_watchlists
      const watchlistPayload = {
        user_id: currentUserId,
        target_price: alertNum || null,
        notify_on_glitch: glitchRadarEnabled,
        sku: canonicalSku,
        node: selectedNode,
        product_id: finalProduct.id,
        tracked_product_id: finalProduct.id,
        target_alert_price_egp: alertNum || null,
        glitch_radar_enabled: glitchRadarEnabled,
        created_at: new Date().toISOString(),
      };

      let wlRecord = null;
      try {
        const { data: wlData, error: wlErr } = await supabase
          .from('user_watchlists')
          .insert(watchlistPayload)
          .select()
          .maybeSingle();

        if (wlErr) {
          console.warn('user_watchlists insert note:', wlErr);
        }
        wlRecord = wlData;
      } catch (errWl) {
        console.warn('Error inserting into user_watchlists:', errWl);
      }

      // 4. Optimistic update with joined structure
      const optimisticItem = {
        id: wlRecord?.id || finalProduct.id || `item-${Date.now()}`,
        watchlist_id: wlRecord?.id,
        target_price: alertNum || null,
        notify_on_glitch: glitchRadarEnabled,
        ...finalProduct,
        tracked_products: finalProduct,
      };

      if (onSuccess) {
        onSuccess(optimisticItem);
      }

      // Reset form
      setSkuUrl('');
      setTargetAlertPrice('');
      onClose();
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to initialize telemetry. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: '#0A0A0A',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '12px',
          maxWidth: '520px',
          width: '100%',
          padding: '24px',
          boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.95)',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 500, color: '#FFFFFF', letterSpacing: '-0.015em' }}>
              Track Target SKU Node
            </h2>
            <p style={{ margin: '6px 0 0 0', fontSize: '0.75rem', color: '#737373', lineHeight: 1.45 }}>
              Enter an Egyptian retail node URL or canonical identifier to begin continuous telemetry ingestion.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#737373',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '10px',
              fontWeight: 600,
              padding: '2px 6px',
              borderRadius: '4px',
              cursor: 'pointer',
              lineHeight: 1.2,
              flexShrink: 0,
            }}
            title="Press Escape to close"
          >
            ESC
          </button>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div
            style={{
              color: '#EF4444',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.75rem',
              lineHeight: 1.4,
              padding: '8px 12px',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              backgroundColor: 'rgba(239, 68, 68, 0.05)',
              borderRadius: '6px',
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Field 1: SKU or URL */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label
              htmlFor="sku-url-input-jsx"
              style={{
                fontSize: '11px',
                color: '#737373',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '8px',
                fontFamily: 'var(--font-mono, monospace)',
              }}
            >
              RETAIL NODE URL OR CANONICAL SKU
            </label>
            <input
              id="sku-url-input-jsx"
              type="text"
              required
              value={skuUrl}
              onChange={handleUrlChange}
              placeholder="https://www.amazon.eg/dp/... or B0CHX..."
              style={{
                backgroundColor: '#0D0D0D',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono, monospace)',
                color: '#EDEDED',
                padding: '0 14px',
                height: '40px',
                borderRadius: '6px',
                width: '100%',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              autoComplete="off"
            />
          </div>

          {/* Field 2: Domestic Node Selector */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label
              style={{
                fontSize: '11px',
                color: '#737373',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '8px',
                fontFamily: 'var(--font-mono, monospace)',
              }}
            >
              DOMESTIC RETAIL NODE
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {DOMESTIC_NODES.map((node) => {
                const isActive = selectedNode === node.id;
                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => setSelectedNode(node.id)}
                    style={{
                      backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : '#0D0D0D',
                      border: `1px solid ${isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.12)'}`,
                      color: isActive ? '#FFFFFF' : '#888888',
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '11px',
                      fontWeight: isActive ? 600 : 500,
                      padding: '6px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 130ms ease',
                    }}
                  >
                    {node.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Field 3: Target Alert Threshold (EGP) */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label
              htmlFor="target-alert-price-jsx"
              style={{
                fontSize: '11px',
                color: '#737373',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '8px',
                fontFamily: 'var(--font-mono, monospace)',
              }}
            >
              TARGET ALERT THRESHOLD (EGP)
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#0D0D0D',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '6px',
                height: '40px',
                overflow: 'hidden',
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-mono, monospace)',
                  color: '#737373',
                  padding: '0 12px',
                  backgroundColor: '#121212',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  borderRight: '1px solid rgba(255, 255, 255, 0.12)',
                  userSelect: 'none',
                }}
              >
                EGP
              </span>
              <input
                id="target-alert-price-jsx"
                type="number"
                min="0"
                step="10"
                value={targetAlertPrice}
                onChange={(e) => setTargetAlertPrice(e.target.value)}
                placeholder="e.g. 27500 (triggers instant alert when shelf drops below)"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono, monospace)',
                  color: '#EDEDED',
                  padding: '0 12px',
                  height: '100%',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Field 4: Glitch Radar Notification Toggle */}
          <div
            style={{
              padding: '10px 12px',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '6px',
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <input
                type="checkbox"
                checked={glitchRadarEnabled}
                onChange={(e) => setGlitchRadarEnabled(e.target.checked)}
                style={{
                  accentColor: '#3ECF8E',
                  marginTop: '2px',
                  width: '15px',
                  height: '15px',
                  cursor: 'pointer',
                }}
              />
              <span style={{ fontSize: '0.75rem', color: '#A3A3A3', lineHeight: 1.4 }}>
                Instant Webhook/Email dispatch if a sub-second price glitch (&gt;30% drop) is detected.
              </span>
            </label>
          </div>

          {/* Footer Controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '14px',
              marginTop: '8px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '0.75rem',
                color: '#737373',
                cursor: 'pointer',
                padding: '6px 10px',
                borderRadius: '4px',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#000000',
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '0 16px',
                height: '36px',
                borderRadius: '6px',
                border: 'none',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
              <span>{isSubmitting ? 'INITIALIZING TELEMETRY...' : 'Initialize Telemetry'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
