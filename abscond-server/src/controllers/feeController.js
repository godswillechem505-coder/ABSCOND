import { Op } from 'sequelize';
import { sequelize } from '../config/database.js';
import {
  AcademicSession,
  Campus,
  FeeItem,
  FeeStructure,
  Payment,
  Programme,
  Student,
  User,
} from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logAuditAction } from '../utils/auditLogger.js';


const studentBriefInclude = [
  { model: Campus, as: 'campus', attributes: ['id', 'name', 'code', 'slug'] },
  { model: Programme, as: 'programme', attributes: ['id', 'name', 'code', 'slug'] },
  { model: User, as: 'user', attributes: ['id', 'email', 'identifier'] },
];

export const listFeeStructures = asyncHandler(async (req, res) => {
  const where = {};
  if (req.query.academicSessionId) {
    where.academicSessionId = req.query.academicSessionId;
  }
  if (req.query.programmeId) {
    where[Op.or] = [{ programmeId: req.query.programmeId }, { programmeId: null }];
  }
  if (req.query.level && req.query.level !== 'all') {
    where.level = { [Op.in]: [req.query.level, 'all'] };
  }
  if (req.query.status) {
    where.status = req.query.status;
  }

  const feeStructures = await FeeStructure.findAll({
    where,
    include: [
      { model: FeeItem, as: 'items' },
      { model: AcademicSession, as: 'academicSession', attributes: ['id', 'name'] },
      { model: Programme, as: 'programme', attributes: ['id', 'name', 'code'] },
    ],
    order: [['createdAt', 'DESC']],
  });

  return res.json({ feeStructures });
});

export const createFeeStructure = asyncHandler(async (req, res) => {
  const {
    title,
    academicSessionId,
    programmeId = null,
    level = '100',
    semester = 'all',
    dueDate = null,
    status = 'published',
    description = '',
    items = [],
  } = req.body;

  if (!title || !academicSessionId) {
    return res.status(400).json({
      message: 'Title and Academic Session are required.',
    });
  }

  const totalAmount = (items || []).reduce(
    (acc, item) => acc + Number(item.amount || 0),
    0,
  );

  const result = await sequelize.transaction(async (t) => {
    const feeStructure = await FeeStructure.create(
      {
        title: title.trim(),
        academicSessionId,
        programmeId: programmeId || null,
        level,
        semester,
        dueDate: dueDate || null,
        status,
        description,
        totalAmount,
      },
      { transaction: t },
    );

    if (items && items.length > 0) {
      const itemsToCreate = items.map((item) => ({
        feeStructureId: feeStructure.id,
        name: item.name.trim(),
        category: item.category || 'tuition',
        amount: Number(item.amount) || 0,
        isCompulsory: item.isCompulsory !== false,
      }));

      await FeeItem.bulkCreate(itemsToCreate, { transaction: t });
    }

    return feeStructure;
  });

  const created = await FeeStructure.findByPk(result.id, {
    include: [
      { model: FeeItem, as: 'items' },
      { model: AcademicSession, as: 'academicSession' },
      { model: Programme, as: 'programme' },
    ],
  });

  await logAuditAction({
    req,
    action: 'CREATE_FEE_STRUCTURE',
    resource: 'FeeStructure',
    resourceId: created.id,
    details: { title: created.title, totalAmount: created.totalAmount },
  });

  return res.status(201).json({ feeStructure: created });
});

export const updateFeeStructure = asyncHandler(async (req, res) => {
  const { feeStructureId } = req.params;
  const {
    title,
    academicSessionId,
    programmeId,
    level,
    semester,
    dueDate,
    status,
    description,
    items,
  } = req.body;

  const feeStructure = await FeeStructure.findByPk(feeStructureId, {
    include: [{ model: FeeItem, as: 'items' }],
  });

  if (!feeStructure) {
    return res.status(404).json({ message: 'Fee structure not found.' });
  }

  await sequelize.transaction(async (t) => {
    if (title !== undefined) feeStructure.title = title.trim();
    if (academicSessionId !== undefined) feeStructure.academicSessionId = academicSessionId;
    if (programmeId !== undefined) feeStructure.programmeId = programmeId || null;
    if (level !== undefined) feeStructure.level = level;
    if (semester !== undefined) feeStructure.semester = semester;
    if (dueDate !== undefined) feeStructure.dueDate = dueDate || null;
    if (status !== undefined) feeStructure.status = status;
    if (description !== undefined) feeStructure.description = description;

    if (items && Array.isArray(items)) {
      await FeeItem.destroy({ where: { feeStructureId }, transaction: t });
      const itemsToCreate = items.map((item) => ({
        feeStructureId,
        name: item.name.trim(),
        category: item.category || 'tuition',
        amount: Number(item.amount) || 0,
        isCompulsory: item.isCompulsory !== false,
      }));
      await FeeItem.bulkCreate(itemsToCreate, { transaction: t });

      feeStructure.totalAmount = items.reduce(
        (acc, item) => acc + Number(item.amount || 0),
        0,
      );
    }

    await feeStructure.save({ transaction: t });
  });

  const updated = await FeeStructure.findByPk(feeStructureId, {
    include: [
      { model: FeeItem, as: 'items' },
      { model: AcademicSession, as: 'academicSession' },
      { model: Programme, as: 'programme' },
    ],
  });

  await logAuditAction({
    req,
    action: 'UPDATE_FEE_STRUCTURE',
    resource: 'FeeStructure',
    resourceId: updated.id,
    details: { title: updated.title, totalAmount: updated.totalAmount },
  });

  return res.json({ feeStructure: updated });
});

