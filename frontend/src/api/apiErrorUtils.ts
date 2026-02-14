import { ApiResponseError } from '../entities/errors';

export const toApiError = (
  error: unknown,
  fallbackMessage: string
): { code: string; message: string } => {
  if (error instanceof ApiResponseError) {
    return {
      code: error.status !== undefined ? String(error.status) : 'ERROR',
      message: error.apiError?.message || error.message || fallbackMessage,
    };
  }

  if (error instanceof Error) {
    return { code: 'ERROR', message: error.message || fallbackMessage };
  }

  return { code: 'ERROR', message: fallbackMessage };
};
