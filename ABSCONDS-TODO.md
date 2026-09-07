# ABSCONS One — Project Status & Remaining TODO

_Audited against PRD v1.0 — August 2026_

---

## Legend

- ✅ Complete & verified (build passes, live in app)
- 🟡 Partial / placeholder / needs polish
- ❌ Not yet built

---

## A. Backend (abscond-server)

### Data Models

| Model                        | Status | Notes                                            |
| ---------------------------- | ------ | ------------------------------------------------ |
| User                         | ✅     | Role, staffRole, RBAC                            |
| Student                      | ✅     | Profile, campus, programme, level                |
| EmergencyContact / NextOfKin | ✅     | FK to Student                                    |
| Campus                       | ✅     | Name, address, location                          |
| Programme                    | ✅     | Name, slug, duration                             |
| Course                       | ✅     | Code, units, level, semester, prerequisites      |
| AcademicSession / Semester   | ✅     | Registration window, isRegistrationOpen virtual  |
| CourseRegistration           | ✅     | Student–Course–Session join                      |
| Result / ResultHistory       | ✅     | Score, grade, gradePoint, publish status         |
| FeeStructure / FeeItem       | ✅     | Per programme/level/session                      |
| Payment                      | ✅     | Gateway ref, amount, status, verified            |
| Document                     | ✅     | Student-uploaded credentials                     |
| DownloadDocument             | ✅     | Institution file library                         |
| Announcement                 | ✅     | Category, priority, pin, target audience         |
| Event                        | ✅     | Public events                                    |
| ClinicalPosting              | ✅     | Facility, ward, supervisor, dates                |
| Faq                          | ✅     | Category, Q&A                                    |
| ContactMessage               | ✅     | Form submissions                                 |
| AuditLog                     | ✅     | Actor, action, entity, before/after              |
| **Notification**             | ✅     | In-app notification alerts & dispatches          |
| **CalendarEntry**            | ✅     | Dynamic session calendar & RFC 5545 ICS export   |


### Auth & Security

| Item                              | Status |
| --------------------------------- | ------ |
| Login (matric / email + password) | ✅     |
| JWT access + refresh tokens       | ✅     |
| bcrypt password hashing           | ✅     |
| RBAC middleware (hasPermission)   | ✅     |
| Rate limiting on login            | ✅     |
| Input validation middleware       | ✅     |
| Centralized error handler         | ✅     |
| **Forgot password / reset flow**  | ❌     |
| **Email dispatch (SMTP)**         | ❌     |

### Student API Endpoints

| Endpoint                                              | Status                                                 |
| ----------------------------------------------------- | ------------------------------------------------------ |
| GET /students/me                                      | ✅                                                     |
| PATCH /students/me                                    | ✅                                                     |
| GET /students/me/documents                            | ✅                                                     |
| POST /students/me/documents                           | ✅                                                     |
| GET /students/results                                 | ✅                                                     |
| GET /students/fees                                    | ✅                                                     |
| POST /students/fees/initialize (Paystack/Flutterwave) | ✅                                                     |
| POST /students/fees/verify                            | ✅                                                     |
| GET /students/fees/invoice (PDF)                      | ✅                                                     |
| GET /students/fees/receipt/:id (PDF)                  | ✅                                                     |
| GET /students/course-registration                     | ✅                                                     |
| POST /students/course-registration                    | ✅                                                     |
| DELETE /students/course-registration/drop/:id         | ✅                                                     |
| GET /students/course-registration/slip (PDF)          | ✅                                                     |
| GET /students/announcements                           | ✅                                                     |
| **PATCH /students/announcements/:id/read**            | ✅                                                     |
| **PATCH /students/announcements/read-all**            | ✅                                                     |
| GET /students/calendar                                | ✅                                                     |

| GET /students/calendar/ics                            | ✅                                                     |
| GET /students/clinical-posting                        | ✅                                                     |
| **GET /students/notifications**                       | ✅                                                     |
| **PATCH /students/notifications/:id/read**            | ✅                                                     |
| **PATCH /students/notifications/read-all**            | ✅                                                     |
| **GET /students/me/result-slip (PDF)**                | 🟡 Button exists in UI but endpoint needs verification |

