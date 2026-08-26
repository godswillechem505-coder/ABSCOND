import { Op } from 'sequelize';
import { getPermissionsForUser, USER_ROLES } from '../config/permissions.js';
import { AcademicSession, Campus, Programme, Student, User } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/tokens.js';
import { clearLoginAttempts } from '../middleware/rateLimiter.js';

const includeProfile = [
  {
    model: Student,
    as: 'student',
    include: [
      { model: Campus, as: 'campus' },
      { model: Programme, as: 'programme' },
    ],
  },
];

const buildSessionPayload = async (user, rememberMe = false) => {
  const reloadedUser = await User.findByPk(user.id, { include: includeProfile });

  return {
    user: reloadedUser.toSafeJSON(),
    permissions: getPermissionsForUser(reloadedUser),
    accessToken: signAccessToken(reloadedUser),
    refreshToken: signRefreshToken(reloadedUser, rememberMe),
  };
};

export const login = ({ staffOnly = false } = {}) =>
  asyncHandler(async (req, res) => {
    const identifier = String(
      req.body.identifier || req.body.matricNumber || req.body.email || '',
    ).trim();
    const { password, rememberMe = false } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        message: 'Identifier and password are required.',
      });
    }

    const user = await User.findOne({
      where: {
        [Op.or]: [{ identifier }, { email: identifier.toLowerCase() }],
      },
    });

    if (!user || !user.isActive || user.status !== 'active') {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (staffOnly && user.role === USER_ROLES.STUDENT) {
      return res.status(403).json({ message: 'Staff account is required.' });
    }

    const passwordMatches = await user.comparePassword(password);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    clearLoginAttempts(req);
    user.lastLoginAt = new Date();
    await user.save();

    return res.json(await buildSessionPayload(user, rememberMe));
  });

export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token is required.' });
  }

  const payload = verifyRefreshToken(refreshToken);
  if (payload.type !== 'refresh') {
    return res.status(401).json({ message: 'Invalid refresh token.' });
  }

  const user = await User.findByPk(payload.sub);
  if (
    !user ||
    !user.isActive ||
    user.status !== 'active' ||
    user.refreshTokenVersion !== payload.version
  ) {
    return res.status(401).json({ message: 'Invalid refresh token.' });
  }

  return res.json({
    accessToken: signAccessToken(user),
  });
});

export const logout = asyncHandler(async (req, res) => {
  req.user.refreshTokenVersion += 1;
  await req.user.save();

  return res.status(204).send();
});

export const me = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, { include: includeProfile });

  return res.json({
    user: user.toSafeJSON(),
    permissions: getPermissionsForUser(user),
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { identifier, email } = req.body;

  if (!identifier && !email) {
    return res.status(400).json({
      message: 'Identifier or email is required.',
    });
  }

  return res.status(202).json({
    message:
      'If an active account exists, password recovery instructions will be issued by Student Affairs or ICT.',
  });
});

export const authBootstrap = asyncHandler(async (_req, res) => {
  const currentSession = await AcademicSession.findOne({
    where: { isCurrent: true },
  });

  return res.json({
    currentSession,
  });
});
