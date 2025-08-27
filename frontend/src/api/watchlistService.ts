/**
 * Watchlist Service
 * Handles API requests related to user watchlist
 */
import { BaseApiService } from './baseApiService';
import { ApiResponse } from '../entities/api';
import apiClient from './apiClient';
import { Stock } from '../entities/Stock';

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
    super('watchlist');
  }

  /**
   * Get current user's watchlist
   */
  async getCurrentUserWatchlist(): Promise<ApiResponse<WatchlistItem[]>> {
    try {
      const response = await apiClient.get(`${this.endpoint}/me`);
      
      return {
        success: true,
        data: response.data || response,
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.status || 'ERROR',
          message: error.data?.message || error.statusText || 'Failed to fetch watchlist data',
        },
      };
    }
  }

  /**
   * Add a stock to watchlist
   */
  async addToWatchlist(stockId: string, options?: { notes?: string, targetPrice?: number }): Promise<ApiResponse<WatchlistItem>> {
    try {
      const response = await apiClient.post(`${this.endpoint}`, {
        stockId,
        ...options
      });
      
      return {
        success: true,
        data: response.data || response,
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.status || 'ERROR',
          message: error.data?.message || error.statusText || 'Failed to add stock to watchlist',
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
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.status || 'ERROR',
          message: error.data?.message || error.statusText || 'Failed to remove stock from watchlist',
        },
      };
    }
  }

  /**
   * Update watchlist item notes or target price
   */
  async updateWatchlistItem(
    itemId: string, 
    updates: { notes?: string, targetPrice?: number }
  ): Promise<ApiResponse<WatchlistItem>> {
    try {
      const response = await apiClient.patch(`${this.endpoint}/${itemId}`, updates);
      
      return {
        success: true,
        data: response.data || response,
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.status || 'ERROR',
          message: error.data?.message || error.statusText || 'Failed to update watchlist item',
        },
      };
    }
  }
}

// Create and export a singleton instance
export const watchlistService = new WatchlistService();
