import { useCallback, useEffect, useState } from 'react';
import { ApiClient } from '../auth/ApiClient';
import { useAuth } from '../auth/useAuth';
import { TableSkeleton } from '../components/Skeleton';
import { useToast } from '../context/useToast';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');

export default function StudentFeesPage() {
  const { getAccessToken, refreshAccessToken } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [summary, setSummary] = useState({
    totalBilled: 150000,
    totalPaid: 0,
    totalOutstanding: 150000,
    paymentStatus: 'unpaid',
  });

  const [structures, setStructures] = useState([]);
  const [payments, setPayments] = useState([]);

  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('paystack');
  const [submitting, setSubmitting] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);
    ApiClient.get('/students/fees', {}, getAccessToken, refreshAccessToken)
      .then((data) => {
        if (data.summary) setSummary(data.summary);
        setStructures(data.structures || []);
        setPayments(data.payments || []);
        if (data.summary?.totalOutstanding > 0) {
          setPayAmount(data.summary.totalOutstanding);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [getAccessToken, refreshAccessToken]);

  useEffect(() => {
    document.title = 'Fees & Payments | ABSCONS Student Portal';
    ApiClient.get('/students/fees', {}, getAccessToken, refreshAccessToken)
      .then((data) => {
        if (data.summary) setSummary(data.summary);
        setStructures(data.structures || []);
        setPayments(data.payments || []);
        if (data.summary?.totalOutstanding > 0) {
          setPayAmount(data.summary.totalOutstanding);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [getAccessToken, refreshAccessToken]);

  // Line 56: Gateway Initialization & Verification Flow
  const handleProcessPayment = async (e) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0) {
      setError('Please specify a valid payment amount.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Step 1: Initialize gateway transaction
      const initRes = await ApiClient.post(
        '/students/fees/initialize',
        {
          amount: Number(payAmount),
          gateway: payMethod,
          purpose: 'Session Tuition & Compulsory Institutional Levies',
        },
        {},
        getAccessToken,
        refreshAccessToken
      );

      // Step 2: Simulate / authorize gateway confirmation & verify transaction
      const verifyRes = await ApiClient.post(
        '/students/fees/verify',
        {
          reference: initRes.reference,
          gateway: payMethod,
          amount: Number(payAmount),
        },
        {},
        getAccessToken,
        refreshAccessToken
      );

      toast.success(verifyRes.message || 'Payment authorized, credited, and verified successfully!', 'Payment Confirmed');
      setShowPayModal(false);
      if (verifyRes.payment) setSelectedReceipt(verifyRes.payment);
      loadData();
    } catch (err) {
      toast.error(err.message, 'Payment Failed');
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadInvoice = () => {
    const url = `${API_BASE}/students/fees/invoice`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handlePrintReceipt = (paymentId) => {
    const url = `${API_BASE}/students/fees/receipt/${paymentId}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const formatCurrency = (val) =>
    `₦${Number(val || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;

  return (
    <div className="portal-page-container">
      {/* Header Banner */}
      <header className="portal-header-banner">
        <div>
          <span className="eyebrow">Financial Services</span>
          <h1>Fee Ledger & Payment Portal</h1>
          <p>View itemized fee structures, check outstanding balances, make online payments, and download payment receipts.</p>
        </div>
        <div className="portal-header-actions" style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn-print-slip"
            onClick={handleDownloadInvoice}
          >
            📄 Official Fee Invoice (PDF)
          </button>
          <button
            type="button"
            className="admin-btn-primary"
            onClick={() => setShowPayModal(true)}
            disabled={summary.totalOutstanding === 0}
          >
            💳 Pay Fees Online Now
          </button>
        </div>
      </header>

      {error && <div className="login-error" role="alert">✕ {error}</div>}

      {/* Financial Summary Metric Cards */}
      <section className="admin-fee-stats-grid" aria-label="Student Fee Summary">
        <div className="admin-fee-stat-card billed">
          <span>Total Invoiced Tuition</span>
          <b>{formatCurrency(summary.totalBilled)}</b>
          <small>Current Academic Session</small>
        </div>
        <div className="admin-fee-stat-card collected">
          <span>Total Paid & Credited</span>
          <b className="text-success">{formatCurrency(summary.totalPaid)}</b>
          <small>Verified Receipts</small>
        </div>
        <div className="admin-fee-stat-card outstanding">
          <span>Outstanding Balance</span>
          <b className={summary.totalOutstanding > 0 ? 'text-danger' : 'text-success'}>
            {formatCurrency(summary.totalOutstanding)}
          </b>
          <small>
            <span className={`status-pill ${summary.totalOutstanding === 0 ? 'approved' : 'pending'}`}>
              {summary.totalOutstanding === 0 ? 'PAID IN FULL' : 'BALANCE DUE'}
            </span>
          </small>
        </div>
      </section>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ background: '#fff', borderRadius: '10px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <TableSkeleton rows={4} cols={3} />
          </div>
          <div style={{ background: '#fff', borderRadius: '10px', padding: '24px', border: '1px solid #e2e8f0' }}>
            <TableSkeleton rows={4} cols={4} />
          </div>
        </div>
      ) : (
        <div className="fees-two-col-layout">
          {/* Left Column: Itemized Fee Structure Breakdown */}
          <section className="portal-card fee-breakdown-card">
            <div className="portal-card-header">
              <h2>Session Fee Schedule Breakdown</h2>
              <span>Approved Levies</span>
            </div>

            {structures.map((st) => (
              <div key={st.id} className="fee-structure-block">
                <div className="structure-block-header">
                  <h3>{st.name}</h3>
                  <strong className="text-primary">{formatCurrency(st.totalAmount)}</strong>
                </div>

                <div className="admin-table-container">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>Levy Item</th>
                        <th>Category</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {st.items?.map((item) => (
                        <tr key={item.id}>
                          <td><strong>{item.name}</strong></td>
                          <td><span className="matric-badge">{item.category}</span></td>
                          <td><b>{formatCurrency(item.amount)}</b></td>
                        </tr>
                      ))}
                      {(!st.items || st.items.length === 0) && (
                        <tr>
                          <td colSpan="3" className="admin-empty-table">
                            General Tuition & Practicum Levy - {formatCurrency(st.totalAmount)}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            {structures.length === 0 && (
              <div className="empty-state">
                <p>Standard Session Tuition & Clinical Levies: <strong>₦150,000.00</strong></p>
              </div>
            )}
          </section>

          {/* Right Column: Payment History & Receipts */}
          <section className="portal-card payment-history-card">
            <div className="portal-card-header">
              <h2>Payment History & Receipts</h2>
              <span>{payments.length} Transactions</span>
            </div>

            <div className="admin-table-container">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Receipt No.</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td><strong>{p.receiptNumber}</strong></td>
                      <td><small>{new Date(p.paidAt || p.createdAt).toLocaleDateString('en-GB')}</small></td>
                      <td><b>{formatCurrency(p.amount)}</b></td>
                      <td>
                        <span className={`status-pill ${p.status === 'verified' ? 'approved' : 'pending'}`}>
                          {p.status?.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="admin-btn-sm"
                          onClick={() => setSelectedReceipt(p)}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className="admin-btn-sm text-primary"
                          onClick={() => handlePrintReceipt(p.id)}
                          title="Print official PDF receipt"
                        >
                          🖨 Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan="5" className="admin-empty-table">
                        No verified payments found. Click "Pay Fees Online Now" to make a payment.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* Modal: Online Payment Gateway Simulation */}
      {showPayModal && (
        <div className="admin-modal-overlay" role="dialog" onClick={() => setShowPayModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>💳 Online Fee Payment Gateway</h2>
              <button type="button" className="admin-modal-close" onClick={() => setShowPayModal(false)}>✕</button>
            </div>
            <form onSubmit={handleProcessPayment}>
              <div className="admin-modal-body admin-form-grid">
                <div className="span-full">
                  <label>
                    Outstanding Balance
                    <input type="text" value={formatCurrency(summary.totalOutstanding)} disabled />
                  </label>
                </div>
                <div className="span-full">
                  <label>
                    Amount to Pay (₦) *
                    <input
                      type="number"
                      min="1000"
                      max={summary.totalOutstanding || 300000}
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      required
                    />
                  </label>
                </div>
                <div className="span-full">
                  <label>
                    Payment Gateway Channel
                    <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
                      <option value="paystack">Paystack Gateway (Mastercard / Visa / Verve / Bank USSD)</option>
                      <option value="flutterwave">Flutterwave Gateway (Cards / Mobile Money / Transfers)</option>
                    </select>
                  </label>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn-secondary" onClick={() => setShowPayModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn-primary" disabled={submitting}>
                  {submitting ? 'Connecting Gateway...' : `Proceed to ${payMethod === 'flutterwave' ? 'Flutterwave' : 'Paystack'} (${formatCurrency(payAmount)}) →`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Download / Print Digital Receipt */}
      {selectedReceipt && (
        <div className="admin-modal-overlay" role="dialog" onClick={() => setSelectedReceipt(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>🧾 Official Payment Receipt</h2>
              <button type="button" className="admin-modal-close" onClick={() => setSelectedReceipt(null)}>✕</button>
            </div>
            <div className="admin-modal-body">
              <div className="receipt-box-card">
                <div className="receipt-header">
                  <h3>ABIA STATE COLLEGE OF NURSING SCIENCES</h3>
                  <p>Bursary Department — Official Electronic Receipt</p>
                </div>
                <hr />
                <div className="receipt-meta-grid">
                  <p><strong>Receipt Number:</strong> {selectedReceipt.receiptNumber}</p>
                  <p><strong>Transaction Ref:</strong> {selectedReceipt.reference}</p>
                  <p><strong>Payment Date:</strong> {new Date(selectedReceipt.paidAt || selectedReceipt.createdAt).toLocaleString('en-GB')}</p>
                  <p><strong>Payment Channel:</strong> {selectedReceipt.paymentMethod?.toUpperCase()}</p>
                  <p><strong>Status:</strong> <span className="status-pill approved">VERIFIED & CREDITED</span></p>
                  <p className="receipt-total-line"><strong>Amount Paid:</strong> <b>{formatCurrency(selectedReceipt.amount)}</b></p>
                </div>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button type="button" className="admin-btn-secondary" onClick={() => setSelectedReceipt(null)}>Close</button>
              <button
                type="button"
                className="btn-green-arrow"
                onClick={() => handlePrintReceipt(selectedReceipt.id)}
              >
                🖨️ Download Official PDF Receipt
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