export const deleteFeeStructure = asyncHandler(async (req, res) => {
  const { feeStructureId } = req.params;
  const feeStructure = await FeeStructure.findByPk(feeStructureId);

  if (!feeStructure) {
    return res.status(404).json({ message: 'Fee structure not found.' });
  }

  await feeStructure.destroy();

  await logAuditAction({
    req,
    action: 'DELETE_FEE_STRUCTURE',
    resource: 'FeeStructure',
    resourceId: feeStructureId,
    details: { title: feeStructure.title },
  });

  return res.json({ message: 'Fee structure deleted successfully.' });
});


export const listPayments = asyncHandler(async (req, res) => {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 100);
  const search = String(req.query.search || '').trim();

  const where = {};
  if (req.query.status) {
    where.status = req.query.status;
  }
  if (req.query.paymentMethod) {
    where.paymentMethod = req.query.paymentMethod;
  }
  if (req.query.academicSessionId) {
    where.academicSessionId = req.query.academicSessionId;
  }
  if (req.query.studentId) {
    where.studentId = req.query.studentId;
  }

  const studentWhere = {};
  if (search) {
    studentWhere[Op.or] = [
      { matricNumber: { [Op.like]: `%${search}%` } },
      { firstName: { [Op.like]: `%${search}%` } },
      { lastName: { [Op.like]: `%${search}%` } },
    ];
  }

  const { count, rows } = await Payment.findAndCountAll({
    where,
    include: [
      {
        model: Student,
        as: 'student',
        where: search ? studentWhere : undefined,
        include: studentBriefInclude,
      },
      { model: FeeStructure, as: 'feeStructure', attributes: ['id', 'title', 'level'] },
      { model: AcademicSession, as: 'academicSession', attributes: ['id', 'name'] },
      { model: User, as: 'recorder', attributes: ['id', 'email', 'staffRole'] },
    ],
    order: [['paidAt', 'DESC']],
    limit,
    offset: (page - 1) * limit,
  });

  return res.json({
    payments: rows,
    pagination: { page, limit, total: count, pages: Math.ceil(count / limit) },
  });
});

export const recordManualPayment = asyncHandler(async (req, res) => {
  const {
    matricNumber,
    studentId: directStudentId,
    feeStructureId = null,
    academicSessionId,
    semester = 'first',
    amount,
    paymentMethod = 'bank_transfer',
    reference,
    receiptNumber,
    notes = '',
    paidAt = new Date(),
  } = req.body;

  if (!amount || Number(amount) <= 0) {
    return res.status(400).json({ message: 'Valid payment amount is required.' });
  }

  let student;
  if (directStudentId) {
    student = await Student.findByPk(directStudentId, {
      include: studentBriefInclude,
    });
  } else if (matricNumber) {
    student = await Student.findOne({
      where: { matricNumber: matricNumber.trim() },
      include: studentBriefInclude,
    });
  }

  if (!student) {
    return res.status(404).json({ message: 'Student not found with the provided identifier.' });
  }

  const session = academicSessionId
    ? await AcademicSession.findByPk(academicSessionId)
    : await AcademicSession.findOne({ where: { isCurrent: true } });


  if (!session) {
    return res.status(400).json({ message: 'Valid academic session is required.' });
  }

  const generatedRef =
    reference?.trim() ||
    `MAN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const generatedReceipt =
    receiptNumber?.trim() ||
    `REC-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

  const payment = await Payment.create({
    studentId: student.id,
    feeStructureId: feeStructureId || null,
    academicSessionId: session.id,
    semester,
    amount: Number(amount),
    currency: 'NGN',
    paymentMethod,
    reference: generatedRef,
    receiptNumber: generatedReceipt,
    status: 'verified',
    paidAt: paidAt ? new Date(paidAt) : new Date(),
    recordedBy: req.user?.id || null,
    notes: notes?.trim() || null,
  });

  const createdPayment = await Payment.findByPk(payment.id, {
    include: [
      { model: Student, as: 'student', include: studentBriefInclude },
      { model: FeeStructure, as: 'feeStructure' },
      { model: AcademicSession, as: 'academicSession' },
      { model: User, as: 'recorder', attributes: ['id', 'email', 'staffRole'] },
    ],
  });

  await logAuditAction({
    req,
    action: 'RECORD_MANUAL_PAYMENT',
    resource: 'Payment',
    resourceId: createdPayment.id,
    details: { matricNumber: student.matricNumber, amount: payment.amount, receiptNumber: payment.receiptNumber },
  });

  return res.status(201).json({
    payment: createdPayment,
    message: 'Manual payment recorded successfully.',
  });
});


