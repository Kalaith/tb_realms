import React, { useState, useEffect } from 'react';
import { settingsService } from '../api/settingsService';
import { UserSettings } from '../entities/UserSettings';
import { SettingsCategory } from '../entities/SettingsUI';
import { LoadingSpinner } from '../components/utility';
import userSettingsService from '../api/userSettingsService';

const Settings: React.FC = () => {
  // Settings state
  const [settings, setSettings] = useState<Partial<UserSettings>>({});
  const [settingsCategories, setSettingsCategories] = useState<SettingsCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState<boolean>(true);
  const [saveStatus, setSaveStatus] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // Load settings categories from the backend
  useEffect(() => {
    const fetchSettingsCategories = async () => {
      try {
        setIsCategoriesLoading(true);
        setCategoriesError(null);
        
        const response = await settingsService.getSettingsCategories();
        if (response.success && response.data) {
          setSettingsCategories(response.data);
        } else {
          setCategoriesError('Failed to load settings categories. Please try refreshing the page.');
        }
      } catch (error) {
        console.error('Failed to fetch settings categories:', error);
        setCategoriesError('An error occurred while loading settings categories.');
      } finally {
        setIsCategoriesLoading(false);
      }
    };
    
    fetchSettingsCategories();
  }, []);

  // Load user settings on component mount
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
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  // Handle setting change
  const handleSettingChange = (id: string, value: any) => {
    setSettings({
      ...settings,
      [id]: value
    });
    setSaveStatus(null); // Clear previous save status
  };

  // Save all settings
  const handleSaveSettings = async () => {
    try {
      const response = await userSettingsService.saveUserSettings(settings);
      if (response.success) {
        setSaveStatus({
          message: 'Settings saved successfully!',
          type: 'success'
        });
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSaveStatus(null);
        }, 3000);
      } else {
        setSaveStatus({
          message: response.error?.message || 'Failed to save settings',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus({
        message: 'An error occurred while saving settings',
        type: 'error'
      });
    }
  };

  // Reset settings to defaults
  const handleResetSettings = async () => {
    if (window.confirm('Are you sure you want to reset all settings to their default values?')) {
      try {
        const response = await userSettingsService.resetToDefaults();
        if (response.success && response.data) {
          setSettings(response.data);
          setSaveStatus({
            message: 'Settings reset to defaults',
            type: 'success'
          });
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            setSaveStatus(null);
          }, 3000);
        }
      } catch (error) {
        console.error('Error resetting settings:', error);
      }
    }
  };

  if (isLoading || isCategoriesLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Settings</h1>
        <div className="flex justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (categoriesError) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Settings</h1>
        <div className="p-4 mt-4 text-red-700 bg-red-100 border border-red-200 rounded-lg dark:bg-red-900 dark:text-red-200 dark:border-red-800">
          {categoriesError}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Settings</h1>
      <p className="text-gray-600 dark:text-gray-400 max-w-3xl">
        Customize your game experience. These settings focus on visual cues and performance optimizations
        for playing in real-time with thousands of other players.
      </p>
      
      {saveStatus && (
        <div className={`p-4 mb-6 rounded-md ${
          saveStatus.type === 'success' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          <p>{saveStatus.message}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {settingsCategories.map((category) => (
          <div key={category.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">{category.title}</h2>
            {category.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{category.description}</p>
            )}
            
            <div className="space-y-6">
              {category.settings.map((setting) => (
                <div key={setting.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0">
                  <div className="md:w-7/12">
                    <label htmlFor={setting.id} className="block text-sm font-medium text-gray-800 dark:text-gray-100 mb-1">{setting.label}</label>
                    {setting.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{setting.description}</p>
                    )}
                  </div>
                  
                  <div className="md:w-5/12">
                    {setting.type === 'toggle' && (
                      <div className="flex items-center justify-end">
                        <button 
                          type="button"
                          className={`relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            settings[setting.id as keyof UserSettings] === true
                              ? 'bg-blue-600'
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                          onClick={() => handleSettingChange(setting.id, !settings[setting.id as keyof UserSettings])}
                          role="switch"
                          aria-checked={settings[setting.id as keyof UserSettings] === true}
                          aria-labelledby={`label-${setting.id}`}
                        >
                          <span className="sr-only">{settings[setting.id as keyof UserSettings] ? 'On' : 'Off'}</span>
                          <span 
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                              settings[setting.id as keyof UserSettings] === true
                                ? 'translate-x-6' 
                                : 'translate-x-0.5'
                            }`}
                            aria-hidden="true"
                          />
                        </button>
                        <span id={`label-${setting.id}`} className="sr-only">{setting.label}</span>
                      </div>
                    )}
                    
                    {setting.type === 'select' && (
                      <select 
                        id={setting.id}
                        value={String(settings[setting.id as keyof UserSettings] ?? setting.defaultValue)}
                        onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-800 dark:text-gray-200"
                      >
                        {setting.options?.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    )}
                    
                    {setting.type === 'slider' && (
                      <div className="flex items-center space-x-3">
                        <input 
                          type="range"
                          id={setting.id}
                          min="1"
                          max="20"
                          value={Number(settings[setting.id as keyof UserSettings] ?? setting.defaultValue)}
                          onChange={(e) => handleSettingChange(setting.id, parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[40px] text-center">
                          {Number(settings[setting.id as keyof UserSettings] ?? setting.defaultValue)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button 
          className="w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          onClick={handleSaveSettings}
        >
          Save Settings
        </button>
        <button 
          className="w-full sm:w-auto px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          onClick={handleResetSettings}
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
};

export default Settings;