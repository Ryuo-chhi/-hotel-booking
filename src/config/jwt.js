/**
 * JWT Parameters Module
 * 
 * Responsibility: Configures JWT sign and verification keys, refresh secrets, and algorithms.
 */

export default {
  /**
   * Secret key for signing authorization access tokens.
   * @type {string}
   */
  secret: 'c6e7374a6912a1fd8bdb990e7dc13ce5',

  /**
   * Secret key for signing session renewal refresh tokens.
   * @type {string}
   */
  refreshSecret: '74dd8aadf9f6d1bded63c68d715fd9dc',

  /**
   * Life duration for access tokens.
   * @type {string}
   */
  expiresIn: '1h',

  /**
   * Life duration for refresh tokens.
   * @type {string}
   */
  refreshExpiresIn: '7d'
};
