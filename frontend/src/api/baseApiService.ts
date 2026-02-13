import { ApiResponse } from "../entities/api";
import apiClient from "./apiClient";
import { ApiResponseError } from "../entities/errors";

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
        code: error.status !== undefined ? String(error.status) : "ERROR",
        message:
          error.apiError?.message || error.message || "An error occurred",
      };
    }
    if (error instanceof Error) {
      return { code: "ERROR", message: error.message };
    }
    return { code: "ERROR", message: "An error occurred" };
  }

  /**
   * Get all items
   */
  async getAll(): Promise<ApiResponse<T[]>> {
    try {
      const response = await apiClient.get<unknown>(this.endpoint);
      const responseRecord =
        typeof response === "object" && response !== null
          ? (response as Record<string, unknown>)
          : null;
      const data =
        responseRecord && "data" in responseRecord
          ? responseRecord["data"]
          : response;
      return {
        success: true,
        data: (data as T[]) || ([] as T[]), // Handle both { data: [] } and direct array responses
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
      const responseRecord =
        typeof response === "object" && response !== null
          ? (response as Record<string, unknown>)
          : null;
      const data =
        responseRecord && "data" in responseRecord
          ? responseRecord["data"]
          : response;
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
      const response = await apiClient.post<unknown, Partial<T>>(
        this.endpoint,
        item,
      );
      const responseRecord =
        typeof response === "object" && response !== null
          ? (response as Record<string, unknown>)
          : null;
      const data =
        responseRecord && "data" in responseRecord
          ? responseRecord["data"]
          : response;
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
      const response = await apiClient.put<unknown, Partial<T>>(
        `${this.endpoint}/${id}`,
        item,
      );
      const responseRecord =
        typeof response === "object" && response !== null
          ? (response as Record<string, unknown>)
          : null;
      const data =
        responseRecord && "data" in responseRecord
          ? responseRecord["data"]
          : response;
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
