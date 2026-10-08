import WatchlistManager from '../../components/console/WatchlistManager.jsx';

export default function WatchlistPage({ onInspectProduct, onShowToast }) {
  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#EDEDED', margin: '0 0 4px 0', letterSpacing: '-0.02em', fontFamily: "'Geist', sans-serif" }}>
          Custom Watchlist & Target Price Triggers
        </h1>
        <p style={{ fontSize: '0.8125rem', color: '#888888', margin: 0, fontFamily: "'Geist', sans-serif" }}>
          Algorithmic limit order monitoring, real-time inventory restock interception, and multi-channel notification dispatch rules.
        </p>
      </div>
      <WatchlistManager onInspectProduct={onInspectProduct} onShowToast={onShowToast} />
    </div>
  );
}
