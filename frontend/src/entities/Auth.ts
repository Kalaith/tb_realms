/**
 * Authentication related types
 */

/**
 * Authenticated user data returned from API
 */
export interface AuthUser {
  id: string;
  email?: string | null;
  username?: string | null;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  token?: string;
  avatarUrl?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  startingBalance?: number;
  roles?: string[];
}

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Registration request payload
 */
export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

/**
 * API response structure
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
}
