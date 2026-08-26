import { useEffect, useState } from 'react';
import { ApiClient } from '../auth/ApiClient';
import { useAuth } from '../auth/useAuth';

export default function AdminContent() {
  const { permissions, getAccessToken, refreshAccessToken } = useAuth();
  const canManage = permissions?.includes('content:manage');

  const [tab, setTab] = useState('announcements'); // 'announcements' | 'events'
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  // Announcement modal
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [annForm, setAnnForm] = useState({
    title: '',
    body: '',
    category: 'Academic',
    priority: 'medium',
    isPinned: false,
    targetAudience: 'all',
    status: 'published',
  });

  // Event modal
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    location: '',
    campusId: '',
    eventDate: new Date().toISOString().slice(0, 10),
    startTime: '10:00 AM',
    endTime: '02:00 PM',
    category: 'Academic',
    isFeatured: false,
    status: 'published',
  });

  const loadData = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      ApiClient.get('/admin/content/announcements', {}, getAccessToken, refreshAccessToken),
      ApiClient.get('/admin/content/events', {}, getAccessToken, refreshAccessToken),
      ApiClient.get('/admin/academic/campuses', {}, getAccessToken, refreshAccessToken),
    ])
      .then(([aData, eData, cData]) => {
        setAnnouncements(aData.announcements || []);
        setEvents(eData.events || []);
        setCampuses(cData.campuses || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    document.title = 'Announcements & Events | ABSCONS One';
    Promise.all([
      ApiClient.get('/admin/content/announcements', {}, getAccessToken, refreshAccessToken),
      ApiClient.get('/admin/content/events', {}, getAccessToken, refreshAccessToken),
      ApiClient.get('/admin/academic/campuses', {}, getAccessToken, refreshAccessToken),
    ])
      .then(([aData, eData, cData]) => {
        setAnnouncements(aData.announcements || []);
        setEvents(eData.events || []);
        setCampuses(cData.campuses || []);
      })
      .catch((err) => setError(err.message));
  }, [getAccessToken, refreshAccessToken]);


  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await ApiClient.post('/admin/content/announcements', annForm, {}, getAccessToken, refreshAccessToken);
      setNotice('Announcement published.');
      setShowAnnModal(false);
      setAnnForm({ title: '', body: '', category: 'Academic', priority: 'medium', isPinned: false, targetAudience: 'all', status: 'published' });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Delete announcement?')) return;
    try {
      await ApiClient.delete(`/admin/content/announcements/${id}`, {}, getAccessToken, refreshAccessToken);
      setNotice('Announcement deleted.');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await ApiClient.post('/admin/content/events', eventForm, {}, getAccessToken, refreshAccessToken);
      setNotice('Event created.');
      setShowEventModal(false);
      setEventForm({ title: '', description: '', location: '', campusId: '', eventDate: new Date().toISOString().slice(0, 10), startTime: '10:00 AM', endTime: '02:00 PM', category: 'Academic', isFeatured: false, status: 'published' });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Delete event?')) return;
    try {
      await ApiClient.delete(`/admin/content/events/${id}`, {}, getAccessToken, refreshAccessToken);
      setNotice('Event removed.');
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="admin-content-module admin-module">
      <header className="admin-module-header">
        <div>
          <span className="eyebrow">Institutional Communications</span>
          <h1>Announcements & Events Management</h1>
          <p>Publish campus notices, calendar events, circulars, and institutional highlights.</p>
        </div>
      </header>

      {error && <div className="login-error" role="alert">{error}</div>}
      {notice && <div className="admin-notice" role="status">{notice}</div>}

      <div className="admin-fee-tabs" role="tablist">
        <button type="button" className={`admin-fee-tab ${tab === 'announcements' ? 'active' : ''}`} onClick={() => setTab('announcements')}>
          Announcements ({announcements.length})
        </button>
        <button type="button" className={`admin-fee-tab ${tab === 'events' ? 'active' : ''}`} onClick={() => setTab('events')}>
          Public Events ({events.length})
        </button>
      </div>

      {tab === 'announcements' && (
        <section className="admin-panel">
          <div className="portal-panel-header">
            <h2>Campus Announcements</h2>
            {canManage && (
              <button type="button" className="admin-btn-primary" onClick={() => setShowAnnModal(true)}>
                + Create Announcement
              </button>
            )}
          </div>
          <div className="admin-table-container">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Title & Excerpt</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Audience</th>
                  <th>Pinned</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {announcements.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <strong>{a.title}</strong>
                      <small className="admin-table-subtext">{a.excerpt || a.body?.slice(0, 80)}...</small>
                    </td>
                    <td>{a.category}</td>
                    <td>
                      <span className={`status-pill priority-${a.priority}`}>{a.priority}</span>
                    </td>
                    <td>{a.targetAudience}</td>
                    <td>{a.isPinned ? '📌 Pinned' : 'No'}</td>
                    <td><span className={`status-pill ${a.status}`}>{a.status}</span></td>
                    <td>
                      {canManage && (
                        <button type="button" className="admin-btn-sm text-danger" onClick={() => handleDeleteAnnouncement(a.id)}>
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {!loading && announcements.length === 0 && (
                  <tr><td colSpan="7" className="admin-empty-table">No announcements created yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === 'events' && (
        <section className="admin-panel">
          <div className="portal-panel-header">
            <h2>Institution Events</h2>
            {canManage && (
              <button type="button" className="admin-btn-primary" onClick={() => setShowEventModal(true)}>
                + Add Event
              </button>
            )}
          </div>
          <div className="admin-grid-cards">
            {events.map((e) => (
              <article key={e.id} className="admin-feature-card">
                <span className="matric-badge">{e.category}</span>
                <h3>{e.title}</h3>
                <p>{e.description}</p>
                <small>📅 {e.eventDate} · {e.startTime} - {e.endTime}</small>
                <small>📍 {e.location}</small>
                {canManage && (
                  <footer style={{ marginTop: '12px' }}>
                    <button type="button" className="admin-btn-sm text-danger" onClick={() => handleDeleteEvent(e.id)}>
                      Remove Event
                    </button>
                  </footer>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Announcement Modal */}
      {showAnnModal && (
        <div className="admin-modal-overlay" role="dialog">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h2>Create Announcement</h2>
              <button type="button" className="admin-modal-close" onClick={() => setShowAnnModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateAnnouncement}>
              <div className="admin-modal-body">
                <div className="admin-form-grid">
                  <label className="span-full">
                    Title *
                    <input value={annForm.title} onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })} required />
                  </label>
                  <label>
                    Category
                    <select value={annForm.category} onChange={(e) => setAnnForm({ ...annForm, category: e.target.value })}>
                      <option value="Academic">Academic</option>
                      <option value="Clinical">Clinical</option>
                      <option value="Bursary">Bursary</option>
                      <option value="General">General</option>
                    </select>
                  </label>
                  <label>
                    Priority
                    <select value={annForm.priority} onChange={(e) => setAnnForm({ ...annForm, priority: e.target.value })}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </label>
                  <label>
                    Target Audience
                    <select value={annForm.targetAudience} onChange={(e) => setAnnForm({ ...annForm, targetAudience: e.target.value })}>
                      <option value="all">All</option>
                      <option value="students">Students Only</option>
                      <option value="staff">Staff Only</option>
                    </select>
                  </label>
                  <label>
                    Pin to Top
                    <select value={String(annForm.isPinned)} onChange={(e) => setAnnForm({ ...annForm, isPinned: e.target.value === 'true' })}>
                      <option value="false">No</option>
                      <option value="true">Yes (Pinned)</option>
                    </select>
                  </label>
                  <label className="span-full">
                    Full Announcement Text *
                    <textarea rows="5" value={annForm.body} onChange={(e) => setAnnForm({ ...annForm, body: e.target.value })} required />
                  </label>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn-secondary" onClick={() => setShowAnnModal(false)}>Cancel</button>
                <button type="submit" className="login-submit">Publish Notice</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Modal */}
      {showEventModal && (
        <div className="admin-modal-overlay" role="dialog">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h2>Add Public Event</h2>
              <button type="button" className="admin-modal-close" onClick={() => setShowEventModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateEvent}>
              <div className="admin-modal-body">
                <div className="admin-form-grid">
                  <label className="span-full">
                    Event Title *
                    <input value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} required />
                  </label>
                  <label>
                    Event Date *
                    <input type="date" value={eventForm.eventDate} onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })} required />
                  </label>
                  <label>
                    Location / Venue *
                    <input value={eventForm.location} onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })} placeholder="e.g. Main Auditorium, Aba" required />
                  </label>
                  <label>
                    Campus
                    <select value={eventForm.campusId} onChange={(e) => setEventForm({ ...eventForm, campusId: e.target.value })}>
                      <option value="">All Campuses</option>
                      {campuses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </label>
                  <label>
                    Category
                    <input value={eventForm.category} onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })} placeholder="e.g. Ceremony" />
                  </label>
                  <label className="span-full">
                    Description *
                    <textarea rows="4" value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} required />
                  </label>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn-secondary" onClick={() => setShowEventModal(false)}>Cancel</button>
                <button type="submit" className="login-submit">Save Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
