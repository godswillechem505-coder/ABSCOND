import { useEffect, useState } from 'react';
import { ApiClient } from '../auth/ApiClient';
import { useAuth } from '../auth/useAuth';
import { TableSkeleton } from '../components/Skeleton';
import { useToast } from '../context/useToast';

const GRADING_LEGEND = [
  { grade: 'A', range: '70% - 100%', points: '5.0', remark: 'EXCELLENT' },
  { grade: 'B', range: '60% - 69%', points: '4.0', remark: 'VERY GOOD' },
  { grade: 'C', range: '50% - 59%', points: '3.0', remark: 'GOOD' },
  { grade: 'D', range: '45% - 49%', points: '2.0', remark: 'FAIR PASS' },
  { grade: 'E', range: '40% - 44%', points: '1.0', remark: 'PASS' },
  { grade: 'F', range: '0% - 39%', points: '0.0', remark: 'FAIL (CARRYOVER)' },
];

export default function StudentResultsPage() {
  const { getAccessToken, refreshAccessToken } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [results, setResults] = useState([]);

  const [summary, setSummary] = useState({
    totalCourses: 0,
    totalUnits: 0,
    cgpa: '0.00',
    passRate: 100,
  });

  const [selectedSessionId, setSelectedSessionId] = useState('all');

  useEffect(() => {
    document.title = 'Semester Examination Results | ABSCONS Student Portal';
    ApiClient.get('/students/results', {}, getAccessToken, refreshAccessToken)
      .then((data) => {
        setResults(data.results || []);
        if (data.summary) setSummary(data.summary);
      })
      .catch((err) => {
        setError(err.message);
        toast.error(err.message || 'Failed to load examination results.');
      })
      .finally(() => setLoading(false));
  }, [getAccessToken, refreshAccessToken, toast]);

  const filteredResults = results.filter((r) => {
    if (selectedSessionId === 'all') return true;
    return String(r.academicSessionId) === String(selectedSessionId);
  });

  const handlePrintResults = () => {
    toast.info('Preparing Statement of Results for print...', 'Print Assessment');
    window.print();
  };

  return (
    <div className="portal-page-container">
      {/* Header Banner */}
      <header className="portal-header-banner">
        <div>
          <span className="eyebrow">Academic Assessment</span>
          <h1>Official Examination Results & Transcript</h1>
          <p>Verified semester examination results, grade point averages, and academic performance transcript.</p>
        </div>
        <div className="portal-header-actions">
          <button type="button" className="btn-print-slip" onClick={handlePrintResults}>
            🖨 Print Statement of Results
          </button>
        </div>
      </header>

      {error && <div className="login-error" role="alert">✕ {error}</div>}

      {/* Summary Cards */}
      <section className="admin-fee-stats-grid" aria-label="Academic Performance Summary">
        <div className="admin-fee-stat-card billed">
          <span>Cumulative GPA (CGPA)</span>
          <b>{summary.cgpa} / 5.00</b>
          <small>Current Academic Standing</small>
        </div>
        <div className="admin-fee-stat-card collected">
          <span>Total Units Earned</span>
          <b className="text-success">{summary.totalUnits} Units</b>
          <small>Passed Course Load</small>
        </div>
        <div className="admin-fee-stat-card outstanding">
          <span>Passed Courses Rate</span>
          <b className="text-primary">{summary.passRate}%</b>
          <small>{summary.totalCourses} Total Assessed Courses</small>
        </div>
      </section>

      {loading ? (
        <div style={{ background: '#fff', borderRadius: '10px', padding: '24px', border: '1px solid #e2e8f0' }}>
          <TableSkeleton rows={6} cols={7} />
        </div>
      ) : (
        <div className="results-two-col-layout">
          {/* Main Results Table */}
          <section className="portal-card main-results-card">
            <div className="portal-card-header">
              <h2>Published Results Ledger</h2>
              <div className="session-filter-select">
                <select
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                >
                  <option value="all">All Academic Sessions</option>
                  <option value="1">2025/2026 Academic Session</option>
                  <option value="2">2024/2025 Academic Session</option>
                </select>
              </div>
            </div>

            <div className="admin-table-container">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Course Title</th>
                    <th>Units</th>
                    <th>Score</th>
                    <th>Grade</th>
                    <th>Points</th>
                    <th>Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((r) => (
                    <tr key={r.id}>
                      <td><strong>{r.course?.code}</strong></td>
                      <td>{r.course?.title}</td>
                      <td><b>{r.course?.units || 3}</b></td>
                      <td>{r.score !== undefined ? `${r.score}%` : 'N/A'}</td>
                      <td>
                        <span className={`status-pill ${r.grade === 'F' ? 'rejected' : 'approved'}`}>
                          {r.grade}
                        </span>
                      </td>
                      <td><b>{r.grade === 'A' ? 5 : r.grade === 'B' ? 4 : r.grade === 'C' ? 3 : r.grade === 'D' ? 2 : r.grade === 'E' ? 1 : 0}</b></td>
                      <td>
                        <span className={r.grade === 'F' ? 'text-danger font-bold' : 'text-success'}>
                          {r.grade === 'F' ? 'CARRYOVER' : 'PASS'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredResults.length === 0 && (
                    <tr>
                      <td colSpan="7" className="admin-empty-table">
                        No published results found for the selected session.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Right Sidebar: Grading Scale Legend */}
          <aside className="portal-card grading-legend-card">
            <div className="portal-card-header">
              <h3>NMCN Official Grading Scale</h3>
            </div>
            <div className="grading-legend-list">
              {GRADING_LEGEND.map((g) => (
                <div key={g.grade} className="grading-legend-item">
                  <span className={`grade-badge ${g.grade === 'F' ? 'fail' : ''}`}>{g.grade}</span>
                  <div className="legend-info">
                    <strong>{g.range} ({g.points} Points)</strong>
                    <small>{g.remark}</small>
                  </div>
                </div>
              ))}
            </div>

            <div className="transcript-note-box">
              <p>
                ℹ Results published on this portal are official. Official hardcopy transcripts with the College seal can be requested at the Academic Affairs Directorate.
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
