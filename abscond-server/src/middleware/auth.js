import {
  getPermissionsForUser,
  hasPermission,
  USER_ROLES,
} from '../config/permissions.js';
import { User } from '../models/index.js';
import { verifyAccessToken } from '../utils/tokens.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Authentication token is required.' });
    }

    const payload = verifyAccessToken(token);
    const user = await User.findByPk(payload.sub);

    if (!user || !user.isActive || user.status !== 'active') {
      return res.status(401).json({ message: 'Invalid or inactive account.' });
    }

    req.user = user;
    req.auth = payload;
    req.permissions = getPermissionsForUser(user);
    return next();
  } catch (_error) {
    return res
      .status(401)
      .json({ message: 'Invalid or expired authentication token.' });
  }
};

export const requireRoles =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: 'You do not have access to this resource.' });
    }

    return next();
  };

export const requireStaffAccess = (req, res, next) => {
  if (
    !req.user ||
    ![USER_ROLES.STAFF, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].includes(
      req.user.role,
    )
  ) {
    return res.status(403).json({ message: 'Staff access is required.' });
  }

  return next();
};

export const requirePermission = (permission) => (req, res, next) => {
  if (!hasPermission(req.user, permission)) {
    return res
      .status(403)
      .json({ message: 'You do not have the required permission.' });
  }

  return next();
};
