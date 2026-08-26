import { AcademicSession, DownloadDocument, User } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listDownloads = asyncHandler(async (req, res) => {
  const { category, status, academicSessionId } = req.query;
  const where = {};
  if (category) where.category = category;
  if (status) where.status = status;
  if (academicSessionId) where.academicSessionId = academicSessionId;

  const downloads = await DownloadDocument.findAll({
    where,
    include: [
      { model: AcademicSession, as: 'academicSession', attributes: ['id', 'name'] },
      { model: User, as: 'uploader', attributes: ['id', 'email'] },
    ],
    order: [['createdAt', 'DESC']],
  });

  return res.json({ downloads });
});

export const createDownload = asyncHandler(async (req, res) => {
  const { title, description, category = 'general', fileUrl, fileName, fileSize, academicSessionId, status = 'published' } = req.body;
  if (!title || !fileName) {
    return res.status(400).json({ message: 'Title and file are required.' });
  }

  const download = await DownloadDocument.create({
    title: title.trim(),
    description: description?.trim() || null,
    category,
    fileUrl: fileUrl || `/downloads/${fileName}`,
    fileName: fileName.trim(),
    fileSize: Number(fileSize) || 256000,
    academicSessionId: academicSessionId || null,
    status,
    uploadedBy: req.user?.id || null,
  });

  const created = await DownloadDocument.findByPk(download.id, {
    include: [{ model: AcademicSession, as: 'academicSession' }],
  });

  return res.status(201).json({ download: created, message: 'Document uploaded to library.' });
});

export const updateDownload = asyncHandler(async (req, res) => {
  const { downloadId } = req.params;
  const download = await DownloadDocument.findByPk(downloadId);
  if (!download) {
    return res.status(404).json({ message: 'Document not found.' });
  }

  const { title, description, category, status, academicSessionId } = req.body;
  if (title !== undefined) download.title = title.trim();
  if (description !== undefined) download.description = description;
  if (category !== undefined) download.category = category;
  if (status !== undefined) download.status = status;
  if (academicSessionId !== undefined) download.academicSessionId = academicSessionId;

  await download.save();
  return res.json({ download, message: 'Document updated.' });
});

export const deleteDownload = asyncHandler(async (req, res) => {
  const { downloadId } = req.params;
  const download = await DownloadDocument.findByPk(downloadId);
  if (!download) {
    return res.status(404).json({ message: 'Document not found.' });
  }
  await download.destroy();
  return res.json({ message: 'Document removed from library.' });
});
