
/**
 * API Client for making HTTP requests to the backend
 * Provides a wrapper around fetch API with common functionality
 * Includes response caching for improved performance
 */

import { apiCache, CacheTTL } from "../utils/apiCache";
import type { ApiError } from "../entities/api";

// Base API URL - required environment variable
const apiBaseUrl = import.meta.env.VITE_API_URL;

if (!apiBaseUrl) {
  throw new Error("VITE_API_URL environment variable is required");
}

// Helper to build request options (no authentication needed)
const buildRequestOptions = (options: RequestInit = {}): RequestInit => ({
  ...defaultOptions,
  ...options,
  headers: {
    ...(defaultOptions.headers ?? {}),
    ...(options.headers ?? {}),
  },
});

// Default request options
const defaultOptions: RequestInit = {
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

const getAuthToken = (): string | null => {
  try {
    const raw = localStorage.getItem("auth-storage");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { token?: string | null } };
    return parsed.state?.token ?? null;
  } catch {
    return null;
  }
};

// Helper to build URLs
const buildUrl = (endpoint: string): string => {
  // Remove leading slash if present
  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint.substring(1)
    : endpoint;

  return `${apiBaseUrl}/${normalizedEndpoint}`;
};

// Helper to handle response
const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

const getBodyMessage = (body: unknown): string | undefined => {
  if (!isRecord(body)) return undefined;
  const message = body["message"];
  return typeof message === "string" ? message : undefined;
};

const getBodyApiError = (body: unknown): ApiError | undefined => {
  if (!isRecord(body)) return undefined;
  const err = body["error"];
  // ApiError is structural; validate minimally.
  if (!isRecord(err)) return undefined;
  const code = err["code"];
  const message = err["message"];
  if (typeof code !== "string" || typeof message !== "string") return undefined;
  return err as unknown as ApiError;
};

const handleResponse = async <T = unknown>(response: Response): Promise<T> => {
  // Parse JSON response
  const body: unknown = await response.json().catch(() => ({}));

  // Handle error responses
  if (!response.ok) {
    const { ApiResponseError } = await import("../entities/errors");
    throw new ApiResponseError(
      getBodyMessage(body) || `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      response.statusText,
      getBodyApiError(body),
    );
  }

  return body as T;
};

type ApiClientOptions = RequestInit & {
  cache?: boolean;
  cacheKey?: string;
  cacheTTL?: number;
};

// API client with common HTTP methods
const apiClient = {
  /**
   * Send a GET request with optional caching
   */
  async get<T = unknown>(
    endpoint: string,
    options: ApiClientOptions = {},
  ): Promise<T> {
    const {
      cache = false,
      cacheKey,
      cacheTTL = CacheTTL.STOCKS_LIST,
      ...fetchOptions
    } = options;

    // Check cache first if caching is enabled
    if (cache && cacheKey) {
      const cachedData = apiCache.get<T>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    const response = await fetch(buildUrl(endpoint), {
      ...buildRequestOptions(fetchOptions),
      method: "GET",
      headers: {
        ...(buildRequestOptions(fetchOptions).headers ?? {}),
        ...(getAuthToken()
          ? { Authorization: `Bearer ${getAuthToken()}` }
          : {}),
      },
    });

    const data = await handleResponse<T>(response);

    // Store in cache if caching is enabled
    if (cache && cacheKey) {
      apiCache.set(cacheKey, data, cacheTTL);
    }

    return data;
  },

  /**
   * Send a POST request with JSON body
   */
  async post<TResponse = unknown, TBody = unknown>(
    endpoint: string,
    data: TBody,
    options: RequestInit = {},
  ): Promise<TResponse> {
    const response = await fetch(buildUrl(endpoint), {
      ...buildRequestOptions(options),
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        ...buildRequestOptions(options).headers,
        ...(getAuthToken()
          ? { Authorization: `Bearer ${getAuthToken()}` }
          : {}),
      },
    });

    return handleResponse<TResponse>(response);
  },

  /**
   * Send a PUT request with JSON body
   */
  async put<TResponse = unknown, TBody = unknown>(
    endpoint: string,
    data: TBody,
    options: RequestInit = {},
  ): Promise<TResponse> {
    const response = await fetch(buildUrl(endpoint), {
      ...buildRequestOptions(options),
      method: "PUT",
      body: JSON.stringify(data),
      headers: {
        ...buildRequestOptions(options).headers,
        ...(getAuthToken()
          ? { Authorization: `Bearer ${getAuthToken()}` }
          : {}),
      },
    });

    return handleResponse<TResponse>(response);
  },

  /**
   * Send a DELETE request
   */
  async delete<TResponse = unknown>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<TResponse> {
    const response = await fetch(buildUrl(endpoint), {
      ...buildRequestOptions(options),
      method: "DELETE",
      headers: {
        ...(buildRequestOptions(options).headers ?? {}),
        ...(getAuthToken()
          ? { Authorization: `Bearer ${getAuthToken()}` }
          : {}),
      },
    });

    return handleResponse<TResponse>(response);
  },

  /**
   * Send a PATCH request with JSON body
   */
  async patch<TResponse = unknown, TBody = unknown>(
    endpoint: string,
    data: TBody,
    options: RequestInit = {},
  ): Promise<TResponse> {
    const response = await fetch(buildUrl(endpoint), {
      ...buildRequestOptions(options),
      method: "PATCH",
      body: JSON.stringify(data),
      headers: {
        ...buildRequestOptions(options).headers,
        ...(getAuthToken()
          ? { Authorization: `Bearer ${getAuthToken()}` }
          : {}),
      },
    });

    return handleResponse<TResponse>(response);
  },
};

export default apiClient;
