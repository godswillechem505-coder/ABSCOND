import { Router } from 'express';
import {
  deleteDocument,
  downloadCalendarIcs,
  dropStudentCourse,
  getCourseRegistrationData,
  getFeeInvoiceSlip,
  getPaymentReceiptSlip,
  getRegisteredCourses,
  getRegistrationSlip,
  getStudentAnnouncementsData,
  getStudentCalendarData,
  getStudentClinicalPosting,
  getStudentDocuments,
  getStudentDownloadsData,
  getStudentFeesData,
  getStudentNotifications,
  getStudentProfile,
  getStudentResultsData,
  initializePaymentGateway,
  markAllAnnouncementsAsRead,
  markAllNotificationsAsRead,
  markAnnouncementAsRead,
  markNotificationAsRead,
  payStudentFee,
  registerStudentCourses,
  updateStudentNotificationPreferences,
  updateStudentPassword,
  updateStudentProfile,
  uploadDocument,
  verifyPaymentGateway,
} from '../controllers/studentController.js';
import { authenticate } from '../middleware/auth.js';
import { uploadMiddleware } from '../middleware/upload.js';

export const studentRoutes = Router();

// All routes require authentication
studentRoutes.use(authenticate);

// Student profile & documents endpoints
studentRoutes.get('/me', getStudentProfile);
studentRoutes.patch('/me', updateStudentProfile);
studentRoutes.get('/documents', getStudentDocuments);
studentRoutes.get('/me/documents', getStudentDocuments);
studentRoutes.post('/documents', uploadMiddleware(), uploadDocument);
studentRoutes.post('/me/documents', uploadMiddleware(), uploadDocument);
studentRoutes.delete('/documents/:documentId', deleteDocument);
studentRoutes.delete('/me/documents/:documentId', deleteDocument);

// Line 141: Course Registration endpoints
studentRoutes.get('/course-registration', getCourseRegistrationData);
studentRoutes.post('/course-registration', registerStudentCourses);
studentRoutes.post('/course-registration/drop/:courseId', dropStudentCourse);

// Line 49: Get current registered courses + registration slip (HTML → print/PDF)
studentRoutes.get('/course-registration/registered', getRegisteredCourses);
studentRoutes.get('/course-registration/slip', getRegistrationSlip);

// Line 142: Results endpoint
studentRoutes.get('/results', getStudentResultsData);

// Line 143 & Lines 54-58: Fees & Payments endpoints
studentRoutes.get('/fees', getStudentFeesData);
studentRoutes.post('/fees/pay', payStudentFee);
studentRoutes.post('/fees/initialize', initializePaymentGateway); // Line 56
studentRoutes.post('/fees/verify', verifyPaymentGateway); // Line 56
studentRoutes.get('/fees/invoice', getFeeInvoiceSlip); // Line 57
studentRoutes.get('/fees/receipt/:paymentId', getPaymentReceiptSlip); // Line 58

// Line 144: Academic Calendar endpoints
studentRoutes.get('/calendar', getStudentCalendarData);
studentRoutes.get('/calendar/ics', downloadCalendarIcs);

// Line 145 & Line 316: Student Announcements endpoints
studentRoutes.get('/announcements', getStudentAnnouncementsData);
studentRoutes.patch('/announcements/read-all', markAllAnnouncementsAsRead);
studentRoutes.patch('/announcements/:id/read', markAnnouncementAsRead);

// Line 146: Student Downloads endpoint
studentRoutes.get('/downloads', getStudentDownloadsData);

// Line 147: Settings & Password update endpoint
studentRoutes.patch('/settings/password', updateStudentPassword);

// Line 41: Clinical Posting endpoint
studentRoutes.get('/clinical-posting', getStudentClinicalPosting);

// Line 40: Notifications endpoints
studentRoutes.get('/notifications', getStudentNotifications);
studentRoutes.patch('/notifications/read-all', markAllNotificationsAsRead);
studentRoutes.patch('/notifications/:id/read', markNotificationAsRead);

// Line 334: Notification preferences
studentRoutes.patch('/me/notification-preferences', updateStudentNotificationPreferences);
studentRoutes.patch('/settings/notification-preferences', updateStudentNotificationPreferences);



