import { body } from 'express-validator';
import validator from 'validator';

// Types for validation results
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Product data validation
export function validateProductData(data: any): ValidationResult {
  const errors: string[] = [];

  // Validate name
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Le nom du produit est requis');
  }

  // Validate price
  if (typeof data.price !== 'number' || data.price <= 0) {
    errors.push('Le prix doit être positif');
  }

  // Validate categoryId
  if (!data.categoryId || typeof data.categoryId !== 'string') {
    errors.push('La catégorie est requise');
  }

  // Validate manufacturerId
  if (!data.manufacturerId || typeof data.manufacturerId !== 'string') {
    errors.push('Le fabricant est requis');
  }

  // Validate SKU format
  if (data.sku && !/^[a-zA-Z0-9\-]+$/.test(data.sku)) {
    errors.push('Le SKU doit contenir uniquement des lettres, chiffres et tirets');
  }

  // Validate stock quantity
  if (typeof data.stockQuantity === 'number' && data.stockQuantity < 0) {
    errors.push('La quantité en stock ne peut pas être négative');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// User data validation
export function validateUserData(data: any): ValidationResult {
  const errors: string[] = [];

  // Validate email
  if (!data.email || !validator.isEmail(data.email)) {
    errors.push('Adresse email invalide');
  }

  // Validate firstName
  if (!data.firstName || typeof data.firstName !== 'string' || data.firstName.trim().length === 0) {
    errors.push('Le prénom est requis');
  }

  // Validate lastName
  if (!data.lastName || typeof data.lastName !== 'string' || data.lastName.trim().length === 0) {
    errors.push('Le nom de famille est requis');
  }

  // Validate password
  if (!data.password || typeof data.password !== 'string') {
    errors.push('Le mot de passe est requis');
  } else {
    if (data.password.length < 8) {
      errors.push('Le mot de passe doit contenir au moins 8 caractères');
    }
    // Note: In a real app, you'd want more complex password validation
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Input sanitization
export function sanitizeInput(input: string | null | undefined): string {
  if (input === null || input === undefined) {
    return '';
  }

  let sanitized = input.toString();

  // Remove HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  // Basic SQL injection protection (remove common attack patterns)
  sanitized = sanitized.replace(/['"`;\\]/g, '');

  return sanitized;
}

export const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
  
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
    .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
    .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),
  
  body('companyName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company name cannot exceed 100 characters'),
  
  body('customerType')
    .optional()
    .isIn(['B2B', 'B2C'])
    .withMessage('Customer type must be either B2B or B2C'),
];

export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

export const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
    .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
    .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),
  
  body('phone')
    .optional()
    .matches(/^(\+33|0)[1-9](\d{8})$/)
    .withMessage('Please provide a valid French phone number'),
];

export const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return value;
    }),
];

export const requestPasswordResetValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
];

export const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return value;
    }),
];