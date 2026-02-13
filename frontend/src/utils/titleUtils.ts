/**
 * Utility functions for managing page titles
 * Used to set and update the document title based on the current route
 */

const appName = 'Tradeborn Realms';

/**
 * Sets the document title with the provided page name
 * Format: "Page Name | Tradeborn Realms"
 * 
 * @param pageName - The name of the current page
 */
export const setPageTitle = (pageName: string): void => {
  document.title = pageName ? `${pageName} | ${appName}` : appName;
};

/**
 * Returns the title for a given route path
 * 
 * @param path - The current route path
 * @returns The corresponding page title
 */
export const getPageTitleFromPath = (path: string): string => {
  const routeTitles: Record<string, string> = {
    'dashboard': 'Dashboard',
    'market': 'Market Overview',
    'portfolio': 'My Portfolio',
    'trade': 'Trade Stocks',
    'news': 'Market News',
    'leaderboard': 'Leaderboard',
    'achievements': 'Achievements',
    'settings': 'Settings',
  };

  // Handle nested routes by getting the base path
  const basePath = path.split('/')[1];
  return routeTitles[basePath] || 'Page Not Found';
};