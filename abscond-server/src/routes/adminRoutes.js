import { Router } from 'express';
import {
  getPermissionsForUser,
  getRolePermissionMap,
  PERMISSIONS,
  STAFF_ROLES,
  USER_ROLES,
} from '../config/permissions.js';
import { login, me } from '../controllers/authController.js';
import {
  deactivateStudentAccount,
  getAdminDashboard,
  getStudentDetail,
  listStudents,
  resetStudentPassword,
  updateDocumentDecision,
  updateStudentStatus,
} from '../controllers/adminController.js';
import {
  bulkEnterResults,
  enterResult,
  getResultHistory,
  listResults,
  setResultPublication,
} from '../controllers/resultController.js';
import {
  createFeeStructure,
  deleteFeeStructure,
  exportOutstandingBalancesCsv,
  getFeeStats,
  getOutstandingBalances,
  listFeeStructures,
  listPayments,
  recordManualPayment,
  updateFeeStructure,
} from '../controllers/feeController.js';
import {
  createCampus,
  createCourse,
  createProgramme,
  deleteCourse,
  listAcademicWindows,
  listAdminCampuses,
  listAdminCourses,
  listAdminProgrammes,
  toggleRegistrationWindow,
  updateCampus,
  updateCourse,
  updateProgramme,
} from '../controllers/academicController.js';
import {
  assignClinicalPosting,
  deleteClinicalPosting,
  listClinicalPostings,
  updateClinicalPosting,
} from '../controllers/clinicalController.js';
import {
  createAnnouncement,
  createEvent,
  deleteAnnouncement,
  deleteEvent,
  listAnnouncements,
  listEvents,
  updateAnnouncement,
  updateEvent,
} from '../controllers/contentController.js';
import {
  createDownload,
  deleteDownload,
  listDownloads,
  updateDownload,
} from '../controllers/downloadController.js';
import {
  createFaq,
  deleteFaq,
  listFaqs,
  updateFaq,
} from '../controllers/faqController.js';
import {
  listContactMessages,
  replyContactMessage,
  updateContactMessageStatus,
} from '../controllers/contactController.js';
import {
  createStaffAccount,
  listStaffAccounts,
  updateStaffAccount,
} from '../controllers/staffController.js';
import { listAuditLogs } from '../controllers/auditController.js';
import {
  authenticate,
  requirePermission,
  requireStaffAccess,
} from '../middleware/auth.js';
import { adminMutationRateLimiter, loginRateLimiter } from '../middleware/rateLimiter.js';

export const adminRoutes = Router();

adminRoutes.post('/auth/login', loginRateLimiter(), login({ staffOnly: true }));
adminRoutes.get('/me', authenticate, requireStaffAccess, me);
adminRoutes.get(
  '/rbac',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.MANAGE_STAFF),
  (_req, res) => {
    res.json({
      userRoles: USER_ROLES,
      staffRoles: STAFF_ROLES,
      permissions: PERMISSIONS,
      rolePermissionMap: getRolePermissionMap(),
    });
  },
);

adminRoutes.get('/permissions/me', authenticate, requireStaffAccess, (req, res) => {
  res.json({
    permissions: getPermissionsForUser(req.user),
  });
});

