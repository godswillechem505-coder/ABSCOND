import { useCallback, useEffect, useState, useMemo } from "react";
import { ApiClient } from "../auth/ApiClient";
import { useAuth } from "../auth/useAuth";

const FEE_CATEGORIES = [
  { value: "tuition", label: "Tuition Fee" },
  { value: "clinical", label: "Clinical & Practical Training" },
  { value: "laboratory", label: "Laboratory Levy" },
  { value: "library", label: "Library & Journals" },
  { value: "ict", label: "ICT & Internet Access" },
  { value: "welfare", label: "Student Welfare & Insurance" },
  { value: "examination", label: "Examination & Assessment" },
  { value: "other", label: "Other Levies" },
];

const PAYMENT_METHODS = [
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "pos", label: "POS Terminal" },
  { value: "cash", label: "Direct Cash" },
  { value: "bank_draft", label: "Bank Draft" },
  { value: "card", label: "Debit/Credit Card" },
  { value: "online", label: "Online Gateway" },
];

const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return `₦${num.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export default function AdminFees() {
  const { permissions, getAccessToken, refreshAccessToken } = useAuth();
  const canManage = permissions?.includes("fees:manage");

  const [activeTab, setActiveTab] = useState("balances");

  // Reference data
  const [campuses, setCampuses] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [sessions, setSessions] = useState([]);

  // Stats
  const [stats, setStats] = useState({
    totalBilled: 0,
    totalCollected: 0,
    totalOutstanding: 0,
    collectionRate: 0,
  });

  // Balances state
  const [balanceRecords, setBalanceRecords] = useState([]);
  const [balanceFilters, setBalanceFilters] = useState({
    campusId: "",
    programmeId: "",
    level: "all",
    paymentStatus: "",
    search: "",
  });
  const [balancesLoading, setBalancesLoading] = useState(false);

  // Structures state
  const [feeStructures, setFeeStructures] = useState([]);
  const [structuresLoading, setStructuresLoading] = useState(false);
  const [showStructureModal, setShowStructureModal] = useState(false);
  const [structureForm, setStructureForm] = useState({
    title: "",
    academicSessionId: "",
    programmeId: "",
    level: "100",
    semester: "all",
    dueDate: "",
    status: "published",
    description: "",
    items: [
      { name: "Tuition Fee", category: "tuition", amount: "100000", isCompulsory: true },
      { name: "Clinical & Practical Training", category: "clinical", amount: "35000", isCompulsory: true },
      { name: "Laboratory Levy", category: "laboratory", amount: "15000", isCompulsory: true },
    ],
  });

  // Payments state
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    matricNumber: "",
    academicSessionId: "",
    semester: "first",
    amount: "",
    paymentMethod: "bank_transfer",
    reference: "",
    receiptNumber: "",
    notes: "",
    paidAt: new Date().toISOString().slice(0, 10),
  });
  const [lookupStudent, setLookupStudent] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  // UI state
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Data-loading functions (declared before useEffects)
  const loadStats = useCallback(async () => {
    try {
      const data = await ApiClient.get(
        "/admin/fees/stats",
        {},
        getAccessToken,
        refreshAccessToken,
      );
      if (data) {
        setStats(data);
      }
    } catch {
      // stats optional
    }
  }, [getAccessToken, refreshAccessToken]);

  const loadBalances = useCallback(async () => {
    setBalancesLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (balanceFilters.campusId) params.set("campusId", balanceFilters.campusId);
      if (balanceFilters.programmeId) params.set("programmeId", balanceFilters.programmeId);
      if (balanceFilters.level && balanceFilters.level !== "all") params.set("level", balanceFilters.level);
      if (balanceFilters.paymentStatus) params.set("paymentStatus", balanceFilters.paymentStatus);
      if (balanceFilters.search) params.set("search", balanceFilters.search);

      const endpoint = `/admin/fees/balances${params.toString() ? `?${params.toString()}` : ""}`;
      const data = await ApiClient.get(endpoint, {}, getAccessToken, refreshAccessToken);
      setBalanceRecords(data.records || []);
      if (data.summary) {
        setStats((prev) => ({
          ...prev,
          totalBilled: data.summary.totalBilled,
          totalCollected: data.summary.totalPaid,
          totalOutstanding: data.summary.totalOutstanding,
          collectionRate: data.summary.collectionRate,
        }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBalancesLoading(false);
    }
  }, [getAccessToken, refreshAccessToken, balanceFilters]);

  const loadStructures = useCallback(async () => {
    setStructuresLoading(true);
    setError(null);
    try {
      const data = await ApiClient.get(
        "/admin/fees/structures",
        {},
        getAccessToken,
        refreshAccessToken,
      );
      setFeeStructures(data.feeStructures || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setStructuresLoading(false);
    }
  }, [getAccessToken, refreshAccessToken]);

  const loadPayments = useCallback(async () => {
    setPaymentsLoading(true);
    setError(null);
    try {
      const data = await ApiClient.get(
        "/admin/fees/payments?limit=50",
        {},
        getAccessToken,
        refreshAccessToken,
      );
      setPayments(data.payments || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setPaymentsLoading(false);
    }
  }, [getAccessToken, refreshAccessToken]);

  // Bootstrap effect
  useEffect(() => {
    document.title = "Fees & Payments Management | ABSCONS One";

    ApiClient.get("/reference/bootstrap", {}, getAccessToken, refreshAccessToken)
      .then((data) => {
        setCampuses(data.campuses || []);
        setProgrammes(data.programmes || []);
        if (data.currentSession) {
          setStructureForm((prev) => ({
            ...prev,
            academicSessionId: data.currentSession.id,
          }));
          setPaymentForm((prev) => ({
            ...prev,
            academicSessionId: data.currentSession.id,
          }));
        }
      })
      .catch((err) => setError(err.message));

    ApiClient.get("/reference/sessions", {}, getAccessToken, refreshAccessToken)
      .then((data) => setSessions(data.sessions || []))
      .catch(() => {});

    ApiClient.get("/admin/fees/stats", {}, getAccessToken, refreshAccessToken)
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(() => {});

    ApiClient.get("/admin/fees/balances", {}, getAccessToken, refreshAccessToken)
      .then((data) => {
        setBalanceRecords(data.records || []);
        if (data.summary) {
          setStats((prev) => ({
            ...prev,
            totalBilled: data.summary.totalBilled,
            totalCollected: data.summary.totalPaid,
            totalOutstanding: data.summary.totalOutstanding,
            collectionRate: data.summary.collectionRate,
          }));
        }
      })
      .catch((err) => setError(err.message));
  }, [getAccessToken, refreshAccessToken]);

  const handleTabChange = (nextTab) => {
    setActiveTab(nextTab);
    if (nextTab === "balances") {
      loadBalances();
    } else if (nextTab === "structures") {
      loadStructures();
    } else if (nextTab === "payments") {
      loadPayments();
    }
  };





  // Dynamic Structure Item calculation
  const calculatedStructureTotal = useMemo(() => {
    return (structureForm.items || []).reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0,
    );
  }, [structureForm.items]);

  const addStructureItem = () => {
    setStructureForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { name: "", category: "other", amount: "", isCompulsory: true },
      ],
    }));
  };

  const updateStructureItem = (index, field, value) => {
    setStructureForm((prev) => {
      const updated = [...prev.items];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, items: updated };
    });
  };

  const removeStructureItem = (index) => {
    setStructureForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleCreateStructure = async (e) => {
    e.preventDefault();
    if (!structureForm.title.trim()) {
      setError("Please provide a title for the fee structure.");
      return;
    }
    if (structureForm.items.length === 0) {
      setError("Please add at least one fee component.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setNotice(null);

    try {
      await ApiClient.post(
        "/admin/fees/structures",
        structureForm,
        {},
        getAccessToken,
        refreshAccessToken,
      );
      setNotice("Fee structure created and published successfully.");
      setShowStructureModal(false);
      await loadStructures();
      await loadStats();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStructureStatus = async (structure) => {
    const nextStatus = structure.status === "published" ? "draft" : "published";
    try {
      await ApiClient.patch(
        `/admin/fees/structures/${structure.id}`,
        { status: nextStatus },
        {},
        getAccessToken,
        refreshAccessToken,
      );
      setNotice(`Fee structure status updated to ${nextStatus}.`);
      await loadStructures();
      await loadStats();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteStructure = async (structureId) => {
    if (!window.confirm("Are you sure you want to delete this fee structure?")) return;
    try {
      await ApiClient.delete(
        `/admin/fees/structures/${structureId}`,
        {},
        getAccessToken,
        refreshAccessToken,
      );
      setNotice("Fee structure deleted.");
      await loadStructures();
      await loadStats();
    } catch (err) {
      setError(err.message);
    }
  };

  // Student Matric Lookup for Payment Entry
  const handleLookupStudent = async (matric) => {
    const trimmed = matric.trim();
    if (!trimmed) {
      setLookupStudent(null);
      return;
    }
    setLookupLoading(true);
    try {
      const data = await ApiClient.get(
        `/admin/students?search=${encodeURIComponent(trimmed)}&limit=1`,
        {},
        getAccessToken,
        refreshAccessToken,
      );
      if (data.students && data.students.length > 0) {
        setLookupStudent(data.students[0]);
      } else {
        setLookupStudent(null);
      }
    } catch {
      setLookupStudent(null);
    } finally {
      setLookupLoading(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!paymentForm.matricNumber.trim() || !paymentForm.amount) {
      setError("Please specify a student matric number and payment amount.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setNotice(null);

    try {
      const res = await ApiClient.post(
        "/admin/fees/payments",
        paymentForm,
        {},
        getAccessToken,
        refreshAccessToken,
      );
      setNotice(`Payment of ${formatCurrency(paymentForm.amount)} recorded successfully!`);
      setSelectedReceipt(res.payment);
      setPaymentForm((prev) => ({
        ...prev,
        matricNumber: "",
        amount: "",
        reference: "",
        receiptNumber: "",
        notes: "",
      }));
      setLookupStudent(null);
      await loadPayments();
      await loadStats();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportCsv = () => {
    const params = new URLSearchParams();
    if (balanceFilters.campusId) params.set("campusId", balanceFilters.campusId);
    if (balanceFilters.programmeId) params.set("programmeId", balanceFilters.programmeId);
    if (balanceFilters.level && balanceFilters.level !== "all") params.set("level", balanceFilters.level);
    if (balanceFilters.paymentStatus) params.set("paymentStatus", balanceFilters.paymentStatus);

    const token = getAccessToken();
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
    const exportUrl = `${apiUrl}/admin/fees/export?${params.toString()}`;

    // Download CSV via fetch with auth token
    fetch(exportUrl, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to generate CSV export");
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `abscons-outstanding-balances-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        setNotice("Outstanding balances CSV exported successfully.");
      })
      .catch((err) => setError(err.message));
  };

  const startPaymentForStudent = (record) => {
    setPaymentForm((prev) => ({
      ...prev,
      matricNumber: record.matricNumber,
      amount: record.outstandingBalance > 0 ? String(record.outstandingBalance) : "",
    }));
    handleLookupStudent(record.matricNumber);
    setActiveTab("payments");
  };

  return (
    <main className="admin-fees-module admin-module">
      <header className="admin-module-header">
        <div>
          <span className="eyebrow">Bursary & Financial Control</span>
          <h1>Fees & Payments Management</h1>
          <p>Configure fee schedules, record manual payments, and audit student balances.</p>
        </div>
        {canManage && (
          <div className="admin-header-actions">
            <button
              className="admin-btn-primary"
              type="button"
              onClick={() => setShowStructureModal(true)}
            >
              + Create Fee Structure
            </button>
          </div>
        )}
      </header>

      {/* Notifications */}
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

      {/* Financial Overview Metrics */}
      <section className="admin-fee-stats-grid" aria-label="Institution Fee Metrics">
        <div className="admin-fee-stat-card billed">
          <span>Total Invoiced Fees</span>
          <b>{formatCurrency(stats.totalBilled)}</b>
          <small>Current academic session</small>
        </div>
        <div className="admin-fee-stat-card collected">
          <span>Total Collected</span>
          <b className="text-success">{formatCurrency(stats.totalCollected)}</b>
          <small>Reconciled payments</small>
        </div>
        <div className="admin-fee-stat-card outstanding">
          <span>Outstanding Balances</span>
          <b className="text-danger">{formatCurrency(stats.totalOutstanding)}</b>
          <small>Uncollected balance</small>
        </div>
        <div className="admin-fee-stat-card rate">
          <span>Collection Rate</span>
          <b>{stats.collectionRate}%</b>
          <div className="admin-fee-progress-bar">
            <div
              className="admin-fee-progress-fill"
              style={{ width: `${Math.min(stats.collectionRate, 100)}%` }}
            />
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <div className="admin-fee-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "balances"}
          className={`admin-fee-tab ${activeTab === "balances" ? "active" : ""}`}
          onClick={() => handleTabChange("balances")}
        >
          Outstanding Balances & Ledger
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "structures"}
          className={`admin-fee-tab ${activeTab === "structures" ? "active" : ""}`}
          onClick={() => handleTabChange("structures")}
        >
          Fee Structures ({feeStructures.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "payments"}
          className={`admin-fee-tab ${activeTab === "payments" ? "active" : ""}`}
          onClick={() => handleTabChange("payments")}
        >
          Manual Payment Entry & History
        </button>
      </div>


      {/* TAB 1: OUTSTANDING BALANCES */}
      {activeTab === "balances" && (
        <section className="admin-panel admin-balances-panel">
          <div className="admin-panel-toolbar">
            <div className="admin-filter-row">
              <input
                type="search"
                placeholder="Search matric no or student name..."
                value={balanceFilters.search}
                onChange={(e) =>
                  setBalanceFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                onKeyDown={(e) => e.key === "Enter" && loadBalances()}
                className="admin-search-input"
              />
              <select
                value={balanceFilters.campusId}
                onChange={(e) => {
                  setBalanceFilters((prev) => ({ ...prev, campusId: e.target.value }));
                }}
              >
                <option value="">All Campuses</option>
                {campuses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
                value={balanceFilters.programmeId}
                onChange={(e) => {
                  setBalanceFilters((prev) => ({ ...prev, programmeId: e.target.value }));
                }}
              >
                <option value="">All Programmes</option>
                {programmes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <select
                value={balanceFilters.level}
                onChange={(e) => {
                  setBalanceFilters((prev) => ({ ...prev, level: e.target.value }));
                }}
              >
                <option value="all">All Levels</option>
                <option value="100">100 Level</option>
                <option value="200">200 Level</option>
                <option value="300">300 Level</option>
              </select>
              <select
                value={balanceFilters.paymentStatus}
                onChange={(e) => {
                  setBalanceFilters((prev) => ({ ...prev, paymentStatus: e.target.value }));
                }}
              >
                <option value="">All Payment Statuses</option>
                <option value="paid">Fully Paid</option>
                <option value="partial">Partially Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={loadBalances}
                disabled={balancesLoading}
              >
                {balancesLoading ? "Filtering..." : "Filter"}
              </button>
            </div>
            <div className="admin-toolbar-actions">
              <button
                type="button"
                className="admin-btn-export"
                onClick={handleExportCsv}
                title="Download CSV statement of outstanding balances"
              >
                📥 Export CSV Statement
              </button>
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Matric Number</th>
                  <th>Student Name</th>
                  <th>Programme & Level</th>
                  <th>Campus</th>
                  <th>Total Billed</th>
                  <th>Amount Paid</th>
                  <th>Outstanding</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {balanceRecords.map((record) => (
                  <tr key={record.studentId}>
                    <td>
                      <span className="matric-badge">{record.matricNumber}</span>
                    </td>
                    <td>
                      <strong>{record.fullName}</strong>
                      <small className="admin-table-subtext">{record.phone || record.email}</small>
                    </td>
                    <td>
                      <span>{record.programme}</span>
                      <small className="admin-table-subtext">{record.level} Level</small>
                    </td>
                    <td>{record.campus}</td>
                    <td>{formatCurrency(record.totalBilled)}</td>
                    <td className="text-success">{formatCurrency(record.amountPaid)}</td>
                    <td>
                      <strong className={record.outstandingBalance > 0 ? "text-danger" : "text-success"}>
                        {formatCurrency(record.outstandingBalance)}
                      </strong>
                    </td>
                    <td>
                      <span className={`status-pill ${record.status}`}>
                        {record.status === "paid"
                          ? "Fully Paid"
                          : record.status === "partial"
                            ? "Partially Paid"
                            : record.status === "no_fees"
                              ? "No Fees Assigned"
                              : "Unpaid"}
                      </span>
                    </td>
                    <td>
                      {canManage && (
                        <button
                          type="button"
                          className="admin-btn-table-action"
                          onClick={() => startPaymentForStudent(record)}
                        >
                          Record Payment
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {!balancesLoading && balanceRecords.length === 0 && (
                  <tr>
                    <td colSpan="9" className="admin-empty-table">
                      No student records found matching the active filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 2: FEE STRUCTURES BUILDER */}
      {activeTab === "structures" && (
        <section className="admin-panel admin-structures-panel">
          <div className="portal-panel-header">
            <div>
              <h2>Institutional Fee Structures</h2>
              <span>Configured itemized levies per session and programme</span>
            </div>
            {canManage && (
              <button
                className="admin-btn-primary"
                type="button"
                onClick={() => setShowStructureModal(true)}
              >
                + Create New Structure
              </button>
            )}
          </div>

          <div className="admin-structures-grid">
            {feeStructures.map((structure) => (
              <article key={structure.id} className="admin-structure-card">
                <header className="structure-card-header">
                  <div>
                    <span className="structure-tag">
                      {structure.academicSession?.name || "Session"} · {structure.level} Level
                    </span>
                    <h3>{structure.title}</h3>
                    <p>{structure.programme?.name || "All Programmes"}</p>
                  </div>
                  <span className={`status-pill ${structure.status}`}>
                    {structure.status}
                  </span>
                </header>

                <div className="structure-card-total">
                  <span>Total Amount</span>
                  <strong>{formatCurrency(structure.totalAmount)}</strong>
                </div>

                <div className="structure-items-breakdown">
                  <h4>Itemized Breakdown</h4>
                  <ul>
                    {structure.items?.map((item) => (
                      <li key={item.id}>
                        <span>{item.name}</span>
                        <b>{formatCurrency(item.amount)}</b>
                      </li>
                    ))}
                    {!structure.items?.length && (
                      <li className="text-muted">No individual items configured</li>
                    )}
                  </ul>
                </div>

                {structure.dueDate && (
                  <div className="structure-due-date">
                    <span>Due Date:</span> {new Date(structure.dueDate).toLocaleDateString()}
                  </div>
                )}

                {canManage && (
                  <footer className="structure-card-actions">
                    <button
                      type="button"
                      className="admin-btn-sm"
                      onClick={() => toggleStructureStatus(structure)}
                    >
                      {structure.status === "published" ? "Unpublish" : "Publish"}
                    </button>
                    <button
                      type="button"
                      className="admin-btn-sm text-danger"
                      onClick={() => handleDeleteStructure(structure.id)}
                    >
                      Delete
                    </button>
                  </footer>
                )}
              </article>
            ))}
            {!structuresLoading && feeStructures.length === 0 && (
              <p className="admin-empty-note">
                No fee structures created yet. Click <b>Create Fee Structure</b> above to build one.
              </p>
            )}
          </div>
        </section>
      )}

      {/* TAB 3: MANUAL PAYMENT ENTRY & HISTORY */}
      {activeTab === "payments" && (
        <section className="admin-payments-section">
          {canManage && (
            <form className="admin-panel admin-payment-form" onSubmit={handleRecordPayment}>
              <div className="portal-panel-header">
                <div>
                  <h2>Record Manual Payment</h2>
                  <span>Record bank transfers, POS transactions, cash, and bank drafts</span>
                </div>
              </div>

              <div className="admin-form-grid">
                <label>
                  Student Matric Number *
                  <div className="matric-input-wrapper">
                    <input
                      type="text"
                      placeholder="e.g. ABSCONS/2025/001"
                      value={paymentForm.matricNumber}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPaymentForm((prev) => ({ ...prev, matricNumber: val }));
                        handleLookupStudent(val);
                      }}
                      required
                    />
                    {lookupLoading && <span className="lookup-spinner">...</span>}
                  </div>
                  {lookupStudent && (
                    <div className="student-lookup-badge">
                      ✓ {lookupStudent.lastName} {lookupStudent.firstName} (
                      {lookupStudent.programme?.name || "Nursing"}, {lookupStudent.level}L -{" "}
                      {lookupStudent.campus?.name})
                    </div>
                  )}
                </label>

                <label>
                  Academic Session *
                  <select
                    value={paymentForm.academicSessionId}
                    onChange={(e) =>
                      setPaymentForm((prev) => ({
                        ...prev,
                        academicSessionId: e.target.value,
                      }))
                    }
                    required
                  >
                    {sessions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} {s.isCurrent ? "(Current)" : ""}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Semester
                  <select
                    value={paymentForm.semester}
                    onChange={(e) =>
                      setPaymentForm((prev) => ({ ...prev, semester: e.target.value }))
                    }
                  >
                    <option value="first">First Semester</option>
                    <option value="second">Second Semester</option>
                    <option value="all">Full Session</option>
                  </select>
                </label>

                <label>
                  Amount Paid (NGN) *
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="e.g. 120000"
                    value={paymentForm.amount}
                    onChange={(e) =>
                      setPaymentForm((prev) => ({ ...prev, amount: e.target.value }))
                    }
                    required
                  />
                </label>

                <label>
                  Payment Method *
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) =>
                      setPaymentForm((prev) => ({
                        ...prev,
                        paymentMethod: e.target.value,
                      }))
                    }
                    required
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Bank / Transaction Reference
                  <input
                    type="text"
                    placeholder="e.g. POLARIS-TXN-9842"
                    value={paymentForm.reference}
                    onChange={(e) =>
                      setPaymentForm((prev) => ({ ...prev, reference: e.target.value }))
                    }
                  />
                </label>

                <label>
                  Receipt / Teller Number
                  <input
                    type="text"
                    placeholder="e.g. REC-2025-0081"
                    value={paymentForm.receiptNumber}
                    onChange={(e) =>
                      setPaymentForm((prev) => ({ ...prev, receiptNumber: e.target.value }))
                    }
                  />
                </label>

                <label>
                  Payment Date
                  <input
                    type="date"
                    value={paymentForm.paidAt}
                    onChange={(e) =>
                      setPaymentForm((prev) => ({ ...prev, paidAt: e.target.value }))
                    }
                  />
                </label>

                <label className="span-full">
                  Bursary Notes / Description
                  <input
                    type="text"
                    placeholder="e.g. Verified payment receipt submitted in Bursary office"
                    value={paymentForm.notes}
                    onChange={(e) =>
                      setPaymentForm((prev) => ({ ...prev, notes: e.target.value }))
                    }
                  />
                </label>
              </div>

              <div className="admin-form-actions">
                <button
                  type="submit"
                  className="login-submit"
                  disabled={submitting || lookupLoading}
                >
                  {submitting ? "Recording Payment..." : "Record & Issue Receipt"}
                </button>
              </div>
            </form>
          )}

          {/* Payment History Table */}
          <div className="admin-panel admin-payments-table-panel">
            <div className="portal-panel-header">
              <h2>Recent Payment Transactions</h2>
              <span>Audit trail of all recorded student payments</span>
            </div>

            <div className="admin-table-container">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Receipt No.</th>
                    <th>Student Matric & Name</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Reference</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <strong>{p.receiptNumber}</strong>
                      </td>
                      <td>
                        <b>{p.student?.matricNumber}</b>
                        <small className="admin-table-subtext">
                          {p.student?.lastName} {p.student?.firstName}
                        </small>
                      </td>
                      <td className="text-success">
                        <strong>{formatCurrency(p.amount)}</strong>
                      </td>
                      <td>
                        <span className="payment-method-badge">
                          {p.paymentMethod?.replaceAll("_", " ")}
                        </span>
                      </td>
                      <td>
                        <code>{p.reference}</code>
                      </td>
                      <td>{new Date(p.paidAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-pill ${p.status}`}>{p.status}</span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="admin-btn-sm"
                          onClick={() => setSelectedReceipt(p)}
                        >
                          View Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!paymentsLoading && payments.length === 0 && (
                    <tr>
                      <td colSpan="8" className="admin-empty-table">
                        No payment transactions recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* CREATE FEE STRUCTURE MODAL */}
      {showStructureModal && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h2>Fee Structure Builder</h2>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setShowStructureModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStructure}>
              <div className="admin-modal-body">
                <div className="admin-form-grid">
                  <label className="span-full">
                    Structure Title *
                    <input
                      type="text"
                      placeholder="e.g. 100 Level Basic Nursing Compulsory Fees 2025/2026"
                      value={structureForm.title}
                      onChange={(e) =>
                        setStructureForm((prev) => ({ ...prev, title: e.target.value }))
                      }
                      required
                    />
                  </label>

                  <label>
                    Academic Session *
                    <select
                      value={structureForm.academicSessionId}
                      onChange={(e) =>
                        setStructureForm((prev) => ({
                          ...prev,
                          academicSessionId: e.target.value,
                        }))
                      }
                      required
                    >
                      {sessions.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Programme
                    <select
                      value={structureForm.programmeId}
                      onChange={(e) =>
                        setStructureForm((prev) => ({
                          ...prev,
                          programmeId: e.target.value,
                        }))
                      }
                    >
                      <option value="">All Programmes</option>
                      {programmes.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Level
                    <select
                      value={structureForm.level}
                      onChange={(e) =>
                        setStructureForm((prev) => ({ ...prev, level: e.target.value }))
                      }
                    >
                      <option value="100">100 Level</option>
                      <option value="200">200 Level</option>
                      <option value="300">300 Level</option>
                      <option value="all">All Levels</option>
                    </select>
                  </label>

                  <label>
                    Semester
                    <select
                      value={structureForm.semester}
                      onChange={(e) =>
                        setStructureForm((prev) => ({ ...prev, semester: e.target.value }))
                      }
                    >
                      <option value="all">Full Session</option>
                      <option value="first">First Semester</option>
                      <option value="second">Second Semester</option>
                    </select>
                  </label>

                  <label>
                    Due Date
                    <input
                      type="date"
                      value={structureForm.dueDate}
                      onChange={(e) =>
                        setStructureForm((prev) => ({ ...prev, dueDate: e.target.value }))
                      }
                    />
                  </label>

                  <label>
                    Status
                    <select
                      value={structureForm.status}
                      onChange={(e) =>
                        setStructureForm((prev) => ({ ...prev, status: e.target.value }))
                      }
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft (Hidden)</option>
                    </select>
                  </label>
                </div>

                {/* Dynamic Itemized Fee Components Builder */}
                <div className="admin-fee-items-builder">
                  <div className="builder-header">
                    <h4>Fee Items & Components</h4>
                    <button
                      type="button"
                      className="admin-btn-sm"
                      onClick={addStructureItem}
                    >
                      + Add Item
                    </button>
                  </div>

                  <div className="builder-items-list">
                    {structureForm.items.map((item, idx) => (
                      <div key={idx} className="builder-item-row">
                        <input
                          type="text"
                          placeholder="Item Name (e.g. Tuition)"
                          value={item.name}
                          onChange={(e) =>
                            updateStructureItem(idx, "name", e.target.value)
                          }
                          required
                        />
                        <select
                          value={item.category}
                          onChange={(e) =>
                            updateStructureItem(idx, "category", e.target.value)
                          }
                        >
                          {FEE_CATEGORIES.map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          placeholder="Amount (NGN)"
                          min="0"
                          step="0.01"
                          value={item.amount}
                          onChange={(e) =>
                            updateStructureItem(idx, "amount", e.target.value)
                          }
                          required
                        />
                        <button
                          type="button"
                          className="admin-btn-remove"
                          onClick={() => removeStructureItem(idx)}
                          title="Remove item"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="builder-total-row">
                    <span>Computed Total Structure Amount:</span>
                    <strong>{formatCurrency(calculatedStructureTotal)}</strong>
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => setShowStructureModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="login-submit"
                  disabled={submitting}
                >
                  {submitting ? "Saving..." : "Save & Publish Structure"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECEIPT VIEW MODAL */}
      {selectedReceipt && (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true">
          <div className="admin-modal-card receipt-card">
            <div className="admin-modal-header">
              <h2>Official Payment Receipt</h2>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setSelectedReceipt(null)}
              >
                ✕
              </button>
            </div>

            <div className="receipt-printable-body" id="receipt-print-area">
              <div className="receipt-header">
                <span className="receipt-org">Abia State College of Nursing Sciences</span>
                <h3>BURSARY DEPARTMENT PAYMENT RECEIPT</h3>
                <p className="receipt-sub">One Institution · One System · Endless Possibilities</p>
              </div>

              <div className="receipt-meta-grid">
                <div>
                  <small>Receipt Number</small>
                  <b>{selectedReceipt.receiptNumber}</b>
                </div>
                <div>
                  <small>Transaction Reference</small>
                  <b>{selectedReceipt.reference}</b>
                </div>
                <div>
                  <small>Payment Date</small>
                  <b>{new Date(selectedReceipt.paidAt).toLocaleString()}</b>
                </div>
                <div>
                  <small>Academic Session</small>
                  <b>{selectedReceipt.academicSession?.name || "2025/2026"}</b>
                </div>
              </div>

              <div className="receipt-student-details">
                <h4>Student Information</h4>
                <p>
                  <b>Matric Number:</b> {selectedReceipt.student?.matricNumber}
                </p>
                <p>
                  <b>Student Name:</b> {selectedReceipt.student?.lastName}{" "}
                  {selectedReceipt.student?.firstName}
                </p>
                <p>
                  <b>Programme:</b> {selectedReceipt.student?.programme?.name || "Basic Nursing"}
                </p>
                <p>
                  <b>Campus:</b> {selectedReceipt.student?.campus?.name || "Umuahia"}
                </p>
              </div>

              <div className="receipt-amount-box">
                <span>Amount Paid</span>
                <h2>{formatCurrency(selectedReceipt.amount)}</h2>
                <small>
                  Payment Method: {selectedReceipt.paymentMethod?.replaceAll("_", " ").toUpperCase()}
                </small>
              </div>

              {selectedReceipt.notes && (
                <p className="receipt-notes">
                  <b>Notes:</b> {selectedReceipt.notes}
                </p>
              )}

              <div className="receipt-footer-stamp">
                <div className="stamp-box">
                  <span>BURSARY STAMP & SIGNATURE</span>
                  <b>STATUS: VERIFIED & RECONCILED</b>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setSelectedReceipt(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="admin-btn-primary"
                onClick={() => window.print()}
              >
                🖨️ Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
