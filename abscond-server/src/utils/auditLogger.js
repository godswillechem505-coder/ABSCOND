import { AuditLog } from '../models/index.js';

export const logAuditAction = async ({ req, action, resource, resourceId, details }) => {
  try {
    const userId = req?.user?.id || null;
    const userEmail = req?.user?.email || 'system@abscons.edu.ng';
    const ipAddress = req?.ip || req?.headers?.['x-forwarded-for'] || req?.socket?.remoteAddress || '127.0.0.1';

    await AuditLog.create({
      userId,
      userEmail,
      action,
      resource,
      resourceId: resourceId ? String(resourceId) : null,
      details: typeof details === 'object' ? JSON.stringify(details) : String(details || ''),
      ipAddress,
    });
  } catch (err) {
    console.error('AuditLog creation failed:', err.message);
  }
};
