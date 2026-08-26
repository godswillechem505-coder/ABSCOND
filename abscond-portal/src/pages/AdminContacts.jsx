import { useEffect, useState } from 'react';
import { ApiClient } from '../auth/ApiClient';
import { useAuth } from '../auth/useAuth';

export default function AdminContacts() {
  const { getAccessToken, refreshAccessToken } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadMessages = () => {
    setLoading(true);
    setError(null);
    ApiClient.get('/admin/contacts', {}, getAccessToken, refreshAccessToken)
      .then((data) => setMessages(data.messages || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    document.title = 'Contact Inbox | ABSCONS One';
    ApiClient.get('/admin/contacts', {}, getAccessToken, refreshAccessToken)
      .then((data) => setMessages(data.messages || []))
      .catch((err) => setError(err.message));
  }, [getAccessToken, refreshAccessToken]);


  const handleUpdateStatus = async (msgId, status) => {
    try {
      await ApiClient.patch(`/admin/contacts/${msgId}/status`, { status }, {}, getAccessToken, refreshAccessToken);
      setNotice(`Status updated to ${status}.`);
      loadMessages();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedMessage) return;
    setSubmitting(true);
    try {
      await ApiClient.post(`/admin/contacts/${selectedMessage.id}/reply`, { replyText }, {}, getAccessToken, refreshAccessToken);
      setNotice('Reply recorded and message marked resolved.');
      setSelectedMessage(null);
      setReplyText('');
      loadMessages();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="admin-contacts-module admin-module">
      <header className="admin-module-header">
        <div>
          <span className="eyebrow">Public Relations & Support</span>
          <h1>Contact Messages Inbox</h1>
          <p>Review public inquiries, assign to departments, and log official responses.</p>
        </div>
      </header>

      {error && <div className="login-error" role="alert">{error}</div>}
      {notice && <div className="admin-notice" role="status">{notice}</div>}

      <section className="admin-panel">
        <div className="portal-panel-header">
          <h2>Inquiries & Messages</h2>
          <span>{messages.length} total received</span>
        </div>
        <div className="admin-table-container">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Sender & Contact</th>
                <th>Subject & Snippet</th>
                <th>Department</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((m) => (
                <tr key={m.id}>
                  <td>
                    <strong>{m.fullName}</strong>
                    <small className="admin-table-subtext">{m.email} · {m.phone || 'No phone'}</small>
                  </td>
                  <td>
                    <strong>{m.subject}</strong>
                    <small className="admin-table-subtext">{m.message?.slice(0, 75)}...</small>
                  </td>
                  <td><span className="matric-badge">{m.department}</span></td>
                  <td>{new Date(m.createdAt).toLocaleDateString()}</td>
                  <td><span className={`status-pill ${m.status}`}>{m.status?.replaceAll('_', ' ')}</span></td>
                  <td>
                    <button type="button" className="admin-btn-sm admin-btn-primary" onClick={() => { setSelectedMessage(m); setReplyText(m.replyText || ''); }}>
                      {m.replyText ? 'View Reply' : 'Reply'}
                    </button>
                    {m.status === 'new' && (
                      <button type="button" className="admin-btn-sm" onClick={() => handleUpdateStatus(m.id, 'in_progress')}>
                        In Progress
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && messages.length === 0 && (
                <tr><td colSpan="6" className="admin-empty-table">No contact messages in inbox.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedMessage && (
        <div className="admin-modal-overlay" role="dialog">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h2>Contact Message Details</h2>
              <button type="button" className="admin-modal-close" onClick={() => setSelectedMessage(null)}>✕</button>
            </div>
            <form onSubmit={handleSendReply}>
              <div className="admin-modal-body">
                <div className="message-inquiry-box" style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                  <p><b>From:</b> {selectedMessage.fullName} ({selectedMessage.email})</p>
                  <p><b>Subject:</b> {selectedMessage.subject}</p>
                  <p><b>Department:</b> {selectedMessage.department}</p>
                  <div style={{ marginTop: '10px', padding: '12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                    {selectedMessage.message}
                  </div>
                </div>

                <label className="span-full">
                  Official Response / Reply Notes *
                  <textarea rows="5" value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Type official response here..." required />
                </label>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn-secondary" onClick={() => setSelectedMessage(null)}>Close</button>
                <button type="submit" className="login-submit" disabled={submitting}>
                  {submitting ? 'Recording...' : 'Send & Mark Resolved'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
