import { useState, useEffect, useCallback } from 'react';
import { UserSettings, defaultUserSettings } from '../entities/UserSettings';
import userSettingsService from '../api/userSettingsService';

/**
 * Custom hook for accessing and modifying user settings throughout the application
 * @returns Object containing settings state and functions to interact with settings
 */
export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // First try to load from localStorage for immediate display
        const localSettings = userSettingsService.loadFromLocalStorage();
        if (localSettings) {
          setSettings(localSettings);
          setIsLoading(false);
        }

        // Then load from API (in case there are updates)
        const response = await userSettingsService.getCurrentUserSettings();
        if (response.success && response.data) {
          setSettings(response.data);
        } else if (response.error) {
          setError(response.error.message);
        }
      } catch (err) {
        setError('Failed to load settings');
        console.error('Error loading settings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  /**
   * Update a specific setting
   */
  const updateSetting = useCallback(
    <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
      setSettings(prev =>
        prev
          ? {
              ...prev,
              [key]: value,
            }
          : null
      );
    },
    []
  );

  /**
   * Save all current settings to the backend/localStorage
   */
  const saveSettings = useCallback(async () => {
    if (!settings) {
      setError('No settings to save');
      return false;
    }

    try {
      const response = await userSettingsService.saveUserSettings(settings);
      if (!response.success && response.error) {
        setError(response.error.message);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
      return false;
    }
  }, [settings]);

  /**
   * Reset all settings to default values
   */
  const resetSettings = useCallback(async () => {
    try {
      const response = await userSettingsService.resetToDefaults();
      if (response.success && response.data) {
        setSettings(response.data);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error resetting settings:', err);
      setError('Failed to reset settings');
      return false;
    }
  }, []);

  /**
   * Get the current value of a setting with type safety
   * Falls back to default value if setting is not yet loaded
   */
  const getSetting = useCallback(
    <K extends keyof UserSettings>(key: K): UserSettings[K] => {
      if (settings && key in settings) {
        return settings[key];
      }

      // Fall back to default if setting not loaded yet
      return defaultUserSettings[key as keyof typeof defaultUserSettings] as UserSettings[K];
    },
    [settings]
  );

  return {
    settings,
    isLoading,
    error,
    updateSetting,
    saveSettings,
    resetSettings,
    getSetting,
  };
}

export default useUserSettings;
