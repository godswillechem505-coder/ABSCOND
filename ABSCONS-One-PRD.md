# Product Requirements Document (PRD)
## ABSCONS One — Abia State College of Nursing Sciences Digital Platform

**Version:** 1.0
**Date:** August 2026
**Prepared for:** Development (React frontend + Node.js/Express backend)

---

## 1. Overview

ABSCONS One is a unified digital platform for the Abia State College of Nursing Sciences (a multi-campus institution under the Abia State Ministry of Health). The platform has **two connected surfaces**:

1. **Public Marketing Website** — informational site for prospective students, parents, and the public (Home, About, Campuses, Programmes, Admissions, News/Announcements, Events, FAQs, Contact Us).
2. **Student Portal** (authenticated) — self-service portal for enrolled students to manage academics, fees, documents, and communication (Dashboard, Profile, Results, Fees & Payments, Academic Calendar, Announcements, Downloads, Settings).

An **Admin/Staff Portal** is required to manage the data that powers the student portal (results entry, fee records, announcements, documents, events) and a **Course Registration** flow is required for students to register courses each semester. Neither was included in the supplied UI designs, so both are specified below at a functional level, based on the patterns established by the rest of the system — replace with real mockups if/when available.

Tagline: *"One Institution. One System. Endless Possibilities."*

---

## 2. Goals

- Give prospective students a professional, trustworthy public site that drives inquiries and admissions.
- Give enrolled students self-service access to results, fees, calendar, documents, and notices — reducing walk-in traffic to the registry/bursary.
- Give the institution (via an admin panel) a single system of record instead of manual/paper processes.
- Support multiple campuses (Aba, Amachara, Umuahia, Abiriba) and multiple programmes under one platform.

## 3. Non-Goals (for v1)

- Online course/CBT examinations (not shown in designs).
- Mobile native apps (web-responsive only for v1).
- Multi-institution/tenant support — this is single-institution.
- Alumni portal.

## 4. Users & Roles

| Role | Description |
|---|---|
| **Visitor (public)** | Unauthenticated user browsing the marketing site. |
| **Student** | Authenticated user with matric number + password; accesses the Student Portal. |
| **Staff/Admin** (Registry, Bursary, ICT, Academic Affairs, Clinical Training Unit) | Back-office users who publish announcements/events, upload results, record payments, manage documents. Requires an admin UI not present in current designs — recommend wireframing before backend contracts are finalized. |
| **Super Admin** | Manages staff accounts, roles, and system settings. |

---

## 5. Scope by Module (from supplied designs)

### 5.1 Public Website
- **Home** — hero, highlights, calls to action (referenced in nav, not detailed in designs; treat as standard landing page).
- **About Us / Campuses / Programmes / Admissions** — informational/CMS-driven pages (referenced in nav; content structure to be defined).
- **News & Announcements** — public-facing news feed.
- **Events** — hero banner, featured event, upcoming events grid, events calendar (month view with day markers), past events gallery, "Student Life" highlights.
- **FAQs** — searchable, filterable by category (Admissions, Programmes, Fees, Student Life, Campuses, Student Portal, General), accordion answers, "Quick Links" and "Still need help?" sidebar.
- **Contact Us** — contact form (name, email, message), visit/call/email/office-hours cards, campus location cards (4 campuses), interactive map of Abia State campuses, "Frequently Contacted Departments" directory, social links.
- **Global footer** — quick links, information links, student services links, contact details, social icons, copyright.
- **Student Portal entry** — "Student Portal" button in main nav leads to login.

### 5.2 Student Portal (authenticated)

**Login**
- Student ID (matric number) + password, "Remember me", "Forgot password", helper note that credentials are issued after registration, alternate "Contact Student Affairs" action.
- Right-hand promo panel + quick feature shortcuts (Academic Records, Announcements, Results & Transcript, Fees & Payments, Academic Calendar).

