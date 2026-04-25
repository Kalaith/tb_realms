/**
 * Authentication API Client
 */
import axios from 'axios';
import { AuthUser, ApiResponse } from '../entities/Auth';

const apiUrl = import.meta.env.VITE_API_URL;
const GUEST_AUTH_STORAGE_KEY = 'tb-realms-guest-session';

if (!apiUrl) {
  throw new Error('VITE_API_URL environment variable is required');
}

const apiClient = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

const readToken = (): string | null => {
  try {
    const raw = localStorage.getItem('auth-storage');
    if (raw) {
      const parsed = JSON.parse(raw) as { state?: { token?: string | null } };
      const token = parsed.state?.token ?? null;
      if (token) {
        return token;
      }
    }

    const guestRaw = localStorage.getItem(GUEST_AUTH_STORAGE_KEY);
    if (guestRaw) {
      const parsedGuest = JSON.parse(guestRaw) as { token?: string | null };
      return parsedGuest.token ?? null;
    }
  } catch {
    return null;
  }

  return null;
};

apiClient.interceptors.request.use(config => {
  const token = readToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const handleApiError = (error: unknown): never => {
  if (import.meta.env.DEV) {
    console.error('API Error:', error);
  }

  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || !error.response) {
      throw {
        code: 'CONNECTION_ERROR',
        message:
          'Unable to connect to the server. Please check your connection or try again later.',
      };
    }

    if (error.response?.data?.error) {
      throw error.response.data.error;
    }

    switch (error.response?.status) {
      case 401:
        throw { code: 'UNAUTHORIZED', message: 'Authentication required.' };
      case 403:
        throw { code: 'FORBIDDEN', message: 'You do not have permission to perform this action.' };
      case 404:
        throw { code: 'NOT_FOUND', message: 'The requested resource was not found.' };
      case 422:
        throw { code: 'VALIDATION_ERROR', message: 'Please check your input and try again.' };
      case 500:
        throw { code: 'SERVER_ERROR', message: 'An internal server error occurred. Please try again later.' };
      default:
        throw { code: 'UNKNOWN_ERROR', message: `Error ${error.response?.status || ''}: Something went wrong.` };
    }
  }

  throw { code: 'CLIENT_ERROR', message: 'An unexpected error occurred. Please try again.' };
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const response = await apiClient.get<ApiResponse<{ user: AuthUser }>>('/auth/session');
    return response.data.data?.user ?? null;
  } catch (error) {
    if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
      return null;
    }

    if (axios.isAxiosError(error) && !error.response) {
      console.warn('Connection issue during auth check:', error.message);
      return null;
    }

    return handleApiError(error);
  }
};

export const checkServerConnectivity = async (): Promise<boolean> => {
  try {
    await axios.get(`${apiUrl}/health`, { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
};

export const logout = (): void => {
  // Auth state is managed elsewhere.
};

export default {
  getCurrentUser,
  checkServerConnectivity,
  logout,
};
