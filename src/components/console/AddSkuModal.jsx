import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useLanguage } from '../../context/LanguageContext';

const DOMESTIC_NODES = [
  { id: 'AMZN_EG', label: 'AMZN_EG', domain: 'node.amazon.eg' },
  { id: 'NOON_EG', label: 'NOON_EG', domain: 'node.noon.eg' },
  { id: 'BTECH_EG', label: 'BTECH_EG', domain: 'node.btech.eg' },
  { id: '2B_EG', label: '2B_EG', domain: 'node.2b.com.eg' },
  { id: 'RAYA_EG', label: 'RAYA_EG', domain: 'node.rayashop.com' },
];

export default function AddSkuModal({ isOpen, onClose, onSuccess }) {
  const { lang, t, isRtl, getRetailerName, formatCurrency } = useLanguage();
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
      // 1. Resolve canonical SKU and title heuristic
      let canonicalSku = rawVal;
      let inferredTitle = 'Probed Hardware Product';

      if (rawVal.includes('amazon.eg') || rawVal.includes('/dp/')) {
        const match = rawVal.match(/\/dp\/([A-Z0-9]{10})/i);
        canonicalSku = match ? `caw_sku_${match[1].toLowerCase()}` : `caw_sku_${Date.now().toString(36)}`;
        inferredTitle = 'Amazon EG Domestic Probed SKU';
      } else if (rawVal.includes('noon.com')) {
        const match = rawVal.match(/\/p-([A-Z0-9_-]+)/i);
        canonicalSku = match ? `caw_sku_${match[1].toLowerCase().slice(0, 8)}` : `caw_sku_${Date.now().toString(36)}`;
        inferredTitle = 'Noon Egypt Catalog Item';
      } else if (!rawVal.startsWith('http')) {
        canonicalSku = rawVal.startsWith('caw_') ? rawVal : `caw_sku_${rawVal.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        inferredTitle = `Target Probed SKU [${rawVal}]`;
      }

      // Check current session
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;

      if (!user) {
        throw new Error('Authenticated session required to add SKU.');
      }

      const parsedTarget = targetAlertPrice ? parseFloat(targetAlertPrice) : null;
      const baseEstimate = parsedTarget ? Math.round(parsedTarget * 1.08) : 48500;
      const currentEstimate = parsedTarget || 45000;
      const deltaCalc = parseFloat((((currentEstimate - baseEstimate) / baseEstimate) * 100).toFixed(1));

      // 2. Insert into tracked_products
      const { data: productData, error: productErr } = await supabase
        .from('tracked_products')
        .upsert(
          {
            sku: canonicalSku,
            title: inferredTitle,
            retailer: selectedNode,
            node: selectedNode,
            domain: DOMESTIC_NODES.find((n) => n.id === selectedNode)?.domain || 'node.cawlix.com',
            current_price: currentEstimate,
            current_price_egp: currentEstimate,
            baseline_price: baseEstimate,
            baseline_price_egp: baseEstimate,
            delta_pct: deltaCalc,
            discount_status: `${deltaCalc}%`,
            status: 'Active',
            last_ping: 'just now',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'sku' }
        )
        .select()
        .single();

      if (productErr) {
        console.warn('Direct product insert fallback:', productErr.message);
      }

      const resolvedProductId = productData?.id || canonicalSku;

      // 3. Upsert user_watchlists connection
      const { error: watchlistErr } = await supabase
        .from('user_watchlists')
        .upsert(
          {
            user_id: user.id,
            product_id: resolvedProductId,
            sku: canonicalSku,
            target_price: parsedTarget,
            target_alert_price: parsedTarget,
            notify_on_glitch: glitchRadarEnabled,
            glitch_radar_enabled: glitchRadarEnabled,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,product_id' }
        );

      if (watchlistErr) {
        console.warn('Watchlist insert notice:', watchlistErr.message);
      }

      // 4. Return new hydrated product for optimistic UI update
      if (onSuccess) {
        onSuccess({
          id: resolvedProductId,
          sku: canonicalSku,
          title: inferredTitle,
          node: selectedNode,
          domain: DOMESTIC_NODES.find((n) => n.id === selectedNode)?.domain || 'node.cawlix.com',
          current_price_egp: currentEstimate,
          baseline_price_egp: baseEstimate,
          delta_pct: deltaCalc,
          status: 'Active',
          last_ping: 'just now',
          target_price: parsedTarget,
          notify_on_glitch: glitchRadarEnabled,
        });
      }

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
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
          backgroundColor: '#000000',
          border: '1px solid #1F1F1F',
          borderRadius: '8px',
          maxWidth: '520px',
          width: '100%',
          padding: '24px',
          boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.95)',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          direction: isRtl ? 'rtl' : 'ltr',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#EDEDED', letterSpacing: '-0.015em', fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist', sans-serif" }}>
              {t('modal.addTitle', 'Track Target SKU Node')}
            </h2>
            <p style={{ margin: '6px 0 0 0', fontSize: '0.8125rem', color: '#888888', lineHeight: 1.45, fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist', sans-serif" }}>
              {t('modal.addSubtitle', 'Enter an Egyptian retail node URL or canonical identifier to begin continuous telemetry ingestion.')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#888888',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'color 120ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#10B981';
              const svg = e.currentTarget.querySelector('svg');
              if (svg) svg.style.stroke = '#10B981';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#888888';
              const svg = e.currentTarget.querySelector('svg');
              if (svg) svg.style.stroke = 'currentColor';
            }}
            title="Close"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div
            style={{
              color: '#FB7185',
              backgroundColor: 'transparent',
              border: 'none',
              padding: '2px 0',
              fontSize: '0.8125rem',
              lineHeight: 1.45,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist', sans-serif",
            }}
          >
            <span style={{ fontSize: '0.875rem', lineHeight: 1, flexShrink: 0, color: '#FB7185' }}>✕</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Field 1: SKU or URL */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label
              htmlFor="sku-url-input-jsx"
              style={{
                fontSize: '0.75rem',
                color: '#666666',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '8px',
                fontWeight: 500,
                fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist', sans-serif",
              }}
            >
              {t('modal.retailerUrlLabel', 'RETAIL NODE URL OR CANONICAL SKU')}
            </label>
            <input
              id="sku-url-input-jsx"
              type="text"
              required
              value={skuUrl}
              onChange={handleUrlChange}
              placeholder={t('modal.retailerUrlPlaceholder', 'https://www.amazon.eg/dp/... or B0CHX...')}
              style={{
                backgroundColor: '#000000',
                border: '1px solid #1F1F1F',
                fontSize: '0.8125rem',
                color: '#EDEDED',
                padding: '0 12px',
                height: '40px',
                borderRadius: '6px',
                width: '100%',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 150ms ease',
                fontFamily: "'Geist Mono', monospace",
                direction: 'ltr',
                textAlign: 'left',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#333333')}
              onBlur={(e) => (e.target.style.borderColor = '#1F1F1F')}
              autoComplete="off"
            />
          </div>

          {/* Field 2: Domestic Node Selector */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label
              style={{
                fontSize: '0.75rem',
                color: '#666666',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '8px',
                fontWeight: 500,
                fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist', sans-serif",
              }}
            >
              {isRtl ? 'المتجر المصري المستهدف' : 'DOMESTIC RETAIL NODE'}
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
                      backgroundColor: isActive ? '#111111' : '#000000',
                      border: `1px solid ${isActive ? '#333333' : '#222222'}`,
                      color: isActive ? '#EDEDED' : '#888888',
                      fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace",
                      fontSize: '11px',
                      fontWeight: isActive ? 600 : 500,
                      padding: '5px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 130ms ease',
                    }}
                  >
                    {getRetailerName(node.id)}
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
                fontSize: '0.75rem',
                color: '#666666',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '8px',
                fontWeight: 500,
                fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist', sans-serif",
              }}
            >
              {t('drawer.targetPriceLabel', 'سعر التنبيه المستهدف')} ({isRtl ? 'ج.م' : 'EGP'})
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#000000',
                border: '1px solid #1F1F1F',
                borderRadius: '6px',
                height: '40px',
                overflow: 'hidden',
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 500,
                  fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace",
                  color: '#666666',
                  padding: '0 12px',
                  backgroundColor: '#0A0A0A',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  borderRight: isRtl ? 'none' : '1px solid #1F1F1F',
                  borderLeft: isRtl ? '1px solid #1F1F1F' : 'none',
                  userSelect: 'none',
                }}
              >
                {isRtl ? 'ج.م' : 'EGP'}
              </span>
              <input
                id="target-alert-price-jsx"
                type="number"
                min="0"
                step="10"
                value={targetAlertPrice}
                onChange={(e) => setTargetAlertPrice(e.target.value)}
                placeholder={isRtl ? 'مثال: 27500 (يتم إرسال إشعار فوري عند هبوط السعر)' : 'e.g. 27500 (triggers instant alert when shelf drops below)'}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  fontSize: '0.8125rem',
                  fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist Mono', monospace",
                  color: '#EDEDED',
                  padding: '0 12px',
                  height: '100%',
                  outline: 'none',
                  direction: isRtl ? 'rtl' : 'ltr',
                  textAlign: isRtl ? 'right' : 'left',
                }}
              />
            </div>
          </div>

          {/* Field 4: Glitch Radar Notification Toggle */}
          <div
            style={{
              padding: '10px 12px',
              backgroundColor: '#000000',
              border: '1px solid #1F1F1F',
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
                  accentColor: '#FFFFFF',
                  marginTop: '2px',
                  width: '14px',
                  height: '14px',
                  cursor: 'pointer',
                }}
              />
              <span style={{ fontSize: '0.75rem', color: '#888888', lineHeight: 1.4, fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist', sans-serif" }}>
                {isRtl
                  ? 'إرسال تنبيه فوري عبر البريد الإلكتروني عند اكتشاف أي انهيار سعري لحظي أو خصم استثنائي (>30%).'
                  : 'Instant Webhook/Email dispatch if a sub-second price glitch (>30% drop) is detected.'}
              </span>
            </label>
          </div>

          {/* Footer Controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '4px',
              paddingTop: '16px',
              borderTop: '1px solid #1F1F1F',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: '1px solid #222222',
                fontSize: '0.8125rem',
                color: '#888888',
                cursor: 'pointer',
                padding: '6px 14px',
                borderRadius: '6px',
                transition: 'all 120ms ease',
                fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist', sans-serif",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#EDEDED';
                e.currentTarget.style.borderColor = '#333333';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#888888';
                e.currentTarget.style.borderColor = '#222222';
              }}
            >
              {t('modal.cancelButton', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#000000',
                fontSize: '0.8125rem',
                fontWeight: 600,
                padding: '0 16px',
                height: '38px',
                borderRadius: '6px',
                border: 'none',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: isSubmitting ? 0.7 : 1,
                transition: 'opacity 150ms ease',
                fontFamily: isRtl ? "'Cairo', sans-serif" : "'Geist', sans-serif",
              }}
            >
              <span>{isSubmitting ? t('modal.submitting', 'Initializing Telemetry...') : t('modal.submitButton', 'Initialize Telemetry')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
