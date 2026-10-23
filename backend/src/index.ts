import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
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
import { guardianRoutes } from './routes/guardian.routes.js';
import { teacherRoutes } from './routes/teacher.routes.js';
import { contactRoutes } from './routes/contact.routes.js';
import { marketplaceRoutes } from './routes/marketplace.routes.js';
import { adminRoutes } from './routes/admin.routes.js';
import { isAllowedOrigin } from './config/cors.js';

const app = express();

// Trust reverse proxy (Vercel, Render, AWS ALB, Cloudflare)
app.set('trust proxy', 1);

// 1. Security Headers & CORS
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'x-bypass-csrf',
  ],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// 2. Cookie & Body Parsers with limits
app.use(cookieParser(env.COOKIE_SECRET));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 3. Global Rate Limiter
app.use(globalLimiter);

// 4. CSRF Protection for state-changing requests
app.use(csrfProtection);

// 5. Health, Root & Diagnostics
app.get(['/', env.API_PREFIX], (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    name: 'TutorHub API',
    version: '1.0.0',
    prefix: env.API_PREFIX,
    timestamp: new Date().toISOString(),
  });
});

app.get('/healthz', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/readyz', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ready', timestamp: new Date().toISOString() });
});

// Ensure database connection for serverless cold starts
app.use(async (_req: Request, _res: Response, next) => {
  if (mongoose.connection.readyState !== 1 && env.NODE_ENV !== 'test') {
    try {
      await connectDatabase();
    } catch (err) {
      return next(err);
    }
  }
  next();
});

// 6. Application API Routes
app.use(`${env.API_PREFIX}/auth`, authRoutes);
app.use(`${env.API_PREFIX}/uploads`, uploadRoutes);
app.use(`${env.API_PREFIX}/tuitions`, tuitionRoutes);
app.use(`${env.API_PREFIX}/guardian`, guardianRoutes);
app.use(`${env.API_PREFIX}/teachers`, teacherRoutes);
app.use(`${env.API_PREFIX}/contact-requests`, contactRoutes);
app.use(`${env.API_PREFIX}/marketplace`, marketplaceRoutes);
app.use(`${env.API_PREFIX}/admin`, adminRoutes);

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
