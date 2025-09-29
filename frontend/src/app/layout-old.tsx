import '@/styles/globals.css'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers/index'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: {
    default: 'MJ CHAUFFAGE - Heating Solutions & Services',
    template: '%s | MJ CHAUFFAGE',
  },
  description: 'Professional heating equipment, installation services, and maintenance solutions for homes and businesses. Quality boilers, expert installation, and reliable maintenance.',
  keywords: [
    'heating',
    'boilers', 
    'installation',
    'maintenance',
    'chauffage',
    'plumbing',
    'heating systems',
    'professional services'
  ],
  authors: [{ name: 'MJ CHAUFFAGE' }],
  creator: 'MJ CHAUFFAGE',
  publisher: 'MJ CHAUFFAGE',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://mjchauffage.com',
    title: 'MJ CHAUFFAGE - Heating Solutions & Services',
    description: 'Professional heating equipment, installation services, and maintenance solutions.',
    siteName: 'MJ CHAUFFAGE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MJ CHAUFFAGE - Heating Solutions & Services', 
    description: 'Professional heating equipment, installation services, and maintenance solutions.',
    creator: '@mjchauffage',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="h-full">
      <body className={`${inter.className} h-full flex flex-col`}>
        <Providers>
          <main className="flex-1">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}