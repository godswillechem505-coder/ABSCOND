import { useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { ApiClient } from "../auth/ApiClient";
import { useAuth } from "../auth/useAuth";
import { useToast } from "../context/useToast";
import { siteConfig } from "../data/homeData";

const adminProperties = [
  { label: "Student directory", permission: "students:view" },
  { label: "Document verification", permission: "documents:verify" },
  { label: "Results management", permission: "results:manage" },
  { label: "Fees and payments", permission: "fees:manage" },
  { label: "Course management", permission: "courses:manage" },
  { label: "Clinical postings", permission: "clinical_postings:manage" },
  { label: "Content management", permission: "content:manage" },
  { label: "Staff accounts", permission: "staff:manage" },
];

const adminNavItems = [
  { label: "Overview", to: "/admin", end: true },
  { label: "Students", to: "/admin/students", permission: "students:view" },
  { label: "Results", to: "/admin/results", permission: "results:manage" },
  { label: "Fees & payments", to: "/admin/fees", permission: "fees:view" },
  { label: "Academic setup", to: "/admin/academic", permission: "courses:manage" },
  {
    label: "Clinical postings",
    to: "/admin/clinical",
    permission: "clinical_postings:manage",
  },
  { label: "Content", to: "/admin/content", permission: "content:manage" },
  { label: "Downloads", to: "/admin/downloads", permission: "downloads:manage" },
  { label: "FAQs", to: "/admin/faqs", permission: "faqs:manage" },
  {
    label: "Contact inbox",
    to: "/admin/contacts",
    permission: "contact_messages:view",
  },
  { label: "Staff accounts", to: "/admin/staff", permission: "staff:manage" },
  { label: "Audit log", to: "/admin/audit-log", permission: "audit_log:view" },
];

const formatRole = (user) =>
  user.staffRole?.replaceAll("_", " ") || user.role?.replaceAll("_", " ");

function StaffLogin() {
  const { login, loading, error } = useAuth();
  const [identifier, setIdentifier] = useState("registry@abscons.edu.ng");
  const [password, setPassword] = useState("Password123!");
  const [formError, setFormError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError(null);
    try {
      await login(identifier.trim(), password, true, true);
    } catch (loginError) {
      setFormError(loginError.message);
    }
  };

  return (
    <main className="admin-placeholder">
      <section className="admin-login-card">
        <Link to="/" className="login-brand">
          <img src={siteConfig.logo} alt="Abia State Coat of Arms" />
          <span>
            <b>{siteConfig.brandName}</b>
            <small>Staff Portal</small>
          </span>
        </Link>
        <span className="eyebrow">Staff access</span>
        <h1>Admin Portal</h1>
        <p>Sign in with your institutional staff account.</p>
        {(formError || error) && (
          <div className="login-error" role="alert">
            {formError || error}
          </div>
        )}
        <form className="admin-login-form" onSubmit={handleSubmit}>
          <label>
            Staff email or identifier
            <input
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <button className="login-submit" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in to admin"}
          </button>
        </form>
        <Link to="/" className="admin-back-link">
          Back to public site
        </Link>
      </section>
    </main>
  );
}

function AdminDashboard() {
  const { user, permissions, logout, getAccessToken, refreshAccessToken } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "Admin Portal | ABSCONS One";
    Promise.all([
      ApiClient.get("/admin/dashboard", {}, getAccessToken, refreshAccessToken),
      ApiClient.get("/admin/students?limit=8", {}, getAccessToken, refreshAccessToken),
    ])
      .then(([dashboard, directory]) => {
        setMetrics(dashboard.metrics);
        setStudents(directory.students);
      })
      .catch((requestError) => setError(requestError.message));
  }, [getAccessToken, refreshAccessToken]);

  return (
    <main className="admin-workspace">
      <header className="admin-header">
        <div>
          <span className="eyebrow">ABSCONS One</span>
          <h1>Admin Portal</h1>
          <p>
            {user.email || user.identifier} · {formatRole(user)}
          </p>
        </div>
        <button className="portal-logout" type="button" onClick={logout}>
          Sign out
        </button>
      </header>
      {error && (
        <div className="login-error" role="alert">
          {error}
        </div>
      )}
      <section className="admin-metric-grid" aria-label="Admin metrics">
        {[
          ["Total students", metrics?.totalStudents ?? "-"],
          ["Active students", metrics?.activeStudents ?? "-"],
          ["Pending documents", metrics?.pendingDocuments ?? "0"],
          ["Staff accounts", metrics?.totalStaff ?? "-"],
          [
            "Outstanding fees",
            metrics?.outstandingFees !== undefined && metrics?.outstandingFees !== null
              ? `₦${Number(metrics.outstandingFees).toLocaleString()}`
              : "-",
          ],
          [
            "Unread contact messages",
            metrics?.unreadContactMessages ?? "0",
          ],
          [
            "Open registration windows",
            metrics?.openRegistrationWindows ?? metrics?.upcomingRegistrationWindows ?? "0",
          ],
        ].map(([label, value]) => (
          <article className="admin-metric-card" key={label}>
            <span>{label}</span>
            <b>{value}</b>
          </article>
        ))}
      </section>
      <section className="admin-content-grid">
        <article className="admin-panel">
          <div className="portal-panel-header">
            <h2>Admin properties</h2>
            <span>{permissions?.length || 0} permissions</span>
          </div>
          <div className="admin-property-list">
            {adminProperties.map((property) => {
              const available = permissions?.includes(property.permission);
              return (
                <div
                  className={available ? "available" : "restricted"}
                  key={property.permission}
                >
                  <span>{property.label}</span>
                  <b>{available ? "Available" : "Restricted"}</b>
                </div>
              );
            })}
          </div>
        </article>
        <article className="admin-panel">
          <div className="portal-panel-header">
            <h2>Student directory</h2>
            <span>{students.length} shown</span>
          </div>
          <div className="admin-student-list">
            {students.map((student) => (
              <div key={student.id}>
                <b>
                  {student.firstName} {student.lastName}
                </b>
                <span>{student.matricNumber}</span>
                <small>{student.programme?.name || "Programme"}</small>
              </div>
            ))}
            {!students.length && <p>Loading student records...</p>}
          </div>
        </article>
      </section>
    </main>
  );
}

