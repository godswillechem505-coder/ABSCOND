import { useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { ApiClient } from "../auth/ApiClient";
import { useAuth } from "../auth/useAuth";
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
          ["Pending documents", metrics?.pendingDocuments ?? "-"],
          ["Staff accounts", metrics?.totalStaff ?? "-"],
          ["Outstanding fees", metrics?.outstandingFees ?? "Not configured"],
          [
            "Unread contact messages",
            metrics?.unreadContactMessages ?? "Not configured",
          ],
          [
            "Upcoming registration windows",
            metrics?.upcomingRegistrationWindows ?? "Not configured",
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
  const { permissions, getAccessToken, refreshAccessToken } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [decisionLoading, setDecisionLoading] = useState(null);
  const [error, setError] = useState(null);
  const canVerifyDocuments = permissions?.includes("documents:verify");

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
      setError(null);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setDecisionLoading(null);
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
            </>
          )}
        </article>
      </section>
    </main>
  );
}

export function AdminResults() {
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
  const [history, setHistory] = useState(null);
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const canManage = permissions?.includes("results:manage");

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
      await loadResults();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const importCsv = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const response = await ApiClient.post(
        "/admin/results/bulk",
        { csv },
        {},
        getAccessToken,
        refreshAccessToken,
      );
      setNotice(
        `${response.imported} result(s) imported${response.errors.length ? `; ${response.errors.length} row(s) failed.` : "."}`,
      );
      await loadResults();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const togglePublication = async (result) => {
    try {
      await ApiClient.patch(
        `/admin/results/${result.id}/publication`,
        { published: result.status !== "published" },
        {},
        getAccessToken,
        refreshAccessToken,
      );
      await loadResults();
    } catch (requestError) {
      setError(requestError.message);
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
            <h2>Bulk CSV upload</h2>
            <p className="admin-form-help">
              Required columns: matricNumber, courseCode, sessionName, semester, score
            </p>
            <textarea
              value={csv}
              onChange={(event) => setCsv(event.target.value)}
              rows="8"
              required
            />
            <button className="login-submit" type="submit" disabled={saving}>
              {saving ? "Importing..." : "Import CSV"}
            </button>
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
