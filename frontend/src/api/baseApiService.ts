import { ApiResponse } from '../entities/api';
import apiClient from './apiClient';

/**
 * Base class for all API services
 */
export abstract class BaseApiService<T> {
  protected endpoint: string;
  // useMockData is always false and will be removed in a future step if confirmed.
  protected useMockData: boolean = false;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  /**
   * Get all items
   */
  async getAll(): Promise<ApiResponse<T[]>> {
    try {
      const response = await apiClient.get(this.endpoint);
      return {
        success: true,
        data: response.data || response, // Handle both { data: [] } and direct array responses
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.status || 'ERROR',
          message: error.data?.message || error.statusText || 'An error occurred',
        },
      };
    }
  }

  /**
   * Get item by ID
   */
  async getById(id: string): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.get(`${this.endpoint}/${id}`);
      return {
        success: true,
        data: response.data || response,
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.status || 'ERROR',
          message: error.data?.message || error.statusText || 'An error occurred',
        },
      };
    }
  }

  /**
   * Create a new item
   */
  async create(item: Partial<T>): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.post(this.endpoint, item);
      return {
        success: true,
        data: response.data || response,
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.status || 'ERROR',
          message: error.data?.message || error.statusText || 'An error occurred',
        },
      };
    }
  }

  /**
   * Update an existing item
   */
  async update(id: string, item: Partial<T>): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.put(`${this.endpoint}/${id}`, item);
      return {
        success: true,
        data: response.data || response,
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.status || 'ERROR',
          message: error.data?.message || error.statusText || 'An error occurred',
        },
      };
    }
  }

  /**
   * Delete an item by ID
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      await apiClient.delete(`${this.endpoint}/${id}`);
      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: error.status || 'ERROR',
          message: error.data?.message || error.statusText || 'An error occurred',
        },
      };
    }
  }
}