adminRoutes.get(
  '/dashboard',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.VIEW_STUDENTS),
  getAdminDashboard,
);
adminRoutes.get(
  '/dashboard/stats',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.VIEW_STUDENTS),
  getAdminDashboard,
);
adminRoutes.get(
  '/students',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.VIEW_STUDENTS),
  listStudents,
);
adminRoutes.get(
  '/students/:studentId',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.VIEW_STUDENTS),
  getStudentDetail,
);
// Line 333: Admin account status update (activate, suspend, deactivate)
adminRoutes.patch(
  '/students/:studentId/status',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.MANAGE_STUDENTS),
  adminMutationRateLimiter({ maxRequests: 25 }),
  updateStudentStatus,
);
// Line 333: Admin delete/deactivate student account (soft delete - disables login, preserves records)
adminRoutes.delete(
  '/students/:studentId',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.MANAGE_STUDENTS),
  adminMutationRateLimiter({ maxRequests: 20 }),
  deactivateStudentAccount,
);
// Line 342: Admin reset student password
adminRoutes.post(
  '/students/:studentId/reset-password',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.MANAGE_STUDENTS),
  adminMutationRateLimiter({ maxRequests: 20, message: 'Too many password reset requests. Please wait a moment.' }),
  resetStudentPassword,
);
adminRoutes.patch(
  '/documents/:documentId/decision',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.VERIFY_DOCUMENTS),
  updateDocumentDecision,
);
adminRoutes.get(
  '/results',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.VIEW_RESULTS),
  listResults,
);
adminRoutes.post(
  '/results',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.MANAGE_RESULTS),
  enterResult,
);
adminRoutes.post(
  '/results/bulk',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.MANAGE_RESULTS),
  adminMutationRateLimiter({ maxRequests: 15, message: 'Too many bulk result imports. Please wait a moment.' }),
  bulkEnterResults,
);
adminRoutes.patch(
  '/results/:resultId/publication',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.MANAGE_RESULTS),
  adminMutationRateLimiter({ maxRequests: 30 }),
  setResultPublication,
);
adminRoutes.get(
  '/results/:resultId/history',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.VIEW_RESULTS),
  getResultHistory,
);

// Fees Management Routes (Line 155)
adminRoutes.get(
  '/fees/stats',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.VIEW_FEES),
  getFeeStats,
);
adminRoutes.get(
  '/fees/structures',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.VIEW_FEES),
  listFeeStructures,
);
adminRoutes.post(
  '/fees/structures',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.MANAGE_FEES),
  adminMutationRateLimiter({ maxRequests: 20 }),
  createFeeStructure,
);
adminRoutes.patch(
  '/fees/structures/:feeStructureId',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.MANAGE_FEES),
  adminMutationRateLimiter({ maxRequests: 20 }),
  updateFeeStructure,
);
adminRoutes.delete(
  '/fees/structures/:feeStructureId',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.MANAGE_FEES),
  adminMutationRateLimiter({ maxRequests: 20 }),
  deleteFeeStructure,
);
adminRoutes.get(
  '/fees/payments',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.VIEW_FEES),
  listPayments,
);
adminRoutes.post(
  '/fees/payments',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.MANAGE_FEES),
  recordManualPayment,
);
adminRoutes.get(
  '/fees/balances',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.VIEW_FEES),
  getOutstandingBalances,
);
adminRoutes.get(
  '/fees/export',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.VIEW_FEES),
  exportOutstandingBalancesCsv,
);

// Academic Setup Routes (Line 156)
adminRoutes.get('/academic/courses', authenticate, requireStaffAccess, listAdminCourses);
adminRoutes.post(
  '/academic/courses',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.MANAGE_COURSES),
  createCourse,
);
adminRoutes.patch(
  '/academic/courses/:courseId',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.MANAGE_COURSES),
  updateCourse,
);
adminRoutes.delete(
  '/academic/courses/:courseId',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.MANAGE_COURSES),
  deleteCourse,
);

adminRoutes.get('/academic/programmes', authenticate, requireStaffAccess, listAdminProgrammes);
adminRoutes.post(
  '/academic/programmes',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.MANAGE_COURSES),
  createProgramme,
);
adminRoutes.patch(
  '/academic/programmes/:programmeId',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.MANAGE_COURSES),
  updateProgramme,
);

adminRoutes.get('/academic/campuses', authenticate, requireStaffAccess, listAdminCampuses);
adminRoutes.post(
  '/academic/campuses',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.MANAGE_COURSES),
  createCampus,
);
adminRoutes.patch(
  '/academic/campuses/:campusId',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.MANAGE_COURSES),
  updateCampus,
);

