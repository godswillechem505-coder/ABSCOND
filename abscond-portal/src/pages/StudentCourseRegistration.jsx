import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiClient } from '../auth/ApiClient';
import { useAuth } from '../auth/useAuth';
import { useToast } from '../context/useToast';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');

export default function StudentCourseRegistration() {
  const { getAccessToken, refreshAccessToken } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feeHold, setFeeHold] = useState(null); // { message, outstanding, totalBilled }

  const [windowOpen, setWindowOpen] = useState(true);
  const [currentSession, setCurrentSession] = useState(null);
  const [activeSemester, setActiveSemester] = useState(null);

  const [availableCourses, setAvailableCourses] = useState([]);
  const [registeredCourses, setRegisteredCourses] = useState([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [prereqModalCourse, setPrereqModalCourse] = useState(null);

  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);
    ApiClient.get('/students/course-registration', {}, getAccessToken, refreshAccessToken)
      .then((data) => {
        setWindowOpen(data.windowOpen !== false);
        setCurrentSession(data.currentSession);
        setActiveSemester(data.activeSemester);
        setAvailableCourses(data.availableCourses || []);
        setRegisteredCourses(data.registeredCourses || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [getAccessToken, refreshAccessToken]);

  useEffect(() => {
    document.title = 'Course Registration | ABSCONS Student Portal';
    ApiClient.get('/students/course-registration', {}, getAccessToken, refreshAccessToken)
      .then((data) => {
        setWindowOpen(data.windowOpen !== false);
        setCurrentSession(data.currentSession);
        setActiveSemester(data.activeSemester);
        setAvailableCourses(data.availableCourses || []);
        setRegisteredCourses(data.registeredCourses || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [getAccessToken, refreshAccessToken]);

  const toggleCourseSelect = (course) => {
    // If course has unmet prerequisite, show warning modal and block selection
    if (course.prerequisiteMet === false) {
      setPrereqModalCourse(course);
      toast.warning(
        `Prerequisite requirement not met for ${course.code}. You must complete ${course.prerequisite?.code || 'the prerequisite'} first.`,
        'Course Blocked'
      );
      return;
    }

    setSelectedCourseIds((prev) =>
      prev.includes(course.id) ? prev.filter((item) => item !== course.id) : [...prev, course.id]
    );
  };

  const registeredCourseIds = registeredCourses.map((c) => c.id);

  // Compute selected unit totals
  const selectedUnits = availableCourses
    .filter((c) => selectedCourseIds.includes(c.id))
    .reduce((sum, c) => sum + Number(c.units || 0), 0);

  const registeredUnits = registeredCourses.reduce((sum, c) => sum + Number(c.units || 0), 0);
  const totalUnits = selectedUnits + registeredUnits;

  const handleRegister = async (e) => {
    e.preventDefault();
    if (selectedCourseIds.length === 0) {
      setError('Please select at least one course to register.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setFeeHold(null);

    try {
      const res = await ApiClient.post(
        '/students/course-registration',
        { courseIds: selectedCourseIds },
        {},
        getAccessToken,
        refreshAccessToken
      );
      toast.success(res.message || 'Courses registered successfully!', 'Registration Complete');
      setSelectedCourseIds([]);
      loadData();
    } catch (err) {
      if (err.prerequisiteBlocked || (err.message && err.message.toLowerCase().includes('prerequisite'))) {
        toast.error(err.message, 'Prerequisite Blocked');
        setError(err.message);
      } else if (err.feeHold || (err.message && err.message.includes('outstanding fee'))) {
        setFeeHold({
          message: err.message,
          outstanding: err.outstanding,
          totalBilled: err.totalBilled,
        });
        toast.warning(err.message, 'Fee Hold Active');
      } else {
        toast.error(err.message, 'Registration Failed');
        setError(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDrop = async (courseId, courseCode) => {
    if (!window.confirm(`Are you sure you want to drop ${courseCode}?`)) return;

    try {
      await ApiClient.post(
        `/students/course-registration/drop/${courseId}`,
        {},
        {},
        getAccessToken,
        refreshAccessToken
      );
      toast.info(`Course ${courseCode} has been dropped.`, 'Course Dropped');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePrintSlip = () => {
    // Open the server-rendered, print-ready HTML slip in a new browser tab.
    // The user can then File → Print or Ctrl+P to save as PDF.
    const url = `${API_BASE}/students/course-registration/slip`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="portal-page-container">
      {/* Header Banner */}
      <header className="portal-header-banner">
        <div>
          <span className="eyebrow">Academic Portal</span>
          <h1>Semester Course Registration</h1>
          <p>Select and register your accredited nursing and midwifery course units for the current semester.</p>
        </div>
        <div className="portal-header-actions">
          <button type="button" className="btn-print-slip" onClick={handlePrintSlip}>
            🖨 Print Registration Slip
          </button>
        </div>
      </header>

      {/* Window Status Banner */}
      <div className={`registration-window-status-banner ${windowOpen ? 'open' : 'closed'}`}>
        <div className="status-indicator">
          <span className="status-dot"></span>
          <strong>
            {windowOpen
              ? `Registration Window OPEN for ${currentSession?.name || '2025/2026 Session'} (${activeSemester?.name || 'Current Semester'})`
              : 'Registration Window CLOSED'}
          </strong>
        </div>
        <p>
          {windowOpen
            ? 'Ensure your selected course units do not exceed the maximum allowed workload of 24 units.'
            : 'Course registration is currently locked by the Academic Affairs Directorate.'}
        </p>
      </div>

      {error && <div className="login-error" role="alert">✕ {error}</div>}

      {/* Fee Hold Warning Banner */}
      {feeHold && (
        <div className="fee-hold-banner" role="alert">
          <div className="fee-hold-icon">🔒</div>
          <div className="fee-hold-content">
            <strong>Registration Blocked — Outstanding Fee Balance</strong>
            <p>{feeHold.message}</p>
            {feeHold.outstanding && (
              <p className="fee-hold-amount">
                Amount Due: <strong>₦{Number(feeHold.outstanding).toLocaleString()}</strong>
              </p>
            )}
          </div>
          <Link to="/portal/fees" className="btn-green-arrow fee-hold-cta">
            Pay Fees Now →
          </Link>
        </div>
      )}

      {/* Workload Summary Bar */}
      <div className="workload-summary-bar">
        <div className="workload-item">
          <span>Registered Units:</span>
          <b>{registeredUnits} Units</b>
        </div>
        <div className="workload-item">
          <span>Selected New Units:</span>
          <b className="text-primary">{selectedUnits} Units</b>
        </div>
        <div className="workload-item">
          <span>Total Workload:</span>
          <b className={totalUnits > 24 ? 'text-danger' : 'text-success'}>
            {totalUnits} / 24 Units Max
          </b>
        </div>
      </div>

      {loading ? (
        <div className="portal-loading"><p>Loading available courses...</p></div>
      ) : (
        <div className="course-registration-grid">
          {/* Left: Available Courses to Register */}
          <section className="portal-card available-courses-panel">
            <div className="portal-card-header">
              <h2>Available Course Units</h2>
              <span>{availableCourses.length} Courses Offered</span>
            </div>

            <div className="available-courses-list">
              {availableCourses.map((c) => {
                const isAlreadyRegistered = registeredCourseIds.includes(c.id);
                const isSelected = selectedCourseIds.includes(c.id);
                const isPrereqBlocked = c.prerequisiteMet === false;

                return (
                  <div
                    key={c.id}
                    className={`course-item-row ${isAlreadyRegistered ? 'registered' : ''} ${isSelected ? 'selected' : ''} ${isPrereqBlocked ? 'prereq-blocked' : ''}`}
                    onClick={() => {
                      if (isAlreadyRegistered || !windowOpen) return;
                      toggleCourseSelect(c);
                    }}
                  >
                    <div className="course-checkbox-col">
                      <input
                        type="checkbox"
                        checked={isAlreadyRegistered || isSelected}
                        disabled={isAlreadyRegistered || !windowOpen || isPrereqBlocked}
                        onChange={() => {}}
                      />
                    </div>
                    <div className="course-info-col">
                      <div className="course-code-row">
                        <strong>{c.code}</strong>
                        <span className="unit-badge">{c.units} Units</span>
                        <span className="semester-badge">Level {c.level} | Sem {c.semester}</span>
                        {isPrereqBlocked && (
                          <span className="prereq-blocked-badge" title="Prerequisite not completed">
                            🔒 Prerequisite Required
                          </span>
                        )}
                      </div>
                      <h4>{c.title}</h4>
                      {c.prerequisite && (
                        <div className={`prereq-indicator ${isPrereqBlocked ? 'blocked' : 'met'}`}>
                          <span className="prereq-icon">{isPrereqBlocked ? '⚠️' : '✓'}</span>
                          <span>
                            Prerequisite: <strong>{c.prerequisite.code} - {c.prerequisite.title}</strong>
                            {isPrereqBlocked && c.prerequisiteDetails && (
                              <span className="prereq-status-note">
                                {c.prerequisiteDetails.reason === 'failed'
                                  ? ` (Previous Attempt: Grade ${c.prerequisiteDetails.grade}, ${c.prerequisiteDetails.score}%)`
                                  : ' (Not Yet Passed)'}
                              </span>
                            )}
                          </span>
                          {isPrereqBlocked && (
                            <button
                              type="button"
                              className="btn-view-prereq-details"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPrereqModalCourse(c);
                              }}
                            >
                              View Requirement
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="course-status-col">
                      {isAlreadyRegistered ? (
                        <span className="status-pill active">REGISTERED</span>
                      ) : isSelected ? (
                        <span className="status-pill pending">SELECTED</span>
                      ) : isPrereqBlocked ? (
                        <span className="status-pill blocked">BLOCKED</span>
                      ) : (
                        <span className="status-pill">AVAILABLE</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {windowOpen && (
              <div className="registration-submit-footer">
                <button
                  type="button"
                  className="btn-green-arrow"
                  disabled={submitting || selectedCourseIds.length === 0 || totalUnits > 24}
                  onClick={handleRegister}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {submitting ? 'Registering...' : `Submit Registration (${selectedCourseIds.length} Courses Selected) →`}
                </button>
              </div>
            )}
          </section>

          {/* Right: Registered Courses Table */}
          <section className="portal-card registered-courses-panel">
            <div className="portal-card-header">
              <h2>Registered Course Slip</h2>
              <span>{registeredCourses.length} Confirmed Courses</span>
            </div>

            <div className="admin-table-container">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Course Title</th>
                    <th>Units</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {registeredCourses.map((rc) => (
                    <tr key={rc.id}>
                      <td><strong>{rc.code}</strong></td>
                      <td>{rc.title}</td>
                      <td><b>{rc.units}</b></td>
                      <td>
                        {windowOpen ? (
                          <button
                            type="button"
                            className="admin-btn-sm text-danger"
                            onClick={() => handleDrop(rc.id, rc.code)}
                          >
                            Drop
                          </button>
                        ) : (
                          <span className="status-pill verified">CONFIRMED</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {registeredCourses.length === 0 && (
                    <tr>
                      <td colSpan="4" className="admin-empty-table">
                        No courses registered for this semester yet. Select from the available courses list and click submit.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Downloadable slip */}
            {registeredCourses.length > 0 && (
              <div className="registration-submit-footer" style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                <button
                  type="button"
                  className="btn-green-arrow"
                  style={{ width: '100%', justifyContent: 'center', background: 'var(--navy)' }}
                  onClick={handlePrintSlip}
                >
                  🖨 Download / Print Registration Slip
                </button>
              </div>
            )}
          </section>
        </div>
      )}

      {/* Prerequisite Warning Modal */}
      {prereqModalCourse && (
        <div
          className="admin-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setPrereqModalCourse(null)}
        >
          <div className="admin-modal-card prereq-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header" style={{ borderBottom: '1px solid #fed7aa', background: '#fffbeb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>⚠️</span>
                <div>
                  <h2 style={{ margin: 0, color: '#9a3412', fontSize: '1.2rem' }}>
                    Prerequisite Requirement Not Met
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#c2410c' }}>
                    Academic Enrollment Clearance Notice
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setPrereqModalCourse(null)}
              >
                ✕
              </button>
            </div>

            <div className="admin-modal-body" style={{ padding: '24px' }}>
              <div className="prereq-target-course-box">
                <span className="prereq-box-label">Target Course You Attempted to Select:</span>
                <div className="prereq-course-title-line">
                  <strong>{prereqModalCourse.code}</strong> — {prereqModalCourse.title}
                </div>
                <div className="prereq-meta-tags">
                  <span className="unit-badge">{prereqModalCourse.units} Units</span>
                  <span className="semester-badge">Level {prereqModalCourse.level} | Sem {prereqModalCourse.semester}</span>
                </div>
              </div>

              <div className="prereq-requirement-box">
                <div className="prereq-box-header">
                  <strong>Mandatory Prerequisite Course:</strong>
                  <span className={`prereq-state-badge ${prereqModalCourse.prerequisiteDetails?.reason === 'failed' ? 'failed' : 'missing'}`}>
                    {prereqModalCourse.prerequisiteDetails?.reason === 'failed'
                      ? 'FAILED PREVIOUS ATTEMPT'
                      : 'NOT YET TAKEN / PASSED'}
                  </span>
                </div>
                <div className="prereq-course-title-line">
                  <strong>{prereqModalCourse.prerequisite?.code}</strong> — {prereqModalCourse.prerequisite?.title}
                </div>
                {prereqModalCourse.prerequisiteDetails?.reason === 'failed' && (
                  <div className="prereq-result-details">
                    <p>
                      <strong>Your Recorded Result:</strong> Grade{' '}
                      <span className="badge-danger" style={{ fontWeight: 700, color: '#dc2626' }}>{prereqModalCourse.prerequisiteDetails.grade}</span>{' '}
                      ({prereqModalCourse.prerequisiteDetails.score}%)
                    </p>
                    <p className="prereq-note-text">
                      The minimum passing grade for this prerequisite is <strong>Grade E (40%)</strong>.
                    </p>
                  </div>
                )}
                {prereqModalCourse.prerequisiteDetails?.reason === 'not_taken' && (
                  <div className="prereq-result-details">
                    <p className="prereq-note-text">
                      You have no recorded passing grade for <strong>{prereqModalCourse.prerequisite?.code}</strong>.
                      Academic regulations require completion of this course before enrollment in {prereqModalCourse.code}.
                    </p>
                  </div>
                )}
              </div>

              <div className="prereq-guidance-callout">
                <p style={{ margin: 0 }}>
                  💡 <strong>Next Steps:</strong> Register and achieve a passing score in{' '}
                  <strong>{prereqModalCourse.prerequisite?.code}</strong> during its regular semester offering, or consult your Academic Advisor / Head of Department if you believe this is an evaluation discrepancy.
                </p>
              </div>
            </div>

            <div className="admin-modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
              <button
                type="button"
                className="btn-green-arrow"
                onClick={() => setPrereqModalCourse(null)}
              >
                Understood, Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
