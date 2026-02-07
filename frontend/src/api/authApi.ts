/**
 * Authentication API Client
 * Handles all authentication-related API requests
 */
import axios from 'axios';
import { AuthUser, LoginRequest, RegisterRequest, ApiResponse } from '../entities/Auth';

// Base API URL from environment variables - required
// IMPORTANT: Make sure this matches your backend server address and port
const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  throw new Error('VITE_API_URL environment variable is required');
}

/**
 * Axios instance with base configuration
 */
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add timeout to prevent hanging requests
  timeout: 10000,
});

/**
 * Add auth token to requests if available (Web Hatchery)
 */
apiClient.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('auth-storage');
    if (raw) {
      const parsed = JSON.parse(raw) as { state?: { token?: string | null } };
      const token = parsed.state?.token ?? null;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch {
    // ignore storage errors
  }
  return config;
});

/**
 * Custom error handler to provide more descriptive error messages
 * @param error - The error from axios
 * @returns A formatted error object
 */
const handleApiError = (error: unknown): never => {
  // Log the error for debugging (only in development)
  if (import.meta.env.DEV) {
    console.error('API Error:', error);
  }
  
  // Handle Axios errors
  if (axios.isAxiosError(error)) {
    // Handle network errors (connection refused, server down, etc.)
    if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || !error.response) {
      throw {
        code: 'CONNECTION_ERROR',
        message: 'Unable to connect to the server. Please check your connection or try again later.',
      };
    }
    
    // Handle API error responses with status codes
    if (error.response?.data?.error) {
      throw error.response.data.error;
    }
    
    // Generic error based on status code
    switch (error.response?.status) {
      case 401:
        throw {
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials. Please check your email and password.',
        };
      case 403:
        throw {
          code: 'FORBIDDEN',
          message: 'You do not have permission to perform this action.',
        };
      case 404:
        throw {
          code: 'NOT_FOUND',
          message: 'The requested resource was not found.',
        };
      case 422:
        throw {
          code: 'VALIDATION_ERROR',
          message: 'Please check your input and try again.',
        };
      case 500:
        throw {
          code: 'SERVER_ERROR',
          message: 'An internal server error occurred. Please try again later.',
        };
      default:
        throw {
          code: 'UNKNOWN_ERROR',
          message: `Error ${error.response?.status || ''}: Something went wrong.`,
        };
    }
  }
  
  // Handle non-Axios errors
  throw {
    code: 'CLIENT_ERROR',
    message: 'An unexpected error occurred. Please try again.',
  };
};

/**
 * Login user with credentials
 * @param credentials - User email and password
 * @returns AuthUser data with token
 */
export const login = async (credentials: LoginRequest): Promise<AuthUser> => {
  return handleApiError({
    code: 'UNSUPPORTED',
    message: 'Login is handled by Web Hatchery.'
  });
};

/**
 * Register new user
 * @param userData - User registration data
 * @returns AuthUser data with token
 */
export const register = async (userData: RegisterRequest): Promise<AuthUser> => {
  return handleApiError({
    code: 'UNSUPPORTED',
    message: 'Registration is handled by Web Hatchery.'
  });
};

/**
 * Get current authenticated user info
 * @returns Current user data
 */
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const response = await apiClient.get<ApiResponse<{ user: AuthUser }>>('/auth/session');
    return response.data.data?.user ?? null;
  } catch (error) {
    // Silently fail for auth check - this is expected when not logged in
    if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
      return null;
    }
    
    // For connection errors during auth check, also return null but log the issue
    if (axios.isAxiosError(error) && !error.response) {
      console.warn('Connection issue during auth check:', error.message);
      return null;
    }
    
    // Handle other types of errors
    return handleApiError(error);
  }
};

/**
 * Check server connectivity
 * @returns True if server is reachable
 */
export const checkServerConnectivity = async (): Promise<boolean> => {
  try {
    // Use a simple endpoint that doesn't require authentication
    await axios.get(`${API_URL}/health`, { timeout: 5000 });
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Logout user (client-side only)
 */
export const logout = (): void => {
  // Web Hatchery manages auth; no local logout.
};

export default {
  login,
  register,
  getCurrentUser,
  logout,
  checkServerConnectivity,
};
