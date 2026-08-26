import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { STAFF_ROLES, USER_ROLES } from '../config/permissions.js';
import { AuditLog, User } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listStaffAccounts = asyncHandler(async (_req, res) => {
  const staff = await User.findAll({
    where: {
      role: { [Op.in]: [USER_ROLES.STAFF, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN] },
    },
    attributes: ['id', 'email', 'identifier', 'role', 'staffRole', 'isActive', 'createdAt', 'lastLoginAt'],
    order: [['createdAt', 'ASC']],
  });

  return res.json({
    staff,
    availableStaffRoles: STAFF_ROLES,
    availableUserRoles: USER_ROLES,
  });
});

export const createStaffAccount = asyncHandler(async (req, res) => {
  const { email, identifier, password, role = USER_ROLES.STAFF, staffRole } = req.body;
  if (!email || !password || !staffRole) {
    return res.status(400).json({ message: 'Email, password, and staff role are required.' });
  }

  const existing = await User.findOne({
    where: {
      [Op.or]: [{ email: email.trim().toLowerCase() }, { identifier: (identifier || email).trim() }],
    },
  });

  if (existing) {
    return res.status(400).json({ message: 'User with this email or identifier already exists.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    email: email.trim().toLowerCase(),
    identifier: (identifier || email).trim(),
    password: hashedPassword,
    role,
    staffRole,
    isActive: true,
  });

  await AuditLog.create({
    userId: req.user?.id,
    userEmail: req.user?.email,
    action: 'CREATE_STAFF_ACCOUNT',
    resource: 'User',
    resourceId: String(user.id),
    details: JSON.stringify({ email: user.email, staffRole: user.staffRole, role: user.role }),
    ipAddress: req.ip,
  });

  return res.status(201).json({
    staff: {
      id: user.id,
      email: user.email,
      identifier: user.identifier,
      role: user.role,
      staffRole: user.staffRole,
      isActive: user.isActive,
      createdAt: user.createdAt,
    },
    message: 'Staff account created successfully.',
  });
});

export const updateStaffAccount = asyncHandler(async (req, res) => {
  const { staffId } = req.params;
  const user = await User.findByPk(staffId);
  if (!user) {
    return res.status(404).json({ message: 'Staff account not found.' });
  }

  const { role, staffRole, isActive, password } = req.body;
  if (role !== undefined) user.role = role;
  if (staffRole !== undefined) user.staffRole = staffRole;
  if (isActive !== undefined) user.isActive = Boolean(isActive);
  if (password && password.trim().length >= 6) {
    user.password = await bcrypt.hash(password.trim(), 10);
  }

  await user.save();

  await AuditLog.create({
    userId: req.user?.id,
    userEmail: req.user?.email,
    action: 'UPDATE_STAFF_ACCOUNT',
    resource: 'User',
    resourceId: String(user.id),
    details: JSON.stringify({ email: user.email, staffRole: user.staffRole, role: user.role, isActive: user.isActive }),
    ipAddress: req.ip,
  });

  return res.json({
    staff: {
      id: user.id,
      email: user.email,
      identifier: user.identifier,
      role: user.role,
      staffRole: user.staffRole,
      isActive: user.isActive,
      createdAt: user.createdAt,
    },
    message: 'Staff account updated successfully.',
  });
});
