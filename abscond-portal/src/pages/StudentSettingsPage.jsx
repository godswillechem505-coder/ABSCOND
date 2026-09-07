import { useEffect, useState } from 'react';
import { ApiClient } from '../auth/ApiClient';
import { useAuth } from '../auth/useAuth';
import { useToast } from '../context/useToast';

export default function StudentSettingsPage() {
  const { getAccessToken, refreshAccessToken } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const [student, setStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');

  // Form states
  const [personalForm, setPersonalForm] = useState({ phone: '', address: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [notifForm, setNotifForm] = useState({
    emailAnnouncements: true,
    smsResults: true,
    emailReceipts: true,
    newsletterUpdates: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [savingNotif, setSavingNotif] = useState(false);

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
          if (data.student.notificationPreferences) {
            setNotifForm({
              emailAnnouncements: data.student.notificationPreferences.emailAnnouncements ?? true,
              smsResults: data.student.notificationPreferences.smsResults ?? true,
              emailReceipts: data.student.notificationPreferences.emailReceipts ?? true,
              newsletterUpdates: data.student.notificationPreferences.newsletterUpdates ?? false,
            });
          }
        }
      })
      .catch((err) => {
        setError(err.message);
        toast.error(err.message || 'Failed to load profile settings.');
      })
      .finally(() => setLoading(false));
  }, [getAccessToken, refreshAccessToken, toast]);

  const handleUpdatePersonal = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setNotice(null);

    try {
      const res = await ApiClient.patch('/students/me', personalForm, {}, getAccessToken, refreshAccessToken);
      const msg = res.message || 'Personal details updated successfully!';
      setNotice(msg);
      toast.success(msg);
      if (res.student) setStudent(res.student);
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to update personal details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      const msg = 'New password and confirm password do not match.';
      setError(msg);
      toast.error(msg);
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
      const msg = res.message || 'Password changed successfully!';
      setNotice(msg);
      toast.success(msg);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to change password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateNotifications = async (e) => {
    e.preventDefault();
    setSavingNotif(true);
    setError(null);
    setNotice(null);

    try {
      const res = await ApiClient.patch(
        '/students/me/notification-preferences',
        { notificationPreferences: notifForm },
        {},
        getAccessToken,
        refreshAccessToken
      );
      const msg = res.message || 'Notification preferences saved successfully!';
      setNotice(msg);
      toast.success(msg);
      if (res.student) setStudent(res.student);
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to update notification preferences.');
    } finally {
      setSavingNotif(false);
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

              {/* Account Deletion / Deactivation Policy Callout */}
              <div className="span-full" style={{ marginTop: '20px', padding: '16px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '18px' }}>ℹ️</span>
                  <div>
                    <strong style={{ display: 'block', color: '#334155', fontSize: '13px', marginBottom: '4px' }}>
                      Institutional Account Policy Notice
                    </strong>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '12px', lineHeight: '1.5' }}>
                      In compliance with Nursing & Midwifery Council standards and Registry archives, student accounts cannot be self-deleted. Academic transcripts, matriculation records, and examination scores are permanent records. Account deactivation or status suspension can only be initiated by authorized College Administrators.
                    </p>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* TAB 3: Notifications */}
          {activeTab === 'notifications' && (
            <form onSubmit={handleUpdateNotifications} style={{ maxWidth: '600px' }}>
              <h3>Notification & Email Alerts</h3>
              <p style={{ color: '#64748b' }}>Configure how you receive academic circulars, exam score alerts, and Bursary receipts.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
                <label style={{ display: 'flex', gap: '12px', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={notifForm.emailAnnouncements}
                    onChange={(e) => setNotifForm({ ...notifForm, emailAnnouncements: e.target.checked })}
                  />
                  <div>
                    <strong style={{ display: 'block', fontSize: '14px' }}>Official Announcements & Circulars</strong>
                    <span style={{ color: '#64748b', fontSize: '12px' }}>Receive prompt email dispatches from Academic Affairs & Registry</span>
                  </div>
                </label>
                <label style={{ display: 'flex', gap: '12px', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={notifForm.smsResults}
                    onChange={(e) => setNotifForm({ ...notifForm, smsResults: e.target.checked })}
                  />
                  <div>
                    <strong style={{ display: 'block', fontSize: '14px' }}>SMS Result Alerts</strong>
                    <span style={{ color: '#64748b', fontSize: '12px' }}>Instant SMS notification once semester examination results are released</span>
                  </div>
                </label>
                <label style={{ display: 'flex', gap: '12px', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={notifForm.emailReceipts}
                    onChange={(e) => setNotifForm({ ...notifForm, emailReceipts: e.target.checked })}
                  />
                  <div>
                    <strong style={{ display: 'block', fontSize: '14px' }}>Fee Payment & Bursary Receipts</strong>
                    <span style={{ color: '#64748b', fontSize: '12px' }}>Automated payment clearance receipts and PDF download links</span>
                  </div>
                </label>
                <label style={{ display: 'flex', gap: '12px', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={notifForm.newsletterUpdates}
                    onChange={(e) => setNotifForm({ ...notifForm, newsletterUpdates: e.target.checked })}
                  />
                  <div>
                    <strong style={{ display: 'block', fontSize: '14px' }}>Campus Events & Newsletter</strong>
                    <span style={{ color: '#64748b', fontSize: '12px' }}>Updates on clinical posting cycles, matriculation, and seminars</span>
                  </div>
                </label>
              </div>

              <div style={{ marginTop: '24px' }}>
                <button type="submit" className="admin-btn-primary" disabled={savingNotif}>
                  {savingNotif ? 'Saving Preferences...' : 'Save Notification Preferences →'}
                </button>
              </div>
            </form>
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
