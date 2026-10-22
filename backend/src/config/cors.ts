import { env } from './env.js';

export const getAllowedOrigins = (): string[] => {
  return env.CORS_ORIGIN
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean);
};

export const isAllowedOrigin = (origin?: string): boolean => {
  // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
  if (!origin) return true;

  const cleanOrigin = origin.replace(/\/$/, '');
  const allowed = getAllowedOrigins();

  if (allowed.includes(cleanOrigin) || allowed.includes('*')) {
    return true;
  }

  // Allow Vercel preview & production deployments if any vercel.app is configured
  if (
    allowed.some((ao) => ao.includes('vercel.app')) &&
    /^https:\/\/[a-zA-Z0-9_-]+\.vercel\.app$/.test(cleanOrigin)
  ) {
    return true;
  }

  // In non-production, allow localhost and local IPs
  if (env.NODE_ENV !== 'production' && /https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(cleanOrigin)) {
    return true;
  }

  return false;
};
