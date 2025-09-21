/**
 * API Client for making HTTP requests to the backend
 * Provides a wrapper around fetch API with common functionality
 * Includes response caching for improved performance
 */

import { apiCache, CacheKeys, CacheTTL } from '../utils/apiCache';

// Base API URL - required environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
  throw new Error('VITE_API_URL environment variable is required');
}

/**
 * Get the authentication token from localStorage
 * @returns The JWT token or null if not logged in
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem('token'); // Changed to match AuthContext key
};

// Helper to build request options with auth token
const buildRequestOptions = (options = {}) => {
  const token = getAuthToken();
  
  // Add Authorization header if token exists
  if (token) {
    return {
      ...options,
      headers: {
        ...defaultOptions.headers,
        'Authorization': `Bearer ${token}`,
        ...(options as any)?.headers,
      }
    };
  }
  
  return {
    ...defaultOptions,
    ...options,
  };
};

// Default request options
const defaultOptions = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Helper to build URLs
const buildUrl = (endpoint: string): string => {
  // Remove leading slash if present
  const normalizedEndpoint = endpoint.startsWith('/') 
    ? endpoint.substring(1) 
    : endpoint;
    
  return `${API_BASE_URL}/${normalizedEndpoint}`;
};

// Helper to handle response
const handleResponse = async (response: Response) => {
  // Parse JSON response
  const data = await response.json().catch(() => ({}));

  // Handle error responses
  if (!response.ok) {
    const { ApiResponseError } = await import('../entities/errors');
    throw new ApiResponseError(
      data.message || `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      response.statusText,
      data.error
    );
  }

  return data;
};

// API client with common HTTP methods
const apiClient = {
  /**
   * Send a GET request with optional caching
   */
  async get(endpoint: string, options: { cache?: boolean; cacheKey?: string; cacheTTL?: number } = {}) {
    const { cache = false, cacheKey, cacheTTL = CacheTTL.STOCKS_LIST } = options;

    // Check cache first if caching is enabled
    if (cache && cacheKey) {
      const cachedData = apiCache.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    const response = await fetch(buildUrl(endpoint), {
      ...buildRequestOptions(options),
      method: 'GET',
    });

    const data = await handleResponse(response);

    // Store in cache if caching is enabled
    if (cache && cacheKey) {
      apiCache.set(cacheKey, data, cacheTTL);
    }

    return data;
  },
  
  /**
   * Send a POST request with JSON body
   */
  async post(endpoint: string, data: any = {}, options = {}) {
    const response = await fetch(buildUrl(endpoint), {
      ...buildRequestOptions(options),
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    return handleResponse(response);
  },
  
  /**
   * Send a PUT request with JSON body
   */
  async put(endpoint: string, data: any = {}, options = {}) {
    const response = await fetch(buildUrl(endpoint), {
      ...buildRequestOptions(options),
      method: 'PUT',
      body: JSON.stringify(data),
    });
    
    return handleResponse(response);
  },
  
  /**
   * Send a DELETE request
   */
  async delete(endpoint: string, options = {}) {
    const response = await fetch(buildUrl(endpoint), {
      ...buildRequestOptions(options),
      method: 'DELETE',
    });
    
    return handleResponse(response);
  },
  
  /**
   * Send a PATCH request with JSON body
   */
  async patch(endpoint: string, data: any = {}, options = {}) {
    const response = await fetch(buildUrl(endpoint), {
      ...buildRequestOptions(options),
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    
    return handleResponse(response);
  },
};

export default apiClient;