/**
 * Watchlist Service
 * Handles API requests related to user watchlist
 */
import { BaseApiService } from "./baseApiService";
import { ApiResponse } from "../entities/api";
import apiClient from "./apiClient";
import { Stock } from "../entities/Stock";
import { toApiError } from "./apiErrorUtils";
import { unwrapData } from "./apiResponseUtils";

export interface WatchlistItem {
  id: string;
  userId: string;
  stockId: string;
  addedAt: string; // ISO date string
  stock: Stock;
  notes?: string;
  targetPrice?: number;
}

/**
 * Service for managing user watchlist data
 */
export class WatchlistService extends BaseApiService<WatchlistItem> {
  constructor() {
    super("watchlist");
  }

  /**
   * Get current user's watchlist
   */
  async getCurrentUserWatchlist(): Promise<ApiResponse<WatchlistItem[]>> {
    try {
      const response = await apiClient.get<unknown>(`${this.endpoint}/me`);

      return {
        success: true,
        data: unwrapData<WatchlistItem[]>(response),
      };
    } catch (error: unknown) {
      const apiError = toApiError(error, "Failed to fetch watchlist data");
      return {
        success: false,
        error: {
          code: apiError.code,
          message: apiError.message,
        },
      };
    }
  }

  /**
   * Add a stock to watchlist
   */
  async addToWatchlist(
    stockId: string,
    options?: { notes?: string; targetPrice?: number },
  ): Promise<ApiResponse<WatchlistItem>> {
    try {
      const response = await apiClient.post<
        unknown,
        { stockId: string; notes?: string; targetPrice?: number }
      >(`${this.endpoint}`, {
        stockId,
        ...options,
      });

      return {
        success: true,
        data: unwrapData<WatchlistItem>(response),
      };
    } catch (error: unknown) {
      const apiError = toApiError(error, "Failed to add stock to watchlist");
      return {
        success: false,
        error: {
          code: apiError.code,
          message: apiError.message,
        },
      };
    }
  }

  /**
   * Remove a stock from watchlist
   */
  async removeFromWatchlist(itemId: string): Promise<ApiResponse<void>> {
    try {
      await apiClient.delete(`${this.endpoint}/${itemId}`);

      return {
        success: true,
      };
    } catch (error: unknown) {
      const apiError = toApiError(
        error,
        "Failed to remove stock from watchlist",
      );
      return {
        success: false,
        error: {
          code: apiError.code,
          message: apiError.message,
        },
      };
    }
  }

  /**
   * Update watchlist item notes or target price
   */
  async updateWatchlistItem(
    itemId: string,
    updates: { notes?: string; targetPrice?: number },
  ): Promise<ApiResponse<WatchlistItem>> {
    try {
      const response = await apiClient.patch<
        unknown,
        { notes?: string; targetPrice?: number }
      >(`${this.endpoint}/${itemId}`, updates);

      return {
        success: true,
        data: unwrapData<WatchlistItem>(response),
      };
    } catch (error: unknown) {
      const apiError = toApiError(error, "Failed to update watchlist item");
      return {
        success: false,
        error: {
          code: apiError.code,
          message: apiError.message,
        },
      };
    }
  }
}

// Create and export a singleton instance
export const watchlistService = new WatchlistService();
