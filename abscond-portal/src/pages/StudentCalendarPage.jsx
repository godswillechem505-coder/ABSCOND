import { useEffect, useState } from 'react';
import { ApiClient } from '../auth/ApiClient';
import { useAuth } from '../auth/useAuth';

export default function StudentCalendarPage() {
  const { getAccessToken, refreshAccessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentSession, setCurrentSession] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    document.title = 'Academic Calendar | ABSCONS Student Portal';
    ApiClient.get('/students/calendar', {}, getAccessToken, refreshAccessToken)
      .then((data) => {
        setCurrentSession(data.currentSession);
        setEvents(data.events || []);
        if (data.events && data.events.length > 0) {
          setSelectedEvent(data.events[0]);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [getAccessToken, refreshAccessToken]);

  return (
    <div className="portal-page-container">
      {/* Header Banner */}
      <header className="portal-header-banner">
        <div>
          <span className="eyebrow">Institutional Schedule</span>
          <h1>Academic Calendar & Events Schedule</h1>
          <p>Key academic session dates, lecture commencement, clinical posting periods, and examination schedules.</p>
        </div>
      </header>

      {error && <div className="login-error" role="alert">✕ {error}</div>}

      {/* Countdown Summary Strip */}
      <section className="calendar-countdown-strip">
        <div className="countdown-card">
          <span>Current Session</span>
          <strong>{currentSession?.name || '2025/2026 Session'}</strong>
          <small>Abia State College of Nursing Sciences</small>
        </div>
        <div className="countdown-card highlight">
          <span>Semester Exams Countdown</span>
          <strong className="text-primary">18 Days Remaining</strong>
          <small>Scheduled Starts: June 15, 2026</small>
        </div>
        <div className="countdown-card">
          <span>Registration Closure</span>
          <strong className="text-danger">Feb 28, 2026</strong>
          <small>Course Registration Deadline</small>
        </div>
      </section>

      {loading ? (
        <div className="portal-loading"><p>Loading academic calendar...</p></div>
      ) : (
        <div className="calendar-two-col-layout">
          {/* Left: Events & Key Dates List */}
          <section className="portal-card main-calendar-list-card">
            <div className="portal-card-header">
              <h2>Important Academic Dates & Events</h2>
              <span>{events.length} Scheduled Events</span>
            </div>

            <div className="calendar-events-list">
              {events.map((evt) => {
                const eventDateObj = new Date(evt.eventDate);
                const monthName = eventDateObj.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase();
                const dayNum = eventDateObj.getDate();
                const isSelected = selectedEvent?.id === evt.id;

                return (
                  <div
                    key={evt.id}
                    className={`calendar-event-row ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedEvent(evt)}
                  >
                    <div className="event-date-col">
                      <strong>{monthName}</strong>
                      <b>{dayNum}</b>
                    </div>
                    <div className="event-info-col">
                      <div className="event-tag-line">
                        <span className="matric-badge">{evt.category}</span>
                        {evt.campus && <span className="campus-badge">{evt.campus.code} CAMPUS</span>}
                      </div>
                      <h3>{evt.title}</h3>
                      <p className="event-location-text">📍 {evt.location || 'All Campuses'}</p>
                    </div>
                    <div className="event-action-col">
                      <button type="button" className="admin-btn-sm">
                        {isSelected ? 'Viewing' : 'Details →'}
                      </button>
                    </div>
                  </div>
                );
              })}

              {events.length === 0 && (
                <div className="empty-state">
                  <p>No academic calendar events published for this session yet.</p>
                </div>
              )}
            </div>
          </section>

          {/* Right: Selected Day Detail Panel */}
          {selectedEvent && (
            <aside className="portal-card day-detail-panel">
              <div className="portal-card-header">
                <h3>Event Detail Inspector</h3>
              </div>

              <div className="day-detail-body">
                <span className="status-pill priority-high" style={{ marginBottom: '12px' }}>
                  {selectedEvent.category}
                </span>

                <h2>{selectedEvent.title}</h2>

                <div className="detail-meta-list">
                  <p>
                    📅 <strong>Date:</strong> {new Date(selectedEvent.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  {selectedEvent.startTime && (
                    <p>
                      ⏱ <strong>Timing:</strong> {selectedEvent.startTime} - {selectedEvent.endTime}
                    </p>
                  )}
                  <p>
                    📍 <strong>Venue:</strong> {selectedEvent.location || 'All ABSCONS Campuses'}
                  </p>
                </div>

                <hr />

                <div className="detail-description-box">
                  <h4>Event Overview & Instructions:</h4>
                  <p>{selectedEvent.description || 'Mandatory attendance for all eligible nursing and midwifery students.'}</p>
                </div>
              </div>
            </aside>
          )}
        </div>
      )}
    </div>
  );
}
