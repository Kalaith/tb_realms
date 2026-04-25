/**
 * Authentication related types
 */

export interface AuthUser {
  id: string;
  email?: string | null;
  username?: string | null;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  display_name?: string | null;
  token?: string;
  avatarUrl?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  startingBalance?: number;
  roles?: string[];
  role?: string;
  is_guest?: boolean;
  auth_type?: 'frontpage' | 'guest';
  guest_user_id?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
}
