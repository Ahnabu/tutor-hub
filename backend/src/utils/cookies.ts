import { Response, CookieOptions } from 'express';
import { env } from '../config/env.js';

const isProduction = env.NODE_ENV === 'production';
const sameSiteSetting = env.COOKIE_SAME_SITE ?? (isProduction ? 'none' : 'lax');

export const ACCESS_TOKEN_COOKIE = 'th_access_token';
export const REFRESH_TOKEN_COOKIE = 'th_refresh_token';

export const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction || sameSiteSetting === 'none',
  sameSite: sameSiteSetting,
  path: '/',
};

export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
): void => {
  // Access Token: 15 minutes (in milliseconds: 15 * 60 * 1000)
  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
    ...baseCookieOptions,
    maxAge: 15 * 60 * 1000,
  });

  // Refresh Token: 7 days (7 * 24 * 60 * 60 * 1000)
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...baseCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const clearAuthCookies = (res: Response): void => {
  res.clearCookie(ACCESS_TOKEN_COOKIE, {
    ...baseCookieOptions,
    maxAge: 0,
  });
  res.clearCookie(REFRESH_TOKEN_COOKIE, {
    ...baseCookieOptions,
    maxAge: 0,
  });
};
