const loginAttempts = new Map();

export const loginRateLimiter =
  ({ windowMs = 15 * 60 * 1000, maxAttempts = 5 } = {}) =>
  (req, res, next) => {
    const identifier = String(
      req.body?.identifier || req.body?.matricNumber || req.body?.email || 'unknown',
    )
      .trim()
      .toLowerCase();
    const key = `${req.ip}:${identifier}`;
    const now = Date.now();
    const attempt = loginAttempts.get(key) || {
      count: 0,
      firstAttemptAt: now,
    };

    if (now - attempt.firstAttemptAt > windowMs) {
      loginAttempts.set(key, {
        count: 1,
        firstAttemptAt: now,
      });
      return next();
    }

    if (attempt.count >= maxAttempts) {
      return res.status(429).json({
        message: 'Too many login attempts. Please try again later.',
      });
    }

    attempt.count += 1;
    loginAttempts.set(key, attempt);
    return next();
  };

export const clearLoginAttempts = (req) => {
  const identifier = String(
    req.body?.identifier || req.body?.matricNumber || req.body?.email || 'unknown',
  )
    .trim()
    .toLowerCase();
  loginAttempts.delete(`${req.ip}:${identifier}`);
};
