import { Router } from 'express';
import {
  deleteDocument,
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
  getStudentProfile,
  getStudentResultsData,
  initializePaymentGateway,
  payStudentFee,
  registerStudentCourses,
  updateStudentPassword,
  updateStudentProfile,
  uploadDocument,
  verifyPaymentGateway,
} from '../controllers/studentController.js';
import { authenticate } from '../middleware/auth.js';

export const studentRoutes = Router();

// All routes require authentication
studentRoutes.use(authenticate);

// Student profile & documents endpoints
studentRoutes.get('/me', getStudentProfile);
studentRoutes.patch('/me', updateStudentProfile);
studentRoutes.get('/documents', getStudentDocuments);
studentRoutes.post('/documents', uploadDocument);
studentRoutes.delete('/documents/:documentId', deleteDocument);

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

// Line 144: Academic Calendar endpoint
studentRoutes.get('/calendar', getStudentCalendarData);

// Line 145: Student Announcements endpoint
studentRoutes.get('/announcements', getStudentAnnouncementsData);

// Line 146: Student Downloads endpoint
studentRoutes.get('/downloads', getStudentDownloadsData);

// Line 147: Settings & Password update endpoint
studentRoutes.patch('/settings/password', updateStudentPassword);

// Line 41: Clinical Posting endpoint
studentRoutes.get('/clinical-posting', getStudentClinicalPosting);

