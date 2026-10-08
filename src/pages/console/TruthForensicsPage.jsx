import TruthForensics from '../../components/console/TruthForensics.jsx';

export default function TruthForensicsPage({ onInspectProduct, onShowToast }) {
  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#EDEDED', margin: '0 0 4px 0', letterSpacing: '-0.02em', fontFamily: "'Geist', sans-serif" }}>
          Truth Forensics & Glitch Radar
        </h1>
        <p style={{ fontSize: '0.8125rem', color: '#888888', margin: 0, fontFamily: "'Geist', sans-serif" }}>
          Automated interception of artificial reference price inflation, ghost markups, and deceptive discount anomalies across 12 domestic retailers.
        </p>
      </div>
      <TruthForensics onInspectProduct={onInspectProduct} onShowToast={onShowToast} />
    </div>
  );
}
