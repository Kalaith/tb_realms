/**
 * Navigation Context
 * Provides navigation data from the backend throughout the application
 */
import React, { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { NavigationItem, AccountNavItem, AppBranding } from '../entities/navigation';
import navigationService from '../api/navigationService';
import { NavigationContext, type NavigationContextType } from './navigationContextValue';

// Fallback data in case API call fails
const fallbackMainNavigation: NavigationItem[] = [
  {
    name: 'Home',
    path: '/',
    icon: '🏠',
    requiresAuth: false,
    showInHeader: true,
  },
];

const fallbackAccountNavigation: AccountNavItem[] = [
  {
    name: 'Settings',
    path: '/settings',
    icon: '⚙️',
  },
];

const fallbackAppBranding: AppBranding = {
  name: 'Stock Management App',
  logoUrl: null,
  version: '1.0.0',
};

// Provider props
interface NavigationProviderProps {
  children: ReactNode;
}

/**
 * Navigation Context Provider component
 */
export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  // Navigation state
  const [mainNavigation, setMainNavigation] = useState<NavigationItem[]>(fallbackMainNavigation);
  const [accountNavigation, setAccountNavigation] =
    useState<AccountNavItem[]>(fallbackAccountNavigation);
  const [appBranding, setAppBranding] = useState<AppBranding>(fallbackAppBranding);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  /**
   * Fetch navigation data from API
   */
  const refreshNavigationData = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch main navigation items
      const mainNavResponse = await navigationService.getMainNavigation();
      if (mainNavResponse.success && mainNavResponse.data) {
        setMainNavigation(mainNavResponse.data);
      }

      // Fetch account navigation items
      const accountNavResponse = await navigationService.getAccountNavigation();
      if (accountNavResponse.success && accountNavResponse.data) {
        setAccountNavigation(accountNavResponse.data);
      }

      // Fetch app branding
      const brandingResponse = await navigationService.getAppBranding();
      if (brandingResponse.success && brandingResponse.data) {
        setAppBranding(brandingResponse.data);
      }
    } catch (error) {
      console.error('Error fetching navigation data:', error);
      setError('Failed to load navigation data. Using fallback values.');
    } finally {
      setIsLoading(false);
    }
  }, []);
  /**
   * Load navigation data on mount
   */ useEffect(() => {
    refreshNavigationData();

    // Add event listener for auth:login-success
    const handleLoginSuccess = () => {
      // Add a small delay to ensure auth state is updated
      setTimeout(() => {
        refreshNavigationData();
      }, 100);
    };

    window.addEventListener('auth:login-success', handleLoginSuccess);

    // Clean up event listener
    return () => {
      window.removeEventListener('auth:login-success', handleLoginSuccess);
    };
  }, [refreshNavigationData]);

  // Create context value
  const contextValue: NavigationContextType = useMemo(
    () => ({
      mainNavigation,
      accountNavigation,
      appBranding,
      isLoading,
      error,
      refreshNavigationData,
    }),
    [accountNavigation, appBranding, error, isLoading, mainNavigation, refreshNavigationData]
  );

  return <NavigationContext.Provider value={contextValue}>{children}</NavigationContext.Provider>;
};
