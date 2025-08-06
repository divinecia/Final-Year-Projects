/**
 * Standard API response interface.
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

/**
 * Pagination metadata.
 */
export interface Pagination {
  total: number
  page: number
  limit: number
  hasMore: boolean
}

/**
 * Paginated API response.
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: Pagination
}

/**
 * Custom API error class.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
    Object.setPrototypeOf(this, ApiError.prototype)
  }
}

interface CacheEntry<T> {
  data: T
  timestamp: number
}

const apiResponseCache = new Map<string, CacheEntry<unknown>>()

/**
 * Handles API responses with optional caching.
 */
export async function handleApiResponse<T>(
  fn: () => Promise<T>,
  cacheKey?: string,
  cacheTTL = 60_000 // 1 minute cache by default
): Promise<ApiResponse<T>> {
  try {
    if (cacheKey) {
      const cached = apiResponseCache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < cacheTTL) {
        return {
          success: true,
          data: cached.data as T,
          message: 'Operation completed successfully (from cache)'
        }
      }
      apiResponseCache.delete(cacheKey)
    }

    const result = await fn()

    if (cacheKey) {
      apiResponseCache.set(cacheKey, { data: result, timestamp: Date.now() })
    }

    return {
      success: true,
      data: result,
      message: 'Operation completed successfully'
    }
  } catch (error: unknown) {
    console.error('API Error:', error)
    if (error instanceof ApiError) {
      return {
        success: false,
        error: error.message,
        message: error.message
      }
    }
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    return {
      success: false,
      error: errorMessage,
      message: 'Something went wrong. Please try again.'
    }
  }
}

/**
 * Creates a successful API response.
 */
export function createApiResponse<T>(
  data: T,
  message = 'Success'
): ApiResponse<T> {
  return {
    success: true,
    data,
    message
  }
}

/**
 * Creates a failed API response.
 */
export function createApiError(
  message: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _statusCode?: number
): ApiResponse<never> {
  return {
    success: false,
    error: message,
    message
  }
}

/**
 * Retry utility for failed requests.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: unknown

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
      }
    }
  }

  throw lastError
}

/**
 * Request timeout utility.
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs = 10_000
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    )
  ])
}
