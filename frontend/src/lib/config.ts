// frontend/src/lib/config.ts
// ✅ Centralized configuration for environment variables

/**
 * API Configuration
 * Single source of truth for all API URLs
 */
export const config = {
  api: {
    // Client-side API URL (exposed to browser)
    baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',

    // Server-side API URL (SSR, API routes)
    ssrBaseURL: process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  },

  app: {
    // Application URLs
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    environment: process.env.NODE_ENV || 'development',
  },

  features: {
    // Feature flags
    enablePayments: process.env.NEXT_PUBLIC_ENABLE_PAYMENTS !== 'false',
    enableGuestCheckout: process.env.NEXT_PUBLIC_ENABLE_GUEST_CHECKOUT !== 'false',
  }
} as const;

/**
 * Helper to get API URL based on context
 * @param isServer - Whether running on server (SSR) or client
 */
export function getApiUrl(isServer: boolean = typeof window === 'undefined'): string {
  return isServer ? config.api.ssrBaseURL : config.api.baseURL;
}

export default config;
