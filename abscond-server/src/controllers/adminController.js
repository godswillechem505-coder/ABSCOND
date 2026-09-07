import { Op } from 'sequelize';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logAuditAction } from '../utils/auditLogger.js';

import {
  AcademicSession,
  Campus,
  ContactMessage,
  Document,
  FeeStructure,
  Payment,
  Programme,
  Semester,
  Student,
  User,
} from '../models/index.js';

const studentInclude = [
  { model: Campus, as: 'campus', attributes: ['id', 'name', 'slug'] },
  { model: Programme, as: 'programme', attributes: ['id', 'name', 'slug'] },
  { model: Document, as: 'documents' },
  { model: User, as: 'user', attributes: ['id', 'identifier', 'email', 'status', 'isActive', 'lastLoginAt'] },
];

export const getAdminDashboard = asyncHandler(async (_req, res) => {
  const now = new Date();

  const [
    totalStudents,
    activeStudents,
    pendingDocuments,
    totalStaff,
    currentSession,
    unreadContactMessages,
    openRegistrationWindows,
    upcomingRegistrationWindows,
  ] = await Promise.all([
    Student.count(),
    Student.count({ where: { status: 'active' } }),
    Document.count({ where: { status: 'pending' } }),
    User.count({ where: { role: { [Op.in]: ['staff', 'admin', 'super_admin'] } } }),
    AcademicSession.findOne({ where: { isCurrent: true } }),
    ContactMessage.count({ where: { status: 'new' } }),
    Semester.count({
      where: {
        registrationOpensAt: { [Op.lte]: now },
        registrationClosesAt: { [Op.gte]: now },
      },
    }),
    Semester.count({
      where: {
        registrationOpensAt: { [Op.gt]: now },
      },
    }),
  ]);

  let outstandingFees = 0;
  if (currentSession) {
    const activeStudentsList = await Student.findAll({ where: { status: 'active' } });
    const structures = await FeeStructure.findAll({
      where: { academicSessionId: currentSession.id, status: 'published' },
    });
    const payments = await Payment.findAll({
      where: { academicSessionId: currentSession.id, status: 'verified' },
    });

    let totalBilled = 0;
    let totalCollected = 0;

    for (const p of payments) {
      totalCollected += Number(p.amount);
    }

    for (const std of activeStudentsList) {
      const matchingStructures = structures.filter((s) => {
        const progMatch = !s.programmeId || s.programmeId === std.programmeId;
        const levelMatch = s.level === 'all' || s.level === std.level;
        return progMatch && levelMatch;
      });
      totalBilled += matchingStructures.reduce(
        (acc, s) => acc + Number(s.totalAmount || 0),
        0,
      );
    }

    outstandingFees = Math.max(totalBilled - totalCollected, 0);
  }

  return res.json({
    metrics: {
      totalStudents,
      activeStudents,
      pendingDocuments,
      totalStaff,
      outstandingFees,
      unreadContactMessages,
      openRegistrationWindows,
      upcomingRegistrationWindows,
    },
    // Also include top-level stats for convenience
    totalStudents,
    activeStudents,
    pendingDocuments,
    totalStaff,
    outstandingFees,
    unreadContactMessages,
    openRegistrationWindows,
    upcomingRegistrationWindows,
  });
});


export const listStudents = asyncHandler(async (req, res) => {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 100);
  const search = String(req.query.search || '').trim();
  const where = {};

  if (req.query.status) {
    where.status = req.query.status;
  }

  if (req.query.campusId) {
    where.campusId = req.query.campusId;
  }

  if (req.query.programmeId) {
    where.programmeId = req.query.programmeId;
  }

  if (search) {
    where[Op.or] = [
      { matricNumber: { [Op.like]: `%${search}%` } },
      { firstName: { [Op.like]: `%${search}%` } },
      { middleName: { [Op.like]: `%${search}%` } },
      { lastName: { [Op.like]: `%${search}%` } },
    ];
  }

  const { count, rows } = await Student.findAndCountAll({
    where,
    include: studentInclude.slice(0, 2),
    order: [
      ['lastName', 'ASC'],
      ['firstName', 'ASC'],
    ],
    limit,
    offset: (page - 1) * limit,
  });

  return res.json({
    students: rows,
    pagination: { page, limit, total: count, pages: Math.ceil(count / limit) },
  });
});

