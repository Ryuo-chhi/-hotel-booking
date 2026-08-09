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

  // Generate JWT tokens
  const token = jwt.sign(
    { id: user.id, role: user.role },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    env.jwt.refreshSecret,
    { expiresIn: env.jwt.refreshExpiresIn }
  );

  // Save refresh token to user
  await userRepository.update(user.id, { refreshToken });

  // Return user and tokens
  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      phone_number: user.phone_number,
      role: user.role,
      createdAt: user.createdAt
    },
    token,
    refreshToken
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

  const refreshToken = jwt.sign(
    { id: user.id },
    env.jwt.refreshSecret,
    { expiresIn: env.jwt.refreshExpiresIn }
  );

  await userRepository.update(user.id, { refreshToken });

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    },
    token,
    refreshToken
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

/**
 * Refresh the authentication tokens
 * 
 * @param {string} token - Refresh token
 * @returns {Promise<object>} New session tokens
 */
const refreshAuth = async (token) => {
  if (!token) throw errors.UnauthorizedError("No refresh token provided");
  
  try {
    const decoded = jwt.verify(token, env.jwt.refreshSecret);
    const user = await userRepository.findById(decoded.id);

    if (!user || user.refreshToken !== token) {
      throw errors.UnauthorizedError("Invalid refresh token");
    }

    const newAccessToken = jwt.sign(
      { id: user.id, role: user.role },
      env.jwt.secret,
      { expiresIn: env.jwt.expiresIn }
    );
    // Refresh Token Rotation
    const newRefreshToken = jwt.sign(
      { id: user.id },
      env.jwt.refreshSecret,
      { expiresIn: env.jwt.refreshExpiresIn }
    );

    await userRepository.update(user.id, { refreshToken: newRefreshToken });

    return {
      token: newAccessToken,
      refreshToken: newRefreshToken
    };
  } catch (error) {
    throw errors.UnauthorizedError("Invalid refresh token");
  }
};

/**
 * Logout user by clearing their refresh token
 * 
 * @param {number} userId 
 */
const logoutUser = async (userId) => {
  await userRepository.update(userId, { refreshToken: null });
};

export {
  registerUser,
  authenticateUser,
  getUserProfile,
  refreshAuth,
  logoutUser
};
