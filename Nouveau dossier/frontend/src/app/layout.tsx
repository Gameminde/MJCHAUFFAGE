import type { Metadata } from 'next'
// Removed next/font for build reliability - using system fonts
import '../styles/globals.css'
import { AnalyticsProvider } from '../components/analytics/AnalyticsProvider'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'

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

  return (
    <html lang="fr" className="h-full">
      <body className="h-full flex flex-col font-sans antialiased bg-neutral-50 text-neutral-900">
        <NextIntlClientProvider locale="fr" messages={messages}>
          <AnalyticsProvider>
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
