import { sequelize } from '../config/database.js';
import { AcademicSession } from './AcademicSession.js';
import { Announcement } from './Announcement.js';
import { AnnouncementRead } from './AnnouncementRead.js';
import { AuditLog } from './AuditLog.js';
import { CalendarEntry } from './CalendarEntry.js';
import { Campus } from './Campus.js';
import { ClinicalPosting } from './ClinicalPosting.js';
import { ContactMessage } from './ContactMessage.js';
import { Course } from './Course.js';
import { Document } from './Document.js';
import { DownloadDocument } from './DownloadDocument.js';
import { CourseRegistration } from './CourseRegistration.js';
import { EmergencyContact } from './EmergencyContact.js';
import { Event } from './Event.js';
import { Faq } from './Faq.js';
import { FeeItem } from './FeeItem.js';
import { FeeStructure } from './FeeStructure.js';
import { NextOfKin } from './NextOfKin.js';
import { Notification } from './Notification.js';
import { Payment } from './Payment.js';
import { Programme } from './Programme.js';
import { Result } from './Result.js';
import { ResultHistory } from './ResultHistory.js';
import { Semester } from './Semester.js';
import { Student } from './Student.js';
import { User } from './User.js';

let associationsRegistered = false;

export const initModels = () => {
  if (associationsRegistered) {
    return;
  }

  User.hasOne(Student, {
    as: 'student',
    foreignKey: 'userId',
    onDelete: 'CASCADE',
  });
  Student.belongsTo(User, {
    as: 'user',
    foreignKey: 'userId',
  });

  Campus.hasMany(Student, {
    as: 'students',
    foreignKey: 'campusId',
  });
  Student.belongsTo(Campus, {
    as: 'campus',
    foreignKey: 'campusId',
  });

  Programme.hasMany(Student, {
    as: 'students',
    foreignKey: 'programmeId',
  });
  Student.belongsTo(Programme, {
    as: 'programme',
    foreignKey: 'programmeId',
  });

  Student.hasMany(Result, { as: 'results', foreignKey: 'studentId' });
  Result.belongsTo(Student, { as: 'student', foreignKey: 'studentId' });
  Course.hasMany(Result, { as: 'results', foreignKey: 'courseId' });
  Result.belongsTo(Course, { as: 'course', foreignKey: 'courseId' });
  AcademicSession.hasMany(Result, { as: 'results', foreignKey: 'academicSessionId' });
  Result.belongsTo(AcademicSession, {
    as: 'academicSession',
    foreignKey: 'academicSessionId',
  });
  Result.hasMany(ResultHistory, { as: 'history', foreignKey: 'resultId' });
  ResultHistory.belongsTo(Result, { as: 'result', foreignKey: 'resultId' });

  Programme.hasMany(Course, {
    as: 'courses',
    foreignKey: 'programmeId',
  });
  Course.belongsTo(Programme, {
    as: 'programme',
    foreignKey: 'programmeId',
  });

  Course.belongsTo(Course, {
    as: 'prerequisite',
    foreignKey: 'prerequisiteCourseId',
  });

  AcademicSession.hasMany(Semester, {
    as: 'semesters',
    foreignKey: 'academicSessionId',
  });
  Semester.belongsTo(AcademicSession, {
    as: 'academicSession',
    foreignKey: 'academicSessionId',
  });

  Student.hasMany(EmergencyContact, {
    as: 'emergencyContacts',
    foreignKey: 'studentId',
    onDelete: 'CASCADE',
  });
  EmergencyContact.belongsTo(Student, {
    as: 'student',
    foreignKey: 'studentId',
  });

  Student.hasMany(NextOfKin, {
    as: 'nextOfKin',
    foreignKey: 'studentId',
    onDelete: 'CASCADE',
  });
  NextOfKin.belongsTo(Student, {
    as: 'student',
    foreignKey: 'studentId',
  });

  Student.hasMany(Document, {
    as: 'documents',
    foreignKey: 'studentId',
    onDelete: 'CASCADE',
  });
  Document.belongsTo(Student, {
    as: 'student',
    foreignKey: 'studentId',
  });

  FeeStructure.hasMany(FeeItem, {
    as: 'items',
    foreignKey: 'feeStructureId',
    onDelete: 'CASCADE',
  });
  FeeItem.belongsTo(FeeStructure, {
    as: 'feeStructure',
    foreignKey: 'feeStructureId',
  });

  AcademicSession.hasMany(FeeStructure, {
    as: 'feeStructures',
    foreignKey: 'academicSessionId',
  });
  FeeStructure.belongsTo(AcademicSession, {
    as: 'academicSession',
    foreignKey: 'academicSessionId',
  });

  Programme.hasMany(FeeStructure, {
    as: 'feeStructures',
    foreignKey: 'programmeId',
  });
  FeeStructure.belongsTo(Programme, {
    as: 'programme',
    foreignKey: 'programmeId',
  });

  Student.hasMany(Payment, {
    as: 'payments',
    foreignKey: 'studentId',
  });
  Payment.belongsTo(Student, {
    as: 'student',
    foreignKey: 'studentId',
  });

  FeeStructure.hasMany(Payment, {
    as: 'payments',
    foreignKey: 'feeStructureId',
  });
  Payment.belongsTo(FeeStructure, {
    as: 'feeStructure',
    foreignKey: 'feeStructureId',
  });

  AcademicSession.hasMany(Payment, {
    as: 'payments',
    foreignKey: 'academicSessionId',
  });
  Payment.belongsTo(AcademicSession, {
    as: 'academicSession',
    foreignKey: 'academicSessionId',
  });

  User.hasMany(Payment, {
    as: 'recordedPayments',
    foreignKey: 'recordedBy',
  });
  Payment.belongsTo(User, {
    as: 'recorder',
    foreignKey: 'recordedBy',
  });

  Student.hasMany(ClinicalPosting, {
    as: 'clinicalPostings',
    foreignKey: 'studentId',
    onDelete: 'CASCADE',
  });
  ClinicalPosting.belongsTo(Student, {
    as: 'student',
    foreignKey: 'studentId',
  });

  Announcement.belongsTo(User, {
    as: 'author',
    foreignKey: 'authorId',
  });

  // Announcement read tracking
  Announcement.hasMany(AnnouncementRead, {
    as: 'reads',
    foreignKey: 'announcementId',
    onDelete: 'CASCADE',
  });
  AnnouncementRead.belongsTo(Announcement, {
    as: 'announcement',
    foreignKey: 'announcementId',
  });

  User.hasMany(AnnouncementRead, {
    as: 'announcementReads',
    foreignKey: 'userId',
    onDelete: 'CASCADE',
  });
  AnnouncementRead.belongsTo(User, {
    as: 'user',
    foreignKey: 'userId',
  });

  Event.belongsTo(Campus, {
    as: 'campus',
    foreignKey: 'campusId',
  });
  Event.belongsTo(User, {
    as: 'creator',
    foreignKey: 'createdById',
  });

  DownloadDocument.belongsTo(AcademicSession, {
    as: 'academicSession',
    foreignKey: 'academicSessionId',
  });
  DownloadDocument.belongsTo(User, {
    as: 'uploader',
    foreignKey: 'uploadedBy',
  });

  ContactMessage.belongsTo(User, {
    as: 'assignee',
    foreignKey: 'assignedTo',
  });
  ContactMessage.belongsTo(User, {
    as: 'replier',
    foreignKey: 'repliedBy',
  });

  Student.hasMany(CourseRegistration, { as: 'courseRegistrations', foreignKey: 'studentId' });
  CourseRegistration.belongsTo(Student, { as: 'student', foreignKey: 'studentId' });

  Course.hasMany(CourseRegistration, { as: 'registrations', foreignKey: 'courseId' });
  CourseRegistration.belongsTo(Course, { as: 'course', foreignKey: 'courseId' });

  AcademicSession.hasMany(CourseRegistration, { as: 'courseRegistrations', foreignKey: 'academicSessionId' });
  CourseRegistration.belongsTo(AcademicSession, { as: 'academicSession', foreignKey: 'academicSessionId' });

  Semester.hasMany(CourseRegistration, { as: 'courseRegistrations', foreignKey: 'semesterId' });
  CourseRegistration.belongsTo(Semester, { as: 'semester', foreignKey: 'semesterId' });

  // Notification associations
  User.hasMany(Notification, {
    as: 'notifications',
    foreignKey: 'userId',
    onDelete: 'CASCADE',
  });
  Notification.belongsTo(User, {
    as: 'user',
    foreignKey: 'userId',
  });

  // CalendarEntry associations
  AcademicSession.hasMany(CalendarEntry, {
    as: 'calendarEntries',
    foreignKey: 'academicSessionId',
    onDelete: 'CASCADE',
  });
  CalendarEntry.belongsTo(AcademicSession, {
    as: 'academicSession',
    foreignKey: 'academicSessionId',
  });

  Semester.hasMany(CalendarEntry, {
    as: 'calendarEntries',
    foreignKey: 'semesterId',
    onDelete: 'SET NULL',
  });
  CalendarEntry.belongsTo(Semester, {
    as: 'semester',
    foreignKey: 'semesterId',
  });


  associationsRegistered = true;
};

initModels();

export {
  AcademicSession,
  Announcement,
  AnnouncementRead,
  AuditLog,
  CalendarEntry,
  Campus,
  ClinicalPosting,
  ContactMessage,
  Course,
  CourseRegistration,
  Document,
  DownloadDocument,
  EmergencyContact,
  Event,
  Faq,
  FeeItem,
  FeeStructure,
  NextOfKin,
  Notification,
  Payment,
  Programme,
  Result,
  ResultHistory,
  Semester,
  Student,
  User,
  sequelize,
};




