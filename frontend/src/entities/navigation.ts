/**
 * Navigation-related types and interfaces
 */

/**
 * Main navigation item definition
 */
export interface NavigationItem {
  name: string;
  path: string;
  icon: string;
  requiresAuth: boolean;
  showInHeader: boolean;
}

/**
 * Account-related navigation item definition
 */
export interface AccountNavItem {
  name: string;
  path: string;
  icon: string;
}

/**
 * App branding definition
 */
export interface AppBranding {
  name: string;
  logoUrl: string | null;
  version: string;
}
