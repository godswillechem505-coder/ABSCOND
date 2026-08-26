import { useEffect, useState } from 'react';
import { ApiClient } from '../auth/ApiClient';
import { useAuth } from '../auth/useAuth';

const CATEGORY_CARDS = [
  { title: 'Academic Handbooks', category: 'Academic', icon: '📚', count: 'Curriculum & Rules' },
  { title: 'Clinical Logbooks', category: 'Clinical', icon: '🩺', count: 'Posting Logsheets' },
  { title: 'Bursary & Fee Forms', category: 'Bursary', icon: '💳', count: 'Payment Tellers' },
  { title: 'General Guidelines', category: 'General', icon: '📄', count: 'Student Regulations' },
];

export default function StudentDownloadsPage() {
  const { getAccessToken, refreshAccessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [downloads, setDownloads] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    document.title = 'Download Library | ABSCONS Student Portal';
    ApiClient.get('/students/downloads', {}, getAccessToken, refreshAccessToken)
      .then((data) => {
        setDownloads(data.downloads || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [getAccessToken, refreshAccessToken]);

  const filteredDownloads = downloads.filter((d) => {
    const matchCat = selectedCategory === 'All' || d.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchSearch =
      search.trim() === '' ||
      `${d.title} ${d.description} ${d.fileName}`.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="portal-page-container">
      {/* Header Banner */}
      <header className="portal-header-banner">
        <div>
          <span className="eyebrow">Document Repository</span>
          <h1>Document & Resource Library</h1>
          <p>Download official academic handbooks, clinical logbooks, exam schedules, and institutional forms.</p>
        </div>
      </header>

      {error && <div className="login-error" role="alert">✕ {error}</div>}

      {/* Category Summary Cards */}
      <section className="admin-fee-stats-grid" style={{ marginBottom: '24px' }}>
        {CATEGORY_CARDS.map((cat) => (
          <div
            key={cat.category}
            className={`admin-fee-stat-card ${selectedCategory === cat.category ? 'billed' : ''}`}
            style={{ cursor: 'pointer' }}
            onClick={() => setSelectedCategory(selectedCategory === cat.category ? 'All' : cat.category)}
          >
            <span>{cat.icon} {cat.title}</span>
            <b>{cat.category}</b>
            <small>{cat.count}</small>
          </div>
        ))}
      </section>

      {/* Filter & Search Bar */}
      <div className="announcements-filter-bar">
        <div className="category-chips-row">
          {['All', 'Academic', 'Clinical', 'Bursary', 'General'].map((c) => (
            <button
              type="button"
              key={c}
              className={`filter-chip ${selectedCategory === c ? 'active' : ''}`}
              onClick={() => setSelectedCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="announcements-search-box">
          <input
            type="search"
            placeholder="Search documents by title or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="portal-loading"><p>Loading document library...</p></div>
      ) : (
        <section className="portal-card" style={{ marginTop: '20px' }}>
          <div className="admin-table-container">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Document Title</th>
                  <th>Category</th>
                  <th>Session / File Info</th>
                  <th>Uploaded Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDownloads.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <strong>📄 {doc.title}</strong>
                      <span className="admin-table-subtext">{doc.description}</span>
                    </td>
                    <td><span className="matric-badge">{doc.category}</span></td>
                    <td>
                      <small>{doc.fileName || 'PDF Document'} ({doc.fileSize || '1.2 MB'})</small>
                    </td>
                    <td><small>{new Date(doc.createdAt).toLocaleDateString('en-GB')}</small></td>
                    <td>
                      <a
                        href={doc.fileUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="admin-btn-primary"
                        style={{ display: 'inline-block', fontSize: '12px', padding: '6px 12px', textDecoration: 'none' }}
                      >
                        ⬇ Download File
                      </a>
                    </td>
                  </tr>
                ))}
                {filteredDownloads.length === 0 && (
                  <tr>
                    <td colSpan="5" className="admin-empty-table">
                      No document files found in this category.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
