import axios from 'axios';
import apiClient from './apiClient';
import type { AuthUser, ApiResponse } from '../entities/Auth';

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const response = await apiClient.get<ApiResponse<{ user: AuthUser }>>('/auth/session');
    return response.data.data?.user ?? null;
  } catch (error) {
    if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
      return null;
    }

    if (axios.isAxiosError(error) && !error.response) {
      return null;
    }

    throw error;
  }
};

export const checkServerConnectivity = async (): Promise<boolean> => {
  try {
    await apiClient.get('/health', { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
};

export const logout = (): void => {
  // Auth state is owned by the shared WebHatchery auth store and AuthContext wrapper.
};

export default {
  getCurrentUser,
  checkServerConnectivity,
  logout,
};
