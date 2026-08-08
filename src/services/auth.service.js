/**
 * Auth Service
 * 
 * Responsibility: Implements user signup security, verifies password matches,
 * signs JWT tokens, and manages authentication flows.
 */

import * as userRepository from "../repositories/user.repository.js";
import * as errors from "../utils/errors.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as env from "../config/env.js";

/**
 * Register a new user in the database.
 * 
 * @param {object} userData - New user details
 * @returns {Promise<object>} The created User model instance profile
 */
const registerUser = async (userData) => {
  const { username, email, password, phone_number, role } = userData;

  // Check if email already exists
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw errors.ConflictError("Email is already in use");
  }

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await userRepository.create({
    username,
    email,
    password: hashedPassword,
    phone_number,
    role: role || 'customer'
  });

  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, role: user.role },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn }
  );

  // Return user and token
  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      phone_number: user.phone_number,
      role: user.role,
      createdAt: user.createdAt
    },
    token
  };
};

/**
 * Authenticate details and generate an authorization token.
 * 
 * @param {string} email - Login email
 * @param {string} password - Raw password
 * @returns {Promise<object>} Session tokens and user details
 */
const authenticateUser = async (email, password) => {
  const user = await userRepository.findByEmail(email);

  if(!user) {
    throw errors.UnauthorizedError("Invalid Credentials");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw errors.UnauthorizedError("Invalid Credentials");
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn }
  );

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    },
    token
  };
};

/**
 * Get user profile by ID
 * 
 * @param {number} userId
 * @returns {Promise<object>} User details
 */
const getUserProfile = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw errors.NotFoundError("User not found");
  }
  return user;
};

export {
  registerUser,
  authenticateUser,
  getUserProfile
};
