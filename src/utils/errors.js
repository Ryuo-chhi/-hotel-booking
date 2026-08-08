/**
 * Custom Operational Errors Framework
 * 
 * Responsibility: Defines factory functions matching specific API status outcomes.
 */

const createError = (name, statusCode, message) => {
  const error = new Error(message);
  error.name = name;
  error.statusCode = statusCode;
  error.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
  error.isOperational = true;
  Error.captureStackTrace(error, createError);
  return error;
};

const AppError = (message, statusCode) => createError('AppError', statusCode, message);
const BadRequestError = (message = 'Bad Request') => createError('BadRequestError', 400, message);
const UnauthorizedError = (message = 'Unauthorized') => createError('UnauthorizedError', 401, message);
const ForbiddenError = (message = 'Forbidden') => createError('ForbiddenError', 403, message);
const NotFoundError = (message = 'Not Found') => createError('NotFoundError', 404, message);
const ConflictError = (message = 'Conflict') => createError('ConflictError', 409, message);

export {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError
};
