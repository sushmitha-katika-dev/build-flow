import axios from 'axios';

interface ApiErrorPayload {
  message?: string;
  error?: string;
  details?: string;
}

/**
 * Extracts a clear, user-facing message from Axios / Spring Boot errors.
 */
export const getApiErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong. Please try again.'
): string => {
  if (axios.isAxiosError<ApiErrorPayload | string>(error)) {
    const data = error.response?.data;
    if (typeof data === 'string' && data.trim()) {
      return data.trim();
    }
    if (data && typeof data === 'object') {
      if (data.message && data.message.trim()) {
        return data.message.trim();
      }
      if (data.error && data.error.trim()) {
        return data.error.trim();
      }
    }
    if (error.message && error.message.trim()) {
      return error.message.trim();
    }
  } else if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }
  return fallback;
};
