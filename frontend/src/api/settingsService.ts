import { ApiResponse } from '../entities/api';
import { SettingsCategory } from '../entities/SettingsUI';
import apiClient from './apiClient';

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
      const response = await apiClient.get('/settings/categories');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching settings categories:', error);
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch settings categories'
        }
      };
    }
  },
  
  /**
   * Updates user settings on the backend
   * @param settingsData Settings data to update
   * @returns Promise with updated settings data
   */
  updateUserSettings: async (settingsData: Record<string, any>): Promise<ApiResponse<Record<string, any>>> => {
    try {
      const response = await apiClient.put('/settings', settingsData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating user settings:', error);
      return {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: 'Failed to update user settings'
        }
      };
    }
  },
  
  /**
   * Fetches current user settings from the backend
   * @returns Promise with user settings data
   */
  getUserSettings: async (): Promise<ApiResponse<Record<string, any>>> => {
    try {
      const response = await apiClient.get('/settings');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching user settings:', error);
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch user settings'
        }
      };
    }
  }
};