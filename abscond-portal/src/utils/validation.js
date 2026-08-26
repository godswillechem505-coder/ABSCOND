import { useState, useCallback } from 'react';

/**
 * Client-Side Validation Utilities matching ABSCONS Backend Validation Rules
 */

// Email regex
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Nigerian Phone Regex: supports 080..., 070..., 090..., 081..., +234..., etc.
export const NIGERIAN_PHONE_REGEX = /^(?:\+?234|0)[789][01]\d{8}$/;

// Matric number format or alphanumeric ID
export const MATRIC_REGEX = /^[A-Za-z0-9/_-]{4,25}$/;

/**
 * Validate required field
 */
export function validateRequired(value, fieldName = 'This field') {
  if (value === undefined || value === null || String(value).trim() === '') {
    return `${fieldName} is required.`;
  }
  return null;
}

/**
 * Validate Email address
 */
export function validateEmail(email, fieldName = 'Email address') {
  const reqErr = validateRequired(email, fieldName);
  if (reqErr) return reqErr;
  if (!EMAIL_REGEX.test(String(email).trim())) {
    return `Please enter a valid ${fieldName.toLowerCase()} (e.g. student@abscons.edu.ng).`;
  }
  return null;
}

/**
 * Validate Phone number
 */
export function validatePhone(phone, fieldName = 'Phone number') {
  const reqErr = validateRequired(phone, fieldName);
  if (reqErr) return reqErr;
  const cleanPhone = String(phone).replace(/[\s-]/g, '');
  if (!NIGERIAN_PHONE_REGEX.test(cleanPhone)) {
    return `Please enter a valid 11-digit Nigerian phone number (e.g. 08012345678).`;
  }
  return null;
}

/**
 * Validate Password
 */
export function validatePassword(password, { minLength = 6, fieldName = 'Password' } = {}) {
  const reqErr = validateRequired(password, fieldName);
  if (reqErr) return reqErr;
  if (String(password).length < minLength) {
    return `${fieldName} must be at least ${minLength} characters long.`;
  }
  return null;
}

/**
 * Validate Password Confirmation
 */
export function validatePasswordConfirmation(password, confirmPassword) {
  const reqErr = validateRequired(confirmPassword, 'Password confirmation');
  if (reqErr) return reqErr;
  if (password !== confirmPassword) {
    return 'Passwords do not match.';
  }
  return null;
}

/**
 * Validate Matric / Student ID
 */
export function validateMatricNumber(matric, fieldName = 'Matriculation number') {
  const reqErr = validateRequired(matric, fieldName);
  if (reqErr) return reqErr;
  if (!MATRIC_REGEX.test(String(matric).trim())) {
    return `Please enter a valid ${fieldName.toLowerCase()}.`;
  }
  return null;
}

/**
 * Validate Numeric Range (e.g. Score: 0 - 100)
 */
export function validateRange(value, min = 0, max = 100, fieldName = 'Value') {
  const reqErr = validateRequired(value, fieldName);
  if (reqErr) return reqErr;
  const num = Number(value);
  if (isNaN(num)) return `${fieldName} must be a valid number.`;
  if (num < min || num > max) {
    return `${fieldName} must be between ${min} and ${max}.`;
  }
  return null;
}

/**
 * Validate Course Registration Workload
 */
export function validateWorkload(selectedUnits, registeredUnits = 0, maxLimit = 24) {
  const total = selectedUnits + registeredUnits;
  if (total > maxLimit) {
    return `Total registered workload (${total} units) exceeds the maximum allowed semester limit of ${maxLimit} units.`;
  }
  return null;
}

/**
 * React Hook for Form Validation & Field State Management
 */
export function useFormValidation(initialValues = {}, validationRules = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = useCallback(
    (name, val) => {
      const rule = validationRules[name];
      if (!rule) return null;
      return rule(val, values);
    },
    [validationRules, values]
  );

  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      const val = type === 'checkbox' ? checked : value;

      setValues((prev) => ({ ...prev, [name]: val }));

      if (touched[name]) {
        const fieldError = validateField(name, val);
        setErrors((prev) => ({ ...prev, [name]: fieldError }));
      }
    },
    [touched, validateField]
  );

  const handleBlur = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      const val = type === 'checkbox' ? checked : value;

      setTouched((prev) => ({ ...prev, [name]: true }));
      const fieldError = validateField(name, val);
      setErrors((prev) => ({ ...prev, [name]: fieldError }));
    },
    [validateField]
  );

  const validateAll = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach((name) => {
      const error = validationRules[name](values[name], values);
      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    // Mark all as touched
    const allTouched = Object.keys(validationRules).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);

    return isValid;
  }, [validationRules, values]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const getFieldProps = useCallback(
    (name) => ({
      name,
      value: values[name] !== undefined ? values[name] : '',
      onChange: handleChange,
      onBlur: handleBlur,
      'aria-invalid': !!(touched[name] && errors[name]),
      'aria-describedby': touched[name] && errors[name] ? `${name}-error` : undefined,
    }),
    [values, handleChange, handleBlur, touched, errors]
  );

  return {
    values,
    setValues,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    resetForm,
    getFieldProps,
    isValid: Object.keys(errors).every((k) => !errors[k]),
  };
}
