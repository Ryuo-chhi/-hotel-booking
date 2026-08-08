/**
 * Express Application Configuration
 * 
 * Responsibility: Initializes Express app, registers standard security middlewares,
 * binds rate-limiters, mounts routing branches, and maps global error wrappers.
 */

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import logger from './utils/logger.js';

import authRoutes from "./routes/auth.routes.js";
import { errorHandler } from './middlewares/error.middleware.js';

const app = express();

// Standard middlewares (helmet, cors, express.json) placeholders
app.use(helmet());
app.use(cors());

// HTTP request logger mapping morgan to winston
app.use(morgan('dev', {
  stream: { write: (message) => logger.info(message.trim()) }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route loading placeholders
app.use("/api/auth", authRoutes);


// Global error handling placeholder
app.use(errorHandler)

export default app;
