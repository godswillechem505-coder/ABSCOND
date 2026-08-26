import { Campus, ClinicalPosting, Programme, Student, User } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listClinicalPostings = asyncHandler(async (req, res) => {
  const { status, studentId } = req.query;
  const where = {};
  if (status) where.status = status;
  if (studentId) where.studentId = studentId;

  const postings = await ClinicalPosting.findAll({
    where,
    include: [
      {
        model: Student,
        as: 'student',
        include: [
          { model: Campus, as: 'campus', attributes: ['id', 'name'] },
          { model: Programme, as: 'programme', attributes: ['id', 'name'] },
          { model: User, as: 'user', attributes: ['id', 'email'] },
        ],
      },
    ],
    order: [['startDate', 'DESC']],
  });

  return res.json({ postings });
});

export const assignClinicalPosting = asyncHandler(async (req, res) => {
  const {
    matricNumber,
    studentId: directStudentId,
    hospitalName,
    wardUnit,
    supervisorName,
    supervisorContact,
    startDate,
    endDate,
    status = 'assigned',
    notes,
  } = req.body;

  if (!hospitalName || !wardUnit || !supervisorName || !startDate || !endDate) {
    return res.status(400).json({
      message: 'Hospital, Ward, Supervisor, and Date range are required.',
    });
  }

  let student;
  if (directStudentId) {
    student = await Student.findByPk(directStudentId);
  } else if (matricNumber) {
    student = await Student.findOne({ where: { matricNumber: matricNumber.trim() } });
  }

  if (!student) {
    return res.status(404).json({ message: 'Student not found.' });
  }

  const posting = await ClinicalPosting.create({
    studentId: student.id,
    hospitalName: hospitalName.trim(),
    wardUnit: wardUnit.trim(),
    supervisorName: supervisorName.trim(),
    supervisorContact: supervisorContact?.trim() || null,
    startDate,
    endDate,
    status,
    notes: notes?.trim() || null,
  });

  const created = await ClinicalPosting.findByPk(posting.id, {
    include: [
      {
        model: Student,
        as: 'student',
        include: [
          { model: Campus, as: 'campus' },
          { model: Programme, as: 'programme' },
        ],
      },
    ],
  });

  return res.status(201).json({
    posting: created,
    message: 'Clinical posting assigned successfully.',
  });
});

export const updateClinicalPosting = asyncHandler(async (req, res) => {
  const { postingId } = req.params;
  const posting = await ClinicalPosting.findByPk(postingId);
  if (!posting) {
    return res.status(404).json({ message: 'Posting not found.' });
  }

  const {
    hospitalName,
    wardUnit,
    supervisorName,
    supervisorContact,
    startDate,
    endDate,
    status,
    notes,
  } = req.body;

  if (hospitalName !== undefined) posting.hospitalName = hospitalName.trim();
  if (wardUnit !== undefined) posting.wardUnit = wardUnit.trim();
  if (supervisorName !== undefined) posting.supervisorName = supervisorName.trim();
  if (supervisorContact !== undefined) posting.supervisorContact = supervisorContact;
  if (startDate !== undefined) posting.startDate = startDate;
  if (endDate !== undefined) posting.endDate = endDate;
  if (status !== undefined) posting.status = status;
  if (notes !== undefined) posting.notes = notes;

  await posting.save();

  const updated = await ClinicalPosting.findByPk(posting.id, {
    include: [
      {
        model: Student,
        as: 'student',
        include: [
          { model: Campus, as: 'campus' },
          { model: Programme, as: 'programme' },
        ],
      },
    ],
  });

  return res.json({ posting: updated, message: 'Clinical posting updated.' });
});

export const deleteClinicalPosting = asyncHandler(async (req, res) => {
  const { postingId } = req.params;
  const posting = await ClinicalPosting.findByPk(postingId);
  if (!posting) {
    return res.status(404).json({ message: 'Posting not found.' });
  }
  await posting.destroy();
  return res.json({ message: 'Clinical posting deleted.' });
});
