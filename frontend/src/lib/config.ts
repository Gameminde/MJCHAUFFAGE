// frontend/src/lib/config.ts
// v3.0 - Supabase Migration
// ✅ Centralized configuration for environment variables

export const config = {
  app: {
    // Application URLs
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    environment: process.env.NODE_ENV || 'development',
  },

  features: {
    // Feature flags
    enablePayments: process.env.NEXT_PUBLIC_ENABLE_PAYMENTS !== 'false',
    enableGuestCheckout: process.env.NEXT_PUBLIC_ENABLE_GUEST_CHECKOUT !== 'false',
  },


} as const;

export default config;
