import { useEffect, useState } from 'react';
import { ApiClient } from '../auth/ApiClient';
import { useAuth } from '../auth/useAuth';

export default function AdminAcademic() {
  const { permissions, getAccessToken, refreshAccessToken } = useAuth();
  const canManage = permissions?.includes('courses:manage');
  const canManageWindows = permissions?.includes('course_registration_windows:manage');

  const [tab, setTab] = useState('courses'); // 'courses' | 'programmes' | 'campuses' | 'windows'

  const [courses, setCourses] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  // Course modal & form
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseForm, setCourseForm] = useState({
    code: '',
    title: '',
    units: '3',
    level: '100',
    semester: 'first',
    programmeId: '',
    prerequisiteCourseId: '',
    type: 'core',
  });

  // Programme modal & form
  const [showProgModal, setShowProgModal] = useState(false);
  const [progForm, setProgForm] = useState({
    name: '',
    code: '',
    durationYears: '3',
    description: '',
  });

  // Campus modal & form
  const [showCampusModal, setShowCampusModal] = useState(false);
  const [campusForm, setCampusForm] = useState({
    name: '',
    code: '',
    city: '',
    address: '',
  });

  const fetchData = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      ApiClient.get('/admin/academic/courses', {}, getAccessToken, refreshAccessToken),
      ApiClient.get('/admin/academic/programmes', {}, getAccessToken, refreshAccessToken),
      ApiClient.get('/admin/academic/campuses', {}, getAccessToken, refreshAccessToken),
      ApiClient.get('/admin/academic/windows', {}, getAccessToken, refreshAccessToken),
    ])
      .then(([cData, pData, camData, wData]) => {
        setCourses(cData.courses || []);
        setProgrammes(pData.programmes || []);
        setCampuses(camData.campuses || []);
        setSessions(wData.sessions || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    document.title = 'Academic Setup | ABSCONS One';
    Promise.all([
      ApiClient.get('/admin/academic/courses', {}, getAccessToken, refreshAccessToken),
      ApiClient.get('/admin/academic/programmes', {}, getAccessToken, refreshAccessToken),
      ApiClient.get('/admin/academic/campuses', {}, getAccessToken, refreshAccessToken),
      ApiClient.get('/admin/academic/windows', {}, getAccessToken, refreshAccessToken),
    ])
      .then(([cData, pData, camData, wData]) => {
        setCourses(cData.courses || []);
        setProgrammes(pData.programmes || []);
        setCampuses(camData.campuses || []);
        setSessions(wData.sessions || []);
      })
      .catch((err) => setError(err.message));
  }, [getAccessToken, refreshAccessToken]);


  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await ApiClient.post('/admin/academic/courses', courseForm, {}, getAccessToken, refreshAccessToken);
      setNotice('Course created successfully.');
      setShowCourseModal(false);
      setCourseForm({ code: '', title: '', units: '3', level: '100', semester: 'first', programmeId: '', prerequisiteCourseId: '', type: 'core' });
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    try {
      await ApiClient.delete(`/admin/academic/courses/${id}`, {}, getAccessToken, refreshAccessToken);
      setNotice('Course deleted.');
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateProgramme = async (e) => {
    e.preventDefault();
    try {
      await ApiClient.post('/admin/academic/programmes', progForm, {}, getAccessToken, refreshAccessToken);
      setNotice('Programme created.');
      setShowProgModal(false);
      setProgForm({ name: '', code: '', durationYears: '3', description: '' });
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateCampus = async (e) => {
    e.preventDefault();
    try {
      await ApiClient.post('/admin/academic/campuses', campusForm, {}, getAccessToken, refreshAccessToken);
      setNotice('Campus created.');
      setShowCampusModal(false);
      setCampusForm({ name: '', code: '', city: '', address: '' });
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleWindow = async (semester) => {
    try {
      const nextActive = !semester.isActive;
      await ApiClient.patch(`/admin/academic/windows/${semester.id}`, { isActive: nextActive }, {}, getAccessToken, refreshAccessToken);
      setNotice(`Registration window ${nextActive ? 'opened' : 'closed'} for ${semester.name} semester.`);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="admin-academic-module admin-module">
      <header className="admin-module-header">
        <div>
          <span className="eyebrow">Academic Affairs</span>
          <h1>Academic Setup & Curriculum</h1>
          <p>Manage courses, programmes, campuses, and semester registration windows.</p>
        </div>
      </header>

      {error && <div className="login-error" role="alert">{error}</div>}
      {notice && <div className="admin-notice" role="status">{notice}</div>}

      <div className="admin-fee-tabs" role="tablist">
        <button type="button" className={`admin-fee-tab ${tab === 'courses' ? 'active' : ''}`} onClick={() => setTab('courses')}>
          Courses ({courses.length})
        </button>
        <button type="button" className={`admin-fee-tab ${tab === 'programmes' ? 'active' : ''}`} onClick={() => setTab('programmes')}>
          Programmes ({programmes.length})
        </button>
        <button type="button" className={`admin-fee-tab ${tab === 'campuses' ? 'active' : ''}`} onClick={() => setTab('campuses')}>
          Campuses ({campuses.length})
        </button>
        <button type="button" className={`admin-fee-tab ${tab === 'windows' ? 'active' : ''}`} onClick={() => setTab('windows')}>
          Registration Windows
        </button>
      </div>

      {tab === 'courses' && (
        <section className="admin-panel">
          <div className="portal-panel-header">
            <h2>Course Catalog</h2>
            {canManage && (
              <button type="button" className="admin-btn-primary" onClick={() => setShowCourseModal(true)}>
                + Add New Course
              </button>
            )}
          </div>
          <div className="admin-table-container">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Course Title</th>
                  <th>Units</th>
                  <th>Level & Semester</th>
                  <th>Programme</th>
                  <th>Prerequisite</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c.id}>
                    <td><strong>{c.code}</strong></td>
                    <td>{c.title}</td>
                    <td>{c.units} Units</td>
                    <td>{c.level}L · {c.semester}</td>
                    <td>{c.programme?.name || 'All'}</td>
                    <td>{c.prerequisite?.code || 'None'}</td>
                    <td>
                      {canManage && (
                        <button type="button" className="admin-btn-sm text-danger" onClick={() => handleDeleteCourse(c.id)}>
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {!loading && courses.length === 0 && (
                  <tr><td colSpan="7" className="admin-empty-table">No courses configured yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === 'programmes' && (
        <section className="admin-panel">
          <div className="portal-panel-header">
            <h2>Accredited Programmes</h2>
            {canManage && (
              <button type="button" className="admin-btn-primary" onClick={() => setShowProgModal(true)}>
                + Add Programme
              </button>
            )}
          </div>
          <div className="admin-grid-cards">
            {programmes.map((p) => (
              <article key={p.id} className="admin-feature-card">
                <span className="matric-badge">{p.code}</span>
                <h3>{p.name}</h3>
                <p>{p.description || 'Professional nursing/midwifery training.'}</p>
                <small>Duration: {p.durationYears} Years · {p.courses?.length || 0} Courses</small>
              </article>
            ))}
          </div>
        </section>
      )}

      {tab === 'campuses' && (
        <section className="admin-panel">
          <div className="portal-panel-header">
            <h2>Collegiate Campuses</h2>
            {canManage && (
              <button type="button" className="admin-btn-primary" onClick={() => setShowCampusModal(true)}>
                + Add Campus
              </button>
            )}
          </div>
          <div className="admin-grid-cards">
            {campuses.map((cam) => (
              <article key={cam.id} className="admin-feature-card">
                <span className="matric-badge">{cam.code}</span>
                <h3>{cam.name}</h3>
                <p>{cam.address}</p>
                <small>City: {cam.city}</small>
              </article>
            ))}
          </div>
        </section>
      )}

      {tab === 'windows' && (
        <section className="admin-panel">
          <div className="portal-panel-header">
            <h2>Course Registration Windows</h2>
            <span>Enable/disable online portal course registration per semester</span>
          </div>
          <div className="admin-windows-list">
            {sessions.map((sess) => (
              <div key={sess.id} className="admin-session-window-box">
                <h3>Academic Session {sess.name} {sess.isCurrent ? '(Current)' : ''}</h3>
                <div className="window-semesters-row">
                  {sess.semesters?.map((sem) => (
                    <div key={sem.id} className={`window-sem-card ${sem.isActive ? 'active' : 'closed'}`}>
                      <div>
                        <b>{sem.name.toUpperCase()} SEMESTER</b>
                        <p>Status: <strong className={sem.isActive ? 'text-success' : 'text-danger'}>{sem.isActive ? 'OPEN' : 'CLOSED'}</strong></p>
                      </div>
                      {canManageWindows && (
                        <button
                          type="button"
                          className={`admin-btn-sm ${sem.isActive ? 'admin-btn-secondary' : 'admin-btn-primary'}`}
                          onClick={() => handleToggleWindow(sem)}
                        >
                          {sem.isActive ? 'Close Registration' : 'Open Registration'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Course Modal */}
      {showCourseModal && (
        <div className="admin-modal-overlay" role="dialog">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h2>Add New Course</h2>
              <button type="button" className="admin-modal-close" onClick={() => setShowCourseModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateCourse}>
              <div className="admin-modal-body">
                <div className="admin-form-grid">
                  <label>
                    Course Code *
                    <input value={courseForm.code} onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })} placeholder="e.g. NUR201" required />
                  </label>
                  <label>
                    Course Title *
                    <input value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} placeholder="e.g. Pharmacology in Nursing" required />
                  </label>
                  <label>
                    Units
                    <input type="number" min="1" max="6" value={courseForm.units} onChange={(e) => setCourseForm({ ...courseForm, units: e.target.value })} required />
                  </label>
                  <label>
                    Programme *
                    <select value={courseForm.programmeId} onChange={(e) => setCourseForm({ ...courseForm, programmeId: e.target.value })} required>
                      <option value="">Select Programme</option>
                      {programmes.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </label>
                  <label>
                    Level
                    <select value={courseForm.level} onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}>
                      <option value="100">100 Level</option>
                      <option value="200">200 Level</option>
                      <option value="300">300 Level</option>
                    </select>
                  </label>
                  <label>
                    Semester
                    <select value={courseForm.semester} onChange={(e) => setCourseForm({ ...courseForm, semester: e.target.value })}>
                      <option value="first">First Semester</option>
                      <option value="second">Second Semester</option>
                    </select>
                  </label>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn-secondary" onClick={() => setShowCourseModal(false)}>Cancel</button>
                <button type="submit" className="login-submit">Create Course</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Programme Modal */}
      {showProgModal && (
        <div className="admin-modal-overlay" role="dialog">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h2>Add Programme</h2>
              <button type="button" className="admin-modal-close" onClick={() => setShowProgModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateProgramme}>
              <div className="admin-modal-body">
                <div className="admin-form-grid">
                  <label>
                    Programme Name *
                    <input value={progForm.name} onChange={(e) => setProgForm({ ...progForm, name: e.target.value })} placeholder="e.g. Post-Basic Nursing" required />
                  </label>
                  <label>
                    Programme Code *
                    <input value={progForm.code} onChange={(e) => setProgForm({ ...progForm, code: e.target.value })} placeholder="e.g. PBNUR" required />
                  </label>
                  <label>
                    Duration (Years)
                    <input type="number" min="1" max="5" value={progForm.durationYears} onChange={(e) => setProgForm({ ...progForm, durationYears: e.target.value })} required />
                  </label>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn-secondary" onClick={() => setShowProgModal(false)}>Cancel</button>
                <button type="submit" className="login-submit">Save Programme</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Campus Modal */}
      {showCampusModal && (
        <div className="admin-modal-overlay" role="dialog">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h2>Add Campus</h2>
              <button type="button" className="admin-modal-close" onClick={() => setShowCampusModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateCampus}>
              <div className="admin-modal-body">
                <div className="admin-form-grid">
                  <label>
                    Campus Name *
                    <input value={campusForm.name} onChange={(e) => setCampusForm({ ...campusForm, name: e.target.value })} placeholder="e.g. Abiriba Campus" required />
                  </label>
                  <label>
                    Campus Code *
                    <input value={campusForm.code} onChange={(e) => setCampusForm({ ...campusForm, code: e.target.value })} placeholder="e.g. ABI" required />
                  </label>
                  <label>
                    City *
                    <input value={campusForm.city} onChange={(e) => setCampusForm({ ...campusForm, city: e.target.value })} placeholder="e.g. Abiriba" required />
                  </label>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn-secondary" onClick={() => setShowCampusModal(false)}>Cancel</button>
                <button type="submit" className="login-submit">Save Campus</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
