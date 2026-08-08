/**
 * Auth Request Validator schemas
 * 
 * Responsibility: Outlines Express-Validator structures to validate user signup and login request parameters.
 */

import { body } from 'express-validator';

/**
 * Schema for validating user registration requests.
 */
const registerSchema = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('phone_number')
    .trim()
    .notEmpty().withMessage('Phone number is required'),
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'staff', 'customer']).withMessage('Role must be one of: admin, manager, staff, customer')
];

/**
 * Schema for validating user login requests.
 */
const loginSchema = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
];

export {
  registerSchema,
  loginSchema
};
