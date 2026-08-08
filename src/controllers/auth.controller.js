/**
 * Auth Controller
 * 
 * Responsibility: Handles client registration, login, and user profile retrieval.
 * Validates request payload structures and translates responses to HTTP formats.
 */

import * as authService from "../services/auth.service.js";

/**
 * Register a new customer user.
 * Route: POST /api/auth/register
 * 
 * @param {object} req - Express Request
 * @param {object} res - Express Response
 * @param {function} next - Express Next Middleware Function
 */
const register = async (req, res, next) => {
  try {
    const { user, token } = await authService.registerUser(req.body);
    
    res.status(201).json({
      status: 'success',
      token,
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Authenticate a user and issue a JWT.
 * Route: POST /api/auth/login
 * 
 * @param {object} req - Express Request
 * @param {object} res - Express Response
 * @param {function} next - Express Next Middleware Function
 */
const login = async (req, res, next) => {
  try {
    const {email, password} = req.body;
    const { user, token} = await authService.authenticateUser(email, password);

    res.status(200).json({
      status: "success",
      token,
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve the profile of the current authenticated user.
 * Route: GET /api/auth/profile
 * 
 * @param {object} req - Express Request
 * @param {object} res - Express Response
 * @param {function} next - Express Next Middleware Function
 */
const profile = async (req, res, next) => {
  try {
    // req.user was attached by the `authenticate` middleware!
    const userId = req.user.id; 

    // We can call the repository directly here, or make a getProfile method in authService.
    // For simplicity, we'll just import the repository at the top of the file if needed, 
    // but a cleaner way is adding it to authService. Let's assume you'll add it to authService.
    const user = await authService.getUserProfile(userId);

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

export {
  register,
  login,
  profile
};
