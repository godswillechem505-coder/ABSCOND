import { useEffect, useState } from 'react';
import { ApiClient } from '../auth/ApiClient';
import { useAuth } from '../auth/useAuth';

export default function StudentSettingsPage() {
  const { getAccessToken, refreshAccessToken } = useAuth();
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const [student, setStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');

  // Form states
  const [personalForm, setPersonalForm] = useState({ phone: '', address: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = 'Account Settings | ABSCONS Student Portal';
    ApiClient.get('/students/me', {}, getAccessToken, refreshAccessToken)
      .then((data) => {
        setStudent(data.student);
        if (data.student) {
          setPersonalForm({
            phone: data.student.phone || '',
            address: data.student.address || '',
          });
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [getAccessToken, refreshAccessToken]);

  const handleUpdatePersonal = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setNotice(null);

    try {
      const res = await ApiClient.patch('/students/me', personalForm, {}, getAccessToken, refreshAccessToken);
      setNotice(res.message || 'Personal details updated successfully!');
      if (res.student) setStudent(res.student);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setNotice(null);

    try {
      const res = await ApiClient.patch(
        '/students/settings/password',
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
        {},
        getAccessToken,
        refreshAccessToken
      );
      setNotice(res.message || 'Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="portal-page-container">
      {/* Header Banner */}
      <header className="portal-header-banner">
        <div>
          <span className="eyebrow">Account Configuration</span>
          <h1>Portal Settings & Preferences</h1>
          <p>Manage your student profile, update contact info, change password, and configure portal notifications.</p>
        </div>
      </header>

      {notice && <div className="admin-notice" role="status">✓ {notice}</div>}
      {error && <div className="login-error" role="alert">✕ {error}</div>}

      {/* Student Profile Card Summary */}
      {student && (
        <section className="portal-card" style={{ marginBottom: '24px', padding: '20px' }}>
          <div className="profile-summary-header-row">
            <div className="profile-avatar-circle">
              {student.firstName?.[0]}
              {student.lastName?.[0]}
            </div>
            <div>
              <h2 style={{ fontSize: '20px', margin: '0 0 4px 0' }}>
                {student.firstName} {student.middleName || ''} {student.lastName}
              </h2>
              <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                Matric No: <strong>{student.matricNumber}</strong> | {student.programme?.name || 'Nursing Science'} ({student.campus?.code || 'ABA'})
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Linked Settings Tabs */}
      <div className="admin-fee-tabs">
        <button
          type="button"
          className={`admin-fee-tab ${activeTab === 'personal' ? 'active' : ''}`}
          onClick={() => setActiveTab('personal')}
        >
          👤 Personal Information
        </button>
        <button
          type="button"
          className={`admin-fee-tab ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          🔒 Password & Security
        </button>
        <button
          type="button"
          className={`admin-fee-tab ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          🔔 Notifications & Privacy
        </button>
        <button
          type="button"
          className={`admin-fee-tab ${activeTab === 'support' ? 'active' : ''}`}
          onClick={() => setActiveTab('support')}
        >
          ❓ Help & Support
        </button>
      </div>

      {loading ? (
        <div className="portal-loading"><p>Loading settings...</p></div>
      ) : (
        <section className="portal-card" style={{ marginTop: '20px', padding: '32px' }}>
          {/* TAB 1: Personal Info */}
          {activeTab === 'personal' && (
            <form onSubmit={handleUpdatePersonal} className="admin-form-grid" style={{ maxWidth: '600px' }}>
              <div className="span-full">
                <h3>Contact Information</h3>
              </div>
              <div className="span-full">
                <label>
                  Phone Number
                  <input
                    type="tel"
                    value={personalForm.phone}
                    onChange={(e) => setPersonalForm({ ...personalForm, phone: e.target.value })}
                    required
                  />
                </label>
              </div>
              <div className="span-full">
                <label>
                  Residential Address
                  <textarea
                    rows="3"
                    value={personalForm.address}
                    onChange={(e) => setPersonalForm({ ...personalForm, address: e.target.value })}
                    required
                  />
                </label>
              </div>
              <div className="span-full">
                <button type="submit" className="admin-btn-primary" disabled={submitting}>
                  {submitting ? 'Saving Changes...' : 'Save Personal Details →'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Password & Security */}
          {activeTab === 'security' && (
            <form onSubmit={handleUpdatePassword} className="admin-form-grid" style={{ maxWidth: '600px' }}>
              <div className="span-full">
                <h3>Change Portal Password</h3>
              </div>
              <div className="span-full">
                <label>
                  Current Password *
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    required
                  />
                </label>
              </div>
              <div className="span-full">
                <label>
                  New Password *
                  <input
                    type="password"
                    minLength="6"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required
                  />
                </label>
              </div>
              <div className="span-full">
                <label>
                  Confirm New Password *
                  <input
                    type="password"
                    minLength="6"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    required
                  />
                </label>
              </div>
              <div className="span-full">
                <button type="submit" className="admin-btn-primary" disabled={submitting}>
                  {submitting ? 'Updating Password...' : 'Update Password →'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Notifications */}
          {activeTab === 'notifications' && (
            <div style={{ maxWidth: '600px' }}>
              <h3>Notification & Email Alerts</h3>
              <p style={{ color: '#64748b' }}>Configure how you receive academic dispatches and Bursary receipt notifications.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
                <label style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input type="checkbox" defaultChecked />
                  <span>Email alert on new official announcements & circulars</span>
                </label>
                <label style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input type="checkbox" defaultChecked />
                  <span>SMS alert for examination results publishing</span>
                </label>
                <label style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input type="checkbox" defaultChecked />
                  <span>Email receipt on fee payments verified by Bursary</span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 4: Help & Support */}
          {activeTab === 'support' && (
            <div style={{ maxWidth: '600px' }}>
              <h3>Institutional ICT Helpdesk</h3>
              <p style={{ color: '#475569' }}>
                If you encounter any issues with course registration, missing results, or fee payment reconciliation, please reach out to ICT Support:
              </p>
              <ul style={{ lineHeight: '1.8', color: '#334155' }}>
                <li>✉ Email: <strong>ict@abscons.edu.ng</strong></li>
                <li>📞 Phone: <strong>+234 803 111 2223</strong></li>
                <li>📍 Office: ICT Center, Main Campus Umuahia / Aba Campus</li>
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
