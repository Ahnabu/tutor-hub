import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const getBaseURL = (): string => {
  // 1. Explicit env variable (if provided at build or runtime)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // 2. Client-side browser execution
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

    // On non-localhost domains (e.g. tutor-hub-khaki.vercel.app), NEVER use localhost!
    // Route via Next.js rewrites (/api/v1) which proxies to the production backend
    if (!isLocalhost) {
      return '/api/v1';
    }
  }

  // 3. Server-side Next.js execution (SSR / RSC)
  if (process.env.BACKEND_INTERNAL_URL) {
    return `${process.env.BACKEND_INTERNAL_URL.replace(/\/$/, '')}/api/v1`;
  }
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    return 'https://backend-five-rosy-71.vercel.app/api/v1';
  }

  // 4. Local development fallback
  return 'http://localhost:5000/api/v1';
};

export const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'tutorhub',
  },
});

// Mutex queue variables for single-flight token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Request Interceptor: Ensure dynamic baseURL and attach CSRF header
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Dynamic runtime protection: if running on a live domain, ensure baseURL never targets localhost
  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isLocalhost && (!config.baseURL || config.baseURL.includes('localhost:5000'))) {
      config.baseURL = getBaseURL();
    }
  }

  const method = config.method?.toUpperCase();
  if (method && method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
    config.headers.set('X-Requested-With', 'tutorhub');
  }
  return config;
});

// Response Interceptor: Single-flight 401 refresh mutex
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Ignore 401 on the refresh/login/register endpoints to prevent infinite retry loops
    const requestUrl = originalRequest.url || '';
    if (
      requestUrl.includes('/auth/refresh') ||
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register')
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue concurrent requests while a refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post('/auth/refresh');
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error);
        // Only redirect on browser client if NOT already on a public or auth page
        if (typeof window !== 'undefined') {
          const pathname = window.location.pathname;
          const isPublicOrAuthPage =
            pathname === '/' ||
            pathname.startsWith('/login') ||
            pathname.startsWith('/register') ||
            pathname.startsWith('/verify-email') ||
            pathname.startsWith('/forgot-password') ||
            pathname.startsWith('/reset-password') ||
            pathname.startsWith('/claim-guardian') ||
            pathname.startsWith('/guardian');

          if (!isPublicOrAuthPage) {
            // eslint-disable-next-line @next/next/no-location-assign-relative-destination
            window.location.href = '/login?session_expired=true';
          }
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