export const getOutstandingBalances = asyncHandler(async (req, res) => {
  const {
    campusId,
    programmeId,
    level,
    paymentStatus,
    search = '',
    sessionId,
  } = req.query;

  let session;
  if (sessionId) {
    session = await AcademicSession.findByPk(sessionId);
  } else {
    session = await AcademicSession.findOne({ where: { isCurrent: true } });
  }

  const studentWhere = {};
  if (campusId) studentWhere.campusId = campusId;
  if (programmeId) studentWhere.programmeId = programmeId;
  if (level && level !== 'all') studentWhere.level = level;
  if (search) {
    studentWhere[Op.or] = [
      { matricNumber: { [Op.like]: `%${search}%` } },
      { firstName: { [Op.like]: `%${search}%` } },
      { lastName: { [Op.like]: `%${search}%` } },
    ];
  }

  const students = await Student.findAll({
    where: studentWhere,
    include: studentBriefInclude,
    order: [
      ['lastName', 'ASC'],
      ['firstName', 'ASC'],
    ],
  });

  const structures = session
    ? await FeeStructure.findAll({
        where: {
          academicSessionId: session.id,
          status: 'published',
        },
        include: [{ model: FeeItem, as: 'items' }],
      })
    : [];

  const payments = session
    ? await Payment.findAll({
        where: {
          academicSessionId: session.id,
          status: 'verified',
        },
      })
    : [];

  const paymentByStudent = {};
  for (const p of payments) {
    paymentByStudent[p.studentId] = (paymentByStudent[p.studentId] || 0) + Number(p.amount);
  }

  let totalBilledSum = 0;
  let totalPaidSum = 0;
  let totalOutstandingSum = 0;

  const records = students.map((std) => {
    // Find matching fee structures for student's programme and level
    const matchingStructures = structures.filter((s) => {
      const progMatch = !s.programmeId || s.programmeId === std.programmeId;
      const levelMatch = s.level === 'all' || s.level === std.level;
      return progMatch && levelMatch;
    });

    const totalBilled = matchingStructures.reduce(
      (acc, s) => acc + Number(s.totalAmount || 0),
      0,
    );
    const amountPaid = paymentByStudent[std.id] || 0;
    const balance = Math.max(totalBilled - amountPaid, 0);

    let status = 'unpaid';
    if (totalBilled > 0 && amountPaid >= totalBilled) {
      status = 'paid';
    } else if (amountPaid > 0 && amountPaid < totalBilled) {
      status = 'partial';
    } else if (totalBilled === 0) {
      status = 'no_fees';
    }

    totalBilledSum += totalBilled;
    totalPaidSum += amountPaid;
    totalOutstandingSum += balance;

    return {
      studentId: std.id,
      matricNumber: std.matricNumber,
      fullName: `${std.lastName} ${std.firstName}${std.middleName ? ` ${std.middleName}` : ''}`,
      gender: std.gender,
      phone: std.phone,
      email: std.user?.email || '',
      campus: std.campus?.name || 'N/A',
      campusId: std.campusId,
      programme: std.programme?.name || 'N/A',
      programmeId: std.programmeId,
      level: std.level,
      totalBilled,
      amountPaid,
      outstandingBalance: balance,
      status,
      sessionName: session?.name || 'N/A',
    };
  });

  const filteredRecords = paymentStatus
    ? records.filter((r) => r.status === paymentStatus)
    : records;

  return res.json({
    records: filteredRecords,
    summary: {
      totalStudents: students.length,
      totalBilled: totalBilledSum,
      totalPaid: totalPaidSum,
      totalOutstanding: totalOutstandingSum,
      collectionRate:
        totalBilledSum > 0
          ? Number(((totalPaidSum / totalBilledSum) * 100).toFixed(1))
          : 0,
    },
  });
});

