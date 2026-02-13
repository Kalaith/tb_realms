import { BaseApiService } from './baseApiService';
import { Stock, PricePoint, TimeFrame } from '../entities/Stock';
import { ApiResponse, StockFilters } from '../entities/api';
import apiClient from './apiClient';
import { toApiError } from './apiErrorUtils';
import { unwrapData } from './apiResponseUtils';

/**
 * Service for managing stock data
 */
export class StockService extends BaseApiService<Stock> {
  constructor() {
    super('stocks'); // Removed empty array, as mockData is handled in base
  }
  
  /**
   * Get stocks by filter criteria
   */
  async getByFilters(filters: StockFilters): Promise<ApiResponse<Stock[]>> {
    try {
      // Convert filters to query parameters
      const queryParams = new URLSearchParams();
      
      if (filters.sector) queryParams.append('sector', filters.sector);
      if (filters.priceMin !== undefined) queryParams.append('priceMin', filters.priceMin.toString());
      if (filters.priceMax !== undefined) queryParams.append('priceMax', filters.priceMax.toString());
      if (filters.marketCapMin !== undefined) queryParams.append('marketCapMin', filters.marketCapMin.toString());
      if (filters.marketCapMax !== undefined) queryParams.append('marketCapMax', filters.marketCapMax.toString());
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.sortDirection) queryParams.append('sortDirection', filters.sortDirection);
      
      const queryString = queryParams.toString();
      const endpoint = queryString ? `${this.endpoint}/filter?${queryString}` : `${this.endpoint}/filter`;
      
      const response = await apiClient.get<unknown>(endpoint);
       
      return {
        success: true,
        data: unwrapData<Stock[]>(response),
      };
    } catch (error: unknown) {
      const apiError = toApiError(error, 'Failed to fetch filtered stocks');
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
   * Get price history for a stock by timeframe
   */
  async getPriceHistory(stockId: string, timeFrame: TimeFrame): Promise<ApiResponse<PricePoint[]>> {
    try {
      const response = await apiClient.get<unknown>(`${this.endpoint}/${stockId}/prices?timeFrame=${timeFrame}`);
       
      return {
        success: true,
        data: unwrapData<PricePoint[]>(response),
      };
    } catch (error: unknown) {
      const apiError = toApiError(error, 'Failed to fetch price history');
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
export const stockService = new StockService();
