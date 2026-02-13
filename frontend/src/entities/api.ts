export class ApiResponse<T = unknown> {
  success!: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export class ApiError {
  code!: string;
  message!: string;
  details?: Record<string, unknown>;
}

export class ApiMeta {
  page?: number;
  pageSize?: number;
  totalItems?: number;
  totalPages?: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface StockFilters {
  sector?: string;
  priceMin?: number;
  priceMax?: number;
  marketCapMin?: number;
  marketCapMax?: number;
  sortBy?: "name" | "price" | "change" | "volume" | "marketCap";
  sortDirection?: "asc" | "desc";
}

export interface TimeSimulationParams {
  days: number;
  speed: "normal" | "fast" | "ultra";
}
