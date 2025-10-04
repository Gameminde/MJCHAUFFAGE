import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import '@/styles/globals.css'
import '@/styles/accessibility.css'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers'
import { Header } from '@/components/common/Header'
import { Footer } from '@/components/common/Footer'
import { FloatingComparisonBar } from '@/components/comparison/FloatingComparisonBar'
import { AccessibilityProvider } from '@/components/accessibility/AccessibilityProvider'
import { AccessibilityToolbar } from '@/components/accessibility/AccessibilityToolbar'
import { OrganizationStructuredData, WebsiteStructuredData } from '@/components/seo/StructuredData'

const inter = Inter({ subsets: ['latin'] })

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

async function getMessages(locale: string) {
  try {
    return (await import(`../../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }
}

export function generateStaticParams() {
  return [{ locale: 'fr' }, { locale: 'ar' }, { locale: 'en' }];
}

export const metadata = {
  title: {
    default: 'MJ CHAUFFAGE - Professional Heating Solutions Algeria',
    template: '%s | MJ CHAUFFAGE',
  },
  description: 'Professional heating equipment, installation services, and maintenance solutions for homes and businesses in Algeria. Quality boilers, expert installation, reliable maintenance with 24/7 support.',
  keywords: [
    'heating Algeria',
    'boilers Algeria',
    'installation chauffage',
    'maintenance heating',
    'chauffage professionnel',
    'plumbing Algeria',
    'heating systems',
    'professional services',
    'تدفئة الجزائر',
    'غلايات',
    'تركيب تدفئة',
    'صيانة تدفئة',
    'خدمات تدفئة',
    'أنظمة التدفئة'
  ],
  authors: [{ name: 'MJ CHAUFFAGE' }],
  creator: 'MJ CHAUFFAGE',
  publisher: 'MJ CHAUFFAGE',
  category: 'Business',
  classification: 'Heating Services',
  
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'https://mjchauffage.com',
    title: 'MJ CHAUFFAGE - Professional Heating Solutions Algeria',
    description: 'Professional heating equipment, installation services, and maintenance solutions for homes and businesses in Algeria.',
    siteName: 'MJ CHAUFFAGE',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'MJ CHAUFFAGE - Professional Heating Solutions',
      },
    ],
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'MJ CHAUFFAGE - Professional Heating Solutions Algeria',
    description: 'Professional heating equipment, installation services, and maintenance solutions.',
    images: ['/og-image.jpg'],
  },
  
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    yahoo: process.env.YAHOO_VERIFICATION,
  },
  
  alternates: {
    canonical: process.env.NEXT_PUBLIC_BASE_URL || 'https://mjchauffage.com',
    languages: {
      'fr': '/fr',
      'ar': '/ar',
      'en': '/en',
      'x-default': '/fr',
    },
  },
  
  manifest: '/manifest.json',
  
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/apple-touch-icon.png',
      },
    ],
  },
  
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MJ CHAUFFAGE',
  },
  
  other: {
    'msapplication-TileColor': '#0ea5e9',
    'msapplication-config': '/browserconfig.xml',
  },
}

export default async function RootLayout({
  children,
  params: { locale },
}: Props) {
  const messages = await getMessages(locale);
  
  // Enable static rendering
  const { setRequestLocale } = await import('next-intl/server');
  setRequestLocale(locale);
  
  // Set document direction based on locale
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <div dir={dir} className="h-full flex flex-col" lang={locale}>
      {/* Skip Links */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <a href="#navigation" className="skip-link">
        Skip to navigation
      </a>
      
      {/* Structured Data */}
      <OrganizationStructuredData />
      <WebsiteStructuredData />
      
      <NextIntlClientProvider locale={locale} messages={messages}>
        <AccessibilityProvider>
          <Providers locale={locale}>
            <Header locale={locale} />
            <main id="main-content" className="flex-1" role="main">
              {children}
            </main>
            <Footer />
            <FloatingComparisonBar locale={locale} />
            <AccessibilityToolbar />
          </Providers>
        </AccessibilityProvider>
      </NextIntlClientProvider>
    </div>
  )
}