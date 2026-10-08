import RetailerHealth from '../../components/console/RetailerHealth.jsx';

export default function RetailerHealthPage({ onShowToast }) {
  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#EDEDED', margin: '0 0 4px 0', letterSpacing: '-0.02em', fontFamily: "'Geist', sans-serif" }}>
          Retailer Infrastructure & Ingestion Latency Radar
        </h1>
        <p style={{ fontSize: '0.8125rem', color: '#888888', margin: 0, fontFamily: "'Geist', sans-serif" }}>
          Real-time probe health, schema extraction vectors, and 90-day truth integrity scores across all 12 domestic Egyptian retailers.
        </p>
      </div>
      <RetailerHealth onShowToast={onShowToast} />
    </div>
  );
}
