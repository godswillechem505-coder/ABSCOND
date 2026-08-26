import { ContactMessage, User } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listContactMessages = asyncHandler(async (req, res) => {
  const { status, department } = req.query;
  const where = {};
  if (status) where.status = status;
  if (department) where.department = department;

  const messages = await ContactMessage.findAll({
    where,
    include: [
      { model: User, as: 'assignee', attributes: ['id', 'email', 'staffRole'] },
      { model: User, as: 'replier', attributes: ['id', 'email', 'staffRole'] },
    ],
    order: [['createdAt', 'DESC']],
  });

  return res.json({ messages });
});

export const updateContactMessageStatus = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const message = await ContactMessage.findByPk(messageId);
  if (!message) {
    return res.status(404).json({ message: 'Contact message not found.' });
  }

  const { status, assignedTo, department } = req.body;
  if (status !== undefined) message.status = status;
  if (assignedTo !== undefined) message.assignedTo = assignedTo || null;
  if (department !== undefined) message.department = department;

  await message.save();

  const updated = await ContactMessage.findByPk(message.id, {
    include: [
      { model: User, as: 'assignee', attributes: ['id', 'email', 'staffRole'] },
      { model: User, as: 'replier', attributes: ['id', 'email', 'staffRole'] },
    ],
  });

  return res.json({ message: updated, notice: 'Message updated.' });
});

export const replyContactMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { replyText } = req.body;

  if (!replyText || !replyText.trim()) {
    return res.status(400).json({ message: 'Reply text is required.' });
  }

  const message = await ContactMessage.findByPk(messageId);
  if (!message) {
    return res.status(404).json({ message: 'Contact message not found.' });
  }

  message.replyText = replyText.trim();
  message.repliedAt = new Date();
  message.repliedBy = req.user?.id || null;
  message.status = 'resolved';

  await message.save();

  const updated = await ContactMessage.findByPk(message.id, {
    include: [
      { model: User, as: 'assignee', attributes: ['id', 'email', 'staffRole'] },
      { model: User, as: 'replier', attributes: ['id', 'email', 'staffRole'] },
    ],
  });

  return res.json({ message: updated, notice: 'Reply recorded and message marked resolved.' });
});
