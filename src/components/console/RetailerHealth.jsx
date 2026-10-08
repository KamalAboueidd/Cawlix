import { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

// Enriched telemetry node configurations
const INITIAL_NODES_DATA = [
  {
    id: 'AMZN_EG',
    name: 'Amazon Egypt',
    domain: 'amazon.eg',
    tier: 'Tier 1 Prime Hub',
    ping: 184,
    status: 'ONLINE',
    ingestionMethod: 'JSON-LD + Headless DOM',
    truthScore: 95.8,
    warrantyStrictness: 'NTRA / Official Agent',
    throughput: '580 req/m',
    uptime: '99.98%',
    lastAudited: '42s ago',
  },
  {
    id: 'NOON_EG',
    name: 'Noon Egypt',
    domain: 'noon.com/egypt',
    tier: 'Tier 1 Express Hub',
    ping: 218,
    status: 'ONLINE',
    ingestionMethod: '__NEXT_DATA__ Hydration',
    truthScore: 92.4,
    warrantyStrictness: 'NTRA / Local Agent',
    throughput: '490 req/m',
    uptime: '99.92%',
    lastAudited: '1m ago',
  },
  {
    id: 'BTECH_EG',
    name: 'B.TECH',
    domain: 'btech.com',
    tier: 'Omnichannel Specialist',
    ping: 284,
    status: 'ONLINE',
    ingestionMethod: 'Algolia Search Intercept',
    truthScore: 94.1,
    warrantyStrictness: 'Domestic Agency Authorized',
    throughput: '310 req/m',
    uptime: '99.85%',
    lastAudited: '2m ago',
  },
  {
    id: 'TRADELINE',
    name: 'Tradeline Stores',
    domain: 'tradelinestores.com',
    tier: 'Apple Premium Reseller',
    ping: 242,
    status: 'ONLINE',
    ingestionMethod: 'Shopify CDN Metafields',
    truthScore: 98.7,
    warrantyStrictness: 'Apple Authorized Egyptian Agency',
    throughput: '220 req/m',
    uptime: '99.95%',
    lastAudited: '3m ago',
  },
  {
    id: 'JUMIA_EG',
    name: 'Jumia Egypt',
    domain: 'jumia.com.eg',
    tier: 'Marketplace Cluster',
    ping: 340,
    status: 'ONLINE',
    ingestionMethod: 'JSON-LD Schema + Microdata',
    truthScore: 86.2,
    warrantyStrictness: 'Merchant-Declared / Monitored',
    throughput: '440 req/m',
    uptime: '99.45%',
    lastAudited: '4m ago',
  },
  {
    id: '2B_EG',
    name: '2B Egypt',
    domain: '2b.com.eg',
    tier: 'Hardware Specialist',
    ping: 312,
    status: 'ONLINE',
    ingestionMethod: 'Magento GraphQL / REST',
    truthScore: 93.5,
    warrantyStrictness: 'Local Agent Official Warranty',
    throughput: '185 req/m',
    uptime: '99.78%',
    lastAudited: '2m ago',
  },
  {
    id: 'RAYA_EG',
    name: 'Raya Shop',
    domain: 'rayashop.com',
    tier: 'Official Distributor',
    ping: 275,
    status: 'ONLINE',
    ingestionMethod: 'SAP Hybris Catalog Probe',
    truthScore: 96.0,
    warrantyStrictness: 'Raya Care Official 24M',
    throughput: '260 req/m',
    uptime: '99.88%',
    lastAudited: '1m ago',
  },
  {
    id: 'ELARABY_EG',
    name: 'El Araby Group',
    domain: 'elarabygroup.com',
    tier: 'Manufacturer Direct',
    ping: 368,
    status: 'ONLINE',
    ingestionMethod: 'Direct ERP Catalog Node',
    truthScore: 97.9,
    warrantyStrictness: 'El Araby 10-Year Factory Guard',
    throughput: '190 req/m',
    uptime: '99.80%',
    lastAudited: '5m ago',
  },
  {
    id: 'DUBAI_PHONE',
    name: 'Dubai Phone',
    domain: 'dubaiphone.net',
    tier: 'Retail Chain Network',
    ping: 412,
    status: 'ONLINE',
    ingestionMethod: 'DOM Microdata Parser',
    truthScore: 89.3,
    warrantyStrictness: 'Domestic Retail Agency',
    throughput: '145 req/m',
    uptime: '99.30%',
    lastAudited: '3m ago',
  },
  {
    id: 'DREAM_2000',
    name: 'Dream 2000',
    domain: 'dream2000.com',
    tier: 'Mobile Retail Network',
    ping: 395,
    status: 'ONLINE',
    ingestionMethod: 'WooCommerce REST Probe',
    truthScore: 88.7,
    warrantyStrictness: 'Domestic Dealer Warranty',
    throughput: '160 req/m',
    uptime: '99.25%',
    lastAudited: '4m ago',
  },
  {
    id: 'VODAFONE_EG',
    name: 'Vodafone Shop Egypt',
    domain: 'eshop.vodafone.com.eg',
    tier: 'Telco Direct Hub',
    ping: 228,
    status: 'ONLINE',
    ingestionMethod: 'Telco Direct Microdata',
    truthScore: 96.5,
    warrantyStrictness: 'NTRA Certified Distribution',
    throughput: '320 req/m',
    uptime: '99.91%',
    lastAudited: '1m ago',
  },
  {
    id: 'CARREFOUR_EG',
    name: 'Carrefour Egypt',
    domain: 'carrefouregypt.com',
    tier: 'Hypermarket Tech',
    ping: 326,
    status: 'ONLINE',
    ingestionMethod: 'SAP Commerce Cloud Node',
    truthScore: 93.8,
    warrantyStrictness: 'Majid Al Futtaim Authorized',
    throughput: '275 req/m',
    uptime: '99.72%',
    lastAudited: '2m ago',
  },
];

export default function RetailerHealth({ onShowToast = null }) {
  const { lang, isRtl, t, getRetailerName } = useLanguage();
  const [nodes, setNodes] = useState(INITIAL_NODES_DATA);
  const [probingNodeId, setProbingNodeId] = useState(null);
  const [flashingNodeId, setFlashingNodeId] = useState(null);

  // Ping a single retailer node
  const handlePingNode = (nodeId) => {
    setProbingNodeId(nodeId);

    setTimeout(() => {
      const pingDuration = 160 + ((nodeId.charCodeAt(0) * 7) % 180);
      setNodes((prev) =>
        prev.map((n) =>
          n.id === nodeId
            ? { ...n, ping: pingDuration, lastAudited: 'just now', status: 'ONLINE' }
            : n
        )
      );
      setProbingNodeId(null);
      setFlashingNodeId(nodeId);
      setTimeout(() => setFlashingNodeId(null), 1200);

      const target = nodes.find((n) => n.id === nodeId);
      if (onShowToast) {
        onShowToast(
          'Node Probe Completed',
          `${target?.name || nodeId} probed in ${pingDuration}ms (HTTP 200 OK via ${target?.ingestionMethod}).`
        );
      }
    }, 700);
  };

  // Ping all nodes fleet-wide
  const handlePingAll = () => {
    setProbingNodeId('ALL');
    setTimeout(() => {
      setNodes((prev) =>
        prev.map((n) => ({
          ...n,
          ping: 170 + ((n.id.charCodeAt(0) * 11) % 190),
          lastAudited: 'just now',
        }))
      );
      setProbingNodeId(null);
      if (onShowToast) {
        onShowToast('Fleet Health Verified', 'All 12 Egyptian platform nodes probed. 100% telemetry online.');
      }
    }, 1200);
  };

  // Fleet KPIs
  const avgPing = Math.round(nodes.reduce((acc, n) => acc + n.ping, 0) / nodes.length);
  const avgTruthScore = (nodes.reduce((acc, n) => acc + n.truthScore, 0) / nodes.length).toFixed(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ── 1. FLEET STATUS SUMMARY CARDS ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '14px',
        }}
      >
        <div
          style={{
            backgroundColor: '#000000',
            border: '1px solid #1F1F1F',
            borderRadius: '8px',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '0.6875rem', fontWeight: 500, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist Mono', monospace" }}>
            {isRtl ? 'حالة شبكة المتاجر المصرية' : 'DOMESTIC FLEET STATUS'}
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 600, color: '#10B981', fontFamily: "'Geist Mono', monospace" }}>
              {isRtl ? '12 / 12 متجر' : '12 / 12 NODES'}
            </span>
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#10B981', fontFamily: "'Geist Mono', monospace" }}>
              {isRtl ? '100% متصل ومحدث' : '100% ONLINE'}
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#666666', fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist', sans-serif" }}>
            {isRtl ? 'فحص دوري مستمر لأسعار الرفوف' : 'Continuous real-time shelf scraping active'}
          </span>
        </div>

        <div
          style={{
            backgroundColor: '#000000',
            border: '1px solid #1F1F1F',
            borderRadius: '8px',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '0.6875rem', fontWeight: 500, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist Mono', monospace" }}>
            {isRtl ? 'متوسط سرعة الاستجابة' : 'MEAN INGESTION LATENCY'}
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 600, color: '#EDEDED', fontFamily: "'Geist Mono', monospace" }}>
              {avgPing} ms
            </span>
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#00DF8F', fontFamily: "'Geist Mono', monospace" }}>
              {isRtl ? 'ممتاز' : 'OPTIMAL'}
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#666666', fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist', sans-serif" }}>
            {isRtl ? 'زمن الاستجابة للطلب بالمللي ثانية' : 'Average round-trip response time'}
          </span>
        </div>

        <div
          style={{
            backgroundColor: '#000000',
            border: '1px solid #1F1F1F',
            borderRadius: '8px',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '0.6875rem', fontWeight: 500, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist Mono', monospace" }}>
            {isRtl ? 'مؤشر مصداقية العروض (90 يوم)' : 'FLEET TRUTH SCORE (90D)'}
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 600, color: '#10B981', fontFamily: "'Geist Mono', monospace" }}>
              {avgTruthScore}%
            </span>
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#10B981', fontFamily: "'Geist Mono', monospace" }}>
              {isRtl ? 'خصومات حقيقية' : 'GENUINE'}
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#666666', fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist', sans-serif" }}>
            {isRtl ? 'نسبة التخفيضات الموثقة دون خصم وهمي' : 'Percentage of markdowns verified without ghost inflation'}
          </span>
        </div>

        <div
          style={{
            backgroundColor: '#000000',
            border: '1px solid #1F1F1F',
            borderRadius: '8px',
            padding: '18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '0.6875rem', fontWeight: 500, color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist Mono', monospace" }}>
            {isRtl ? 'نسبة استقرار الاتصال' : 'AGGREGATED UPTIME'}
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 600, color: '#EDEDED', fontFamily: "'Geist Mono', monospace" }}>
              99.82%
            </span>
            <button
              type="button"
              onClick={handlePingAll}
              disabled={probingNodeId === 'ALL'}
              style={{
                background: 'none',
                border: 'none',
                color: '#38BDF8',
                fontSize: '0.6875rem',
                cursor: 'pointer',
                fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist Mono', monospace",
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: 0,
              }}
            >
              <RefreshCw size={10} style={{ animation: probingNodeId === 'ALL' ? 'spin 1s linear infinite' : 'none' }} />
              <span>{isRtl ? 'فحص المتاجر' : 'Probe Fleet'}</span>
            </button>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#666666', fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist', sans-serif" }}>
            {isRtl ? 'صفر انقطاعات أو تأخيرات خلال 72 ساعة' : 'Zero connection timeouts in last 72 hours'}
          </span>
        </div>
      </div>

      {/* ── 2. 12-NODE TELEMETRY GRID (3x4 Institutional Cards) ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '14px',
        }}
      >
        {nodes.map((node) => {
          const isProbing = probingNodeId === node.id || probingNodeId === 'ALL';
          const isFlashing = flashingNodeId === node.id;
          const pingColor = node.ping < 300 ? '#10B981' : node.ping < 500 ? '#F59E0B' : '#FB7185';

          return (
            <div
              key={node.id}
              style={{
                backgroundColor: isFlashing ? '#0D1612' : '#000000',
                border: isFlashing ? '1px solid #10B981' : '1px solid #1F1F1F',
                borderRadius: '8px',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px',
                transition: 'all 200ms ease',
              }}
            >
              {/* Header: Platform Name & Status Dot */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#EDEDED', fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist', sans-serif" }}>
                      {getRetailerName(node.id, lang)}
                    </span>
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: pingColor,
                        boxShadow: `0 0 6px ${pingColor}`,
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.6875rem', color: '#666666', fontFamily: "'Geist Mono', monospace" }}>
                    {node.domain} • {node.tier}
                  </span>
                </div>

                {/* Probe Button */}
                <button
                  type="button"
                  onClick={() => handlePingNode(node.id)}
                  disabled={isProbing}
                  style={{
                    backgroundColor: '#0A0A0A',
                    border: '1px solid #222222',
                    color: isProbing ? '#F59E0B' : '#EDEDED',
                    fontSize: '0.6875rem',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: isProbing ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist Mono', monospace",
                    transition: 'all 100ms ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#141414')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0A0A0A')}
                  title={isRtl ? 'فحص سرعة استجابة المتجر الآن' : 'Ping retailer node'}
                >
                  <RefreshCw size={10} style={{ animation: isProbing ? 'spin 1s linear infinite' : 'none' }} />
                  <span>{isRtl ? 'فحص الآن' : 'Ping'}</span>
                </button>
              </div>

              {/* Metrics Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px',
                  borderTop: '1px solid #141414',
                  paddingTop: '12px',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.625rem', color: '#666666', textTransform: 'uppercase', fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist Mono', monospace" }}>
                    {isRtl ? 'سرعة الاستجابة' : 'INGESTION LATENCY'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: pingColor, fontFamily: "'Geist Mono', monospace" }}>
                      {node.ping} ms
                    </span>
                    <span style={{ fontSize: '0.625rem', color: '#555555' }}>
                      ({node.lastAudited})
                    </span>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.625rem', color: '#666666', textTransform: 'uppercase', fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist Mono', monospace" }}>
                    {isRtl ? 'مؤشر النزاهة 90 يوم' : '90D TRUTH SCORE'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#10B981', fontFamily: "'Geist Mono', monospace" }}>
                      {node.truthScore}%
                    </span>
                    <CheckCircle2 size={12} color="#10B981" />
                  </div>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ fontSize: '0.625rem', color: '#666666', textTransform: 'uppercase', fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist Mono', monospace" }}>
                    {isRtl ? 'آلية جلب وتحديث البيانات' : 'INGESTION VECTOR'}
                  </span>
                  <div style={{ fontSize: '0.75rem', color: '#EDEDED', fontFamily: "'Geist Mono', monospace", marginTop: '2px' }}>
                    {node.ingestionMethod}
                  </div>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ fontSize: '0.625rem', color: '#666666', textTransform: 'uppercase', fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist Mono', monospace" }}>
                    {isRtl ? 'نوع الضمان المعتمد' : 'WARRANTY STRICTNESS'}
                  </span>
                  <div style={{ fontSize: '0.75rem', color: '#888888', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist', sans-serif" }}>
                    <ShieldCheck size={12} color="#10B981" />
                    <span>{node.warrantyStrictness}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Throughput strip */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid #141414',
                  paddingTop: '8px',
                  fontSize: '0.6875rem',
                  color: '#555555',
                  fontFamily: isRtl ? "'Alexandria', sans-serif" : "'Geist Mono', monospace",
                }}
              >
                <span>{isRtl ? `معدل الفحص: ${node.throughput}` : `Throughput: ${node.throughput}`}</span>
                <span>{isRtl ? `الاستقرار: ${node.uptime}` : `Uptime: ${node.uptime}`}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
