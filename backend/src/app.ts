import express from 'express';
import { corsMiddleware } from './middleware/cors';
import { limiter } from './middleware/rate-limiter';
import { errorHandler } from './middleware/error.middleware';
import logger from './lib/logger';
import v1Routes from './routes/v1';

const app = express();

// Middleware
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

// Request logging
app.use((req, _res, next) => {
  logger.http(`${req.method} ${req.url}`);
  next();
});

// Health check (simple)
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/v1', v1Routes);

// Error handler (must be last)
app.use(errorHandler);

export default app;