import { useEffect, useState } from 'react';
import { ApiClient } from '../auth/ApiClient';
import { useAuth } from '../auth/useAuth';

export default function StudentAnnouncementsPage() {
  const { getAccessToken, refreshAccessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [announcements, setAnnouncements] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [readIds, setReadIds] = useState(new Set());
  const [search, setSearch] = useState('');
  const [selectedAnn, setSelectedAnn] = useState(null);

  useEffect(() => {
    document.title = 'Announcements | ABSCONS Student Portal';
    ApiClient.get('/students/announcements', {}, getAccessToken, refreshAccessToken)
      .then((data) => {
        setAnnouncements(data.announcements || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [getAccessToken, refreshAccessToken]);

  const markAsRead = (id) => {
    setReadIds((prev) => new Set(prev).add(id));
  };

  const markAllRead = () => {
    const all = new Set(announcements.map((a) => a.id));
    setReadIds(all);
  };

  const filteredAnnouncements = announcements.filter((a) => {
    const isRead = readIds.has(a.id);
    if (activeTab === 'unread' && isRead) return false;
    if (activeTab === 'read' && !isRead) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        a.title?.toLowerCase().includes(q) ||
        a.body?.toLowerCase().includes(q) ||
        a.category?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pinnedItems = announcements.filter((a) => a.isPinned);

  return (
    <div className="portal-page-container">
      {/* Header Banner */}
      <header className="portal-header-banner">
        <div>
          <span className="eyebrow">Student Circulars</span>
          <h1>Announcements & Dispatches</h1>
          <p>Official notices from the College Management, Bursary, Registry, and Academic Affairs.</p>
        </div>
        <div className="portal-header-actions">
          <button type="button" className="admin-btn-secondary" onClick={markAllRead}>
            ✓ Mark All as Read
          </button>
        </div>
      </header>

      {error && <div className="login-error" role="alert">✕ {error}</div>}

      {/* Pinned Announcement Banner */}
      {pinnedItems.length > 0 && (
        <section className="pinned-announcements-section" style={{ marginBottom: '24px' }}>
          <div className="pinned-banner-header">
            <span className="pinned-indicator">📌 URGENT PINNED ANNOUNCEMENTS</span>
          </div>
          <div className="pinned-cards-grid">
            {pinnedItems.map((item) => (
              <article
                key={item.id}
                className="pinned-notice-card"
                onClick={() => {
                  markAsRead(item.id);
                  setSelectedAnn(item);
                }}
              >
                <div className="pinned-card-top">
                  <span className={`priority-tag ${item.priority}`}>{item.priority?.toUpperCase()} PRIORITY</span>
                  <span className="notice-category">{item.category}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.excerpt || item.body?.slice(0, 130)}...</p>
                <div className="pinned-card-footer">
                  <small>📅 {new Date(item.publishedAt || item.createdAt).toLocaleDateString('en-GB')}</small>
                  <span className="read-more-link">Read →</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Filter Tabs & Search Row */}
      <div className="announcements-filter-bar">
        <div className="admin-fee-tabs" style={{ marginBottom: 0 }}>
          <button
            type="button"
            className={`admin-fee-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Circulars ({announcements.length})
          </button>
          <button
            type="button"
            className={`admin-fee-tab ${activeTab === 'unread' ? 'active' : ''}`}
            onClick={() => setActiveTab('unread')}
          >
            Unread ({announcements.filter((a) => !readIds.has(a.id)).length})
          </button>
          <button
            type="button"
            className={`admin-fee-tab ${activeTab === 'read' ? 'active' : ''}`}
            onClick={() => setActiveTab('read')}
          >
            Read ({readIds.size})
          </button>
        </div>

        <div className="announcements-search-box">
          <input
            type="search"
            placeholder="Search announcements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="portal-loading"><p>Loading announcements...</p></div>
      ) : (
        <section className="portal-card" style={{ marginTop: '20px' }}>
          <div className="announcements-list">
            {filteredAnnouncements.map((item) => {
              const isRead = readIds.has(item.id);

              return (
                <article
                  key={item.id}
                  className={`announcement-list-item ${isRead ? 'read-item' : 'unread-item'}`}
                  onClick={() => {
                    markAsRead(item.id);
                    setSelectedAnn(item);
                  }}
                >
                  <div className="announcement-date-col">
                    <strong>{new Date(item.publishedAt || item.createdAt).toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()}</strong>
                    <b>{new Date(item.publishedAt || item.createdAt).getDate()}</b>
                  </div>
                  <div className="announcement-content-col">
                    <div className="announcement-tags">
                      <span className="matric-badge">{item.category}</span>
                      {!isRead && <span className="status-pill pending">NEW</span>}
                    </div>
                    <h4>{item.title}</h4>
                    <p>{item.excerpt || item.body?.slice(0, 160)}...</p>
                  </div>
                  <div className="announcement-action-col">
                    <button type="button" className="btn-read-ann">
                      Read Circular →
                    </button>
                  </div>
                </article>
              );
            })}

            {filteredAnnouncements.length === 0 && (
              <div className="empty-state">
                <p>No circulars found in this view.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Reader Modal */}
      {selectedAnn && (
        <div className="admin-modal-overlay" role="dialog" onClick={() => setSelectedAnn(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <span className="matric-badge">{selectedAnn.category}</span>
                <small style={{ marginLeft: '8px', color: '#64748b' }}>
                  {new Date(selectedAnn.publishedAt || selectedAnn.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </small>
              </div>
              <button type="button" className="admin-modal-close" onClick={() => setSelectedAnn(null)}>✕</button>
            </div>
            <div className="admin-modal-body">
              <h2 style={{ fontSize: '20px', color: '#0f172a', marginBottom: '16px' }}>{selectedAnn.title}</h2>
              <div style={{ color: '#334155', lineHeight: '1.7', whiteSpace: 'pre-wrap', fontSize: '15px' }}>
                {selectedAnn.body}
              </div>
            </div>
            <div className="admin-modal-footer">
              <button type="button" className="admin-btn-secondary" onClick={() => setSelectedAnn(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
