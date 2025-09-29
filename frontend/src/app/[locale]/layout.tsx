import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import '@/styles/globals.css'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers'
import { Header } from '@/components/common/Header'
import { Footer } from '@/components/common/Footer'
import { FloatingComparisonBar } from '@/components/comparison/FloatingComparisonBar'

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
    'professional services',
    'تدفئة',
    'غلايات',
    'تركيب',
    'صيانة'
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

export default async function RootLayout({
  children,
  params: { locale },
}: Props) {
  const messages = await getMessages(locale);
  
  // Set document direction based on locale
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <div dir={dir} className="h-full flex flex-col">
      <NextIntlClientProvider locale={locale} messages={messages}>
        <Providers locale={locale}>
          <Header locale={locale} />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <FloatingComparisonBar locale={locale} />
        </Providers>
      </NextIntlClientProvider>
    </div>
  )
}