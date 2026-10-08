import ArbitrageEngine from '../../components/console/ArbitrageEngine.jsx';

export default function ArbitrageEnginePage({ onInspectProduct, onShowToast }) {
  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#EDEDED', margin: '0 0 4px 0', letterSpacing: '-0.02em', fontFamily: "'Geist', sans-serif" }}>
          Cross-Retailer Arbitrage Engine
        </h1>
        <p style={{ fontSize: '0.8125rem', color: '#888888', margin: 0, fontFamily: "'Geist', sans-serif" }}>
          Automated domestic shelf divergence discovery calculating real-time margin spreads across 12 verified Egyptian platforms.
        </p>
      </div>
      <ArbitrageEngine onInspectProduct={onInspectProduct} onShowToast={onShowToast} />
    </div>
  );
}
