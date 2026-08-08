/**
 * HTTP Server Entry Point
 * 
 * Responsibility: Resolves database connections, runs pending migrations,
 * registers background cron routines, and binds active sockets.
 */

import app from './app.js';
import { sequelize } from './models/index.js';
import logger from './utils/logger.js';

const PORT =  3000;

async function startServer() {
  try {
    await sequelize.authenticate();
    logger.info('Database connected successfully.');

    // Sync database models with DB tables
    await sequelize.sync();
    logger.info('Database synced successfully.');

    app.listen(PORT, () => {
      logger.info(`Server running on port: http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error(`Unable to connect to the database: ${error.message}`, error);
  }
}

startServer();