**Dashboard**
- Personalized greeting, student summary strip (Student ID, Programme, Campus, Level).
- Campus/college photo banner.
- Stat cards: Current GPA, Current Level, Outstanding Fees, Next Class.
- Quick actions: Register Courses, View Results, Pay Fees, Download Documents.
- Panels: Announcements (latest 3 + "View All"), Upcoming Schedule (today/tomorrow with time + room, "View Full Calendar"), Current Clinical Posting (hospital, ward, posting period, supervisor, "View Posting Details").
- Top bar: hamburger menu, notification bell (badge count), messages icon (badge count), user menu (name, matric no, dropdown), logout.
- Left sidebar nav: Dashboard, My Profile, **Course Registration**, Results, Fees & Payments, Academic Calendar, Announcements, Downloads, Settings. Persistent "Need Help?" contact card.

**Course Registration** *(no design supplied — specified functionally)*
- Session/Semester selector, with registration only enabled during the active registration window (per Academic Calendar dates).
- Student info strip: Programme, Level, Campus, current registered units vs. min/max allowed units.
- Available courses list for the student's programme/level/semester: code, title, units, type (core/elective), pre-requisite indicator.
- Selection UI (checkboxes) with running total of units and validation against min/max unit load.
- Pre-requisite enforcement (block registering a course if a required prior course wasn't passed).
- "Submit Registration" action, producing a **Course Registration Form/Slip** (viewable/downloadable/printable, mirroring the Results page's slip pattern).
- Registered courses list (post-submission) with a "Drop Course" action while the registration window is open.
- Status banner if registration is closed, blocked (e.g., unresolved fees), or already completed for the semester.
- Notification/announcement trigger when registration opens (ties into Announcements module).

**My Profile**
- Profile header card: photo, name, status badge, Student ID, Course, Campus, Level, email, phone, address.
- Sections (each independently editable): Personal Information, Academic Information, Emergency Contact, Next of Kin.
- **Documents & Credentials** table: document name, description, status (Uploaded), date uploaded, View/Download/overflow actions, "Upload New Document" action. Documents seen: O'Level Result, JAMB Result Slip, Post-UTME Result, Passport Photograph, Admission Letter, Acceptance Letter, Birth Certificate, Certificate of Origin, Medical Fitness Certificate.
- "Edit Profile" top-level action.

**Results**
- Session/Semester selector.
- Summary card: Current Level, Programme, Semester GPA, Cumulative GPA, Total Units Taken, Total Units Passed, Status (Pass/Fail).
- Results table: Course Code, Course Title, Units, Score (%), Grade, Grade Point; totals row with Semester GPA.
- Grading legend (A/B/C/D/E/F with ranges).
- Actions: View Full History, Download Result Slip, Print Result Slip.

**Fees & Payments**
- Session/Semester selector.
- Summary cards: Total Fees, Amount Paid, Balance Remaining, Payment Status (with due date).
- Fee Breakdown table (itemized: Tuition, Clinical/Practical, Laboratory, Library, ICT/Internet, Student Welfare, Examination, Other) with total.
- Payment History table (date, description, amount, payment method) + Total Paid.
- "Important Information" notice panel.
- Actions: Download Fee Invoice, View/Print Payment Plan, **Pay Now** (payment gateway integration required).

**Academic Calendar**
- Session/Semester selector.
- Summary strip: current session/semester + date range, Today, Days to Exams countdown, Days to Break countdown, Download Calendar.
- Important Academic Dates list (Registration, Lectures Begin, Continuous Assessments, Clinical Posting, Revision, Examinations, Results Release, Semester Break) each with a date-range and a "view in calendar" icon.
- Month calendar grid with event dot markers; "Events for [date]" detail list; prev/next month navigation.

**Announcements**
- Session/Semester filter, search bar, filters (Category, Priority, Status), Reset.
- Pinned/important announcement banner.
- Tabs: All / Unread / Read, "Mark all as read".
- List items: icon, title, unread indicator dot, excerpt, posted date, publishing department, category tag, Read More link.
- Pagination.

**Downloads**
- Session/Semester filter, search, category filter, Reset.
- Category summary cards: All Documents, Academic, Finance, Personal, Others (with counts).
- Recent Documents table: name, description, category tag, session/semester, date uploaded, file size, View/Download actions.
- "Load More" pagination.

**Settings**
- Profile summary strip with "View Profile" shortcut.
- Menu list: Personal Information, Password & Security, Notification Preferences, Privacy & Data Sharing, Delete Account (destructive, confirm dialog required), Help/FAQs/Contact Support shortcut.

### 5.3 Admin/Staff Portal *(no design supplied — specified functionally)*

A separate authenticated area (recommend a distinct route namespace, e.g. `/admin`, and optionally a visually distinct theme so staff never confuse it with the student portal) for back-office users.

**Admin Dashboard**
- Overview stats: total students (by campus/programme/level), outstanding fees across the institution, pending document verifications, unread contact messages, upcoming registration/exam windows.

**Student Management** (Registry)
- Searchable/filterable student directory (by campus, programme, level, session, status).
- Student detail view: profile, documents (with verify/reject action per document), results history, fee/payment history, clinical postings.
- Add/edit/deactivate student accounts; issue/reset portal credentials.

**Results Management** (Academic Affairs)
- Select session/semester/course → enter or bulk-upload (CSV) scores for enrolled students.
- Auto-calculate grade/grade point from score using the grading scale.
- Publish/unpublish results (controls student visibility + triggers "Results Release" notification).
- Edit history / audit trail per result entry.

**Fees Management** (Bursary)
- Define fee structures per programme/level/session/semester (itemized, matching the student-facing Fee Breakdown).
- Record manual payments (bank transfer/POS) and reconcile automatic gateway payments.
- View outstanding balances institution-wide; export statements.

**Course & Curriculum Management** (Academic Affairs)
- CRUD for Programmes, Courses (code, title, units, level, semester, pre-requisites), Campuses.
- Open/close course registration windows.

**Clinical Postings Management** (Clinical Training Unit)
- Assign students to clinical facilities/wards/supervisors with posting date ranges.

**Announcements & Events Management**
- CRUD for Announcements (title, body, category, priority, pin, target audience) and Events (public site).
- Schedule publish dates.

**Downloads/Document Library Management**
- Upload institution documents (calendars, handbooks, fee invoices templates) with category tagging, visible to students via the Downloads page.

**FAQ & Contact Management**
- CRUD for public FAQs.
- Inbox for Contact Us submissions, with status (new/in progress/resolved) and assignment to department.

**Staff & Role Management** (Super Admin)
- Create/manage staff accounts, assign roles (Registry, Bursary, ICT, Academic Affairs, Clinical Training Unit, Registrar, Super Admin) with scoped permissions.
- Audit log viewer (who changed what, when) for sensitive actions (results, fees, account deletion).

---

## 6. Non-Functional Requirements

- **Responsive design** — portal and public site must work on mobile, tablet, desktop (designs are desktop-first; mobile breakpoints must be designed during build).
- **Security** — password hashing (bcrypt/argon2), JWT or session-based auth with refresh tokens, rate limiting on login, RBAC for staff/admin actions, audit log for grade/fee edits.
- **Data privacy** — student personal data (NIN-equivalent docs, DOB, contact info, guardian info) must be access-controlled; align with NDPR (Nigeria Data Protection Regulation).
- **Performance** — dashboard and results pages should load key data in a single request where possible (avoid waterfalls).
- **Availability** — target 99.5% uptime; institution-critical during registration/exam/results periods.
- **File storage** — documents/results slips/receipts stored via object storage (e.g., S3-compatible) or server disk with backups, not DB blobs.
- **Payments** — integrate a Nigerian payment gateway (e.g., Paystack or Flutterwave) for "Pay Now"; must support partial payments and reconcile against fee breakdown.
- **Notifications** — in-app (bell/message icons with unread counts) at minimum; email notifications recommended for announcements, fee due dates, results release.
- **Accessibility** — reasonable color contrast, keyboard navigation, alt text for images.

---

## 7. Proposed Tech Stack

- **Frontend:** React + Vite, React Router, a component/styling approach (Tailwind CSS recommended to match the clean card/table-heavy UI), state/data-fetching via React Query (or SWR) + Axios.
- **Backend:** Node.js + Express, MySQL with Sequelize ORM (matches current stack), JWT auth, Multer (or S3 SDK) for file uploads, node-cron for scheduled tasks (e.g., fee due reminders).
- **Payments:** Paystack or Flutterwave Node SDK.
- **Infra:** dotenv config, migrations via Sequelize CLI, seeders for reference data (campuses, programmes, courses, grading scale).

## 8. Core Data Model (entities)

- **User** (base auth: id, email/matric, password_hash, role, status)
- **Student** (profile fields, FK to User, Campus, Programme, Level, admission_year, current_session)
- **EmergencyContact / NextOfKin** (FK to Student)
- **Campus** (name, address, location coords)
- **Programme** (name, description, duration)
- **Course** (code, title, units, programme_id, level, semester)
- **Session** (e.g., 2025/2026) / **Semester** (First/Second, dates)
- **CourseRegistration** (student_id, course_id, session_id, semester, status, registered_at) + **CourseRegistrationWindow** (session_id, semester, opens_at, closes_at)
- **Result** (student_id, course_id, session_id, semester, score, grade, grade_point)
- **FeeStructure** (programme_id/level, session, semester, breakdown items + amounts)
- **Payment** (student_id, amount, method, date, reference, status)
- **Document** (student_id, type, description, file_url, status, uploaded_at) — for student-uploaded credentials
- **DownloadResource** (title, description, category, session/semester, file_url, uploaded_by) — for institution-provided documents
- **Announcement** (title, body, category, priority, department, pinned, published_at)
- **Event** (title, description, type/category, date range, location, image, featured flag)
- **CalendarEntry** (session_id, semester, title, start_date, end_date, type)
- **ClinicalPosting** (student_id, facility, ward, supervisor, start_date, end_date)
- **FAQ** (category, question, answer)
- **ContactMessage** (name, email, message, submitted_at, status)
- **Notification** (user_id, type, message, read_at)
- **AuditLog** (actor_id, action, entity, entity_id, before/after, created_at)

## 9. High-Level API Surface (illustrative, not exhaustive)

```
POST   /api/auth/login
POST   /api/auth/forgot-password
GET    /api/students/me
PATCH  /api/students/me
GET    /api/students/me/documents
POST   /api/students/me/documents
GET    /api/results?session=&semester=
GET    /api/fees?session=&semester=
POST   /api/fees/pay
GET    /api/calendar?session=&semester=
GET    /api/announcements?status=&category=
PATCH  /api/announcements/:id/read
GET    /api/downloads?category=
GET    /api/events (public)
GET    /api/faqs (public)
POST   /api/contact (public)
GET    /api/course-registration/available?session=&semester=
POST   /api/course-registration
DELETE /api/course-registration/:id
GET    /api/course-registration/window?session=&semester=
-- Admin --
GET    /api/admin/students
GET    /api/admin/students/:id
PATCH  /api/admin/students/:id/documents/:docId
POST   /api/admin/results
POST   /api/admin/results/bulk
PATCH  /api/admin/results/:id/publish
POST   /api/admin/fees
POST   /api/admin/fees/manual-payment
POST   /api/admin/courses
POST   /api/admin/course-registration/window
POST   /api/admin/postings
POST   /api/admin/announcements
POST   /api/admin/events
POST   /api/admin/downloads
POST   /api/admin/faqs
GET    /api/admin/contact-messages
POST   /api/admin/staff
GET    /api/admin/audit-log
```

## 10. Open Questions / Assumptions

1. Admin/Staff Portal and Course Registration were not part of the supplied design files — both are specified functionally in sections 5.2–5.3 above and should get a real design pass (wireframes/mockups) before or during backend build, ideally before admin API contracts are fully locked in.
2. Home, About Us, Campuses, Programmes, and Admissions pages are referenced in navigation but no screens were supplied — content structure assumed to be standard CMS-style pages.
3. Payment gateway choice not specified — Paystack/Flutterwave assumed as they're standard for Nigerian institutions.
4. "Delete Account" on Settings needs an institutional policy decision (students are unlikely to be allowed full self-deletion mid-programme) — flagged for product decision.
5. Staff role scoping (e.g., can Bursary see results? can Academic Affairs record payments?) needs institutional sign-off — assumed department-scoped permissions per the roles listed in section 5.3.

---
