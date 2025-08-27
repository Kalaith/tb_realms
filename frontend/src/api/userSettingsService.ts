import { BaseApiService } from './baseApiService';
import { UserSettings, DEFAULT_USER_SETTINGS } from '../entities/UserSettings';
import { ApiResponse } from '../entities/api';
import apiClient from './apiClient';

/**
 * Service for managing user settings
 */
class UserSettingsService extends BaseApiService<UserSettings> {
  constructor() {
    super('settings');
  }
  
  /**
   * Get user settings for the current user
   */
  async getCurrentUserSettings(): Promise<ApiResponse<UserSettings>> {
    if (this.useMockData) {
      // Mock implementation code kept for reference
      // ...existing mock implementation...
      return { success: false, error: { code: "NOT_IMPLEMENTED", message: "Mock implementation not used" } };
    }
    
    try {
      const response = await apiClient.get(`${this.endpoint}/user`);
      
      // Apply any defaults for missing properties
      const settings = {
        ...DEFAULT_USER_SETTINGS,
        ...response.data
      };
      
      return {
        success: true,
        data: settings
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.status || 'ERROR',
          message: error.data?.message || error.statusText || 'Failed to fetch user settings',
        },
      };
    }
  }
  
  /**
   * Save user settings
   */
  async saveUserSettings(settings: Partial<UserSettings>): Promise<ApiResponse<UserSettings>> {
    if (this.useMockData) {
      // Mock implementation code kept for reference
      // ...existing mock implementation...
      return { success: false, error: { code: "NOT_IMPLEMENTED", message: "Mock implementation not used" } };
    }
    
    try {
      const response = await apiClient.put(this.endpoint, settings);
      
      return {
        success: true,
        data: response.data || response
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.status || 'ERROR',
          message: error.data?.message || error.statusText || 'Failed to save user settings',
        },
      };
    }
  }
  
  /**
   * Reset user settings to defaults
   */
  async resetToDefaults(): Promise<ApiResponse<UserSettings>> {
    if (this.useMockData) {
      // Mock implementation code kept for reference
      // ...existing mock implementation...
      return { success: false, error: { code: "NOT_IMPLEMENTED", message: "Mock implementation not used" } };
    }
    
    try {
      const response = await apiClient.post(`${this.endpoint}/reset`);
      
      return {
        success: true,
        data: response.data || response
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.status || 'ERROR',
          message: error.data?.message || error.statusText || 'Failed to reset user settings',
        },
      };
    }
  }

  /**
   * Load settings from localStorage
   */
  loadFromLocalStorage(): UserSettings | null {
    try {
      const stored = localStorage.getItem('userSettings');
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        // Ensure required fields are present
        if (parsedSettings.id && parsedSettings.userId) {
          return { ...DEFAULT_USER_SETTINGS, ...parsedSettings };
        }
      }
    } catch (error) {
      console.error('Error loading settings from localStorage:', error);
    }
    return null;
  }

  /**
   * Save settings to localStorage
   */
  saveToLocalStorage(settings: Partial<UserSettings>): void {
    try {
      localStorage.setItem('userSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings to localStorage:', error);
    }
  }

 
}

export default new UserSettingsService();