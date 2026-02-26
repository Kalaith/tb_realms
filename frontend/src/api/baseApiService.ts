import { ApiResponse } from '../entities/api';
import apiClient from './apiClient';
import { ApiResponseError } from '../entities/errors';

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

  private static toApiError(error: unknown): { code: string; message: string } {
    if (error instanceof ApiResponseError) {
      return {
        code: error.status !== undefined ? String(error.status) : 'ERROR',
        message: error.apiError?.message || error.message || 'An error occurred',
      };
    }
    if (error instanceof Error) {
      return { code: 'ERROR', message: error.message };
    }
    return { code: 'ERROR', message: 'An error occurred' };
  }

  private static unwrapData<U>(payload: unknown, fallback: U): U {
    if (payload && typeof payload === 'object' && 'data' in payload) {
      const nested = (payload as { data?: unknown }).data;
      if (nested !== undefined && nested !== null) {
        return nested as U;
      }
    }
    if (payload === undefined || payload === null) {
      return fallback;
    }
    return payload as U;
  }

  /**
   * Get all items
   */
  async getAll(): Promise<ApiResponse<T[]>> {
    try {
      const response = await apiClient.get<unknown>(this.endpoint);
      const data = BaseApiService.unwrapData<T[]>(response.data, []);
      return {
        success: true,
        data,
      };
    } catch (error: unknown) {
      const apiError = BaseApiService.toApiError(error);
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
   * Get item by ID
   */
  async getById(id: string): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.get<unknown>(`${this.endpoint}/${id}`);
      const data = BaseApiService.unwrapData<T | undefined>(response.data, undefined);
      return {
        success: true,
        data: data as T,
      };
    } catch (error: unknown) {
      const apiError = BaseApiService.toApiError(error);
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
   * Create a new item
   */
  async create(item: Partial<T>): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.post<unknown>(this.endpoint, item);
      const data = BaseApiService.unwrapData<T | undefined>(response.data, undefined);
      return {
        success: true,
        data: data as T,
      };
    } catch (error: unknown) {
      const apiError = BaseApiService.toApiError(error);
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
   * Update an existing item
   */
  async update(id: string, item: Partial<T>): Promise<ApiResponse<T>> {
    try {
      const response = await apiClient.put<unknown>(`${this.endpoint}/${id}`, item);
      const data = BaseApiService.unwrapData<T | undefined>(response.data, undefined);
      return {
        success: true,
        data: data as T,
      };
    } catch (error: unknown) {
      const apiError = BaseApiService.toApiError(error);
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
   * Delete an item by ID
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      await apiClient.delete(`${this.endpoint}/${id}`);
      return {
        success: true,
      };
    } catch (error: unknown) {
      const apiError = BaseApiService.toApiError(error);
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
