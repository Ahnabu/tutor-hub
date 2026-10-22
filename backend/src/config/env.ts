import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_PREFIX: z.string().default('/api/v1'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  COOKIE_SECRET: z.string().min(32, 'COOKIE_SECRET must be at least 32 characters'),
  COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).optional(),

  CLOUDINARY_CLOUD_NAME: z.string().default('mock_cloud'),
  CLOUDINARY_API_KEY: z.string().default('mock_key'),
  CLOUDINARY_API_SECRET: z.string().default('mock_secret'),

  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.coerce.number().default(1025),
  SMTP_SECURE: z
    .preprocess((val) => {
      if (typeof val === 'string') {
        const lower = val.trim().toLowerCase();
        if (lower === 'true' || lower === '1') return true;
        if (lower === 'false' || lower === '0') return false;
      }
      if (typeof val === 'boolean') return val;
      return false;
    }, z.boolean())
    .default(false),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  EMAIL_FROM: z.string().default('TutorHub <noreply@tutorhub.local>'),

  ADMIN_EMAIL: z.string().email().default('admin@tutorhub.local'),
  ADMIN_PASSWORD: z.string().min(8).default('AdminSecurePassword123!'),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ FATAL: Invalid environment variables configuration:');
    console.error(JSON.stringify(result.error.format(), null, 2));
    process.exit(1);
  }
  return result.data;
};

export const env = parseEnv();
