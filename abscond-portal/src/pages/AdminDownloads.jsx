import { useEffect, useState } from 'react';
import { ApiClient } from '../auth/ApiClient';
import { useAuth } from '../auth/useAuth';
import { useToast } from '../context/useToast';

export default function AdminDownloads() {
  const toast = useToast();
  const { permissions, getAccessToken, refreshAccessToken } = useAuth();
  const canManage = permissions?.includes('downloads:manage');

  const [downloads, setDownloads] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'academic',
    fileName: '',
    academicSessionId: '',
    status: 'published',
  });

  const loadData = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      ApiClient.get('/admin/downloads', {}, getAccessToken, refreshAccessToken),
      ApiClient.get('/reference/sessions', {}, getAccessToken, refreshAccessToken),
    ])
      .then(([dData, sData]) => {
        setDownloads(dData.downloads || []);
        setSessions(sData.sessions || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    document.title = 'Document Library | ABSCONS One';
    Promise.all([
      ApiClient.get('/admin/downloads', {}, getAccessToken, refreshAccessToken),
      ApiClient.get('/reference/sessions', {}, getAccessToken, refreshAccessToken),
    ])
      .then(([dData, sData]) => {
        setDownloads(dData.downloads || []);
        setSessions(sData.sessions || []);
      })
      .catch((err) => setError(err.message));
  }, [getAccessToken, refreshAccessToken]);


  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      await ApiClient.post('/admin/downloads', {
        ...form,
        fileUrl: `/downloads/${form.fileName}`,
        fileSize: 520000,
      }, {}, getAccessToken, refreshAccessToken);
      setNotice('Document published to library.');
      toast.success('Document published to library.');
      setShowModal(false);
      setForm({ title: '', description: '', category: 'academic', fileName: '', academicSessionId: '', status: 'published' });
      loadData();
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to upload document.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete document from library?')) return;
    try {
      await ApiClient.delete(`/admin/downloads/${id}`, {}, getAccessToken, refreshAccessToken);
      setNotice('Document removed.');
      toast.success('Document removed.');
      loadData();
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to remove document.');
    }
  };

  return (
    <main className="admin-downloads-module admin-module">
      <header className="admin-module-header">
        <div>
          <span className="eyebrow">Registry & Academic Affairs</span>
          <h1>Downloads & Document Library</h1>
          <p>Upload handbooks, session calendars, timetables, and downloadable institutional resources.</p>
        </div>
        {canManage && (
          <button type="button" className="admin-btn-primary" onClick={() => setShowModal(true)}>
            + Upload Document
          </button>
        )}
      </header>

      {error && <div className="login-error" role="alert">{error}</div>}
      {notice && <div className="admin-notice" role="status">{notice}</div>}

      <section className="admin-panel">
        <div className="portal-panel-header">
          <h2>Published Documents</h2>
          <span>{downloads.length} resources available</span>
        </div>
        <div className="admin-table-container">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Document Title</th>
                <th>Category</th>
                <th>File Name</th>
                <th>Session</th>
                <th>Upload Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {downloads.map((d) => (
                <tr key={d.id}>
                  <td>
                    <strong>{d.title}</strong>
                    <small className="admin-table-subtext">{d.description || 'Institutional resource'}</small>
                  </td>
                  <td>
                    <span className="matric-badge">{d.category}</span>
                  </td>
                  <td><code>{d.fileName}</code></td>
                  <td>{d.academicSession?.name || 'All Sessions'}</td>
                  <td>{new Date(d.createdAt).toLocaleDateString()}</td>
                  <td>
                    {canManage && (
                      <button type="button" className="admin-btn-sm text-danger" onClick={() => handleDelete(d.id)}>
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && downloads.length === 0 && (
                <tr><td colSpan="6" className="admin-empty-table">No documents in library.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showModal && (
        <div className="admin-modal-overlay" role="dialog">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h2>Upload Document Resource</h2>
              <button type="button" className="admin-modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleUpload}>
              <div className="admin-modal-body">
                <div className="admin-form-grid">
                  <label className="span-full">
                    Document Title *
                    <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. 2025/2026 Examination Timetable" required />
                  </label>
                  <label>
                    Category
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                      <option value="academic">Academic</option>
                      <option value="finance">Finance / Bursary</option>
                      <option value="handbook">Handbook & Regulations</option>
                      <option value="general">General</option>
                    </select>
                  </label>
                  <label>
                    Target Session
                    <select value={form.academicSessionId} onChange={(e) => setForm({ ...form, academicSessionId: e.target.value })}>
                      <option value="">All Sessions</option>
                      {sessions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </label>
                  <label className="span-full">
                    File Name / Attachment *
                    <input value={form.fileName} onChange={(e) => setForm({ ...form, fileName: e.target.value })} placeholder="e.g. exam-timetable-2026.pdf" required />
                  </label>
                  <label className="span-full">
                    Description / Purpose
                    <textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  </label>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="login-submit">Publish to Library</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
