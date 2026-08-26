import { Op } from 'sequelize';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logAuditAction } from '../utils/auditLogger.js';

import {
  AcademicSession,
  Campus,
  Document,
  FeeStructure,
  Payment,
  Programme,
  Student,
  User,
} from '../models/index.js';

const studentInclude = [
  { model: Campus, as: 'campus', attributes: ['id', 'name', 'slug'] },
  { model: Programme, as: 'programme', attributes: ['id', 'name', 'slug'] },
  { model: Document, as: 'documents' },
];

export const getAdminDashboard = asyncHandler(async (_req, res) => {
  const [totalStudents, activeStudents, pendingDocuments, totalStaff, currentSession] =
    await Promise.all([
      Student.count(),
      Student.count({ where: { status: 'active' } }),
      Document.count({ where: { status: 'pending' } }),
      User.count({ where: { role: { [Op.in]: ['staff', 'admin', 'super_admin'] } } }),
      AcademicSession.findOne({ where: { isCurrent: true } }),
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
      unreadContactMessages: null,
      upcomingRegistrationWindows: null,
    },
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