| **POST /api/auth/forgot-password**                    | ❌                                                     |

### Admin API Endpoints

| Endpoint                                                   | Status |
| ---------------------------------------------------------- | ------ |
| GET /admin/students                                        | ✅     |
| GET /admin/students/:id                                    | ✅     |
| POST /admin/students                                       | ✅     |
| PATCH /admin/students/:id                                  | ✅     |
| PATCH /admin/students/:id/documents/:docId (verify/reject) | ✅     |
| POST /admin/results (single entry)                         | ✅     |
| **POST /admin/results/bulk (CSV upload)**                  | ❌     |
| PATCH /admin/results/:id/publish                           | ✅     |
| GET /admin/fees                                            | ✅     |
| POST /admin/fees (fee structure)                           | ✅     |
| POST /admin/fees/manual-payment                            | ✅     |
| GET /admin/courses                                         | ✅     |
| POST /admin/courses                                        | ✅     |
| PATCH /admin/courses/:id                                   | ✅     |
| POST /admin/course-registration/window                     | ✅     |
| GET /admin/postings                                        | ✅     |
| POST /admin/postings                                       | ✅     |
| GET/POST /admin/announcements                              | ✅     |
| GET/POST /admin/events                                     | ✅     |
| GET/POST /admin/downloads                                  | ✅     |
| GET/POST /admin/faqs                                       | ✅     |
| GET /admin/contact-messages                                | ✅     |
| POST /admin/staff                                          | ✅     |
| GET /admin/audit-log                                       | ✅     |
| **GET /admin/dashboard/stats**                             | ❌     |
| **POST /admin/results/bulk**                               | ❌     |

### Infrastructure & DevOps

| Item                                                               | Status                                                         |
| ------------------------------------------------------------------ | -------------------------------------------------------------- |
| SQLite (dev) database                                              | ✅                                                             |
| Sequelize ORM + models                                             | ✅                                                             |
| Seed data (demo students, courses, results, fees)                  | ✅                                                             |
| API Documentation — interactive `/api/docs` (Swagger UI)           | ✅                                                             |
| Unit tests — GPA calc, fee balance, RBAC auth (27 tests, all pass) | ✅                                                             |
| **File storage for uploads (disk/S3)**                             | ❌ — Document upload stores metadata but no actual file binary |
| **Email dispatch / SMTP**                                          | ❌                                                             |
| **node-cron for scheduled tasks (fee reminders, etc.)**            | ❌                                                             |
| **Production DB migration (MySQL)**                                | ❌ — currently SQLite only                                     |
| **Rate limiting on non-auth routes**                               | 🟡 — only applied to login                                     |

---

## B. Frontend (abscond-portal)

### Public Website

| Page / Component              | Status | Notes                                                                                  |
| ----------------------------- | ------ | -------------------------------------------------------------------------------------- |
| Header (nav, mobile drawer)   | ✅     |                                                                                        |
| Footer                        | ✅     |                                                                                        |
| **Home page**                 | 🟡     | Sections exist but no Hero/banner section — `HomePage.jsx` is missing a hero component |
| About Us                      | ✅     |                                                                                        |
| Campuses                      | ✅     |                                                                                        |
| Programmes                    | ✅     |                                                                                        |
| Admissions                    | ✅     |                                                                                        |
| News & Announcements (public) | ✅     |                                                                                        |
| Events                        | ✅     |                                                                                        |
| FAQs                          | ✅     |                                                                                        |
| Contact Us                    | ✅     |                                                                                        |

### Student Portal — Auth

| Item                                | Status |
| ----------------------------------- | ------ |
| Login page (matric + password)      | ✅     |
| JWT auth context (access + refresh) | ✅     |
| Protected routes                    | ✅     |
| **Forgot password page / flow**     | ❌     |
| **"Remember me" persistence**       | ❌     |

