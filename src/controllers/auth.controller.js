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
    const { user, token, refreshToken } = await authService.registerUser(req.body);
    
    // Set HttpOnly cookie for refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

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
    const { user, token, refreshToken } = await authService.authenticateUser(email, password);

    // Set HttpOnly cookie for refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

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

/**
 * Handle refresh token request.
 * Route: POST /api/auth/refresh
 * 
 * @param {object} req - Express Request
 * @param {object} res - Express Response
 * @param {function} next - Express Next Middleware Function
 */
const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    
    const { token: newAccessToken, refreshToken: newRefreshToken } = await authService.refreshAuth(token);

    // Set new refresh token cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
      status: 'success',
      token: newAccessToken
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle logout by clearing cookies and invalidating refresh token.
 * Route: POST /api/auth/logout
 * 
 * @param {object} req - Express Request
 * @param {object} res - Express Response
 * @param {function} next - Express Next Middleware Function
 */
const logout = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    // Assuming user is authenticated to logout, or we parse from cookie
    // If not authenticated, we might need to verify the token first to get the user ID
    // or we just use `req.user.id` if this route is protected by `authenticate`.
    
    // For simplicity, if we have req.user, we use it. 
    // Wait, let's assume this route is protected by the `authenticate` middleware.
    if (req.user) {
      await authService.logoutUser(req.user.id);
    }
    
    res.clearCookie('refreshToken');
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

export {
  register,
  login,
  profile,
  refreshToken,
  logout
};
