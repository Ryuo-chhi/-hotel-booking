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
 * Validated JWT secret and parameters.
 * @type {object}
 */
const jwt = {
  secret: process.env.JWT_SECRET || 'super_secret_dev_key_123',
  expiresIn: process.env.JWT_EXPIRES_IN || '1h'
};

export {
  db,
  server,
  jwt
};
