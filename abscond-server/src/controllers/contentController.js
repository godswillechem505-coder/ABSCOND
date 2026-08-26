import { Announcement, Campus, Event, User } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Announcements CRUD
export const listAnnouncements = asyncHandler(async (req, res) => {
  const { category, status, priority } = req.query;
  const where = {};
  if (category) where.category = category;
  if (status) where.status = status;
  if (priority) where.priority = priority;

  const announcements = await Announcement.findAll({
    where,
    include: [{ model: User, as: 'author', attributes: ['id', 'email', 'staffRole'] }],
    order: [
      ['isPinned', 'DESC'],
      ['publishedAt', 'DESC'],
      ['createdAt', 'DESC'],
    ],
  });

  return res.json({ announcements });
});

export const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, body, excerpt, category = 'Academic', priority = 'medium', isPinned = false, targetAudience = 'all', status = 'published', publishedAt } = req.body;
  if (!title || !body) {
    return res.status(400).json({ message: 'Title and body are required.' });
  }

  const announcement = await Announcement.create({
    title: title.trim(),
    body: body.trim(),
    excerpt: excerpt?.trim() || body.slice(0, 140).trim(),
    category,
    priority,
    isPinned: Boolean(isPinned),
    targetAudience,
    status,
    publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
    authorId: req.user?.id || null,
  });

  const created = await Announcement.findByPk(announcement.id, {
    include: [{ model: User, as: 'author', attributes: ['id', 'email', 'staffRole'] }],
  });

  return res.status(201).json({ announcement: created, message: 'Announcement created.' });
});

export const updateAnnouncement = asyncHandler(async (req, res) => {
  const { announcementId } = req.params;
  const announcement = await Announcement.findByPk(announcementId);
  if (!announcement) {
    return res.status(404).json({ message: 'Announcement not found.' });
  }

  const { title, body, excerpt, category, priority, isPinned, targetAudience, status, publishedAt } = req.body;
  if (title !== undefined) announcement.title = title.trim();
  if (body !== undefined) announcement.body = body.trim();
  if (excerpt !== undefined) announcement.excerpt = excerpt;
  if (category !== undefined) announcement.category = category;
  if (priority !== undefined) announcement.priority = priority;
  if (isPinned !== undefined) announcement.isPinned = Boolean(isPinned);
  if (targetAudience !== undefined) announcement.targetAudience = targetAudience;
  if (status !== undefined) announcement.status = status;
  if (publishedAt !== undefined) announcement.publishedAt = publishedAt ? new Date(publishedAt) : null;

  await announcement.save();
  return res.json({ announcement, message: 'Announcement updated.' });
});

export const deleteAnnouncement = asyncHandler(async (req, res) => {
  const { announcementId } = req.params;
  const announcement = await Announcement.findByPk(announcementId);
  if (!announcement) {
    return res.status(404).json({ message: 'Announcement not found.' });
  }
  await announcement.destroy();
  return res.json({ message: 'Announcement deleted.' });
});

// Events CRUD
export const listEvents = asyncHandler(async (req, res) => {
  const { status, campusId } = req.query;
  const where = {};
  if (status) where.status = status;
  if (campusId) where.campusId = campusId;

  const events = await Event.findAll({
    where,
    include: [
      { model: Campus, as: 'campus', attributes: ['id', 'name', 'code'] },
      { model: User, as: 'creator', attributes: ['id', 'email'] },
    ],
    order: [['eventDate', 'ASC']],
  });

  return res.json({ events });
});

export const createEvent = asyncHandler(async (req, res) => {
  const { title, description, location, campusId, eventDate, startTime, endTime, category = 'Academic', isFeatured = false, status = 'published', coverImage } = req.body;
  if (!title || !description || !location || !eventDate) {
    return res.status(400).json({ message: 'Title, description, location, and date are required.' });
  }

  const event = await Event.create({
    title: title.trim(),
    description: description.trim(),
    location: location.trim(),
    campusId: campusId || null,
    eventDate,
    startTime: startTime || '09:00 AM',
    endTime: endTime || '02:00 PM',
    category,
    isFeatured: Boolean(isFeatured),
    status,
    coverImage: coverImage || null,
    createdById: req.user?.id || null,
  });

  const created = await Event.findByPk(event.id, {
    include: [{ model: Campus, as: 'campus' }],
  });

  return res.status(201).json({ event: created, message: 'Event created successfully.' });
});

export const updateEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const event = await Event.findByPk(eventId);
  if (!event) {
    return res.status(404).json({ message: 'Event not found.' });
  }

  const { title, description, location, campusId, eventDate, startTime, endTime, category, isFeatured, status, coverImage } = req.body;
  if (title !== undefined) event.title = title.trim();
  if (description !== undefined) event.description = description.trim();
  if (location !== undefined) event.location = location.trim();
  if (campusId !== undefined) event.campusId = campusId || null;
  if (eventDate !== undefined) event.eventDate = eventDate;
  if (startTime !== undefined) event.startTime = startTime;
  if (endTime !== undefined) event.endTime = endTime;
  if (category !== undefined) event.category = category;
  if (isFeatured !== undefined) event.isFeatured = Boolean(isFeatured);
  if (status !== undefined) event.status = status;
  if (coverImage !== undefined) event.coverImage = coverImage;

  await event.save();
  return res.json({ event, message: 'Event updated.' });
});

export const deleteEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const event = await Event.findByPk(eventId);
  if (!event) {
    return res.status(404).json({ message: 'Event not found.' });
  }
  await event.destroy();
  return res.json({ message: 'Event deleted.' });
});
