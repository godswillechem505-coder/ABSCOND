import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { ApiClient } from "../auth/ApiClient";
import { siteConfig } from "../data/homeData";
import campusBanner from "../assets/hero-campus.jpg";
import NotificationDropdown from "../components/NotificationDropdown";


const portalNavItems = [
  { label: "Dashboard", to: "/portal", end: true },
  { label: "My Profile", to: "/portal/profile" },
  { label: "Course Registration", to: "/portal/course-registration" },
  { label: "Results", to: "/portal/results" },
  { label: "Fees & Payments", to: "/portal/fees" },
  { label: "Academic Calendar", to: "/portal/calendar" },
  { label: "Announcements", to: "/portal/announcements" },
  { label: "Downloads", to: "/portal/downloads" },
  { label: "Settings", to: "/portal/settings" },
];

export function PortalLayout() {
  const navigate = useNavigate();
  const { user, logout, getAccessToken, refreshAccessToken } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const studentName = useMemo(() => {
    if (user?.student) {
      return `${user.student.firstName} ${user.student.lastName}`;
    }
    return "Student";
  }, [user]);

  const matricNumber = useMemo(() => {
    return user?.student?.matricNumber || "ABSCONS/2025/001";
  }, [user]);

  const handleLogout = async () => {
    try {
      await ApiClient.post("/auth/logout", {}, {}, getAccessToken, refreshAccessToken);
    } catch {
      // Logout anyway even if API call fails
    }
    logout();
    navigate("/", { replace: true });
  };

  return (
    <>
      <a href="#portal-main" className="skip-to-content">
        Skip to portal content
      </a>
      <div className={`portal-shell ${sidebarOpen ? "sidebar-open" : ""}`}>
        {/* Mobile backdrop overlay */}
        {sidebarOpen && (
          <div
            className="portal-sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        <aside className="portal-sidebar" aria-label="Student portal navigation">
          <Link to="/" className="portal-brand">
            <img src={siteConfig.logo} alt="Abia State Coat of Arms" />
            <span>
              <b>{siteConfig.brandName}</b>
              <small>Student Portal</small>
            </span>
          </Link>

          <nav className="portal-nav" aria-label="Student portal main menu">
            {portalNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `portal-nav-link ${isActive ? "active" : ""}`
                }
              >
                <span aria-hidden="true" className="portal-nav-dot" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="portal-help-card">
            <b>Need Help?</b>
            <span>Student Affairs</span>
            <a href="mailto:students@abscons.edu.ng">students@abscons.edu.ng</a>
          </div>
        </aside>

        <div className="portal-workspace">
          <header className="portal-topbar" role="banner">
            <button
              className="portal-menu-button"
              type="button"
              onClick={() => setSidebarOpen((isOpen) => !isOpen)}
              aria-label="Toggle portal navigation sidebar"
              aria-expanded={sidebarOpen}
            >
              <span />
              <span />
              <span />
            </button>

            <div className="portal-topbar-title">
              <b>{studentName}</b>
              <span>{matricNumber}</span>
            </div>

            <div className="portal-topbar-actions">
              <NotificationDropdown />
              <button type="button" aria-label="1 unread message">
                <span aria-hidden="true">?</span>
                <b>1</b>
              </button>
              <button type="button" className="portal-logout" onClick={handleLogout}>
                Logout
              </button>
            </div>

          </header>

          <main id="portal-main" className="portal-main" tabIndex="-1">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}

export function PortalDashboard() {
  const { user } = useAuth();

  useEffect(() => {
    document.title = "Dashboard | ABSCONS One";
  }, []);

  const student = useMemo(() => {
    return {
      name:
        user?.student && `${user.student.firstName} ${user.student.lastName}`.trim(),
      matricNumber: user?.student?.matricNumber,
      programme: user?.student?.programme?.name,
      campus: user?.student?.campus?.name,
      level: user?.student?.level,
    };
  }, [user]);

  const stats = [
    { label: "Current GPA", value: "4.52" },
    { label: "Current Level", value: student.level || "100" },
    { label: "Outstanding Fees", value: "NGN 42,000" },
    { label: "Next Class", value: "NUR102" },
  ];

  const quickActions = [
    { label: "Register Courses", to: "/portal/course-registration" },
    { label: "View Results", to: "/portal/results" },
    { label: "Pay Fees", to: "/portal/fees" },
    { label: "Downloads", to: "/portal/downloads" },
  ];

  return (
    <div className="portal-dashboard">
      <section className="portal-welcome">
        <div>
          <span className="eyebrow">Welcome back</span>
          <h1>{student.name || "Student"}</h1>
          <p>
            {student.programme || "Programme"} | {student.campus || "Campus"} |{" "}
            {student.level || "Level"}
          </p>
        </div>
        <span className="portal-status-badge">Active</span>
      </section>

      <section
        className="portal-campus-banner"
        style={{ backgroundImage: `url(${campusBanner})` }}
        aria-label="Campus banner"
      />

      <section className="portal-stat-grid" aria-label="Student summary">
        {stats.map((stat) => (
          <article className="portal-stat-card" key={stat.label}>
            <span>{stat.label}</span>
            <b>{stat.value}</b>
          </article>
        ))}
      </section>

      <section className="portal-action-grid" aria-label="Quick actions">
        {quickActions.map((action) => (
          <Link className="portal-action-card" to={action.to} key={action.to}>
            {action.label}
            <span aria-hidden="true">-&gt;</span>
          </Link>
        ))}
      </section>

      <section className="portal-panel-grid">
        <article className="portal-panel">
          <div className="portal-panel-header">
            <h2>Announcements</h2>
            <Link to="/portal/announcements">View all</Link>
          </div>
          <ul className="portal-list">
            <li>Course registration window closes 28 February 2026</li>
            <li>Clinical posting briefing holds on Monday</li>
            <li>Second semester lectures continue this week</li>
          </ul>
        </article>

        <article className="portal-panel">
          <div className="portal-panel-header">
            <h2>Upcoming Schedule</h2>
            <Link to="/portal/calendar">Calendar</Link>
          </div>
          <ul className="portal-list">
            <li>NUR102 | 10:00 AM | Skills Lab</li>
            <li>Clinical Posting | 8:00 AM | ABSUTH Ward B</li>
            <li>Continuous Assessment | Friday | Main Hall</li>
          </ul>
        </article>

        <article className="portal-panel clinical">
          <span className="eyebrow">Current Clinical Posting</span>
          <h2>ABSUTH Ward B</h2>
          <p>Supervisor: Mrs. Ngozi Eke</p>
          <p>2 February 2026 - 27 March 2026</p>
          <Link to="/portal/calendar">View posting details</Link>
        </article>
      </section>
    </div>
  );
}

export function PortalPlaceholder({ title }) {
  return (
    <section className="portal-placeholder">
      <span className="eyebrow">Student Portal</span>
      <h1>{title}</h1>
      <p>This workspace is ready for the next module build.</p>
    </section>
  );
}
