import { toast } from 'sonner';

interface ApiErrorResponse {
  error?: {
    code?: string;
    message?: string;
    details?: Array<{ path?: string; message?: string }>;
  };
  message?: string;
}

export function getErrorMessage(err: unknown, fallback = 'An unexpected error occurred. Please try again.'): string {
  if (!err) return fallback;

  // Axios error with server response
  const axiosError = err as {
    response?: {
      status?: number;
      data?: ApiErrorResponse | string;
    };
    request?: unknown;
    message?: string;
  };

  if (axiosError.response) {
    const status = axiosError.response.status;
    const data = axiosError.response.data;

    if (status === 429) {
      return 'Too many requests. Please wait a moment before trying again.';
    }

    if (typeof data === 'object' && data !== null) {
      // Check for structured validation error details
      if (Array.isArray(data.error?.details) && data.error.details.length > 0) {
        const detailMessages = data.error.details
          .map((d) => d.message)
          .filter(Boolean);
        if (detailMessages.length > 0) {
          return detailMessages.join('. ');
        }
      }

      if (data.error?.message) {
        return data.error.message;
      }

      if (data.message && typeof data.message === 'string') {
        return data.message;
      }
    } else if (typeof data === 'string' && data.length < 150) {
      return data;
    }

    if (status === 401) {
      return 'Invalid credentials. Please verify your email/phone and password.';
    }
    if (status === 403) {
      return 'Access denied. You do not have permission to perform this action.';
    }
    if (status === 404) {
      return 'The requested resource was not found.';
    }
    if (status === 409) {
      return 'An account or record with this information already exists.';
    }
    if (status && status >= 500) {
      return 'Internal server error. Please try again in a few moments.';
    }
  }

  // Network error (no response received)
  if (axiosError.request && !axiosError.response) {
    return 'Unable to reach the server. Please check your network connection.';
  }

  if (axiosError.message && typeof axiosError.message === 'string') {
    return axiosError.message;
  }

  return fallback;
}

export function showErrorToast(err: unknown, fallback?: string): string {
  const message = getErrorMessage(err, fallback);
  toast.error(message, {
    duration: 5000,
  });
  return message;
}

export function showSuccessToast(message: string): void {
  toast.success(message, {
    duration: 4000,
  });
}