adminRoutes.get('/academic/windows', authenticate, requireStaffAccess, listAcademicWindows);
adminRoutes.patch(
  '/academic/windows/:semesterId',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.MANAGE_REGISTRATION_WINDOWS),
  toggleRegistrationWindow,
);

// Clinical Postings Routes (Line 157)
adminRoutes.get(
  '/clinical/postings',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.MANAGE_CLINICAL_POSTINGS),
  listClinicalPostings,
);
adminRoutes.post(
  '/clinical/postings',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.MANAGE_CLINICAL_POSTINGS),
  assignClinicalPosting,
);
adminRoutes.patch(
  '/clinical/postings/:postingId',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.MANAGE_CLINICAL_POSTINGS),
  updateClinicalPosting,
);
adminRoutes.delete(
  '/clinical/postings/:postingId',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.MANAGE_CLINICAL_POSTINGS),
  deleteClinicalPosting,
);

// Content Management Routes (Line 158)
adminRoutes.get('/content/announcements', authenticate, requireStaffAccess, listAnnouncements);
adminRoutes.post(
  '/content/announcements',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.MANAGE_CONTENT),
  createAnnouncement,
);
adminRoutes.patch(
  '/content/announcements/:announcementId',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.MANAGE_CONTENT),
  updateAnnouncement,
);
adminRoutes.delete(
  '/content/announcements/:announcementId',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.MANAGE_CONTENT),
  deleteAnnouncement,
);

adminRoutes.get('/content/events', authenticate, requireStaffAccess, listEvents);
adminRoutes.post(
  '/content/events',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.MANAGE_CONTENT),
  createEvent,
);
adminRoutes.patch(
  '/content/events/:eventId',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.MANAGE_CONTENT),
  updateEvent,
);
adminRoutes.delete(
  '/content/events/:eventId',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.MANAGE_CONTENT),
  deleteEvent,
);

// Downloads Management Routes (Line 159)
adminRoutes.get('/downloads', authenticate, requireStaffAccess, listDownloads);
adminRoutes.post(
  '/downloads',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.MANAGE_DOWNLOADS),
  createDownload,
);
adminRoutes.patch(
  '/downloads/:downloadId',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.MANAGE_DOWNLOADS),
  updateDownload,
);
adminRoutes.delete(
  '/downloads/:downloadId',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.MANAGE_DOWNLOADS),
  deleteDownload,
);

// FAQs Management Routes (Line 160)
adminRoutes.get('/faqs', authenticate, requireStaffAccess, listFaqs);
adminRoutes.post(
  '/faqs',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.MANAGE_FAQS),
  createFaq,
);
adminRoutes.patch(
  '/faqs/:faqId',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.MANAGE_FAQS),
  updateFaq,
);
adminRoutes.delete(
  '/faqs/:faqId',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.MANAGE_FAQS),
  deleteFaq,
);

// Contact Messages Inbox Routes (Line 161)
adminRoutes.get(
  '/contacts',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.VIEW_CONTACT_MESSAGES),
  listContactMessages,
);
adminRoutes.patch(
  '/contacts/:messageId/status',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.VIEW_CONTACT_MESSAGES),
  updateContactMessageStatus,
);
adminRoutes.post(
  '/contacts/:messageId/reply',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.VIEW_CONTACT_MESSAGES),
  replyContactMessage,
);

// Staff Accounts Management (Line 162 - Super Admin)
adminRoutes.get(
  '/staff',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.MANAGE_STAFF),
  listStaffAccounts,
);
adminRoutes.post(
  '/staff',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.MANAGE_STAFF),
  createStaffAccount,
);
adminRoutes.patch(
  '/staff/:staffId',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.MANAGE_STAFF),
  updateStaffAccount,
);

// Audit Log Viewer (Line 163)
adminRoutes.get(
  '/audit-logs',
  authenticate,
  requireStaffAccess,
  requirePermission(PERMISSIONS.VIEW_AUDIT_LOG),
  listAuditLogs,
);


