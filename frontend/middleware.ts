import { NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'

/**
 * Layered Middleware with Clear Precedence
 * 
 * LAYER 1: Admin Routes (no i18n)
 * LAYER 2: API Routes (pass through)
 * LAYER 3: Static Files (pass through)
 * LAYER 4: Public Routes (with i18n)
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // ============ LAYER 1: ADMIN ROUTES ============
  // Admin routes are handled FIRST and NEVER get i18n processing
  if (pathname.startsWith('/admin')) {
    // Redirect /fr/admin or /ar/admin to /admin
    if (pathname.match(/^\/(fr|ar)\/admin/)) {
      const cleanPath = pathname.replace(/^\/(fr|ar)/, '')
      return NextResponse.redirect(new URL(cleanPath, request.url))
    }
    
    // Allow /admin/login without authentication
    if (pathname === '/admin/login') {
      return NextResponse.next()
    }
    
    // Check admin authentication for protected admin routes
    const token = request.cookies.get('authToken')?.value
    if (!token && !pathname.startsWith('/admin/login')) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    
    return NextResponse.next()
  }
  
  // ============ LAYER 2: API ROUTES ============
  // API routes pass through without processing
  if (pathname.startsWith('/api')) {
    return NextResponse.next()
  }
  
  // ============ LAYER 3: STATIC FILES ============
  // Static files pass through without processing
  if (pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|css|js|woff|woff2|ttf|eot)$/)) {
    return NextResponse.next()
  }
  
  // ============ LAYER 4: I18N FOR PUBLIC ROUTES ============
  // All remaining routes get i18n processing
  const i18nMiddleware = createMiddleware({
    locales: ['fr', 'ar'],
    defaultLocale: 'fr',
    localePrefix: 'as-needed'
  })
  
  return i18nMiddleware(request)
}

export const config = {
  // Match all routes except Next.js internals and files with extensions
  matcher: ['/((?!_next|.*\\.).*)']
}
