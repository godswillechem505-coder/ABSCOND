import jwt from 'jsonwebtoken';

const accessTokenSecret = process.env.JWT_SECRET || 'dev-access-secret-change-me';
const refreshTokenSecret =
  process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me';

export const signAccessToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      role: user.role,
      staffRole: user.staffRole,
    },
    accessTokenSecret,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    },
  );

export const signRefreshToken = (user, rememberMe = false) =>
  jwt.sign(
    {
      sub: user.id,
      type: 'refresh',
      version: user.refreshTokenVersion,
    },
    refreshTokenSecret,
    {
      expiresIn: rememberMe
        ? process.env.JWT_REFRESH_REMEMBER_EXPIRES_IN || '30d'
        : process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },
  );

export const signPasswordResetToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      type: 'reset-password',
      email: user.email,
    },
    accessTokenSecret,
    {
      expiresIn: process.env.JWT_RESET_EXPIRES_IN || '1h',
    },
  );

export const verifyAccessToken = (token) => jwt.verify(token, accessTokenSecret);

export const verifyRefreshToken = (token) => jwt.verify(token, refreshTokenSecret);

export const verifyPasswordResetToken = (token) => {
  const payload = jwt.verify(token, accessTokenSecret);
  if (payload.type !== 'reset-password') {
    throw new Error('Invalid reset token type.');
  }
  return payload;
};

