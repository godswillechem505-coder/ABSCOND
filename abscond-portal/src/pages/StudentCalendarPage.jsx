import { useEffect, useMemo, useState } from 'react';
import { ApiClient } from '../auth/ApiClient';
import { useAuth } from '../auth/useAuth';

export default function StudentCalendarPage() {
  const { getAccessToken, refreshAccessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingIcs, setDownloadingIcs] = useState(false);

  const [currentSession, setCurrentSession] = useState(null);
  const [calendarEntries, setCalendarEntries] = useState([]);
  const [events, setEvents] = useState([]);
  const [countdowns, setCountdowns] = useState(null);

  const [selectedItem, setSelectedItem] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSemester, setActiveSemester] = useState('all');

  useEffect(() => {
    document.title = 'Academic Calendar | ABSCONS Student Portal';
    let isMounted = true;

    ApiClient.get('/students/calendar', {}, getAccessToken, refreshAccessToken)
      .then((data) => {
        if (!isMounted) return;
        setCurrentSession(data.currentSession);
        setCalendarEntries(data.calendarEntries || []);
        setEvents(data.events || []);
        setCountdowns(data.countdowns || null);

        // Auto select first entry
        const initial = (data.calendarEntries && data.calendarEntries.length > 0)
          ? data.calendarEntries[0]
          : (data.events && data.events.length > 0 ? data.events[0] : null);
        setSelectedItem(initial);
      })
      .catch((err) => {
        if (isMounted) setError(err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [getAccessToken, refreshAccessToken]);

  const handleDownloadIcs = async () => {
    setDownloadingIcs(true);
    try {
      const token = await getAccessToken();
      const response = await fetch(`${ApiClient.getBaseUrl()}/students/calendar/ics`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download calendar ICS file.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `abscons-academic-calendar-${(currentSession?.name || '2025-2026').replace(/[^a-zA-Z0-9]/g, '-')}.ics`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(`Error downloading calendar: ${err.message}`);
    } finally {
      setDownloadingIcs(false);
    }
  };

  // Combine and normalize items
  const allItems = useMemo(() => {
    const entries = calendarEntries.map((e) => ({
      ...e,
      isCalendarEntry: true,
      displayDate: e.startDate,
    }));

    const publicEvents = events.map((evt) => ({
      ...evt,
      isCalendarEntry: false,
      startDate: evt.eventDate,
      displayDate: evt.eventDate,
    }));

    return [...entries, ...publicEvents].sort((a, b) => new Date(a.displayDate) - new Date(b.displayDate));
  }, [calendarEntries, events]);

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      // Category filter
      if (activeCategory !== 'all') {
        const itemCat = (item.category || '').toLowerCase();
        if (activeCategory === 'lectures' && itemCat !== 'lectures') return false;
        if (activeCategory === 'examination' && itemCat !== 'examination' && itemCat !== 'assessment' && itemCat !== 'revision') return false;
        if (activeCategory === 'clinical' && itemCat !== 'clinical') return false;
        if (activeCategory === 'registration' && itemCat !== 'registration' && itemCat !== 'matriculation') return false;
        if (activeCategory === 'break' && itemCat !== 'break' && !item.isHoliday) return false;
      }

      // Semester filter
      if (activeSemester !== 'all') {
        const semNum = item.semester?.number;
        if (activeSemester === '1' && semNum !== 1) return false;
        if (activeSemester === '2' && semNum !== 2) return false;
      }

      return true;
    });
  }, [allItems, activeCategory, activeSemester]);

  const getCategoryBadgeClass = (category) => {
    switch ((category || '').toLowerCase()) {
      case 'examination':
      case 'assessment':
        return 'priority-high';
      case 'clinical':
        return 'status-verified';
      case 'lectures':
        return 'matric-badge';
      case 'registration':
      case 'matriculation':
        return 'priority-normal';
      case 'break':
        return 'status-pending';
      default:
        return 'matric-badge';
    }
  };

  return (
    <div className="portal-page-container">
      {/* Header Banner */}
      <header className="portal-header-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="eyebrow">Institutional Schedule</span>
          <h1>Academic Calendar & Schedule</h1>
          <p>Key academic session dates, lecture commencement, clinical postings, examinations, and vacation breaks.</p>
        </div>
        <button
          type="button"
          className="admin-btn-primary"
          onClick={handleDownloadIcs}
          disabled={downloadingIcs}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          <span>📅</span>
          <span>{downloadingIcs ? 'Generating .ICS...' : 'Download Calendar (.ics)'}</span>
        </button>
      </header>

      {error && <div className="login-error" role="alert">✕ {error}</div>}

      {/* Countdown Summary Strip */}
      <section className="calendar-countdown-strip">
        <div className="countdown-card">
          <span>Current Academic Session</span>
          <strong>{currentSession?.name || '2025/2026 Session'}</strong>
          <small>Abia State College of Nursing Sciences</small>
        </div>
        <div className="countdown-card highlight">
          <span>Semester Exams Countdown</span>
          <strong className="text-primary">
            {countdowns?.daysToExams !== undefined ? `${countdowns.daysToExams} Days Remaining` : '18 Days Remaining'}
          </strong>
          <small>
            Starts:{' '}
            {countdowns?.nextExamDate
              ? new Date(countdowns.nextExamDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
              : 'June 15, 2026'}
          </small>
        </div>
        <div className="countdown-card">
          <span>Course Registration Window</span>
          <strong className="text-danger">
            {countdowns?.daysToRegClose !== undefined ? `${countdowns.daysToRegClose} Days Left` : 'Active'}
          </strong>
          <small>
            Deadline:{' '}
            {countdowns?.regCloseDate
              ? new Date(countdowns.regCloseDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
              : 'Feb 28, 2026'}
          </small>
        </div>
      </section>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', margin: '20px 0 10px 0' }}>
        <div className="admin-fee-tabs" style={{ margin: 0 }}>
          <button
            type="button"
            className={`admin-fee-tab ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            All Entries ({allItems.length})
          </button>
          <button
            type="button"
            className={`admin-fee-tab ${activeCategory === 'lectures' ? 'active' : ''}`}
            onClick={() => setActiveCategory('lectures')}
          >
            Lectures
          </button>
          <button
            type="button"
            className={`admin-fee-tab ${activeCategory === 'examination' ? 'active' : ''}`}
            onClick={() => setActiveCategory('examination')}
          >
            Exams & Assessments
          </button>
          <button
            type="button"
            className={`admin-fee-tab ${activeCategory === 'clinical' ? 'active' : ''}`}
            onClick={() => setActiveCategory('clinical')}
          >
            Clinical Rotations
          </button>
          <button
            type="button"
            className={`admin-fee-tab ${activeCategory === 'registration' ? 'active' : ''}`}
            onClick={() => setActiveCategory('registration')}
          >
            Registration
          </button>
          <button
            type="button"
            className={`admin-fee-tab ${activeCategory === 'break' ? 'active' : ''}`}
            onClick={() => setActiveCategory('break')}
          >
            Breaks & Holidays
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label htmlFor="sem-select" style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>
            Semester:
          </label>
          <select
            id="sem-select"
            className="filter-input"
            value={activeSemester}
            onChange={(e) => setActiveSemester(e.target.value)}
            style={{ padding: '6px 12px', fontSize: '13px', borderRadius: '6px' }}
          >
            <option value="all">All Semesters</option>
            <option value="1">First Semester</option>
            <option value="2">Second Semester</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="portal-loading"><p>Loading academic calendar...</p></div>
      ) : (
        <div className="calendar-two-col-layout">
          {/* Left: Events & Key Dates List */}
          <section className="portal-card main-calendar-list-card">
            <div className="portal-card-header">
              <h2>Important Academic Dates & Milestones</h2>
              <span>{filteredItems.length} Scheduled Entries</span>
            </div>

            <div className="calendar-events-list">
              {filteredItems.map((evt) => {
                const startDateObj = new Date(evt.startDate || evt.displayDate);
                const monthName = startDateObj.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase();
                const dayNum = startDateObj.getDate();
                const isSelected = selectedItem?.id === evt.id && selectedItem?.title === evt.title;

                return (
                  <div
                    key={`${evt.id}-${evt.title}`}
                    className={`calendar-event-row ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedItem(evt)}
                    role="button"
                    tabIndex="0"
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedItem(evt)}
                  >
                    <div className="event-date-col">
                      <strong>{monthName}</strong>
                      <b>{dayNum}</b>
                    </div>
                    <div className="event-info-col">
                      <div className="event-tag-line">
                        <span className={`status-pill ${getCategoryBadgeClass(evt.category)}`}>
                          {(evt.category || 'Academic').toUpperCase()}
                        </span>
                        {evt.semester && (
                          <span className="campus-badge" style={{ backgroundColor: '#e2e8f0', color: '#334155' }}>
                            {evt.semester.name}
                          </span>
                        )}
                        {evt.isHoliday && <span className="campus-badge" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>HOLIDAY</span>}
                      </div>
                      <h3>{evt.title}</h3>
                      <p className="event-location-text">
                        📍 {evt.location || 'All ABSCONS Campuses'}
                        {evt.endDate && evt.endDate !== evt.startDate && (
                          <span> • Through {new Date(evt.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                        )}
                      </p>
                    </div>
                    <div className="event-action-col">
                      <button type="button" className="admin-btn-sm">
                        {isSelected ? 'Viewing' : 'Details →'}
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredItems.length === 0 && (
                <div className="empty-state">
                  <p>No academic calendar events matching the selected filters.</p>
                </div>
              )}
            </div>
          </section>

          {/* Right: Selected Day Detail Panel */}
          {selectedItem && (
            <aside className="portal-card day-detail-panel">
              <div className="portal-card-header">
                <h3>Schedule Inspector</h3>
              </div>

              <div className="day-detail-body">
                <span className={`status-pill ${getCategoryBadgeClass(selectedItem.category)}`} style={{ marginBottom: '12px' }}>
                  {(selectedItem.category || 'Academic').toUpperCase()}
                </span>

                <h2>{selectedItem.title}</h2>

                <div className="detail-meta-list">
                  <p>
                    📅 <strong>Date:</strong>{' '}
                    {new Date(selectedItem.startDate || selectedItem.displayDate).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                    {selectedItem.endDate && selectedItem.endDate !== selectedItem.startDate && (
                      <span>
                        {' '}—{' '}
                        {new Date(selectedItem.endDate).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                  </p>
                  {selectedItem.startTime && (
                    <p>
                      ⏱ <strong>Timing:</strong> {selectedItem.startTime} {selectedItem.endTime ? `- ${selectedItem.endTime}` : ''}
                    </p>
                  )}
                  <p>
                    📍 <strong>Venue:</strong> {selectedItem.location || 'All ABSCONS Campuses (Aba, Amachara, Umuahia, Abiriba)'}
                  </p>
                  {selectedItem.semester && (
                    <p>
                      🏛 <strong>Academic Semester:</strong> {selectedItem.semester.name}
                    </p>
                  )}
                  {selectedItem.targetLevel && selectedItem.targetLevel !== 'all' && (
                    <p>
                      🎓 <strong>Applicable Levels:</strong> {selectedItem.targetLevel} Level Students
                    </p>
                  )}
                </div>

                <hr />

                <div className="detail-description-box">
                  <h4>Activity Overview & Instructions:</h4>
                  <p>{selectedItem.description || 'Mandatory academic activity for all eligible nursing and midwifery students.'}</p>
                </div>
              </div>
            </aside>
          )}
        </div>
      )}
    </div>
  );
}
