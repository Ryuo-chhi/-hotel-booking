/**
 * Auth Service
 *
 * Responsibility: Implements user signup security, verifies password matches,
 * signs JWT tokens, and manages authentication flows.
 */

import * as userRepository from "../repositories/user.repository.js";
import * as refreshTokenRepository from "../repositories/refresh-token.repository.js";
import * as errors from "../utils/errors.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as env from "../config/env.js";
import crypto from "node:crypto";

//helper function to hash tokens
const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

/**
 * Register a new user in the database.
 *
 * @param {object} userData - New user details
 * @returns {Promise<object>} The created User model instance profile
 */
const registerUser = async (userData) => {
  const { username, email, password, phone_number, role, device_name } = userData;

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
    role: role || "customer",
  });

  // Generate JWT tokens
  const token = jwt.sign({ id: user.id, role: user.role }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  });

  const refreshToken = jwt.sign({ id: user.id }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
  });

  // save hashed refresh token to database
  const tokenHash = hashToken(refreshToken);
  const expires_at = new Date(Date.now() + env.jwt.refreshExpiresInMs);

  await refreshTokenRepository.create({
    user_id: user.id,
    token_hash: tokenHash,
    device_name: device_name || "Unknown Device",
    expires_at,
  });

  // Return user and tokens
  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      phone_number: user.phone_number,
      role: user.role,
      createdAt: user.createdAt,
    },
    token,
    refreshToken,
  };
};

/**
 * Authenticate details and generate an authorization token.
 *
 * @param {string} email - Login email
 * @param {string} password - Raw password
 * @returns {Promise<object>} Session tokens and user details
 */
const authenticateUser = async (email, password, device_name) => {
  const user = await userRepository.findByEmail(email);

  if (!user) {
    throw errors.UnauthorizedError("Invalid Credentials");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw errors.UnauthorizedError("Invalid Credentials");
  }

  const token = jwt.sign({ id: user.id, role: user.role }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  });

  const refreshToken = jwt.sign({ id: user.id }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
  });

  // save hashed refresh token to database
  const tokenHash = hashToken(refreshToken);
  const expires_at = new Date(Date.now() + env.jwt.refreshExpiresInMs);

  await refreshTokenRepository.create({
    user_id: user.id,
    token_hash: tokenHash,
    device_name: device_name || "Unknown Device",
    expires_at,
  });

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    token,
    refreshToken,
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
    const tokenHash = hashToken(token);

    // Find token record in database
    const tokenRecord = await refreshTokenRepository.findTokenHash(tokenHash);
    
    // Check token validity 
    if (!tokenRecord || new Date() > new Date(tokenRecord.expires_at)) {
      if (tokenRecord)
        await refreshTokenRepository.deleteByTokenHash(tokenHash);
      throw errors.UnauthorizedError("Invalid or expired refresh token");
    }

    // Fetch user to get their role and verify existence
    const user = await userRepository.findById(decoded.id);
    if (!user) {
      await refreshTokenRepository.deleteByTokenHash(tokenHash);
      throw errors.UnauthorizedError("User no longer exists");
    }

    // Delete used token (Rotation)
    await refreshTokenRepository.deleteByTokenHash(tokenHash);

    // Issue new Access Token & Refresh Token
    const newAccessToken = jwt.sign(
      { id: user.id, role: user.role },
      env.jwt.secret,
      { expiresIn: env.jwt.expiresIn }
    );
    const newRefreshToken = jwt.sign(
      { id: user.id },
      env.jwt.refreshSecret,
      { expiresIn: env.jwt.refreshExpiresIn }
    );

    // Save new hashed token
    const newTokenHash = hashToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + env.jwt.refreshExpiresInMs);

    await refreshTokenRepository.create({
      user_id: user.id,
      token_hash: newTokenHash,
      device_name: tokenRecord.device_name,
      expires_at: expiresAt
    });

    return { token: newAccessToken, refreshToken: newRefreshToken };
  } catch (error) {
    throw errors.UnauthorizedError("Invalid refresh token");
  }
};

/**
 * Logout user by clearing their refresh token
 *
 * @param {number} userId
 */
const logoutUser = async (token) => {
  if(token){
    const tokenHash = hashToken(token);
    await refreshTokenRepository.deleteByTokenHash(tokenHash);  
  }
};

export {
  registerUser,
  authenticateUser,
  getUserProfile,
  refreshAuth,
  logoutUser,
};