export const exportOutstandingBalancesCsv = asyncHandler(async (req, res) => {
  const { campusId, programmeId, level, paymentStatus, sessionId } = req.query;

  let session;
  if (sessionId) {
    session = await AcademicSession.findByPk(sessionId);
  } else {
    session = await AcademicSession.findOne({ where: { isCurrent: true } });
  }

  const studentWhere = {};
  if (campusId) studentWhere.campusId = campusId;
  if (programmeId) studentWhere.programmeId = programmeId;
  if (level && level !== 'all') studentWhere.level = level;

  const students = await Student.findAll({
    where: studentWhere,
    include: studentBriefInclude,
    order: [
      ['lastName', 'ASC'],
      ['firstName', 'ASC'],
    ],
  });

  const structures = session
    ? await FeeStructure.findAll({
        where: {
          academicSessionId: session.id,
          status: 'published',
        },
      })
    : [];

  const payments = session
    ? await Payment.findAll({
        where: {
          academicSessionId: session.id,
          status: 'verified',
        },
      })
    : [];

  const paymentByStudent = {};
  for (const p of payments) {
    paymentByStudent[p.studentId] = (paymentByStudent[p.studentId] || 0) + Number(p.amount);
  }

  const rows = [];
  rows.push([
    'Matric Number',
    'Student Name',
    'Campus',
    'Programme',
    'Level',
    'Academic Session',
    'Total Fees (NGN)',
    'Amount Paid (NGN)',
    'Outstanding Balance (NGN)',
    'Payment Status',
    'Phone',
    'Email',
  ]);

  for (const std of students) {
    const matchingStructures = structures.filter((s) => {
      const progMatch = !s.programmeId || s.programmeId === std.programmeId;
      const levelMatch = s.level === 'all' || s.level === std.level;
      return progMatch && levelMatch;
    });

    const totalBilled = matchingStructures.reduce(
      (acc, s) => acc + Number(s.totalAmount || 0),
      0,
    );
    const amountPaid = paymentByStudent[std.id] || 0;
    const balance = Math.max(totalBilled - amountPaid, 0);

    let status = 'Unpaid';
    if (totalBilled > 0 && amountPaid >= totalBilled) {
      status = 'Fully Paid';
    } else if (amountPaid > 0 && amountPaid < totalBilled) {
      status = 'Partially Paid';
    } else if (totalBilled === 0) {
      status = 'No Fees Assigned';
    }

    if (paymentStatus) {
      const statusKey = status.toLowerCase().includes('fully')
        ? 'paid'
        : status.toLowerCase().includes('partially')
          ? 'partial'
          : 'unpaid';
      if (statusKey !== paymentStatus) continue;
    }

    rows.push([
      `"${std.matricNumber}"`,
      `"${std.lastName} ${std.firstName}${std.middleName ? ` ${std.middleName}` : ''}"`,
      `"${std.campus?.name || ''}"`,
      `"${std.programme?.name || ''}"`,
      `"${std.level}"`,
      `"${session?.name || ''}"`,
      totalBilled.toFixed(2),
      amountPaid.toFixed(2),
      balance.toFixed(2),
      `"${status}"`,
      `"${std.phone || ''}"`,
      `"${std.user?.email || ''}"`,
    ]);
  }

  const csvString = rows.map((r) => r.join(',')).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=abscons-outstanding-balances-${new Date().toISOString().slice(0, 10)}.csv`,
  );
  return res.send(csvString);
});

export const getFeeStats = asyncHandler(async (_req, res) => {
  const currentSession = await AcademicSession.findOne({ where: { isCurrent: true } });

  let totalBilled = 0;
  let totalCollected = 0;

  if (currentSession) {
    const students = await Student.findAll({ where: { status: 'active' } });
    const structures = await FeeStructure.findAll({
      where: { academicSessionId: currentSession.id, status: 'published' },
    });
    const payments = await Payment.findAll({
      where: { academicSessionId: currentSession.id, status: 'verified' },
    });

    const paymentByStudent = {};
    for (const p of payments) {
      paymentByStudent[p.studentId] =
        (paymentByStudent[p.studentId] || 0) + Number(p.amount);
      totalCollected += Number(p.amount);
    }

    for (const std of students) {
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
  }

  const outstanding = Math.max(totalBilled - totalCollected, 0);
  const collectionRate =
    totalBilled > 0 ? Number(((totalCollected / totalBilled) * 100).toFixed(1)) : 0;

  return res.json({
    totalBilled,
    totalCollected,
    totalOutstanding: outstanding,
    collectionRate,
  });
});
