import jwt from "jsonwebtoken";
import * as env from "../config/env.js";

/**
 * Authentication Middleware
 *
 * Responsibility: Restricts route access to valid JWT claims and enforces RBAC rules.
 */

/**
 * Verify JWT authorization token in request headers.
 *
 * @param {object} req - Express Request
 * @param {object} res - Express Response
 * @param {function} next - Express Next
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      status: "fail",
      message: "Unauthorized",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = jwt.verify(token, env.jwt.secret);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({
      status: "fail",
      message: "Invalid Token",
    });
  }
}

/**
 * Limit route execution to specified role parameters.
 *
 * @param {Array<string>} allowedRoles - Permitted authorization roles
 * @returns {function} Curried Express middleware
 */
function authorize(allowedRoles) {
  return (req, res, next) => {
    const { role } = req.user;

    if (!allowedRoles.includes(role)) {
      res.status(403).json({
        status: "fail",
        message: "Forbidden",
      });
    }
    next();
  };
}

export { authenticate, authorize };
