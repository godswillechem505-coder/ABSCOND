import { Op } from 'sequelize';
import { AcademicSession, Campus, Course, Programme, Semester } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Courses CRUD
export const listAdminCourses = asyncHandler(async (req, res) => {
  const { programmeId, level, semester, search } = req.query;
  const where = {};

  if (programmeId) where.programmeId = programmeId;
  if (level) where.level = level;
  if (semester) where.semester = semester;
  if (search) {
    where[Op.or] = [
      { code: { [Op.like]: `%${search}%` } },
      { title: { [Op.like]: `%${search}%` } },
    ];
  }

  const courses = await Course.findAll({
    where,
    include: [
      { model: Programme, as: 'programme', attributes: ['id', 'name', 'code', 'slug'] },
      { model: Course, as: 'prerequisite', attributes: ['id', 'code', 'title'] },
    ],
    order: [
      ['level', 'ASC'],
      ['semester', 'ASC'],
      ['code', 'ASC'],
    ],
  });

  return res.json({ courses });
});

export const createCourse = asyncHandler(async (req, res) => {
  const { code, title, units, level, semester, programmeId, prerequisiteCourseId, type = 'core', description } = req.body;
  if (!code || !title || !programmeId) {
    return res.status(400).json({ message: 'Code, title, and programme are required.' });
  }

  const existing = await Course.findOne({ where: { code: code.trim().toUpperCase() } });
  if (existing) {
    return res.status(400).json({ message: 'Course with this code already exists.' });
  }

  const course = await Course.create({
    code: code.trim().toUpperCase(),
    title: title.trim(),
    units: Number(units) || 3,
    level: level || '100',
    semester: semester || 'first',
    programmeId,
    prerequisiteCourseId: prerequisiteCourseId || null,
    type: type || 'core',
    description: description || null,
    isActive: true,
  });

  const created = await Course.findByPk(course.id, {
    include: [
      { model: Programme, as: 'programme' },
      { model: Course, as: 'prerequisite' },
    ],
  });

  return res.status(201).json({ course: created, message: 'Course created successfully.' });
});

export const updateCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const course = await Course.findByPk(courseId);
  if (!course) {
    return res.status(404).json({ message: 'Course not found.' });
  }

  const { code, title, units, level, semester, programmeId, prerequisiteCourseId, type, isActive, description } = req.body;
  if (code !== undefined) course.code = code.trim().toUpperCase();
  if (title !== undefined) course.title = title.trim();
  if (units !== undefined) course.units = Number(units);
  if (level !== undefined) course.level = level;
  if (semester !== undefined) course.semester = semester;
  if (programmeId !== undefined) course.programmeId = programmeId;
  if (prerequisiteCourseId !== undefined) course.prerequisiteCourseId = prerequisiteCourseId || null;
  if (type !== undefined) course.type = type;
  if (isActive !== undefined) course.isActive = isActive;
  if (description !== undefined) course.description = description;

  await course.save();

  const updated = await Course.findByPk(course.id, {
    include: [
      { model: Programme, as: 'programme' },
      { model: Course, as: 'prerequisite' },
    ],
  });

  return res.json({ course: updated, message: 'Course updated successfully.' });
});

export const deleteCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const course = await Course.findByPk(courseId);
  if (!course) {
    return res.status(404).json({ message: 'Course not found.' });
  }
  await course.destroy();
  return res.json({ message: 'Course deleted successfully.' });
});

// Programmes CRUD
export const listAdminProgrammes = asyncHandler(async (_req, res) => {
  const programmes = await Programme.findAll({
    include: [{ model: Course, as: 'courses', attributes: ['id', 'code', 'title', 'units'] }],
    order: [['name', 'ASC']],
  });
  return res.json({ programmes });
});

export const createProgramme = asyncHandler(async (req, res) => {
  const { name, code, durationYears, description, slug } = req.body;
  if (!name || !code) {
    return res.status(400).json({ message: 'Programme name and code are required.' });
  }

  const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const programme = await Programme.create({
    name: name.trim(),
    code: code.trim().toUpperCase(),
    slug: generatedSlug,
    durationYears: Number(durationYears) || 3,
    description: description || null,
    isActive: true,
  });

  return res.status(201).json({ programme, message: 'Programme created successfully.' });
});

export const updateProgramme = asyncHandler(async (req, res) => {
  const { programmeId } = req.params;
  const programme = await Programme.findByPk(programmeId);
  if (!programme) {
    return res.status(404).json({ message: 'Programme not found.' });
  }

  const { name, code, durationYears, description, isActive } = req.body;
  if (name !== undefined) programme.name = name.trim();
  if (code !== undefined) programme.code = code.trim().toUpperCase();
  if (durationYears !== undefined) programme.durationYears = Number(durationYears);
  if (description !== undefined) programme.description = description;
  if (isActive !== undefined) programme.isActive = isActive;

  await programme.save();
  return res.json({ programme, message: 'Programme updated successfully.' });
});

// Campuses CRUD
export const listAdminCampuses = asyncHandler(async (_req, res) => {
  const campuses = await Campus.findAll({
    order: [['name', 'ASC']],
  });
  return res.json({ campuses });
});

export const createCampus = asyncHandler(async (req, res) => {
  const { name, code, city, address, slug } = req.body;
  if (!name || !code) {
    return res.status(400).json({ message: 'Campus name and code are required.' });
  }

  const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const campus = await Campus.create({
    name: name.trim(),
    code: code.trim().toUpperCase(),
    city: city?.trim() || name.trim(),
    address: address?.trim() || `${city || name}, Abia State`,
    slug: generatedSlug,
    isActive: true,
  });

  return res.status(201).json({ campus, message: 'Campus created successfully.' });
});

export const updateCampus = asyncHandler(async (req, res) => {
  const { campusId } = req.params;
  const campus = await Campus.findByPk(campusId);
  if (!campus) {
    return res.status(404).json({ message: 'Campus not found.' });
  }

  const { name, code, city, address, isActive } = req.body;
  if (name !== undefined) campus.name = name.trim();
  if (code !== undefined) campus.code = code.trim().toUpperCase();
  if (city !== undefined) campus.city = city.trim();
  if (address !== undefined) campus.address = address.trim();
  if (isActive !== undefined) campus.isActive = isActive;

  await campus.save();
  return res.json({ campus, message: 'Campus updated successfully.' });
});

// Registration Window Toggle & Sessions
export const listAcademicWindows = asyncHandler(async (_req, res) => {
  const sessions = await AcademicSession.findAll({
    include: [{ model: Semester, as: 'semesters' }],
    order: [['startsOn', 'DESC']],
  });
  return res.json({ sessions });
});

export const toggleRegistrationWindow = asyncHandler(async (req, res) => {
  const { semesterId } = req.params;
  const { isActive, registrationOpensAt, registrationClosesAt } = req.body;

  const semester = await Semester.findByPk(semesterId, {
    include: [{ model: AcademicSession, as: 'academicSession' }],
  });

  if (!semester) {
    return res.status(404).json({ message: 'Semester not found.' });
  }

  if (isActive !== undefined) semester.isActive = isActive;
  if (registrationOpensAt !== undefined) semester.registrationOpensAt = registrationOpensAt;
  if (registrationClosesAt !== undefined) semester.registrationClosesAt = registrationClosesAt;

  await semester.save();

  return res.json({
    semester,
    message: `Registration window for ${semester.name} semester ${semester.isActive ? 'OPENED' : 'CLOSED'}.`,
  });
});
