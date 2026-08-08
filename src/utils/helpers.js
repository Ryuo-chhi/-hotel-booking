/**
 * Helper Utilities
 * 
 * Responsibility: Implements date calculations, controller wrapper decorators (asyncHandler),
 * and dynamic calculations.
 */

/**
 * Controller wrapper catch helper forwarding exceptions to global middleware.
 * 
 * @param {function} fn - Async controller route handler
 * @returns {function} Curried Express handler function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Calculates day difference duration between two date parameters.
 * 
 * @param {string} start - Start Date (YYYY-MM-DD)
 * @param {string} end - End Date (YYYY-MM-DD)
 * @returns {number} Night count difference
 */
const getNightCount = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate - startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export default {
  asyncHandler,
  getNightCount
};
