import { ApiResponse } from '../entities/api';
import { SettingsCategory } from '../entities/SettingsUI';
import apiClient from './apiClient';
import { unwrapData } from './apiResponseUtils';

/**
 * Service for handling user settings-related API calls
 */
export const settingsService = {
  /**
   * Fetches settings categories from the backend
   * @returns Promise with settings categories data
   */
  getSettingsCategories: async (): Promise<ApiResponse<SettingsCategory[]>> => {
    try {
      const response = await apiClient.get<unknown>('/settings/categories');
      return {
        success: true,
        data: unwrapData<SettingsCategory[]>(response),
      };
    } catch (error) {
      console.error('Error fetching settings categories:', error);
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch settings categories',
        },
      };
    }
  },

  /**
   * Updates user settings on the backend
   * @param settingsData Settings data to update
   * @returns Promise with updated settings data
   */
  updateUserSettings: async (
    settingsData: Record<string, unknown>
  ): Promise<ApiResponse<Record<string, unknown>>> => {
    try {
      const response = await apiClient.put<unknown, Record<string, unknown>>(
        '/settings',
        settingsData
      );
      return {
        success: true,
        data: unwrapData<Record<string, unknown>>(response),
      };
    } catch (error) {
      console.error('Error updating user settings:', error);
      return {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: 'Failed to update user settings',
        },
      };
    }
  },

  /**
   * Fetches current user settings from the backend
   * @returns Promise with user settings data
   */
  getUserSettings: async (): Promise<ApiResponse<Record<string, unknown>>> => {
    try {
      const response = await apiClient.get<unknown>('/settings');
      return {
        success: true,
        data: unwrapData<Record<string, unknown>>(response),
      };
    } catch (error) {
      console.error('Error fetching user settings:', error);
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch user settings',
        },
      };
    }
  },
};
