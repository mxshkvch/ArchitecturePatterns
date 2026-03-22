// src/types/dto/common.dto.ts
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message: string;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
  status: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}