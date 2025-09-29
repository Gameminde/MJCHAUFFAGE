import { NextRequest, NextResponse } from 'next/server'
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'

const locales = ['ar', 'fr', 'en']
const defaultLocale = 'en'

function getLocale(request: NextRequest) {
  // Get locale from URL pathname
  const pathname = request.nextUrl.pathname
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  if (pathnameIsMissingLocale) {
    // Try to get locale from Accept-Language header
    const headers = { 'accept-language': request.headers.get('accept-language') || '' }
    const languages = new Negotiator({ headers }).languages()
    
    try {
      return match(languages, locales, defaultLocale)
    } catch {
      return defaultLocale
    }
  }

  // Extract locale from pathname
  return pathname.split('/')[1] || defaultLocale
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request)
    return NextResponse.redirect(
      new URL(`/${locale}${pathname}`, request.url)
    )
  }

  // Add locale to response headers for client-side usage
  const response = NextResponse.next()
  const locale = pathname.split('/')[1]
  response.headers.set('x-locale', locale)
  
  return response
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next|api|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}