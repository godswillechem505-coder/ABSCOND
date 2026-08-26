import { useEffect, useState } from 'react';
import { ApiClient } from '../auth/ApiClient';
import heroCampus from '../assets/hero-campus.jpg';


const FALLBACK_ANNOUNCEMENTS = [
  {
    id: 1,
    title: '2025/2026 Academic Session Course Registration Notice',
    category: 'Academic',
    priority: 'urgent',
    isPinned: true,
    publishedAt: '2026-02-01T08:00:00Z',
    excerpt: 'Second semester course registration window closes promptly at 11:59 PM on February 28, 2026.',
    body: 'All returning and fresh students are reminded that online course registration for the second semester closes promptly at 11:59 PM on February 28, 2026. Ensure all fees are cleared with the Bursary department before submitting your course registration form.',
  },
  {
    id: 2,
    title: 'Clinical Training Uniform & Equipment Guidelines',
    category: 'Clinical',
    priority: 'high',
    isPinned: false,
    publishedAt: '2026-02-10T10:00:00Z',
    excerpt: 'Mandatory clinical uniform guidelines for all nursing & midwifery students during hospital rounds.',
    body: 'The Clinical Training Unit wishes to notify all Year 1 & 2 students regarding strict adherence to the prescribed clinical uniform and identification badges during hospital ward rounds at FMC Umuahia and ABSUTH Aba.',
  },
  {
    id: 3,
    title: 'Bursary Notice: Second Semester Fee Reconciliation Deadline',
    category: 'Bursary',
    priority: 'medium',
    isPinned: false,
    publishedAt: '2026-01-25T09:00:00Z',
    excerpt: 'Students with outstanding manual bank transfer receipts are requested to present tellers for verification.',
    body: 'The College Bursary Department advises all students with manual fee deposits or bank draft payments to bring original bank tellers to the Bursary office for portal reconciliation before semester examinations.',
  },
  {
    id: 4,
    title: 'Upcoming National Midwifery Licensing Examination',
    category: 'Academic',
    priority: 'high',
    isPinned: false,
    publishedAt: '2026-01-15T12:00:00Z',
    excerpt: 'NMCN Final Qualifying Examination briefing date announced for graduating students.',
    body: 'The Directorate of Academic Affairs announces a mandatory briefing session for all candidates sitting for the upcoming March NMCN Professional Licensing Examinations across all campuses.',
  },
];

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState(FALLBACK_ANNOUNCEMENTS);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedAnn, setSelectedAnn] = useState(null);

  useEffect(() => {
    document.title = 'News & Announcements | ABSCONS One';
    ApiClient.get('/reference/announcements', {})
      .then((data) => {
        if (data.announcements && data.announcements.length > 0) {
          setAnnouncements(data.announcements);
        }
      })
      .catch(() => {});
  }, []);

  const categories = ['All', 'Academic', 'Clinical', 'Bursary', 'General'];

  const filtered = announcements.filter((a) => {
    const matchCategory = selectedCategory === 'All' || a.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchSearch =
      search.trim() === '' ||
      `${a.title} ${a.body} ${a.excerpt}`.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const pinnedItems = filtered.filter((a) => a.isPinned);
  const regularItems = filtered.filter((a) => !a.isPinned);

  return (
    <div className="public-page-wrapper">
      {/* Hero */}
      <section
        className="inner-page-hero"
        style={{ '--hero-image': `url("${heroCampus}")` }}
      >
        <div className="inner-page-hero-content">
          <p className="hero-kicker">Collegiate Dispatches</p>
          <h2>News & Campus Announcements</h2>
          <p>
            Official circulars, academic notices, clinical schedules, and administrative updates across all ABSCONS campuses.
          </p>
        </div>
      </section>

      <div className="inner-page-container">
        {/* Search & Category Filter Bar */}
        <section className="announcements-filter-bar">
          <div className="category-chips-row">
            {categories.map((cat) => (
              <button
                type="button"
                key={cat}
                className={`filter-chip ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="announcements-search-box">
            <input
              type="search"
              placeholder="Search circulars and notices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </section>

        {/* Pinned Urgent Announcements */}
        {pinnedItems.length > 0 && (
          <section className="pinned-announcements-section">
            <div className="pinned-banner-header">
              <span className="pinned-indicator">📌 PINNED OFFICIAL NOTICES</span>
            </div>
            <div className="pinned-cards-grid">
              {pinnedItems.map((item) => (
                <article key={item.id} className="pinned-notice-card" onClick={() => setSelectedAnn(item)}>
                  <div className="pinned-card-top">
                    <span className={`priority-tag ${item.priority}`}>{item.priority?.toUpperCase()} PRIORITY</span>
                    <span className="notice-category">{item.category}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.excerpt || item.body?.slice(0, 140)}...</p>
                  <div className="pinned-card-footer">
                    <small>📅 {new Date(item.publishedAt || item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</small>
                    <span className="read-more-link">Read full circular →</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Regular Announcements Feed */}
        <section className="announcements-feed-section">
          <div className="feed-header">
            <h3>Recent Notices ({regularItems.length})</h3>
          </div>

          <div className="announcements-list">
            {regularItems.map((item) => (
              <article
                key={item.id}
                className="announcement-list-item"
                onClick={() => setSelectedAnn(item)}
              >
                <div className="announcement-date-col">
                  <strong>{new Date(item.publishedAt || item.createdAt).toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()}</strong>
                  <b>{new Date(item.publishedAt || item.createdAt).getDate()}</b>
                </div>
                <div className="announcement-content-col">
                  <div className="announcement-tags">
                    <span className="matric-badge">{item.category}</span>
                    {item.priority === 'urgent' && <span className="status-pill priority-urgent">URGENT</span>}
                  </div>
                  <h4>{item.title}</h4>
                  <p>{item.excerpt || item.body?.slice(0, 160)}...</p>
                </div>
                <div className="announcement-action-col">
                  <button type="button" className="btn-read-ann">
                    Read →
                  </button>
                </div>
              </article>
            ))}

            {filtered.length === 0 && (
              <div className="empty-state">
                <p>No circulars or announcements found matching your criteria.</p>
              </div>
            )}
          </div>
        </section>

        {/* Modal: Full Announcement Reader */}
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
    </div>
  );
}
