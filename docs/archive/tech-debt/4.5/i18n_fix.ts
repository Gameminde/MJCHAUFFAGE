// ========================================
// 1. MIDDLEWARE - Configuration stricte
// ========================================
// frontend/middleware.ts

import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['fr', 'ar'],
  defaultLocale: 'fr',
  localePrefix: 'always', // ✅ Forcer le préfixe
  localeDetection: true
});

export const config = {
  // ✅ Matcher précis - exclure API et fichiers statiques
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
    '/',
    '/(fr|ar)/:path*'
  ]
};

// ========================================
// 2. LAYOUT ROOT - Redirection propre
// ========================================
// frontend/src/app/layout.tsx

import { redirect } from 'next/navigation';

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  // ✅ Rediriger vers /fr par défaut
  redirect('/fr');
}

// ========================================
// 3. PAGE ROOT - Alternative
// ========================================
// frontend/src/app/page.tsx

import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/fr');
}

// ========================================
// 4. I18N REQUEST CONFIG - Robuste
// ========================================
// frontend/i18n/request.ts

import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['fr', 'ar'] as const;
export type Locale = typeof locales[number];

export default getRequestConfig(async ({ locale }) => {
  // ✅ Validation stricte
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  try {
    const messages = (await import(`../messages/${locale}.json`)).default;
    
    return {
      messages,
      timeZone: 'Africa/Algiers',
      now: new Date()
    };
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error);
    notFound();
  }
});

// ========================================
// 5. NEXT CONFIG - API Proxy
// ========================================
// frontend/next.config.js

const withNextIntl = require('next-intl/plugin')('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`
      }
    ];
  },
  
  // ✅ Optimisation i18n
  i18n: undefined, // Désactivé car next-intl gère

  // ✅ Headers de sécurité
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          }
        ]
      }
    ];
  }
};

module.exports = withNextIntl(nextConfig);

// ========================================
// 6. SCRIPT DE DIAGNOSTIC
// ========================================
// scripts/check-i18n.sh

#!/bin/bash

echo "🔍 Diagnostic i18n..."

# Vérifier les fichiers messages
echo "📁 Fichiers de traduction:"
ls -lh frontend/messages/

# Vérifier la config
echo "⚙️ Configuration:"
grep -A 5 "locales" frontend/i18n/request.ts

# Tester les routes
echo "🌐 Test des routes:"
curl -I http://localhost:3000/ 
curl -I http://localhost:3000/fr
curl -I http://localhost:3000/ar

echo "✅ Diagnostic terminé"
