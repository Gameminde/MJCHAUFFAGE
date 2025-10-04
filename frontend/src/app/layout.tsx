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
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0ea5e9',
  colorScheme: 'light dark',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`h-full ${inter.variable}`}>
      <head>
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="https://rsms.me/inter/font-files/InterVariable.woff2?v=4.0"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* Modern viewport meta */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#0ea5e9" />
        <meta name="msapplication-TileColor" content="#0ea5e9" />
        {/* Apple touch icon */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={`${inter.className} h-full flex flex-col font-sans antialiased bg-neutral-50 text-neutral-900`}>
        <AnalyticsProvider>
          {children}
        </AnalyticsProvider>
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
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
