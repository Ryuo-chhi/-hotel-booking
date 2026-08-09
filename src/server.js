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
  const startTime = Date.now();
  try {
    await sequelize.authenticate();
    logger.info('Database connected successfully.');

    // Sync database models with DB tables (alter: true adds missing columns)
    await sequelize.sync({ alter: true });
    logger.info('Database synced successfully.');

    app.listen(PORT, () => {
      const duration = Date.now() - startTime;
      logger.info(`Server running on port: http://localhost:${PORT} (started in ${duration}ms)`);
    });
  } catch (error) {
    logger.error(`Unable to connect to the database: ${error.message}`, error);
  }
}

startServer();
