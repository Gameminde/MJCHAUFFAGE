// 🎯 Client HTTP centralisé pour le Frontend Public (Next.js)
// Inspiré du client Axios de l'admin mais adapté pour fetch() natif

import React from 'react'
// Note: Not using next-auth, using custom auth with localStorage

/**
 * Configuration du client API
 */
const API_CONFIG = {
  baseURL: (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') + '/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
} as const

/**
 * Structure de réponse API standardisée
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

/**
 * Options de requête personnalisées
 */
export interface RequestOptions extends RequestInit {
  timeout?: number
  skipAuth?: boolean // Pour les routes publiques
  isFormData?: boolean // Pour upload de fichiers
}

/**
 * Erreur API personnalisée
 */
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
/**
 * Gestion du timeout pour les requêtes
 */
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

/**
 * Intercepteur de requête : Ajoute l'auth token automatiquement
 */
const addAuthHeader = async (
  headers: HeadersInit,
  skipAuth: boolean
): Promise<HeadersInit> => {
  if (skipAuth) return headers

  // Custom auth from localStorage
  if (typeof window !== 'undefined') {
    try {
      const token = localStorage.getItem('authToken')
      
      if (token) {
        return {
          ...headers,
          Authorization: `Bearer ${token}`,
        }
      }
    } catch {
      // Ignore auth resolution errors
    }
  }

  // SSR : Token depuis cookies (géré par middleware Next.js)
  return headers
}

/**
 * Intercepteur de réponse : Parse et gère les erreurs
 */
const handleResponse = async <T>(response: Response): Promise<T> => {
  // Gestion des erreurs HTTP
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
    } catch {
      // Ignore parsing errors
    }

    // Unified 401 handling: clear token and redirect to login
    if (response.status === 401 && typeof window !== 'undefined') {
      try {
        localStorage.removeItem('authToken')
      } catch {}
      const path = window.location.pathname
      const isAdmin = path.startsWith('/admin')
      const localeMatch = path.match(/^\/(fr|en|ar)(\/|$)/)
      const locale = localeMatch?.[1] || 'fr'
      const redirectTo = isAdmin ? '/admin/login' : `/${locale}/auth/login`
      window.location.href = redirectTo
    }

    throw new ApiError(errorMessage, response.status, errorData)
  }

  // Parse la réponse JSON
  try {
    const data = await response.json()
    return data as T
  } catch {
    // Si pas de JSON, retourne un objet success
    return { success: true } as T
  }
}
/**
 * Requête HTTP générique
 */
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

  // Construction de l'URL complète
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_CONFIG.baseURL}${endpoint}`

  // Headers par défaut
  let requestHeaders: HeadersInit = isFormData
    ? { ...headers } // FormData gère son propre Content-Type
    : { ...API_CONFIG.headers, ...headers }

  // Ajout du token d'authentification
  requestHeaders = await addAuthHeader(requestHeaders, skipAuth)

  // Exécution de la requête avec timeout
  try {
    const response = await withTimeout(
      fetch(url, {
        ...fetchOptions,
        headers: requestHeaders,
      }),
      timeout
    )

    return handleResponse<T>(response)
  } catch (error) {
    // Gestion des erreurs réseau/timeout
    if (error instanceof ApiError) {
      throw error
    }

    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0
    )
  }
}

/**
 * Client API avec méthodes HTTP
 */
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

export default api
