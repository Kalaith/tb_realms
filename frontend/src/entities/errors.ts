/**
 * Common error types for application-wide use
 */

import { ApiError } from './api';

/**
 * Base application error
 */
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Error from API responses
 */
export class ApiResponseError extends AppError {
  status?: number;
  statusText?: string;
  apiError?: ApiError;

  constructor(message: string, status?: number, statusText?: string, apiError?: ApiError) {
    super(message);
    this.name = 'ApiResponseError';
    this.status = status;
    this.statusText = statusText;
    this.apiError = apiError;
  }
}

/**
 * Specific error for authentication failures
 */
export class AuthenticationError extends ApiResponseError {
  constructor(message: string, status?: number, apiError?: ApiError) {
    super(message, status, 'Authentication Failed', apiError);
    this.name = 'AuthenticationError';
  }
}

/**
 * Error for network-related issues
 */
export class NetworkError extends AppError {
  constructor(message: string = 'Network error occurred') {
    super(message);
    this.name = 'NetworkError';
  }
}

/**
 * Expanded Error response for API requests
 */
export interface ApiErrorResponse {
  status?: number;
  statusText?: string;
  data?: {
    error?: ApiError;
    message?: string;
  };
}
