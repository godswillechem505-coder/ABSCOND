/**
 * Lightweight, robust Input Validation Middleware for Express
 * Validates req.body, req.query, or req.params against declarative schemas
 */

export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = req[source] || {};
    const errors = {};

    Object.keys(schema).forEach((field) => {
      const rules = schema[field];
      const value = data[field];

      // 1. Required check
      if (rules.required && (value === undefined || value === null || String(value).trim() === '')) {
        errors[field] = rules.message || `${field} is required.`;
        return;
      }

      // If value is optional and not provided, skip remaining rules
      if (value === undefined || value === null || String(value).trim() === '') {
        return;
      }

      // 2. Type checks
      if (rules.type === 'number' && isNaN(Number(value))) {
        errors[field] = `${field} must be a valid number.`;
        return;
      }

      if (rules.type === 'array' && !Array.isArray(value)) {
        errors[field] = `${field} must be an array.`;
        return;
      }

      if (rules.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(value).trim())) {
          errors[field] = `Please provide a valid email address.`;
          return;
        }
      }

      // 3. Min/Max checks
      if (rules.min !== undefined) {
        if (rules.type === 'number' && Number(value) < rules.min) {
          errors[field] = `${field} must be at least ${rules.min}.`;
          return;
        }
        if ((rules.type === 'string' || typeof value === 'string') && String(value).length < rules.min) {
          errors[field] = `${field} must be at least ${rules.min} characters.`;
          return;
        }
      }

      if (rules.max !== undefined) {
        if (rules.type === 'number' && Number(value) > rules.max) {
          errors[field] = `${field} cannot exceed ${rules.max}.`;
          return;
        }
        if ((rules.type === 'string' || typeof value === 'string') && String(value).length > rules.max) {
          errors[field] = `${field} cannot exceed ${rules.max} characters.`;
          return;
        }
      }

      // 4. Enum check
      if (rules.enum && !rules.enum.includes(value)) {
        errors[field] = `${field} must be one of: ${rules.enum.join(', ')}.`;
        return;
      }

      // 5. Custom validator
      if (rules.custom && typeof rules.custom === 'function') {
        const customErr = rules.custom(value, data);
        if (customErr) {
          errors[field] = customErr;
          return;
        }
      }
    });

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        message: 'Input validation failed.',
        errors,
      });
    }

    next();
  };
};

/**
 * Pre-defined Common Validation Schemas
 */
export const authSchemas = {
  login: {
    identifier: { required: true, message: 'Matric number or email is required.' },
    password: { required: true, min: 4, message: 'Password is required (min 4 characters).' },
  },
};

export const studentSchemas = {
  courseRegistration: {
    courseIds: { required: true, type: 'array', message: 'Course IDs array is required.' },
  },
  feePayment: {
    amount: { required: true, type: 'number', min: 100, message: 'Valid amount (min ₦100) is required.' },
  },
  passwordUpdate: {
    currentPassword: { required: true, message: 'Current password is required.' },
    newPassword: { required: true, min: 6, message: 'New password must be at least 6 characters long.' },
  },
};

export const adminSchemas = {
  enterResult: {
    studentId: { required: true },
    courseId: { required: true },
    score: { required: true, type: 'number', min: 0, max: 100 },
  },
};
