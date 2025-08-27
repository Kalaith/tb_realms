/**
 * Utility functions for the leaderboard feature
 */

/**
 * Format currency value for display
 * @param value Number to format as currency
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Format percentage value for display
 * @param value Number to format as percentage
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: 'always'
  }).format(value / 100);
};

/**
 * Format date for display
 * @param dateString Date string to format
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Get CSS class for positive/negative growth
 * @param growth Growth value
 * @returns CSS class name
 */
export const getGrowthClass = (growth: number): string => {
  return growth >= 0 ? 'positive-growth' : 'negative-growth';
};

/**
 * Get badge color class based on badge name
 * @param badge Badge name
 * @returns CSS class for badge styling
 */
export const getBadgeClass = (badge: string): string => {
  const badgeClasses: Record<string, string> = {
    'Diamond Trader': 'badge-diamond',
    'Market Guru': 'badge-guru',
    'Gold Trader': 'badge-gold',
    'Silver Trader': 'badge-silver',
    'Bronze Trader': 'badge-bronze',
    'Risk Manager': 'badge-risk',
    'Tech Specialist': 'badge-tech',
    'Rising Star': 'badge-rising',
    'Consistent Performer': 'badge-consistent',
    'Smart Investor': 'badge-smart',
    'Rapid Trader': 'badge-rapid',
    'Income Specialist': 'badge-income',
    'Quick Flipper': 'badge-flipper'
  };
  
  return badgeClasses[badge] || 'badge-default';
};