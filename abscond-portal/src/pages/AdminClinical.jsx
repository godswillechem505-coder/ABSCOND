import { useEffect, useState } from 'react';
import { ApiClient } from '../auth/ApiClient';
import { useAuth } from '../auth/useAuth';
import { useToast } from '../context/useToast';

export default function AdminClinical() {
  const toast = useToast();
  const { permissions, getAccessToken, refreshAccessToken } = useAuth();
  const canManage = permissions?.includes('clinical_postings:manage');

  const [postings, setPostings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    matricNumber: 'ABSCONS/2025/001',
    hospitalName: 'Federal Medical Centre (FMC), Umuahia',
    wardUnit: 'Female Surgical Ward',
    supervisorName: 'Matron C. Kalu, RN/RM',
    supervisorContact: '+2348039876543',
    startDate: '2026-05-01',
    endDate: '2026-06-30',
    status: 'assigned',
    notes: 'Surgical nursing clinical rotation.',
  });

  const loadPostings = () => {
    setLoading(true);
    setError(null);
    ApiClient.get('/admin/clinical/postings', {}, getAccessToken, refreshAccessToken)
      .then((data) => setPostings(data.postings || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    document.title = 'Clinical Postings | ABSCONS One';
    ApiClient.get('/admin/clinical/postings', {}, getAccessToken, refreshAccessToken)
      .then((data) => setPostings(data.postings || []))
      .catch((err) => setError(err.message));
  }, [getAccessToken, refreshAccessToken]);


  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await ApiClient.post('/admin/clinical/postings', form, {}, getAccessToken, refreshAccessToken);
      setNotice('Clinical posting assigned successfully.');
      toast.success('Clinical posting assigned successfully.');
      setShowModal(false);
      loadPostings();
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to assign clinical posting.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete clinical posting record?')) return;
    try {
      await ApiClient.delete(`/admin/clinical/postings/${id}`, {}, getAccessToken, refreshAccessToken);
      setNotice('Posting removed.');
      toast.success('Clinical posting removed.');
      loadPostings();
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to remove posting.');
    }
  };

  return (
    <main className="admin-clinical-module admin-module">
      <header className="admin-module-header">
        <div>
          <span className="eyebrow">Clinical Training Unit</span>
          <h1>Clinical Postings & Placements</h1>
          <p>Assign students to affiliated hospitals, medical centres, wards, and clinical preceptors.</p>
        </div>
        {canManage && (
          <button type="button" className="admin-btn-primary" onClick={() => setShowModal(true)}>
            + Assign Clinical Posting
          </button>
        )}
      </header>

      {error && <div className="login-error" role="alert">{error}</div>}
      {notice && <div className="admin-notice" role="status">{notice}</div>}

      <section className="admin-panel">
        <div className="portal-panel-header">
          <h2>Active & Scheduled Postings</h2>
          <span>{postings.length} student placements</span>
        </div>
        <div className="admin-table-container">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Hospital & Placement</th>
                <th>Ward / Unit</th>
                <th>Clinical Preceptor</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {postings.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.student?.lastName} {p.student?.firstName}</strong>
                    <small className="admin-table-subtext">{p.student?.matricNumber} · {p.student?.programme?.name}</small>
                  </td>
                  <td><strong>{p.hospitalName}</strong></td>
                  <td>{p.wardUnit}</td>
                  <td>
                    <span>{p.supervisorName}</span>
                    <small className="admin-table-subtext">{p.supervisorContact || 'No phone'}</small>
                  </td>
                  <td>
                    <small>{new Date(p.startDate).toLocaleDateString()} — {new Date(p.endDate).toLocaleDateString()}</small>
                  </td>
                  <td>
                    <span className={`status-pill ${p.status}`}>{p.status}</span>
                  </td>
                  <td>
                    {canManage && (
                      <button type="button" className="admin-btn-sm text-danger" onClick={() => handleDelete(p.id)}>
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && postings.length === 0 && (
                <tr><td colSpan="7" className="admin-empty-table">No clinical postings assigned yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showModal && (
        <div className="admin-modal-overlay" role="dialog">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h2>Assign Clinical Placement</h2>
              <button type="button" className="admin-modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAssign}>
              <div className="admin-modal-body">
                <div className="admin-form-grid">
                  <label>
                    Student Matric Number *
                    <input value={form.matricNumber} onChange={(e) => setForm({ ...form, matricNumber: e.target.value })} required />
                  </label>
                  <label>
                    Hospital / Facility Name *
                    <input value={form.hospitalName} onChange={(e) => setForm({ ...form, hospitalName: e.target.value })} required />
                  </label>
                  <label>
                    Ward / Department *
                    <input value={form.wardUnit} onChange={(e) => setForm({ ...form, wardUnit: e.target.value })} required />
                  </label>
                  <label>
                    Preceptor / Matron Name *
                    <input value={form.supervisorName} onChange={(e) => setForm({ ...form, supervisorName: e.target.value })} required />
                  </label>
                  <label>
                    Supervisor Contact Phone
                    <input value={form.supervisorContact} onChange={(e) => setForm({ ...form, supervisorContact: e.target.value })} />
                  </label>
                  <label>
                    Start Date *
                    <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
                  </label>
                  <label>
                    End Date *
                    <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
                  </label>
                  <label className="span-full">
                    Clinical Notes / Rotation Details
                    <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                  </label>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="login-submit">Save Posting</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
