import { BaseApiService } from './baseApiService';
import { UserSettings, defaultUserSettings } from '../entities/UserSettings';
import { ApiResponse } from '../entities/api';
import apiClient from './apiClient';
import { toApiError } from './apiErrorUtils';
import { unwrapData } from './apiResponseUtils';

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
      return {
        success: false,
        error: {
          code: 'NOT_IMPLEMENTED',
          message: 'Mock implementation not used',
        },
      };
    }

    try {
      const response = await apiClient.get<unknown>(`${this.endpoint}/user`);

      // Apply any defaults for missing properties
      const settings = {
        id: 'local-settings',
        userId: 'local-user',
        ...defaultUserSettings,
        ...(unwrapData<Partial<UserSettings>>(response) ?? {}),
      } satisfies UserSettings;

      return {
        success: true,
        data: settings,
      };
    } catch (error: unknown) {
      const apiError = toApiError(error, 'Failed to fetch user settings');
      return {
        success: false,
        error: {
          code: apiError.code,
          message: apiError.message,
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
      return {
        success: false,
        error: {
          code: 'NOT_IMPLEMENTED',
          message: 'Mock implementation not used',
        },
      };
    }

    try {
      const response = await apiClient.put<unknown, Partial<UserSettings>>(this.endpoint, settings);

      return {
        success: true,
        data: unwrapData<UserSettings>(response),
      };
    } catch (error: unknown) {
      const apiError = toApiError(error, 'Failed to save user settings');
      return {
        success: false,
        error: {
          code: apiError.code,
          message: apiError.message,
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
      return {
        success: false,
        error: {
          code: 'NOT_IMPLEMENTED',
          message: 'Mock implementation not used',
        },
      };
    }

    try {
      const response = await apiClient.post<unknown, Record<string, never>>(
        `${this.endpoint}/reset`,
        {}
      );

      return {
        success: true,
        data: unwrapData<UserSettings>(response),
      };
    } catch (error: unknown) {
      const apiError = toApiError(error, 'Failed to reset user settings');
      return {
        success: false,
        error: {
          code: apiError.code,
          message: apiError.message,
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
          return { ...defaultUserSettings, ...parsedSettings };
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
