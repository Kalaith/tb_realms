import { ApiResponse } from '../entities/api';
import type { PricePoint } from '../entities/Stock';

/**
 * Simulates API delay (legacy - kept for fallback to mock data if needed)
 */
export async function mockDelay(minMs = 300, maxMs = 800): Promise<void> {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

/**
 * Generate mock price history for a stock (legacy - kept for fallback to mock data if needed)
 */
export function generateMockPriceHistory(basePrice: number): PricePoint[] {
  const today = new Date();
  const priceHistory: PricePoint[] = [];
  let price = basePrice;
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    // Create some random price variation
    const priceChange = (Math.random() * 6) - 3; // Random change between -3% and +3%
    price = price * (1 + (priceChange / 100));
    
    priceHistory.push({
      timestamp: new Date(date),
      price: parseFloat(price.toFixed(2)),
      volume: Math.floor(Math.random() * 10000000) + 10000000
    });
  }
  
  return priceHistory;
}

/**
 * Creates a success API response
 * Used for formatting API responses consistently
 */
export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data
  };
}

/**
 * Creates an error API response
 * Used for formatting error responses consistently
 */
export function createErrorResponse(code: string, message: string): ApiResponse<never> {
  return {
    success: false,
    error: {
      code,
      message
    }
  };
}

/**
 * Generate a new ID with a prefix (legacy - kept for fallback to mock data if needed)
 */
export function generateId(prefix: string): string {
  return `${prefix}${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

/**
 * Handle API errors in a consistent way
 * Formats error responses from API calls
 */
export function handleApiError(error: unknown, entityName: string, actionDescription: string): ApiResponse<never> {
  console.error(`Error ${actionDescription} for ${entityName}:`, error);
  
  // Extract error info
  const err = error as { data?: { message?: string; code?: string }; statusText?: string };
  const message = err.data?.message || err.statusText || `Failed ${actionDescription}`;
  const errorCode = err.data?.code || `${entityName.toUpperCase()}_ERROR`;
  
  return createErrorResponse(errorCode, message);
}
