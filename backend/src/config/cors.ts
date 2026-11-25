import { env } from './env.js';

export const HARDCODED_ORIGINS = [
  'https://tutor-hub-khaki.vercel.app',
  'https://tutorhub.vercel.app',
  'https://tutor-hub.vercel.app',
  'https://backend-five-rosy-71.vercel.app',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5000',
];

export const getAllowedOrigins = (): string[] => {
  const envOrigins = (env.CORS_ORIGIN || '')
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean);

  return Array.from(new Set([...HARDCODED_ORIGINS, ...envOrigins]));
};

export const isAllowedOrigin = (origin?: string): boolean => {
  // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
  if (!origin) return true;

  const cleanOrigin = origin.trim().replace(/\/$/, '');
  const allowed = getAllowedOrigins();

  if (allowed.includes(cleanOrigin) || allowed.includes('*')) {
    return true;
  }

  // Allow localhost & local network IPs in non-production
  if (env.NODE_ENV !== 'production' && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(cleanOrigin)) {
    return true;
  }

  return false;
};
