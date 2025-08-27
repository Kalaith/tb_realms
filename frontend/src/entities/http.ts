/**
 * Types for HTTP requests and options
 */

export interface RequestHeaders {
  [key: string]: string;
}

/**
 * HTTP request options
 */
export interface RequestOptions {
  method?: string;
  headers?: RequestHeaders;
  body?: string | FormData;
  credentials?: RequestCredentials;
  mode?: RequestMode;
  cache?: RequestCache;
  redirect?: RequestRedirect;
  referrer?: string;
  referrerPolicy?: ReferrerPolicy;
  integrity?: string;
  keepalive?: boolean;
  signal?: AbortSignal;
}
