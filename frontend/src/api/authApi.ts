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
 * Add auth token to requests if available
 */
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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
  try {
    const response = await apiClient.post<ApiResponse<AuthUser>>('/auth/login', credentials);
    
    // Store token for future requests
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
    }
    
    return response.data.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Register new user
 * @param userData - User registration data
 * @returns AuthUser data with token
 */
export const register = async (userData: RegisterRequest): Promise<AuthUser> => {
  try {
    const response = await apiClient.post<ApiResponse<AuthUser>>('/auth/register', userData);
    
    // Store token for future requests
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
    }
    
    return response.data.data;
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Get current authenticated user info
 * @returns Current user data
 */
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const response = await apiClient.get<ApiResponse<AuthUser>>('/auth/user');
    return response.data.data;
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
  localStorage.removeItem('token');
};

export default {
  login,
  register,
  getCurrentUser,
  logout,
  checkServerConnectivity,
};