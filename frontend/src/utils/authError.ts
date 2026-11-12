import { AxiosError } from 'axios';

interface ApiErrorBody {
  message?: string;
  error?: string;
}

/**
 * Extracts a clean, user-friendly error message from authentication API or network failures.
 */
export function getAuthErrorMessage(
  err: unknown,
  fallback = 'Unable to complete request. Please try again.'
): string {
  const axiosErr = err as AxiosError<ApiErrorBody> | undefined;

  if (!axiosErr || typeof axiosErr !== 'object') {
    return fallback;
  }

  if (!axiosErr.response) {
    if (axiosErr.code === 'ECONNABORTED') {
      return 'Request timed out. The server may be waking up — please try again.';
    }
    return 'Unable to reach the authentication server. Check your connection and try again.';
  }

  const status = axiosErr.response.status;
  const rawMessage = axiosErr.response.data?.message;

  if (rawMessage && typeof rawMessage === 'string' && rawMessage.trim()) {
    return rawMessage.trim();
  }

  if (status === 401 || status === 403) {
    return 'Invalid username or password.';
  }

  if (status >= 500) {
    return 'Authentication service is temporarily unavailable. Please try again shortly.';
  }

  return fallback;
}

