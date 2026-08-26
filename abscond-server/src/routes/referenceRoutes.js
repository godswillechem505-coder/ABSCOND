import { Router } from 'express';
import { Op } from 'sequelize';
import {
  AcademicSession,
  Announcement,
  Campus,
  ContactMessage,
  Course,
  DownloadDocument,
  Event,
  Faq,
  Programme,
  Semester,
} from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const referenceRoutes = Router();

referenceRoutes.get(
  '/campuses',
  asyncHandler(async (_req, res) => {
    const campuses = await Campus.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']],
    });

    res.json({ campuses });
  }),
);

referenceRoutes.get(
  '/programmes',
  asyncHandler(async (_req, res) => {
    const programmes = await Programme.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']],
    });

    res.json({ programmes });
  }),
);

referenceRoutes.get(
  '/courses',
  asyncHandler(async (req, res) => {
    const { programmeId, level, semester, search } = req.query;
    const where = { isActive: true };

    if (programmeId) {
      where.programmeId = programmeId;
    }
    if (level) {
      where.level = level;
    }
    if (semester) {
      where.semester = semester;
    }
    if (search) {
      where[Op.or] = [
        { code: { [Op.like]: `%${search}%` } },
        { title: { [Op.like]: `%${search}%` } },
      ];
    }

    const courses = await Course.findAll({
      where,
      include: [
        { model: Programme, as: 'programme' },
        { model: Course, as: 'prerequisite' },
      ],
      order: [
        ['level', 'ASC'],
        ['semester', 'ASC'],
        ['code', 'ASC'],
      ],
    });

    res.json({ courses });
  }),
);

referenceRoutes.get(
  '/sessions',
  asyncHandler(async (_req, res) => {
    const sessions = await AcademicSession.findAll({
      include: [{ model: Semester, as: 'semesters' }],
      order: [['startsOn', 'DESC']],
    });

    res.json({ sessions });
  }),
);

referenceRoutes.get(
  '/bootstrap',
  asyncHandler(async (_req, res) => {
    const [campuses, programmes, currentSession] = await Promise.all([
      Campus.findAll({ where: { isActive: true }, order: [['name', 'ASC']] }),
      Programme.findAll({ where: { isActive: true }, order: [['name', 'ASC']] }),
      AcademicSession.findOne({
        where: { isCurrent: true },
        include: [{ model: Semester, as: 'semesters' }],
      }),
    ]);

    res.json({
      campuses,
      programmes,
      currentSession,
    });
  }),
);

// Public Announcements Feed
referenceRoutes.get(
  '/announcements',
  asyncHandler(async (_req, res) => {
    const announcements = await Announcement.findAll({
      where: { status: 'published' },
      order: [
        ['isPinned', 'DESC'],
        ['publishedAt', 'DESC'],
        ['createdAt', 'DESC'],
      ],
    });

    res.json({ announcements });
  }),
);

// Public Events Feed
referenceRoutes.get(
  '/events',
  asyncHandler(async (_req, res) => {
    const events = await Event.findAll({
      where: { status: 'published' },
      include: [{ model: Campus, as: 'campus', attributes: ['id', 'name', 'code', 'city'] }],
      order: [['eventDate', 'ASC']],
    });

    res.json({ events });
  }),
);

// Public FAQs Directory
referenceRoutes.get(
  '/faqs',
  asyncHandler(async (_req, res) => {
    const faqs = await Faq.findAll({
      where: { isPublished: true },
      order: [
        ['sortOrder', 'ASC'],
        ['createdAt', 'ASC'],
      ],
    });

    res.json({ faqs });
  }),
);

// Public Downloads Library
referenceRoutes.get(
  '/downloads',
  asyncHandler(async (_req, res) => {
    const downloads = await DownloadDocument.findAll({
      where: { status: 'published' },
      include: [{ model: AcademicSession, as: 'academicSession', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']],
    });

    res.json({ downloads });
  }),
);

// Public Contact Form Submission
referenceRoutes.post(
  '/contact',
  asyncHandler(async (req, res) => {
    const { fullName, email, phone, subject, message, department = 'General' } = req.body;

    if (!fullName || !email || !message) {
      return res.status(400).json({ message: 'Full name, email, and message are required.' });
    }

    const contactMessage = await ContactMessage.create({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      subject: subject?.trim() || 'General Inquiry',
      message: message.trim(),
      department: department || 'General',
      status: 'new',
    });

    return res.status(201).json({
      contactMessage,
      message: 'Your message has been received! Our support team will get back to you shortly.',
    });
  }),
);