export function AdminStudentDirectory() {
  const toast = useToast();
  const { permissions, getAccessToken, refreshAccessToken } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [decisionLoading, setDecisionLoading] = useState(null);
  const [statusModal, setStatusModal] = useState(null); // { action: 'deactivate' | 'reactivate', student }
  const [statusReason, setStatusReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [resetModal, setResetModal] = useState(null); // student object or null
  const [resetForm, setResetForm] = useState({ newPassword: '', autoGenerate: true });
  const [resetResult, setResetResult] = useState(null); // { temporaryPassword, message }
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState(null);
  const canVerifyDocuments = permissions?.includes("documents:verify");
  const canManageStudents = permissions?.includes("students:manage") || permissions?.includes("students:view") || permissions?.includes("staff:manage");

  useEffect(() => {
    const params = new URLSearchParams({ limit: "50" });
    if (search.trim()) params.set("search", search.trim());
    if (status) params.set("status", status);

    // This request owns the directory loading lifecycle.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    ApiClient.get(
      `/admin/students?${params.toString()}`,
      {},
      getAccessToken,
      refreshAccessToken,
    )
      .then((data) => {
        setStudents(data.students);
        setError(null);
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setIsLoading(false));
  }, [search, status, getAccessToken, refreshAccessToken]);

  const openStudent = async (studentId) => {
    setDetailLoading(true);
    setError(null);
    try {
      const data = await ApiClient.get(
        `/admin/students/${studentId}`,
        {},
        getAccessToken,
        refreshAccessToken,
      );
      setSelectedStudent(data.student);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const updateDocument = async (documentId, nextStatus) => {
    setDecisionLoading(documentId);
    try {
      const data = await ApiClient.patch(
        `/admin/documents/${documentId}/decision`,
        { status: nextStatus },
        {},
        getAccessToken,
        refreshAccessToken,
      );
      setSelectedStudent((current) => ({
        ...current,
        documents: current.documents.map((document) =>
          document.id === documentId ? data.document : document,
        ),
      }));
      toast.success(`Document ${nextStatus === 'approved' ? 'approved' : 'rejected'} successfully.`);
      setError(null);
    } catch (requestError) {
      setError(requestError.message);
      toast.error(requestError.message || 'Failed to update document status.');
    } finally {
      setDecisionLoading(null);
    }
  };

  const handleUpdateStudentStatus = async (targetStatus) => {
    if (!statusModal?.student) return;
    setActionLoading(true);
    try {
      const res = await ApiClient.patch(
        `/admin/students/${statusModal.student.id}/status`,
        { status: targetStatus, reason: statusReason },
        {},
        getAccessToken,
        refreshAccessToken,
      );
      toast.success(res.message || `Student account status updated to ${targetStatus}.`);
      setSelectedStudent(res.student || { ...statusModal.student, status: targetStatus });
      setStudents((prev) =>
        prev.map((s) => (s.id === statusModal.student.id ? { ...s, status: targetStatus } : s))
      );
      setStatusModal(null);
      setStatusReason("");
    } catch (err) {
      toast.error(err.message || 'Failed to update student account status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e?.preventDefault();
    if (!resetModal) return;
    setResetLoading(true);
    try {
      const payload = resetForm.autoGenerate ? {} : { newPassword: resetForm.newPassword };
      const res = await ApiClient.post(
        `/admin/students/${resetModal.id}/reset-password`,
        payload,
        {},
        getAccessToken,
        refreshAccessToken,
      );
      setResetResult({
        temporaryPassword: res.temporaryPassword,
        message: res.message,
      });
      toast.success(res.message || 'Student password reset successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to reset student password.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <main className="admin-directory admin-module">
      <header className="admin-module-header">
        <div>
          <span className="eyebrow">Registry workspace</span>
          <h1>Student directory</h1>
          <p>Search student records and review submitted credentials.</p>
        </div>
        <span className="admin-result-count">{students.length} records</span>
      </header>
      {error && (
        <div className="login-error" role="alert">
          {error}
        </div>
      )}
      <section className="admin-filter-bar" aria-label="Student filters">
        <label>
          Search students
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Name or matric number"
          />
        </label>
        <label>
          Status
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
            <option value="graduated">Graduated</option>
          </select>
        </label>
      </section>
      <section className="admin-directory-grid">
        <article className="admin-panel">
          <div className="portal-panel-header">
            <h2>Students</h2>
            <span>{isLoading ? "Loading..." : "Select a record"}</span>
          </div>
          <div className="admin-directory-list">
            {students.map((student) => (
              <button
                className={selectedStudent?.id === student.id ? "selected" : ""}
                type="button"
                key={student.id}
                onClick={() => openStudent(student.id)}
              >
                <b>
                  {student.firstName} {student.lastName}
                </b>
                <span>{student.matricNumber}</span>
                <small>
                  {student.programme?.name || "Programme"} · {student.status}
                </small>
              </button>
            ))}
            {!isLoading && !students.length && <p>No students match these filters.</p>}
          </div>
        </article>
        <article className="admin-panel admin-student-detail">
          {detailLoading && <p>Loading student details...</p>}
          {!detailLoading && !selectedStudent && (
            <p>Select a student to view profile and documents.</p>
          )}
          {!detailLoading && selectedStudent && (
            <>
              <div className="portal-panel-header">
                <div>
                  <span className="eyebrow">Student profile</span>
                  <h2>
                    {selectedStudent.firstName} {selectedStudent.lastName}
                  </h2>
                </div>
                <span className="admin-status-tag">{selectedStudent.status}</span>
              </div>
              <dl className="admin-detail-list">
                <div>
                  <dt>Matric number</dt>
                  <dd>{selectedStudent.matricNumber}</dd>
                </div>
                <div>
                  <dt>Programme</dt>
                  <dd>{selectedStudent.programme?.name || "Not provided"}</dd>
                </div>
                <div>
                  <dt>Campus</dt>
                  <dd>{selectedStudent.campus?.name || "Not provided"}</dd>
                </div>
                <div>
                  <dt>Level</dt>
                  <dd>{selectedStudent.level}</dd>
                </div>
                <div>
                  <dt>Phone</dt>
                  <dd>{selectedStudent.phone || "Not provided"}</dd>
                </div>
              </dl>
              <h3>Documents</h3>
              <div className="admin-document-list">
                {selectedStudent.documents?.map((document) => (
                  <div key={document.id}>
                    <span>
                      <b>{document.name}</b>
                      <small>
                        {document.type} · {document.status}
                      </small>
                    </span>
                    {canVerifyDocuments && document.status === "pending" && (
                      <span className="admin-document-actions">
                        <button
                          type="button"
                          disabled={decisionLoading === document.id}
                          onClick={() => updateDocument(document.id, "approved")}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={decisionLoading === document.id}
                          onClick={() => updateDocument(document.id, "rejected")}
                        >
                          Reject
                        </button>
                      </span>
                    )}
                  </div>
                ))}
                {!selectedStudent.documents?.length && <p>No documents submitted.</p>}
              </div>

              {/* Account Security & Access Control Panel */}
              <div style={{ marginTop: '24px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <strong style={{ display: 'block', fontSize: '13px', color: '#1e293b' }}>
                      Portal Login & Access Control:{' '}
                      <span style={{ color: selectedStudent.status === 'active' ? '#16a34a' : '#dc2626' }}>
                        {selectedStudent.status === 'active' ? 'Active (Login Permitted)' : `${selectedStudent.status?.toUpperCase()} (Login Revoked)`}
                      </span>
                    </strong>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      {selectedStudent.status === 'active'
                        ? 'Deactivating revokes student portal login while permanently preserving all academic records in database.'
                        : 'Student portal login is locked. All examination grades, payments, and archives remain intact.'}
                    </span>
                  </div>
                  {canManageStudents && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        style={{
                          background: '#0284c7',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '8px 14px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          setResetModal(selectedStudent);
                          setResetForm({ newPassword: '', autoGenerate: true });
                          setResetResult(null);
                        }}
                      >
                        🔑 Reset Password
                      </button>
                      {selectedStudent.status === 'active' ? (
                        <button
                          type="button"
                          style={{
                            background: '#dc2626',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '8px 14px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                          onClick={() => setStatusModal({ action: 'deactivate', student: selectedStudent })}
                        >
                          🗑 Deactivate / Delete Account
                        </button>
                      ) : (
                        <button
                          type="button"
                          style={{
                            background: '#16a34a',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '8px 14px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                          onClick={() => setStatusModal({ action: 'reactivate', student: selectedStudent })}
                        >
                          ✓ Reactivate Student Account
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </article>
      </section>

      {/* Student Account Status / Deactivate Modal */}
      {statusModal && (
        <div className="admin-modal-overlay" role="dialog" onClick={() => !actionLoading && setStatusModal(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="admin-modal-header" style={{ borderBottom: '1px solid #fee2e2', background: statusModal.action === 'deactivate' ? '#fff1f2' : '#f0fdf4' }}>
              <h2>
                {statusModal.action === 'deactivate' ? '⚠️ Deactivate Student Account' : '✓ Reactivate Student Account'}
              </h2>
              <button
                type="button"
                className="admin-modal-close"
                disabled={actionLoading}
                onClick={() => setStatusModal(null)}
              >
                ✕
              </button>
            </div>
            <div className="admin-modal-body" style={{ padding: '20px' }}>
              {statusModal.action === 'deactivate' ? (
                <>
                  <p style={{ color: '#991b1b', fontSize: '14px', lineHeight: '1.5', marginTop: 0 }}>
                    Are you sure you want to deactivate and disable login for{' '}
                    <strong>{statusModal.student.firstName} {statusModal.student.lastName}</strong> ({statusModal.student.matricNumber})?
                  </p>
                  <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px', color: '#475569', lineHeight: '1.6', marginBottom: '16px' }}>
                    🛡️ <strong>Institutional Archive Guarantee:</strong>
                    <br />
                    • The student will immediately be blocked from logging into the portal.
                    <br />
                    • Active sessions and refresh tokens will be invalidated.
                    <br />
                    • <strong>All records remain intact:</strong> matriculation data, results, course registrations, documents, and bursary payment records will be preserved in full for official transcripts.
                  </div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Reason for Deactivation / Closure (Optional):
                    <textarea
                      rows="2"
                      style={{ width: '100%', marginTop: '4px', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      placeholder="e.g. Voluntary withdrawal, administrative suspension, transfer to another institution..."
                      value={statusReason}
                      onChange={(e) => setStatusReason(e.target.value)}
                    />
                  </label>
                </>
              ) : (
                <>
                  <p style={{ color: '#166534', fontSize: '14px', lineHeight: '1.5', marginTop: 0 }}>
                    Reactivate student portal login for{' '}
                    <strong>{statusModal.student.firstName} {statusModal.student.lastName}</strong> ({statusModal.student.matricNumber})?
                  </p>
                  <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
                    The student account will return to <strong>ACTIVE</strong> status and the student will regain access to registration, result viewing, and fee portal services.
                  </p>
                </>
              )}
            </div>
            <div className="admin-modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '14px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
              <button
                type="button"
                className="admin-btn-secondary"
                disabled={actionLoading}
                onClick={() => setStatusModal(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                style={{
                  background: statusModal.action === 'deactivate' ? '#dc2626' : '#16a34a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontWeight: 600,
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                }}
                disabled={actionLoading}
                onClick={() => handleUpdateStudentStatus(statusModal.action === 'deactivate' ? 'inactive' : 'active')}
              >
                {actionLoading
                  ? 'Processing...'
                  : statusModal.action === 'deactivate'
                  ? 'Confirm Deactivation'
                  : 'Confirm Reactivation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Password Reset Modal */}
      {resetModal && (
        <div className="admin-modal-overlay" role="dialog" onClick={() => !resetLoading && setResetModal(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="admin-modal-header" style={{ borderBottom: '1px solid #e0f2fe', background: '#f0f9ff' }}>
              <h2>🔑 Reset Student Portal Password</h2>
              <button
                type="button"
                className="admin-modal-close"
                disabled={resetLoading}
                onClick={() => setResetModal(null)}
              >
                ✕
              </button>
            </div>
            <div className="admin-modal-body" style={{ padding: '20px' }}>
              <div style={{ marginBottom: '16px', padding: '12px 14px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <strong style={{ display: 'block', fontSize: '14px', color: '#0f172a' }}>
                  {resetModal.firstName} {resetModal.lastName}
                </strong>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Matric: <b>{resetModal.matricNumber}</b> | Program: {resetModal.programme?.name || 'Nursing'}
                </span>
              </div>

              {!resetResult ? (
                <form onSubmit={handleResetPassword}>
                  <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5', marginTop: 0 }}>
                    Select password generation method. Resetting the password will terminate any active student sessions immediately.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '16px 0' }}>
                    <label style={{ display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                      <input
                        type="radio"
                        name="passwordMode"
                        checked={resetForm.autoGenerate}
                        onChange={() => setResetForm({ ...resetForm, autoGenerate: true })}
                      />
                      <span>Auto-generate secure temporary password (Recommended)</span>
                    </label>

                    <label style={{ display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                      <input
                        type="radio"
                        name="passwordMode"
                        checked={!resetForm.autoGenerate}
                        onChange={() => setResetForm({ ...resetForm, autoGenerate: false })}
                      />
                      <span>Set custom temporary password manually</span>
                    </label>
                  </div>

                  {!resetForm.autoGenerate && (
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                        Custom Temporary Password (min 6 characters):
                        <input
                          type="text"
                          required
                          minLength={6}
                          style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px', fontSize: '13px' }}
                          value={resetForm.newPassword}
                          onChange={(e) => setResetForm({ ...resetForm, newPassword: e.target.value })}
                          placeholder="e.g. Abscon#2026"
                        />
                      </label>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                    <button
                      type="button"
                      className="admin-btn-secondary"
                      disabled={resetLoading}
                      onClick={() => setResetModal(null)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{
                        background: '#0284c7',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        fontWeight: 600,
                        cursor: resetLoading ? 'not-allowed' : 'pointer',
                      }}
                      disabled={resetLoading}
                    >
                      {resetLoading ? 'Resetting...' : 'Confirm & Reset Password'}
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <div style={{ padding: '16px', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#065f46', fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>
                      ✓ Password Reset Successful
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: '#047857', lineHeight: '1.5' }}>
                      The student's portal password has been updated. Provide the temporary password below to the student.
                    </p>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px dashed #0284c7', textAlign: 'center', margin: '16px 0' }}>
                    <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                      New Temporary Password
                    </span>
                    <code style={{ fontSize: '20px', fontWeight: 800, color: '#0369a1', letterSpacing: '1px' }}>
                      {resetResult.temporaryPassword}
                    </code>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '16px' }}>
                    <button
                      type="button"
                      style={{
                        background: '#0284c7',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        navigator.clipboard.writeText(resetResult.temporaryPassword);
                        toast.success('Temporary password copied to clipboard!');
                      }}
                    >
                      📋 Copy Password
                    </button>
                    <button
                      type="button"
                      className="admin-btn-secondary"
                      onClick={() => setResetModal(null)}
                    >
                      Done & Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export function AdminResults() {
  const toast = useToast();
  const { permissions, getAccessToken, refreshAccessToken } = useAuth();
  const [results, setResults] = useState([]);
  const [form, setForm] = useState({
    matricNumber: "ABSCONS/2025/001",
    courseCode: "NUR101",
    sessionName: "2025/2026",
    semester: "first",
    score: "",
  });
  const [csv, setCsv] = useState(
    "matricNumber,courseCode,sessionName,semester,score\nABSCONS/2025/001,NUR101,2025/2026,first,78",
  );
  const [importReport, setImportReport] = useState(null); // { message, totalProcessed, imported, failed, errors }
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [history, setHistory] = useState(null);
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const canManage = permissions?.includes("results:manage");

  const handleFileDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
      processCsvFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target?.files && e.target.files[0]) {
      processCsvFile(e.target.files[0]);
    }
  };

  const processCsvFile = (file) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please upload a valid .csv file.');
      return;
    }
    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target.result;
      setCsv(content);
      const rowCount = content.split(/\r?\n/).filter(Boolean).length - 1;
      toast.info(`Loaded ${file.name} (${Math.max(0, rowCount)} data rows detected). Click 'Import CSV' to submit.`);
    };
    reader.readAsText(file);
  };

  const downloadSampleCsv = () => {
    const sampleContent =
      "matricNumber,courseCode,sessionName,semester,score\n" +
      "ABSCONS/2025/001,NUR101,2025/2026,first,78.5\n" +
      "ABSCONS/2025/002,NUR101,2025/2026,first,65.0\n" +
      "ABSCONS/2025/003,MID101,2025/2026,first,82.0\n" +
      "ABSCONS/2025/004,NUR102,2025/2026,second,58.0";
    const blob = new Blob([sampleContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample_results_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Sample results CSV template downloaded.');
  };

  const loadResults = async () => {

    try {
      const data = await ApiClient.get(
        "/admin/results",
        {},
        getAccessToken,
        refreshAccessToken,
      );
      setResults(data.results);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  useEffect(() => {
    document.title = "Results Management | ABSCONS One";
    ApiClient.get(
      "/admin/results",
      {},
      getAccessToken,
      refreshAccessToken,
    )
      .then((data) => setResults(data.results))
      .catch((requestError) => setError(requestError.message));
  }, [getAccessToken, refreshAccessToken]);




  const updateField = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));

  const submitResult = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await ApiClient.post(
        "/admin/results",
        form,
        {},
        getAccessToken,
        refreshAccessToken,
      );
      setNotice("Result saved as draft.");
      toast.success("Result saved as draft.");
      await loadResults();
    } catch (requestError) {
      setError(requestError.message);
      toast.error(requestError.message || 'Failed to save result.');
    } finally {
      setSaving(false);
    }
  };

  const importCsv = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);
    setImportReport(null);
    try {
      const response = await ApiClient.post(
        "/admin/results/bulk",
        { csv },
        {},
        getAccessToken,
        refreshAccessToken,
      );
      setImportReport(response);
      const msg = `${response.imported} result(s) imported${response.errors?.length ? `; ${response.errors.length} row(s) failed.` : "."}`;
      setNotice(msg);
      toast.success(msg);
      await loadResults();
    } catch (requestError) {
      setError(requestError.message);
      toast.error(requestError.message || 'Failed to import results.');
    } finally {
      setSaving(false);
    }
  };

  const togglePublication = async (result) => {
    const publishing = result.status !== "published";
    try {
      await ApiClient.patch(
        `/admin/results/${result.id}/publication`,
        { published: publishing },
        {},
        getAccessToken,
        refreshAccessToken,
      );
      toast.success(`Result ${publishing ? 'published' : 'unpublished'} successfully.`);
      await loadResults();
    } catch (requestError) {
      setError(requestError.message);
      toast.error(requestError.message || 'Failed to update publication status.');
    }
  };

  const showHistory = async (resultId) => {
    try {
      const data = await ApiClient.get(
        `/admin/results/${resultId}/history`,
        {},
        getAccessToken,
        refreshAccessToken,
      );
      setHistory(data.history);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <main className="admin-results admin-module">
      <header className="admin-module-header">
        <div>
          <span className="eyebrow">Academic affairs</span>
          <h1>Results management</h1>
          <p>Enter results, import a batch, and control publication.</p>
        </div>
        <span className="admin-result-count">{results.length} records</span>
      </header>
      {error && (
        <div className="login-error" role="alert">
          {error}
        </div>
      )}
      {notice && (
        <div className="admin-notice" role="status">
          {notice}
        </div>
      )}
      {canManage && (
        <section className="admin-results-entry-grid">
          <form className="admin-panel admin-result-form" onSubmit={submitResult}>
            <h2>Single result entry</h2>
            <label>
              Matric number
              <input
                value={form.matricNumber}
                onChange={updateField("matricNumber")}
                required
              />
            </label>
            <label>
              Course code
              <input
                value={form.courseCode}
                onChange={updateField("courseCode")}
                required
              />
            </label>
            <label>
              Academic session
              <input
                value={form.sessionName}
                onChange={updateField("sessionName")}
                required
              />
            </label>
            <label>
              Semester
              <select value={form.semester} onChange={updateField("semester")}>
                <option value="first">First</option>
                <option value="second">Second</option>
              </select>
            </label>
            <label>
              Score
              <input
                type="number"
                min="0"
                max="100"
                value={form.score}
                onChange={updateField("score")}
                required
              />
            </label>
            <button className="login-submit" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save result"}
            </button>
          </form>
          <form className="admin-panel admin-result-form" onSubmit={importCsv}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h2 style={{ margin: 0 }}>Bulk CSV Upload</h2>
              <button
                type="button"
                style={{
                  background: 'none',
                  border: '1px solid #0284c7',
                  color: '#0284c7',
                  borderRadius: '4px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                onClick={downloadSampleCsv}
              >
                📥 Download Template (.csv)
              </button>
            </div>
            <p className="admin-form-help">
              Columns: <code>matricNumber, courseCode, sessionName, semester, score</code>
            </p>

            {/* Drag & Drop File Upload Zone */}
            <div
              className={`admin-csv-dropzone ${dragActive ? 'drag-active' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
              onDrop={handleFileDrop}
              style={{
                border: `2px dashed ${dragActive ? '#0284c7' : '#cbd5e1'}`,
                background: dragActive ? '#f0f9ff' : '#f8fafc',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
                cursor: 'pointer',
                marginBottom: '12px',
                transition: 'all 0.15s ease',
              }}
              onClick={() => document.getElementById('results-csv-file-input')?.click()}
            >
              <input
                type="file"
                id="results-csv-file-input"
                accept=".csv"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
              <span style={{ fontSize: '28px', display: 'block', marginBottom: '6px' }}>📊</span>
              <strong style={{ display: 'block', fontSize: '13px', color: '#1e293b' }}>
                {uploadedFileName ? `Selected: ${uploadedFileName}` : 'Drag & Drop Results CSV File Here'}
              </strong>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                or click to browse your computer (.csv)
              </span>
            </div>

            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              CSV Content Preview / Manual Input:
              <textarea
                value={csv}
                onChange={(event) => setCsv(event.target.value)}
                rows="6"
                style={{ width: '100%', fontFamily: 'monospace', fontSize: '12px', marginTop: '4px' }}
                required
              />
            </label>

            <button className="login-submit" type="submit" disabled={saving}>
              {saving ? "Importing..." : `Import Results (${Math.max(0, csv.split(/\r?\n/).filter(Boolean).length - 1)} Rows) →`}
            </button>

            {/* Import Summary Report */}
            {importReport && (
              <div
                className="admin-import-report"
                style={{
                  marginTop: '16px',
                  padding: '16px',
                  borderRadius: '8px',
                  background: importReport.failed > 0 ? '#fff1f2' : '#f0fdf4',
                  border: `1px solid ${importReport.failed > 0 ? '#fecaca' : '#bbf7d0'}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <strong style={{ fontSize: '14px', color: importReport.failed > 0 ? '#991b1b' : '#166534' }}>
                    {importReport.failed > 0 ? '⚠️ Import Completed with Warnings' : '✓ Bulk Import Successful'}
                  </strong>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '12px' }}
                    onClick={() => setImportReport(null)}
                  >
                    ✕ Dismiss
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '16px', fontSize: '13px', marginBottom: importReport.errors?.length ? '12px' : '0' }}>
                  <span>Processed: <b>{importReport.totalProcessed}</b></span>
                  <span style={{ color: '#16a34a' }}>Imported/Updated: <b>{importReport.imported}</b></span>
                  <span style={{ color: importReport.failed > 0 ? '#dc2626' : '#64748b' }}>Failed: <b>{importReport.failed}</b></span>
                </div>

                {importReport.errors && importReport.errors.length > 0 && (
                  <div style={{ marginTop: '10px', maxHeight: '180px', overflowY: 'auto', background: '#ffffff', borderRadius: '6px', border: '1px solid #fee2e2' }}>
                    <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#fef2f2', borderBottom: '1px solid #fee2e2', textAlign: 'left' }}>
                          <th style={{ padding: '6px 8px' }}>Row</th>
                          <th style={{ padding: '6px 8px' }}>Matric #</th>
                          <th style={{ padding: '6px 8px' }}>Course</th>
                          <th style={{ padding: '6px 8px' }}>Error Reason</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importReport.errors.map((err, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '6px 8px', fontWeight: 700, color: '#dc2626' }}>{err.row}</td>
                            <td style={{ padding: '6px 8px' }}>{err.matricNumber}</td>
                            <td style={{ padding: '6px 8px' }}>{err.courseCode}</td>
                            <td style={{ padding: '6px 8px', color: '#b91c1c' }}>{err.message}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </form>
        </section>
      )}
      <section className="admin-panel admin-results-table-panel">
        <div className="portal-panel-header">
          <h2>Result records</h2>
          <span>Drafts stay hidden from students</span>
        </div>
        <div className="admin-results-list">
          {results.map((result) => (
            <div className="admin-result-row" key={result.id}>
              <span>
                <b>{result.student?.matricNumber}</b>
                <small>
                  {result.course?.code} · {result.academicSession?.name} ·{" "}
                  {result.semester}
                </small>
              </span>
              <strong>
                {result.score} ({result.grade})
              </strong>
              <em className={result.status}>{result.status}</em>
              <button
                type="button"
                onClick={() => togglePublication(result)}
                disabled={!canManage}
              >
                {result.status === "published" ? "Unpublish" : "Publish"}
              </button>
              <button type="button" onClick={() => showHistory(result.id)}>
                History
              </button>
            </div>
          ))}
          {!results.length && <p>No result records yet.</p>}
        </div>
      </section>
      {history && (
        <section className="admin-panel admin-history-panel">
          <div className="portal-panel-header">
            <h2>Edit history</h2>
            <button type="button" onClick={() => setHistory(null)}>
              Close
            </button>
          </div>
          <ul className="portal-list">
            {history.map((entry) => (
              <li key={entry.id}>
                {entry.action} · {new Date(entry.createdAt).toLocaleString()}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

export function AdminPortalLayout() {
  const { user, permissions, logout } = useAuth();
  return (
    <div className="admin-portal-shell">
      <aside className="admin-sidebar">
        <Link to="/admin" className="login-brand">
          <img src={siteConfig.logo} alt="Abia State Coat of Arms" />
          <span>
            <b>{siteConfig.brandName}</b>
            <small>Staff Portal</small>
          </span>
        </Link>
        <nav aria-label="Admin portal">
          {adminNavItems.map((item) => {
            const allowed = !item.permission || permissions?.includes(item.permission);
            return allowed ? (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {item.label}
              </NavLink>
            ) : null;
          })}
        </nav>
        <button className="portal-logout" type="button" onClick={logout}>
          Sign out
        </button>
      </aside>
      <section className="admin-portal-main">
        <header className="admin-portal-bar">
          <span>{user.email || user.identifier}</span>
          <b>{formatRole(user)}</b>
        </header>
        <Outlet />
      </section>
    </div>
  );
}

export function AdminModule({ title, description, permission }) {
  const { permissions } = useAuth();
  const allowed = permissions?.includes(permission);
  return (
    <main className="admin-module">
      <span className="eyebrow">Staff workspace</span>
      <h1>{title}</h1>
      <p>{description}</p>
      <section className="admin-module-state">
        <b>{allowed ? "Module ready" : "Permission required"}</b>
        <span>
          {allowed
            ? "This workspace is available to your role. Connect the module workflow here."
            : "Your staff role does not have access to this property."}
        </span>
      </section>
    </main>
  );
}

export default function AdminPlaceholder() {
  const { user } = useAuth();
  const isStaff = ["staff", "admin", "super_admin"].includes(user?.role);

  if (!isStaff) {
    return <StaffLogin />;
  }
  return <AdminDashboard />;
}
