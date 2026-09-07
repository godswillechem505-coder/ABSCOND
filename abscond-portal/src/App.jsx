import { useEffect } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./auth/useAuth";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AboutPage from "./pages/AboutPage";
import CampusesPage from "./pages/CampusesPage";
import ProgrammesPage from "./pages/ProgrammesPage";
import AdmissionsPage from "./pages/AdmissionsPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import EventsPage from "./pages/EventsPage";
import FaqsPage from "./pages/FaqsPage";
import ContactPage from "./pages/ContactPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import StudentProfilePage from "./pages/StudentProfilePage";
import StudentCourseRegistration from "./pages/StudentCourseRegistration";
import StudentResultsPage from "./pages/StudentResultsPage";
import StudentFeesPage from "./pages/StudentFeesPage";
import StudentCalendarPage from "./pages/StudentCalendarPage";
import StudentAnnouncementsPage from "./pages/StudentAnnouncementsPage";
import StudentDownloadsPage from "./pages/StudentDownloadsPage";
import StudentSettingsPage from "./pages/StudentSettingsPage";
import { PortalDashboard, PortalLayout } from "./pages/Portal";
import AdminPlaceholder, {
  AdminStudentDirectory,
  AdminResults,
  AdminPortalLayout,
} from "./pages/AdminPlaceholder";
import AdminFees from "./pages/AdminFees";
import AdminAcademic from "./pages/AdminAcademic";
import AdminClinical from "./pages/AdminClinical";
import AdminContent from "./pages/AdminContent";
import AdminDownloads from "./pages/AdminDownloads";
import AdminFaqs from "./pages/AdminFaqs";
import AdminContacts from "./pages/AdminContacts";
import AdminStaff from "./pages/AdminStaff";
import AdminAuditLog from "./pages/AdminAuditLog";
import "./App.css";

function ScrollToLocation() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0 });
      return;
    }

    window.requestAnimationFrame(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView();
    });
  }, [pathname, hash]);

  return null;
}

function PublicLayout() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  return (
    <div className="abscons-app">
      <Header />
      <main className={isHome ? "main-content-flow" : "inner-page-flow"}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function RequireStudentAuth() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-loading">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

function RequireStaffAuth() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-loading">
        <p>Loading...</p>
      </div>
    );
  }

  const staffRoles = ["staff", "admin", "super_admin"];
  if (!user || !staffRoles.includes(user.role)) {
    return <AdminPlaceholder />;
  }

  return <Outlet />;
}

function App() {
  return (
    <>
      <ScrollToLocation />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="campuses" element={<CampusesPage />} />
          <Route path="programmes" element={<ProgrammesPage />} />
          <Route path="admissions" element={<AdmissionsPage />} />
          <Route path="announcements" element={<AnnouncementsPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="faqs" element={<FaqsPage />} />
          <Route path="contact" element={<ContactPage />} />
        </Route>


        <Route path="login" element={<LoginPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="reset-password/:token" element={<ResetPasswordPage />} />

        <Route element={<RequireStudentAuth />}>
          <Route path="portal" element={<PortalLayout />}>
            <Route index element={<PortalDashboard />} />
            <Route path="profile" element={<StudentProfilePage />} />
            <Route path="course-registration" element={<StudentCourseRegistration />} />
            <Route path="results" element={<StudentResultsPage />} />
            <Route path="fees" element={<StudentFeesPage />} />
            <Route path="calendar" element={<StudentCalendarPage />} />
            <Route path="announcements" element={<StudentAnnouncementsPage />} />
            <Route path="downloads" element={<StudentDownloadsPage />} />
            <Route path="settings" element={<StudentSettingsPage />} />
            <Route path="*" element={<Navigate to="/portal" replace />} />
          </Route>
        </Route>


        <Route element={<RequireStaffAuth />}>
          <Route path="admin" element={<AdminPortalLayout />}>
            <Route index element={<AdminPlaceholder />} />
            <Route path="students" element={<AdminStudentDirectory />} />
            <Route path="results" element={<AdminResults />} />
            <Route path="fees" element={<AdminFees />} />
            <Route path="academic" element={<AdminAcademic />} />
            <Route path="clinical" element={<AdminClinical />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="downloads" element={<AdminDownloads />} />
            <Route path="faqs" element={<AdminFaqs />} />
            <Route path="contacts" element={<AdminContacts />} />
            <Route path="staff" element={<AdminStaff />} />
            <Route path="audit-log" element={<AdminAuditLog />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;

