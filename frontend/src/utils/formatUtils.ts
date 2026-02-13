/**
 * Common formatting utility functions
 * Used for consistent formatting of numbers, dates, and other values across the application
 */

/**
 * Format currency value for display
 * @param value Number to format as currency
 * @param minimumFractionDigits Minimum number of decimal places (default 2)
 * @param maximumFractionDigits Maximum number of decimal places (default 2)
 * @returns Formatted currency string
 */
export const formatCurrency = (
  value: number | undefined | null,
  minimumFractionDigits = 2,
  maximumFractionDigits = 2,
): string => {
  // Handle undefined or null values
  if (value === undefined || value === null) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(0);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
};

/**
 * Format percentage value for display
 * @param value Number to format as percentage
 * @param showSign Whether to always show the sign (default true)
 * @param minimumFractionDigits Minimum number of decimal places (default 2)
 * @param maximumFractionDigits Maximum number of decimal places (default 2)
 * @param divideByHundred Whether to divide the value by 100 (default true)
 * @returns Formatted percentage string
 */
export const formatPercentage = (
  value: number | undefined | null,
  showSign = true,
  minimumFractionDigits = 2,
  maximumFractionDigits = 2,
  divideByHundred = true,
): string => {
  // Handle undefined or null values
  if (value === undefined || value === null) {
    return "0.00%";
  }

  const signDisplay = showSign ? "exceptZero" : "auto";

  if (divideByHundred) {
    return new Intl.NumberFormat("en-US", {
      style: "percent",
      minimumFractionDigits,
      maximumFractionDigits,
      signDisplay,
    }).format(value / 100);
  }

  return `${value >= 0 && showSign ? "+" : ""}${value.toFixed(minimumFractionDigits)}%`;
};

/**
 * Format date for display
 * @param date Date or string to format
 * @param options DateTimeFormatOptions (defaults to medium date format)
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  },
): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", options).format(dateObj);
};

/**
 * Format date with time for display
 * @param date Date or string to format
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: Date | string): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  return formatDate(date, options);
};

/**
 * Format a number with commas for thousands
 * @param value Number to format
 * @returns Formatted number string with commas
 */
export const formatNumber = (value: number): string => {
  return value.toLocaleString();
};

/**
 * Format market cap value (e.g., $1.2T, $458M)
 * @param marketCap Market cap value
 * @returns Formatted market cap string
 */
export const formatMarketCap = (marketCap: number): string => {
  if (marketCap >= 1_000_000_000_000) {
    return `$${(marketCap / 1_000_000_000_000).toFixed(2)}T`;
  }
  if (marketCap >= 1_000_000_000) {
    return `$${(marketCap / 1_000_000_000).toFixed(2)}B`;
  }
  return `$${(marketCap / 1_000_000).toFixed(2)}M`;
};

/**
 * Get CSS class name based on value trend (positive/negative)
 * @param value Number to check for sign
 * @returns CSS class name based on sign
 */
export const getTrendClass = (value: number): string => {
  return value >= 0 ? "positive" : "negative";
};
