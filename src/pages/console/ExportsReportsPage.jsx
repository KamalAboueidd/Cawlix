import ExportsReports from '../../components/console/ExportsReports.jsx';

export default function ExportsReportsPage({ onShowToast }) {
  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#EDEDED', margin: '0 0 4px 0', letterSpacing: '-0.02em', fontFamily: "'Geist', sans-serif" }}>
          Intelligence Exports & Compliance Audit Reports
        </h1>
        <p style={{ fontSize: '0.8125rem', color: '#888888', margin: 0, fontFamily: "'Geist', sans-serif" }}>
          Machine-readable arbitrage feeds, raw cross-retailer CSV exports, and official price integrity audit reports.
        </p>
      </div>
      <ExportsReports onShowToast={onShowToast} />
    </div>
  );
}
