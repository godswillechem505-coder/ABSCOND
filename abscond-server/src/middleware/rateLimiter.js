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

const adminMutationAttempts = new Map();

/**
 * Rate limiter for sensitive administrative mutation endpoints
 * (bulk results import, results publishing, fee modifications, password resets).
 */
export const adminMutationRateLimiter =
  ({ windowMs = 60 * 1000, maxRequests = 40, message = 'Too many administrative requests. Please slow down.' } = {}) =>
  (req, res, next) => {
    const adminKey = `${req.ip}:${req.user?.id || 'anon'}:${req.baseUrl || req.path}`;
    const now = Date.now();
    const tracker = adminMutationAttempts.get(adminKey) || {
      count: 0,
      resetAt: now + windowMs,
    };

    if (now > tracker.resetAt) {
      adminMutationAttempts.set(adminKey, {
        count: 1,
        resetAt: now + windowMs,
      });
      return next();
    }

    if (tracker.count >= maxRequests) {
      const retryAfterSeconds = Math.ceil((tracker.resetAt - now) / 1000);
      res.set('Retry-After', String(retryAfterSeconds));
      return res.status(429).json({
        message,
        retryAfterSeconds,
      });
    }

    tracker.count += 1;
    adminMutationAttempts.set(adminKey, tracker);
    return next();
  };
