/**
 * Simple in-memory cache for API responses
 * Provides TTL-based caching with automatic cleanup
 */

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

export class ApiCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private cleanupInterval: NodeJS.Timeout;

  constructor(cleanupIntervalMs: number = 300000) {
    // 5 minutes
    // Set up periodic cleanup of expired entries
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, cleanupIntervalMs);
  }

  /**
   * Store data in cache with TTL
   */
  set<T>(key: string, data: T, ttlMs: number = 300000): void {
    // 5 minutes default
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttlMs,
    });
  }

  /**
   * Retrieve data from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (entry.expiry < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Remove specific key from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiry < now) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; expired: number } {
    const now = Date.now();
    let expired = 0;

    for (const entry of this.cache.values()) {
      if (entry.expiry < now) {
        expired++;
      }
    }

    return {
      size: this.cache.size,
      expired,
    };
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}

// Global cache instance
export const apiCache = new ApiCache();

/**
 * Cache key generation utilities
 */
export class CacheKeys {
  static stocks(filters?: Record<string, unknown>): string {
    const filterStr = filters ? JSON.stringify(filters) : "";
    return `stocks:${filterStr}`;
  }

  static stock(id: string): string {
    return `stock:${id}`;
  }

  static stockHistory(id: string, days: number): string {
    return `stock:${id}:history:${days}`;
  }

  static portfolio(userId: string): string {
    return `portfolio:${userId}`;
  }

  static transactions(userId: string, page?: number): string {
    return `transactions:${userId}:${page || 1}`;
  }

  static marketSummary(): string {
    return "market:summary";
  }

  static user(userId: string): string {
    return `user:${userId}`;
  }
}

/**
 * Cache TTL constants (in milliseconds)
 */
export const CacheTTL = {
  STOCKS_LIST: 60000, // 1 minute - stock prices change frequently
  STOCK_DETAILS: 60000, // 1 minute
  STOCK_HISTORY: 300000, // 5 minutes - historical data changes less frequently
  PORTFOLIO: 30000, // 30 seconds - user's portfolio should be fresh
  TRANSACTIONS: 300000, // 5 minutes - transaction history doesn't change often
  MARKET_SUMMARY: 60000, // 1 minute
  USER_PROFILE: 1800000, // 30 minutes - user profile changes rarely
} as const;
