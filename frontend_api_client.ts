// Client API centralisé (portable) — basé sur fetch()
// S'aligne avec `frontend/src/lib/api.ts` pour usage dans Next.js

import React from 'react'
import { getSession } from 'next-auth/react'

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface RequestOptions extends RequestInit {
  timeout?: number
  skipAuth?: boolean
  isFormData?: boolean
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

const API_CONFIG = {
  baseURL: (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') + '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
} as const

const withTimeout = (
  promise: Promise<Response>,
  timeout: number
): Promise<Response> => {
  return Promise.race([
    promise,
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    ),
  ])
}

const addAuthHeader = async (
  headers: HeadersInit,
  skipAuth: boolean
): Promise<HeadersInit> => {
  if (skipAuth) return headers

  if (typeof window !== 'undefined') {
    const session = await getSession()
    if (session?.user?.token) {
      return {
        ...headers,
        Authorization: `Bearer ${session.user.token}`,
      }
    }
  }

  return headers
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`
    let errorData: unknown

    try {
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        errorData = await response.json()
        errorMessage =
          (errorData as ApiResponse).message ||
          (errorData as ApiResponse).error ||
          errorMessage
      }
    } catch {}

    throw new ApiError(errorMessage, response.status, errorData)
  }

  try {
    const data = await response.json()
    return data as T
  } catch {
    return { success: true } as T
  }
}

const request = async <T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> => {
  const {
    timeout = API_CONFIG.timeout,
    skipAuth = false,
    isFormData = false,
    headers = {},
    ...fetchOptions
  } = options

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_CONFIG.baseURL}${endpoint}`

  let requestHeaders: HeadersInit = isFormData
    ? { ...headers }
    : { ...API_CONFIG.headers, ...headers }

  requestHeaders = await addAuthHeader(requestHeaders, skipAuth)

  const response = await withTimeout(
    fetch(url, {
      ...fetchOptions,
      headers: requestHeaders,
    }),
    timeout
  )

  return handleResponse<T>(response)
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
      isFormData: data instanceof FormData,
    }),
  put: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data),
      isFormData: data instanceof FormData,
    }),
  patch: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
  upload: <T>(endpoint: string, formData: FormData, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: formData,
      isFormData: true,
    }),
}

export const useApiRequest = <T>() => {
  const [data, setData] = React.useState<T | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const execute = async (requestFn: () => Promise<T>): Promise<T | null> => {
    setLoading(true)
    setError(null)

    try {
      const result = await requestFn()
      setData(result)
      return result
    } catch (err) {
      const errorMessage =
        err instanceof ApiError ? err.message : 'Une erreur inattendue est survenue'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { data, loading, error, execute }
}
