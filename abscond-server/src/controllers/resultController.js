import {
  AcademicSession,
  Course,
  Result,
  ResultHistory,
  Student,
} from '../models/index.js';
import { calculateGradeFromScore } from '../services/gpaService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logAuditAction } from '../utils/auditLogger.js';

const gradeForScore = (score) => calculateGradeFromScore(score);



const resultInclude = [
  {
    model: Student,
    as: 'student',
    attributes: ['id', 'matricNumber', 'firstName', 'lastName'],
  },
  { model: Course, as: 'course', attributes: ['id', 'code', 'title', 'units'] },
  { model: AcademicSession, as: 'academicSession', attributes: ['id', 'name'] },
  { model: ResultHistory, as: 'history', order: [['createdAt', 'DESC']] },
];

const findReferences = async ({ matricNumber, courseCode, sessionName }) => {
  const [student, course, academicSession] = await Promise.all([
    Student.findOne({ where: { matricNumber } }),
    Course.findOne({ where: { code: courseCode } }),
    AcademicSession.findOne({ where: { name: sessionName } }),
  ]);
  return { student, course, academicSession };
};

const saveResult = async ({ input, userId, action = 'created' }) => {
  const { student, course, academicSession } = await findReferences(input);
  if (!student || !course || !academicSession) {
    throw Object.assign(
      new Error('Student, course, or academic session was not found.'),
      { status: 404 },
    );
  }

  const score = Number(input.score);
  if (!Number.isFinite(score) || score < 0 || score > 100) {
    throw Object.assign(new Error('Score must be a number from 0 to 100.'), {
      status: 400,
    });
  }
  if (!['first', 'second'].includes(input.semester)) {
    throw Object.assign(new Error('Semester must be first or second.'), {
      status: 400,
    });
  }

  const calculated = gradeForScore(score);
  const [result, created] = await Result.findOrCreate({
    where: {
      studentId: student.id,
      courseId: course.id,
      academicSessionId: academicSession.id,
      semester: input.semester,
    },
    defaults: { score, ...calculated, units: course.units, enteredBy: userId },
  });
  const previousValues = created ? null : result.toJSON();
  if (!created) {
    result.set({ score, ...calculated, units: course.units, enteredBy: userId });
    await result.save();
  }
  await ResultHistory.create({
    resultId: result.id,
    action: created ? 'created' : action,
    previousValues,
    newValues: result.toJSON(),
    changedBy: userId,
  });
  return result;
};

export const listResults = asyncHandler(async (req, res) => {
  const where = {};
  if (req.query.status) where.status = req.query.status;
  if (req.query.semester) where.semester = req.query.semester;
  const results = await Result.findAll({
    where,
    include: resultInclude,
    order: [['createdAt', 'DESC']],
  });
  return res.json({ results });
});

export const enterResult = asyncHandler(async (req, res) => {

  const result = await saveResult({
    input: req.body,
    userId: req.user.id,
    action: 'updated',
  });
  await logAuditAction({
    req,
    action: 'RESULT_ENTRY',
    resource: 'Result',
    resourceId: result.id,
    details: { matricNumber: req.body.matricNumber, courseCode: req.body.courseCode, score: req.body.score },
  });
  return res.status(201).json({ result });
});

export const bulkEnterResults = asyncHandler(async (req, res) => {
  const csv = String(req.body.csv || '');
  const lines = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 2)
    return res
      .status(400)
      .json({ message: 'CSV must include a header and at least one result row.' });
  const headers = lines
    .shift()
    .split(',')
    .map((header) => header.trim().toLowerCase());
  const required = ['matricnumber', 'coursecode', 'sessionname', 'semester', 'score'];
  if (required.some((header) => !headers.includes(header)))
    return res
      .status(400)
      .json({ message: `CSV headers required: ${required.join(', ')}` });

  const imported = [];
  const errors = [];
  for (const [index, line] of lines.entries()) {
    const values = line.split(',').map((value) => value.trim());
    const input = Object.fromEntries(
      headers.map((header, valueIndex) => [header, values[valueIndex]]),
    );
    try {
      imported.push(
        await saveResult({ input, userId: req.user.id, action: 'updated' }),
      );
    } catch (error) {
      errors.push({ row: index + 2, message: error.message });
    }
  }

  await logAuditAction({
    req,
    action: 'BULK_RESULTS_UPLOAD',
    resource: 'Result',
    details: { importedCount: imported.length, errorCount: errors.length },
  });

  return res
    .status(errors.length ? 207 : 201)
    .json({ imported: imported.length, errors });
});

export const setResultPublication = asyncHandler(async (req, res) => {
  const result = await Result.findByPk(req.params.resultId);
  if (!result) return res.status(404).json({ message: 'Result not found.' });
  const status = req.body.published === true ? 'published' : 'draft';
  const action = status === 'published' ? 'published' : 'unpublished';
  const previousValues = result.toJSON();
  result.status = status;
  result.publishedAt = status === 'published' ? new Date() : null;
  result.publishedBy = status === 'published' ? req.user.id : null;
  await result.save();
  await ResultHistory.create({
    resultId: result.id,
    action,
    previousValues,
    newValues: result.toJSON(),
    changedBy: req.user.id,
  });

  await logAuditAction({
    req,
    action: status === 'published' ? 'PUBLISH_RESULT' : 'UNPUBLISH_RESULT',
    resource: 'Result',
    resourceId: result.id,
    details: { status, courseId: result.courseId, studentId: result.studentId },
  });

  return res.json({ result });
});


export const getResultHistory = asyncHandler(async (req, res) => {
  const history = await ResultHistory.findAll({
    where: { resultId: req.params.resultId },
    order: [['createdAt', 'DESC']],
  });
  return res.json({ history });
});