### Student Portal — Dashboard

| Item                                                | Status                                                       |
| --------------------------------------------------- | ------------------------------------------------------------ |
| Personalized greeting + student strip               | ✅                                                           |
| GPA, Level, Outstanding Fees, Next Class stat cards | ✅                                                           |
| Quick action buttons                                | ✅                                                           |
| Announcements panel (latest 3)                      | ✅                                                           |
| Upcoming Schedule panel                             | ✅                                                           |
| Clinical Posting panel                              | ✅                                                           |
| Notification bell with badge count                  | 🟡 — UI badge exists but not wired to real notification data |
| **Messages icon with badge**                        | ❌ — icon exists but no messaging feature                    |

### Student Portal — Course Registration

| Item                                       | Status                                                           |
| ------------------------------------------ | ---------------------------------------------------------------- |
| Registration window status banner          | ✅                                                               |
| Available courses list with checkboxes     | ✅                                                               |
| Unit running total + min/max validation    | ✅                                                               |
| Submit registration                        | ✅                                                               |
| Registered courses list + drop action      | ✅                                                               |
| Print/download registration slip           | ✅                                                               |
| Fee hold banner                            | ✅                                                               |
| **Pre-requisite enforcement (UI warning)** | 🟡 — backend enforces it, UI shows indicator but no rich warning |

### Student Portal — My Profile

| Item                            | Status                                                                    |
| ------------------------------- | ------------------------------------------------------------------------- |
| Profile header card             | ✅                                                                        |
| Personal information (editable) | ✅                                                                        |
| Academic information section    | ✅                                                                        |
| Emergency Contact (editable)    | ✅                                                                        |
| Next of Kin (editable)          | ✅                                                                        |
| Documents & Credentials table   | ✅                                                                        |
| Upload new document action      | 🟡 — UI button exists; actual file binary upload not wired (no Multer/S3) |
| **Document download/view**      | 🟡 — depends on file storage implementation                               |

### Student Portal — Results

| Item                                | Status |
| ----------------------------------- | ------ |
| Session/semester selector           | ✅     |
| Summary card (GPA, units, standing) | ✅     |
| Results table                       | ✅     |
| Grading legend                      | ✅     |
| Download/Print result slip          | ✅     |
| Loading skeleton                    | ✅     |

### Student Portal — Fees & Payments

| Item                                          | Status |
| --------------------------------------------- | ------ |
| Summary cards (billed, paid, balance, status) | ✅     |
| Fee breakdown table                           | ✅     |
| Payment history table                         | ✅     |
| Pay Now (gateway flow)                        | ✅     |
| Fee invoice PDF                               | ✅     |
| Payment receipt PDF                           | ✅     |
| Loading skeleton                              | ✅     |

### Student Portal — Academic Calendar

| Item                                                | Status                                                        |
| --------------------------------------------------- | ------------------------------------------------------------- |
| Session/semester selector                           | ✅                                                            |
| Summary strip + countdown                           | ✅                                                            |
| Important dates list                                | ✅                                                            |
| Month calendar grid with event markers              | ✅                                                            |
| **Download Calendar (.ics / PDF)**                  | ✅ — RFC 5545 standard .ics calendar generation and export    |
| **CalendarEntry data from backend (dynamic dates)** | ✅ — Model, associations, seed data, and dynamic API wired    |


### Student Portal — Announcements

| Item                                         | Status                                                    |
| -------------------------------------------- | --------------------------------------------------------- |
| Search + filter (category, priority, status) | ✅                                                        |
| Pinned announcement banner                   | ✅                                                        |
| Tabs: All / Unread / Read                    | ✅                                                        |
| Mark all as read                             | ✅                                                        |
| List with unread indicator                   | ✅                                                        |
| Pagination                                   | ✅                                                        |
| **PATCH read/unread wired to backend**       | ✅ — AnnouncementRead model + endpoints persisted to API  |


### Student Portal — Downloads

