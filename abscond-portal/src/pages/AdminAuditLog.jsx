import { useEffect, useState } from 'react';
import { ApiClient } from '../auth/ApiClient';
import { useAuth } from '../auth/useAuth';
import { useToast } from '../context/useToast';

export default function AdminAuditLog() {
  const toast = useToast();
  const { getAccessToken, refreshAccessToken } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);

  const loadLogs = () => {
    setLoading(true);
    setError(null);
    ApiClient.get('/admin/audit-logs?limit=100', {}, getAccessToken, refreshAccessToken)
      .then((data) => setLogs(data.logs || []))
      .catch((err) => {
        setError(err.message);
        toast.error(err.message || 'Failed to load audit logs.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    document.title = 'Audit Log | ABSCONS One';
    ApiClient.get('/admin/audit-logs?limit=100', {}, getAccessToken, refreshAccessToken)
      .then((data) => setLogs(data.logs || []))
      .catch((err) => setError(err.message));
  }, [getAccessToken, refreshAccessToken]);


  return (
    <main className="admin-audit-module admin-module">
      <header className="admin-module-header">
        <div>
          <span className="eyebrow">Security & Compliance</span>
          <h1>System Audit Trail & Log Viewer</h1>
          <p>Immutable log of administrative operations, role modifications, and system configuration events.</p>
        </div>
        <button type="button" className="admin-btn-secondary" onClick={loadLogs} disabled={loading}>
          {loading ? 'Refreshing...' : '🔄 Refresh Logs'}
        </button>
      </header>


      {error && <div className="login-error" role="alert">{error}</div>}

      <section className="admin-panel">
        <div className="portal-panel-header">
          <h2>Security Activity Logs</h2>
          <span>{logs.length} logged actions</span>
        </div>
        <div className="admin-table-container">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Staff / Actor</th>
                <th>Action</th>
                <th>Target Resource</th>
                <th>Resource ID</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id}>
                  <td><small>{new Date(l.createdAt).toLocaleString()}</small></td>
                  <td>
                    <strong>{l.userEmail || l.user?.email || 'System'}</strong>
                    <small className="admin-table-subtext">{l.user?.staffRole || 'System Action'}</small>
                  </td>
                  <td><span className="matric-badge">{l.action}</span></td>
                  <td><strong>{l.resource}</strong></td>
                  <td><code>{l.resourceId}</code></td>
                  <td>
                    <button type="button" className="admin-btn-sm" onClick={() => setSelectedLog(l)}>
                      View JSON
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && logs.length === 0 && (
                <tr><td colSpan="6" className="admin-empty-table">No audit logs recorded yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedLog && (
        <div className="admin-modal-overlay" role="dialog">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h2>Audit Log Entry Details</h2>
              <button type="button" className="admin-modal-close" onClick={() => setSelectedLog(null)}>✕</button>
            </div>
            <div className="admin-modal-body">
              <p><b>Action:</b> {selectedLog.action}</p>
              <p><b>Actor:</b> {selectedLog.userEmail || 'System'} ({selectedLog.ipAddress || '127.0.0.1'})</p>
              <p><b>Timestamp:</b> {new Date(selectedLog.createdAt).toISOString()}</p>
              <h4 style={{ marginTop: '14px', marginBottom: '6px' }}>Payload Details:</h4>
              <pre style={{ background: '#0f172a', color: '#38bdf8', padding: '12px', borderRadius: '6px', overflowX: 'auto', fontSize: '13px' }}>
                {selectedLog.details}
              </pre>
            </div>
            <div className="admin-modal-footer">
              <button type="button" className="admin-btn-secondary" onClick={() => setSelectedLog(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
