import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import { AnalyticsProvider } from '../components/analytics/AnalyticsProvider'

// Modern Inter Variable font with optimized settings
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
})

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

// Type pour les paramètres
type Props = {
  children: React.ReactNode;
}

export default function RootLayout({ children }: Props) {
  return (
    <html lang="fr" suppressHydrationWarning className={`h-full ${inter.variable}`}>
      <body className={`${inter.className} h-full flex flex-col font-sans antialiased bg-neutral-50 text-neutral-900`}>
        <AnalyticsProvider>
          {children}
        </AnalyticsProvider>
        {/* Service Worker Registration - Client-side only */}
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