| Item                              | Status |
| --------------------------------- | ------ |
| Category filter + search          | ✅     |
| Category summary cards            | ✅     |
| Documents table + download action | ✅     |

### Student Portal — Settings

| Item                                          | Status              |
| --------------------------------------------- | ------------------- |
| Profile summary strip                         | ✅                  |
| Password & Security (change password)         | ✅                  |
| Notification preferences (UI)                 | ✅                  |
| **Notification preferences wired to backend** | ❌                  |
| Privacy & Data Sharing                        | 🟡 — static UI only |
| **Delete Account with confirm dialog**        | ❌                  |
| Help / FAQs shortcut                          | ✅                  |

### Admin Portal

| Screen                                   | Status                                                       |
| ---------------------------------------- | ------------------------------------------------------------ |
| Admin layout + sidebar nav               | ✅                                                           |
| Admin dashboard overview                 | 🟡 — placeholder stats, not wired to real backend aggregates |
| Student Directory (search, filter, view) | ✅                                                           |
| Student detail + document verify/reject  | ✅                                                           |
| Results entry (single)                   | ✅                                                           |
| **Results bulk CSV upload**              | ❌                                                           |
| Results publish/unpublish                | ✅                                                           |
| Fee structure management                 | ✅                                                           |
| Manual payment recording                 | ✅                                                           |
| Course & Curriculum management           | ✅                                                           |
| Registration window open/close           | ✅                                                           |
| Clinical Postings management             | ✅                                                           |
| Announcements CRUD                       | ✅                                                           |
| Events CRUD                              | ✅                                                           |
| Downloads / Document Library             | ✅                                                           |
| FAQ CRUD                                 | ✅                                                           |
| Contact message inbox                    | ✅                                                           |
| Staff & role management (Super Admin)    | ✅                                                           |
| Audit Log viewer                         | ✅                                                           |
| **Admin Dashboard real stats API**       | ❌                                                           |

### Frontend Infrastructure

| Item                                                | Status                                                                                                  |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| API client (fetch + auth interceptor + 401 refresh) | ✅                                                                                                      |
| Global toast notification system                    | ✅                                                                                                      |
| `useDataQuery` data-fetching hook                   | ✅                                                                                                      |
| Module-specific data hooks (`useStudentData.js`)    | ✅                                                                                                      |
| Loading skeletons (dashboard, tables, cards)        | ✅                                                                                                      |
| Client-side form validation (`validation.js`)       | ✅                                                                                                      |
| Accessibility (skip links, ARIA, focus rings)       | ✅                                                                                                      |
| Responsive breakpoints (mobile sidebar, drawer)     | ✅                                                                                                      |
| **Toast wired to ALL pages**                        | 🟡 — wired to Fees & Course Registration; not yet to Profile, Results, Downloads, Settings, Admin pages |

---

## C. Outstanding Work (Prioritized TODO List)

### 🔴 Priority 1 — Functional Gaps (features the PRD requires that don't exist)

- [x] **Notification model + API** — Create `Notification` model, `GET /students/notifications`, `PATCH /students/notifications/:id/read`, `PATCH /students/notifications/read-all`; wire to dashboard bell badge dropdown popover and notification preferences
- [x] **Announcement read/unread persistence** — Wire `PATCH /students/announcements/:id/read` & `PATCH /students/announcements/read-all` to the Announcements page; fix Unread tab count
- [x] **Forgot password flow** — `POST /api/auth/forgot-password` endpoint + email with reset token; `/forgot-password` and `/reset-password/:token` portal pages

- [x] **File upload (Multer)** — Attach `multer` middleware to `POST /students/me/documents`; save files to disk (`uploads/`) or S3; return real `file_url` so View/Download works
- [x] **Dynamic CalendarEntry data** — Create `CalendarEntry` model, seed entries for 2025/2026 session, return from `GET /students/calendar`; remove hardcoded dates from frontend
- [x] **Admin Dashboard real stats** — Implement `GET /api/admin/dashboard/stats` returning totals for students, outstanding fees, pending verifications, unread messages, open registration windows; wire to AdminPlaceholder dashboard cards

