import { useEffect, useState } from 'react';
import { ApiClient } from '../auth/ApiClient';
import { useAuth } from '../auth/useAuth';

export default function AdminFaqs() {
  const { permissions, getAccessToken, refreshAccessToken } = useAuth();
  const canManage = permissions?.includes('faqs:manage');

  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    question: '',
    answer: '',
    category: 'general',
    sortOrder: '0',
    isPublished: true,
  });

  const loadFaqs = () => {
    setLoading(true);
    setError(null);
    ApiClient.get('/admin/faqs', {}, getAccessToken, refreshAccessToken)
      .then((data) => setFaqs(data.faqs || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    document.title = 'FAQs Management | ABSCONS One';
    ApiClient.get('/admin/faqs', {}, getAccessToken, refreshAccessToken)
      .then((data) => setFaqs(data.faqs || []))
      .catch((err) => setError(err.message));
  }, [getAccessToken, refreshAccessToken]);


  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await ApiClient.post('/admin/faqs', form, {}, getAccessToken, refreshAccessToken);
      setNotice('FAQ item created.');
      setShowModal(false);
      setForm({ question: '', answer: '', category: 'general', sortOrder: '0', isPublished: true });
      loadFaqs();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete FAQ item?')) return;
    try {
      await ApiClient.delete(`/admin/faqs/${id}`, {}, getAccessToken, refreshAccessToken);
      setNotice('FAQ deleted.');
      loadFaqs();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="admin-faqs-module admin-module">
      <header className="admin-module-header">
        <div>
          <span className="eyebrow">Public Help Center</span>
          <h1>Frequently Asked Questions (FAQs)</h1>
          <p>Create, organize, and publish categorized answers for prospective & enrolled students.</p>
        </div>
        {canManage && (
          <button type="button" className="admin-btn-primary" onClick={() => setShowModal(true)}>
            + Add FAQ Item
          </button>
        )}
      </header>

      {error && <div className="login-error" role="alert">{error}</div>}
      {notice && <div className="admin-notice" role="status">{notice}</div>}

      <section className="admin-panel">
        <div className="portal-panel-header">
          <h2>Active FAQ Directory</h2>
          <span>{faqs.length} published questions</span>
        </div>
        <div className="admin-table-container">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Question & Answer</th>
                <th>Category</th>
                <th>Order</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {faqs.map((f) => (
                <tr key={f.id}>
                  <td>
                    <strong>{f.question}</strong>
                    <small className="admin-table-subtext">{f.answer}</small>
                  </td>
                  <td><span className="matric-badge">{f.category}</span></td>
                  <td>{f.sortOrder}</td>
                  <td><span className={`status-pill ${f.isPublished ? 'approved' : 'pending'}`}>{f.isPublished ? 'Published' : 'Hidden'}</span></td>
                  <td>
                    {canManage && (
                      <button type="button" className="admin-btn-sm text-danger" onClick={() => handleDelete(f.id)}>
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && faqs.length === 0 && (
                <tr><td colSpan="5" className="admin-empty-table">No FAQ items configured yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showModal && (
        <div className="admin-modal-overlay" role="dialog">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h2>Add FAQ Item</h2>
              <button type="button" className="admin-modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="admin-modal-body">
                <div className="admin-form-grid">
                  <label className="span-full">
                    Question *
                    <input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder="e.g. How do I access clinical posting schedules?" required />
                  </label>
                  <label>
                    Category
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                      <option value="admissions">Admissions</option>
                      <option value="programmes">Programmes</option>
                      <option value="fees">Fees & Payments</option>
                      <option value="student_life">Student Life</option>
                      <option value="campuses">Campuses</option>
                      <option value="portal">Student Portal</option>
                      <option value="general">General</option>
                    </select>
                  </label>
                  <label>
                    Sort Order
                    <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
                  </label>
                  <label className="span-full">
                    Detailed Answer *
                    <textarea rows="5" value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} required />
                  </label>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="login-submit">Save FAQ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
