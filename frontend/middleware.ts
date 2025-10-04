import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['ar', 'fr', 'en'],

  // Used when no locale matches
  defaultLocale: 'fr',

  // Redirect to localized path by default
  localeDetection: true,

  // Always show the locale prefix
  localePrefix: 'always'
})

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(ar|fr|en)/:path*']
}