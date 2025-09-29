import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['ar', 'fr'],

  // Used when no locale matches
  defaultLocale: 'ar',

  // Redirect to localized path by default
  localeDetection: true,

  // Pathnames configuration for internationalized routing
  pathnames: {
    '/': '/',
    '/products': {
      ar: '/منتجات',
      fr: '/produits'
    },
    '/services': {
      ar: '/خدمات',
      fr: '/services'
    },
    '/contact': {
      ar: '/اتصل-بنا',
      fr: '/contact'
    },
    '/auth/login': {
      ar: '/تسجيل-الدخول',
      fr: '/connexion'
    },
    '/auth/register': {
      ar: '/إنشاء-حساب',
      fr: '/inscription'
    },
    '/dashboard': {
      ar: '/لوحة-التحكم',
      fr: '/tableau-de-bord'
    },
    '/checkout': {
      ar: '/الدفع',
      fr: '/commande'
    }
  }
})

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(ar|fr)/:path*']
}