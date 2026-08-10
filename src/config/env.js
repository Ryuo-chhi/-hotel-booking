/**
 * Env Configuration Module
 * 
 * Responsibility: Parses, validates, and exports environment variables from process.env.
 * No implementation code is included here, just signature stubs.
 */

/**
 * Validated database configuration settings.
 * @type {object}
 */

const db = {
  host: process.env.DB_HOST,
  port: 3306,
  user: process.env.DB_USER,
  pass: process.env.DB_PASSWORD,
  name: process.env.DB_NAME
};

/**
 * Validated server configuration settings.
 * @type {object}
 */
const server = {
  port: 5000,
  env: 'development'
};

/**
 * Helper to convert duration strings ('7d', '12h', '30m') to milliseconds.
 */
const parseDurationMs = (durationStr) => {
  const str = String(durationStr || '7d').trim();
  const match = str.match(/^(\d+)([dhms])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const val = parseInt(match[1], 10);
  const unit = match[2];
  if (unit === 'd') return val * 24 * 60 * 60 * 1000;
  if (unit === 'h') return val * 60 * 60 * 1000;
  if (unit === 'm') return val * 60 * 1000;
  if (unit === 's') return val * 1000;
  return val;
};

/**
 * Validated JWT secret and parameters.
 * @type {object}
 */
const jwt = {
  secret: process.env.JWT_SECRET || 'super_secret_dev_key_123',
  expiresIn: process.env.JWT_EXPIRES_IN || '15m', // shorten to 15m as per best practice
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_key_456',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  refreshExpiresInMs: parseDurationMs(process.env.JWT_REFRESH_EXPIRES_IN || '7d')
};

export {
  db,
  server,
  jwt
};