export const getStudentDetail = asyncHandler(async (req, res) => {
  const student = await Student.findByPk(req.params.studentId, {
    include: studentInclude,
  });

  if (!student) {
    return res.status(404).json({ message: 'Student not found.' });
  }

  return res.json({ student });
});

export const updateDocumentDecision = asyncHandler(async (req, res) => {

  const { status, verificationNotes = null } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({
      message: 'Document status must be approved or rejected.',
    });
  }

  const document = await Document.findByPk(req.params.documentId);
  if (!document) {
    return res.status(404).json({ message: 'Document not found.' });
  }

  document.status = status;
  document.verificationNotes = verificationNotes;
  document.verifiedAt = new Date();
  document.verifiedBy = req.user.id;
  await document.save();

  await logAuditAction({
    req,
    action: status === 'approved' ? 'APPROVE_DOCUMENT' : 'REJECT_DOCUMENT',
    resource: 'Document',
    resourceId: document.id,
    details: { name: document.name, status, verificationNotes },
  });

  return res.json({ document });
});

export const updateStudentStatus = asyncHandler(async (req, res) => {
  const { status, reason = null } = req.body;
  const allowedStatuses = ['active', 'inactive', 'suspended', 'graduated'];

  if (!status || !allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}`,
    });
  }

  const student = await Student.findByPk(req.params.studentId);
  if (!student) {
    return res.status(404).json({ message: 'Student record not found.' });
  }

  const user = await User.findByPk(student.userId);

  const oldStudentStatus = student.status;

  student.status = status;
  await student.save();

  if (user) {
    if (status === 'active') {
      user.status = 'active';
      user.isActive = true;
    } else {
      user.status = status === 'suspended' ? 'suspended' : 'inactive';
      user.isActive = false;
      user.refreshTokenVersion = (user.refreshTokenVersion || 0) + 1;
    }
    await user.save();
  }

  await logAuditAction({
    req,
    action: status === 'active' ? 'REACTIVATE_STUDENT' : 'DEACTIVATE_STUDENT',
    resource: 'Student',
    resourceId: student.id,
    details: {
      studentId: student.id,
      matricNumber: student.matricNumber,
      previousStatus: oldStudentStatus,
      newStatus: status,
      reason,
    },
  });

  const updated = await Student.findByPk(student.id, {
    include: studentInclude,
  });

  const actionVerb = status === 'active' ? 'reactivated' : 'deactivated';
  return res.json({
    message: `Student account for ${student.firstName} ${student.lastName} (${student.matricNumber}) successfully ${actionVerb}. ${status !== 'active' ? 'Student portal login has been revoked while all academic records remain preserved.' : 'Portal login access restored.'}`,
    student: updated,
  });
});

export const deactivateStudentAccount = asyncHandler(async (req, res) => {
  req.body.status = 'inactive';
  return updateStudentStatus(req, res);
});

export const resetStudentPassword = asyncHandler(async (req, res) => {
  const student = await Student.findByPk(req.params.studentId, {
    include: studentInclude,
  });
  if (!student) {
    return res.status(404).json({ message: 'Student not found.' });
  }

  const user = await User.findByPk(student.userId);
  if (!user) {
    return res.status(404).json({ message: 'Associated student user account not found.' });
  }

  let tempPassword = req.body.newPassword ? String(req.body.newPassword).trim() : '';
  if (!tempPassword) {
    // Generate a secure, user-friendly temporary password
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let randomPart = '';
    for (let i = 0; i < 6; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    tempPassword = `Abscon#${randomPart}`;
  } else if (tempPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
  }

  user.password = tempPassword;
  user.refreshTokenVersion = (user.refreshTokenVersion || 0) + 1;
  await user.save();

  await logAuditAction({
    req,
    action: 'ADMIN_RESET_STUDENT_PASSWORD',
    resource: 'Student',
    resourceId: student.id,
    details: {
      studentId: student.id,
      matricNumber: student.matricNumber,
      userId: user.id,
      resetByAdminId: req.user.id,
    },
  });

  return res.json({
    message: `Portal password for ${student.firstName} ${student.lastName} (${student.matricNumber}) has been successfully reset.`,
    temporaryPassword: tempPassword,
    student,
  });
});

