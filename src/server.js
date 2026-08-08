/**
 * HTTP Server Entry Point
 * 
 * Responsibility: Resolves database connections, runs pending migrations,
 * registers background cron routines, and binds active sockets.
 */

import app from './app.js';
import { sequelize } from './models/index.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Sync database models with DB tables
    await sequelize.sync();
    console.log('Database synced successfully.');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

startServer();
