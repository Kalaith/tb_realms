/**
 * Navigation configuration
 *
 * @deprecated This file is kept for backward compatibility
 * Use NavigationContext instead with useNavigation() hook
 */

import { NavigationItem, AccountNavItem } from '../entities/navigation';

/**
 * Main application navigation items
 * Temporary fallback hardcoded navigation items for backward compatibility
 */
export const mainNavigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    path: '/',
    icon: '📊',
    requiresAuth: false,
    showInHeader: false,
  },
  {
    name: 'Market',
    path: '/market',
    icon: '📈',
    requiresAuth: true,
    showInHeader: true,
  },
  {
    name: 'Portfolio',
    path: '/portfolio',
    icon: '💼',
    requiresAuth: true,
    showInHeader: true,
  },
  {
    name: 'Transactions',
    path: '/transactions',
    icon: '💱',
    requiresAuth: true,
    showInHeader: false,
  },
  {
    name: 'Watchlist',
    path: '/watchlist',
    icon: '👀',
    requiresAuth: true,
    showInHeader: true,
  },
  {
    name: 'Leaderboard',
    path: '/leaderboard',
    icon: '🏆',
    requiresAuth: true,
    showInHeader: true,
  },
  {
    name: 'News',
    path: '/news',
    icon: '📰',
    requiresAuth: false,
    showInHeader: false,
  },
];

/**
 * Account-related navigation items
 */
export const accountNavigation: AccountNavItem[] = [
  {
    name: 'Profile',
    path: '/profile',
    icon: '👤',
  },
  {
    name: 'Settings',
    path: '/settings',
    icon: '⚙️',
  },
  {
    name: 'Achievements',
    path: '/achievements',
    icon: '🏅',
  },
];

/**
 * Application branding configuration
 */
export const appBranding = {
  name: 'Tradeborn Realms',
  logoUrl: null, // Add logo URL if you have an actual logo image
  version: '1.0.0',
};