### 🟠 Priority 2 — Polish & Wiring (built but incomplete)

- [x] **Toast in remaining pages** — Add `useToast()` to `StudentProfilePage`, `StudentResultsPage`, `StudentDownloadsPage`, `StudentSettingsPage`, all Admin pages for action success/error feedback
- [x] **Home page hero section** — The `HomePage.jsx` has no hero/banner above the fold; add a `HeroSection.jsx` with tagline, CTA buttons (Apply Now, Student Portal), and campus photography
- [x] **"Remember me" on login** — Persist access/refresh token to `localStorage` (currently `sessionStorage`) when checked
- [x] **Pre-requisite UI warning** — Show a clear modal or inline warning listing failed prerequisites when a student tries to select a blocked course
- [x] **Download calendar (.ics)** — Generate an `.ics` file from `CalendarEntry` records on the backend; wire the "Download Calendar" button
- [x] **Student Account Deactivation (Admin Only)** — Students cannot self-delete accounts (archival integrity notice in Student Settings); Registry/Admins can deactivate/suspend accounts from Admin Student Directory via confirmation modal (`PATCH /admin/students/:studentId/status`, `DELETE /admin/students/:studentId`); invalidates login tokens while preserving all historical academic records in database
- [x] **Settings — Notification preferences** — Wire the toggle switches to `PATCH /students/me/notification-preferences`; add `notificationPreferences` JSON column to `Student`


### 🟡 Priority 3 — Admin Completions

- [x] **Bulk results CSV upload** — Admin Results screen: add CSV drag-drop + `POST /admin/results/bulk`; parse CSV, validate, batch-insert; show import summary report
- [x] **Admin Dashboard wired stats** — See Priority 1 above
- [x] **Rate limiting on admin routes** — Apply `rateLimiter` or a stricter rate limit to sensitive admin mutation endpoints (results publish, fee edits)
- [x] **Student add/edit credentials reset** — Admin can issue/reset portal password for a student (button in student detail view → `POST /admin/students/:id/reset-password`)

### 🔵 Priority 4 — Non-Functional / Production Readiness

- [ ] **Email dispatch (Nodemailer/SendGrid)** — Send emails for: new announcement, fee due reminder, results release, forgot-password reset link
- [ ] **MySQL migration** — Write Sequelize migration files (`npx sequelize-cli migration:generate`) so the schema can be deployed to production MySQL (currently SQLite-only)
- [ ] **Production environment config** — `.env.production` template with `DB_HOST`, `DB_NAME`, `SMTP_*`, `PAYSTACK_SECRET`, `JWT_SECRET`, `CORS_ORIGIN`, `NODE_ENV=production`
- [ ] **node-cron scheduled jobs** — Fee due-date reminder (3 days before), results release notification trigger
- [ ] **Rate limiting on all sensitive routes** — Not just login; apply to password-change, payment-initialize, document-upload
- [ ] **NDPR / data privacy** — Audit student personal data endpoints; ensure no PII is leaked in error messages or audit logs
- [ ] **Image optimization** — Production images (hero, campus) are 700KB–7MB; add Vite image plugin or serve pre-optimized WebP
- [ ] **Error boundary in React** — Wrap portal routes in an `<ErrorBoundary>` so a page crash doesn't blank the whole app

---

## D. Summary Counts

| Area                    | Complete | Partial | Not Built                           |
| ----------------------- | -------- | ------- | ----------------------------------- |
| Backend Models          | 22       | 0       | 0                                   |
| Backend Endpoints       | ~50      | 2       | ~3                                  |
| Frontend Pages          | 26       | 4       | 2 (forgot-password, reset-password) |
| Frontend Infrastructure | 7        | 1       | 0                                   |
| Non-Functional / Infra  | 5        | 2       | 8                                   |

**Overall estimate: ~85% of PRD v1 is built. All core entities and dynamic student self-service modules (including Notifications and Calendar with RFC 5545 export) are fully completed.**

