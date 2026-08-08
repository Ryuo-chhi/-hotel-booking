/**
 * Global Error Handling Middleware
 *
 * Responsibility: Catches all route errors, formats response envelopes,
 * and obfuscates production stack traces from client exposure.
 */

/**
 * Handle operational and programmer exceptions gracefully.
 *
 * @param {Error} err - Caught error object
 * @param {object} req - Express Request
 * @param {object} res - Express Response
 * @param {function} next - Express Next
 */
function errorHandler(err, req, res, next) {
  // We check if it's one of our custom operational errors
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  // If it's an unknown programming error (like a database crash)
  console.error("ERROR 💥", err);
  res.status(500).json({
    status: "error",
    message: "Something went very wrong!",
  });
}

export {
  errorHandler,
};
