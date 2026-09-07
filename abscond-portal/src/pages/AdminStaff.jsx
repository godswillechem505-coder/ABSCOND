import { useEffect, useState } from 'react';
import { ApiClient } from '../auth/ApiClient';
import { useAuth } from '../auth/useAuth';
import { useToast } from '../context/useToast';

export default function AdminStaff() {
  const toast = useToast();
  const { user, getAccessToken, refreshAccessToken } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    email: '',
    identifier: '',
    password: '',
    staffRole: 'registry',
    role: 'staff',
  });

  const loadStaff = () => {
    setLoading(true);
    setError(null);
    ApiClient.get('/admin/staff', {}, getAccessToken, refreshAccessToken)
      .then((data) => setStaff(data.staff || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    document.title = 'Staff Account Management | ABSCONS One';
    ApiClient.get('/admin/staff', {}, getAccessToken, refreshAccessToken)
      .then((data) => setStaff(data.staff || []))
      .catch((err) => setError(err.message));
  }, [getAccessToken, refreshAccessToken]);


  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      await ApiClient.post('/admin/staff', form, {}, getAccessToken, refreshAccessToken);
      setNotice('Staff account created successfully.');
      toast.success('Staff account created successfully.');
      setShowModal(false);
      setForm({ email: '', identifier: '', password: '', staffRole: 'registry', role: 'staff' });
      loadStaff();
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to create staff account.');
    }
  };

  const handleToggleStatus = async (member) => {
    try {
      const nextStatus = !member.isActive;
      await ApiClient.patch(`/admin/staff/${member.id}`, { isActive: nextStatus }, {}, getAccessToken, refreshAccessToken);
      const msg = `Account ${member.email} ${nextStatus ? 'activated' : 'deactivated'}.`;
      setNotice(msg);
      toast.success(msg);
      loadStaff();
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to update staff status.');
    }
  };

  return (
    <main className="admin-staff-module admin-module">
      <header className="admin-module-header">
        <div>
          <span className="eyebrow">Institutional Access Control</span>
          <h1>Staff Accounts & Role Management</h1>
          <p>Create staff accounts, assign departmental roles, and control administrative system privileges.</p>
        </div>
        {isSuperAdmin && (
          <button type="button" className="admin-btn-primary" onClick={() => setShowModal(true)}>
            + Add Staff Account
          </button>
        )}
      </header>

      {error && <div className="login-error" role="alert">{error}</div>}
      {notice && <div className="admin-notice" role="status">{notice}</div>}

      <section className="admin-panel">
        <div className="portal-panel-header">
          <h2>Institutional Staff Directory</h2>
          <span>{staff.length} staff members</span>
        </div>
        <div className="admin-table-container">
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Email / Identifier</th>
                <th>System Role</th>
                <th>Staff Department / Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.id}>
                  <td>
                    <strong>{s.email}</strong>
                    <small className="admin-table-subtext">{s.identifier}</small>
                  </td>
                  <td><span className="matric-badge">{s.role?.replaceAll('_', ' ')}</span></td>
                  <td><strong>{s.staffRole?.replaceAll('_', ' ').toUpperCase() || 'Super Admin'}</strong></td>
                  <td>
                    <span className={`status-pill ${s.isActive ? 'approved' : 'rejected'}`}>
                      {s.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td>
                    {isSuperAdmin && s.role !== 'super_admin' && (
                      <button
                        type="button"
                        className={`admin-btn-sm ${s.isActive ? 'text-danger' : 'admin-btn-primary'}`}
                        onClick={() => handleToggleStatus(s)}
                      >
                        {s.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && staff.length === 0 && (
                <tr><td colSpan="6" className="admin-empty-table">No staff accounts found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showModal && (
        <div className="admin-modal-overlay" role="dialog">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h2>Create New Staff Account</h2>
              <button type="button" className="admin-modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateStaff}>
              <div className="admin-modal-body">
                <div className="admin-form-grid">
                  <label>
                    Institutional Email *
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value, identifier: form.identifier || e.target.value })} placeholder="e.g. registry@abscons.edu.ng" required />
                  </label>
                  <label>
                    Staff Identifier
                    <input value={form.identifier} onChange={(e) => setForm({ ...form, identifier: e.target.value })} placeholder="e.g. STAFF-001" required />
                  </label>
                  <label>
                    Temporary Password *
                    <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 8 characters" required />
                  </label>
                  <label>
                    Staff Departmental Role *
                    <select value={form.staffRole} onChange={(e) => setForm({ ...form, staffRole: e.target.value })} required>
                      <option value="registry">Registry (Students, Profiles, Docs)</option>
                      <option value="bursary">Bursary (Fees & Payments)</option>
                      <option value="academic_affairs">Academic Affairs (Results & Curriculum)</option>
                      <option value="clinical_training">Clinical Training Unit</option>
                      <option value="ict">ICT & System Admin</option>
                      <option value="registrar">College Registrar (Full Read/Publish)</option>
                    </select>
                  </label>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="login-submit">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
