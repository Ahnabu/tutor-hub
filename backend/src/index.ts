import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { globalLimiter } from './middlewares/rateLimit.js';
import { csrfProtection } from './middlewares/csrf.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { EmailWorker } from './services/email.service.js';
import { authRoutes } from './routes/auth.routes.js';
import { uploadRoutes } from './routes/upload.routes.js';
import { tuitionRoutes } from './routes/tuition.routes.js';

const app = express();

// 1. Security Headers & CORS
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

// 2. Cookie & Body Parsers with limits
app.use(cookieParser(env.COOKIE_SECRET));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 3. Global Rate Limiter
app.use(globalLimiter);

// 4. CSRF Protection for state-changing requests
app.use(csrfProtection);

// 5. Health & Readiness Diagnostics
app.get('/healthz', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/readyz', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ready', timestamp: new Date().toISOString() });
});

// 6. Application API Routes
app.use(`${env.API_PREFIX}/auth`, authRoutes);
app.use(`${env.API_PREFIX}/uploads`, uploadRoutes);
app.use(`${env.API_PREFIX}/tuitions`, tuitionRoutes);

// 7. Central Error Handler
app.use(errorHandler);

// Boot server if not in test mode
if (env.NODE_ENV !== 'test') {
  connectDatabase()
    .then(() => {
      EmailWorker.start();
      app.listen(env.PORT, () => {
        console.log(`🚀 TutorHub API running on http://localhost:${env.PORT}${env.API_PREFIX}`);
      });
    })
    .catch((err) => {
      console.error('Failed to start server due to database error:', err);
      process.exit(1);
    });
}

export default app;
