import { AuditLog, User } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listAuditLogs = asyncHandler(async (req, res) => {
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 50, 1), 100);
  const { action, resource } = req.query;

  const where = {};
  if (action) where.action = action;
  if (resource) where.resource = resource;

  const { count, rows } = await AuditLog.findAndCountAll({
    where,
    include: [{ model: User, as: 'user', attributes: ['id', 'email', 'staffRole'] }],
    order: [['createdAt', 'DESC']],
    limit,
    offset: (page - 1) * limit,
  });

  return res.json({
    logs: rows,
    pagination: { page, limit, total: count, pages: Math.ceil(count / limit) },
  });
});
