/**
 * Auth Routes
 * 
 * Responsibility: Maps auth URL paths to authentication controller handlers with validation guards.
 */

import express from 'express';
import { register, login, profile } from "../controllers/auth.controller.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";
import { validate } from "../middlewares/validate.middleware.js";
import { authenticate } from '../middlewares/auth.middleware.js';


const router = express.Router();

router.post('/register', registerSchema, validate, register);
router.post('/login', loginSchema, validate, login);
router.get('/profile', authenticate, profile);

export default router;
