import type { Metadata } from 'next'
import { Suspense } from 'react'
import { headers } from 'next/headers'
// Removed next/font for build reliability - using system fonts
import '../styles/globals.css'
import { AnalyticsListener } from '../components/analytics/AnalyticsListener'
import { AnalyticsProvider } from '../components/analytics/AnalyticsProvider'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getLocale } from 'next-intl/server'
import { BrowserExtensionCleaner } from '../components/common/BrowserExtensionCleaner'

export const metadata: Metadata = {
  title: 'MJ CHAUFFAGE - Professional Heating Solutions',
  description: 'Professional heating solutions for Algeria. Modern, efficient, and reliable heating systems for residential and commercial properties.',
  keywords: 'heating, chauffage, Algeria, professional, residential, commercial',
  authors: [{ name: 'MJ CHAUFFAGE' }],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MJ CHAUFFAGE',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
  },
}

// Export viewport separately as required by Next.js 14+
export { viewport } from './viewport'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const messages = await getMessages();
  const locale = await getLocale();
  
  // Determine text direction based on locale
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} className="h-full">
      <body className="h-full flex flex-col font-sans antialiased bg-neutral-50 text-neutral-900" suppressHydrationWarning={true}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <BrowserExtensionCleaner />
          <AnalyticsProvider>
            <Suspense fallback={null}>
              <AnalyticsListener />
            </Suspense>
            {children}
          </AnalyticsProvider>
        </NextIntlClientProvider>
        {/* Service Worker Registration - Fixed for client-side */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (
                typeof window !== 'undefined' &&
                window.location.hostname !== 'localhost' &&
                'serviceWorker' in navigator
              ) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
