import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminAuthMiddleware } from './src/middleware/adminAuth'

const intlMiddleware = createMiddleware({
  locales: ['fr', 'ar'],
  defaultLocale: 'fr',
  localePrefix: 'as-needed',
});

export default function middleware(request: NextRequest) {
  // Apply admin authentication middleware first
  const adminAuthResponse = adminAuthMiddleware(request)
  if (adminAuthResponse) {
    return adminAuthResponse
  }

  // Then apply i18n middleware
  return intlMiddleware(request)
}

export const config = {
  matcher: ['/((?!api|_next|.*\..*).*)'],
};
