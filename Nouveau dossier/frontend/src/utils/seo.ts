import { Metadata } from 'next'

interface SEOConfig {
  title: string
  description: string
  keywords?: string[]
  path: string
  locale?: string
  ogImage?: string
  ogType?: 'website' | 'article' | 'product'
  noindex?: boolean
  nofollow?: boolean
  alternateLanguages?: { [key: string]: string }
}

export function generateMetadata(config: SEOConfig): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mjchauffage.com'
  const locale = config.locale || 'fr'
  const fullTitle = config.title.includes('MJ CHAUFFAGE') 
    ? config.title 
    : `${config.title} | MJ CHAUFFAGE`
  
  const canonical = `${baseUrl}/${locale}${config.path}`
  
  const alternateLanguages = config.alternateLanguages || {
    'fr': `${baseUrl}/fr${config.path}`,
    'ar': `${baseUrl}/ar${config.path}`,
    'en': `${baseUrl}/en${config.path}`,
    'x-default': `${baseUrl}/fr${config.path}`,
  }

  const ogImage = config.ogImage || `${baseUrl}/og-image.jpg`

  return {
    title: fullTitle,
    description: config.description,
    keywords: config.keywords?.join(', '),
    
    robots: {
      index: !config.noindex,
      follow: !config.nofollow,
      googleBot: {
        index: !config.noindex,
        follow: !config.nofollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    
    alternates: {
      canonical,
      languages: alternateLanguages,
    },
    
    openGraph: {
      type: config.ogType === 'product' ? 'website' : (config.ogType || 'website'),
      title: fullTitle,
      description: config.description,
      url: canonical,
      siteName: 'MJ CHAUFFAGE',
      locale: locale === 'ar' ? 'ar_DZ' : locale === 'en' ? 'en_US' : 'fr_FR',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: config.title,
        },
      ],
    },
    
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: config.description,
      images: [ogImage],
    },
    
    authors: [{ name: 'MJ CHAUFFAGE' }],
    creator: 'MJ CHAUFFAGE',
    publisher: 'MJ CHAUFFAGE',
    
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION,
      yahoo: process.env.YAHOO_VERIFICATION,
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
    },
  }
}

// Predefined SEO configurations for common pages
export const seoConfigs = {
  home: (locale: string) => ({
    title: 'Professional Heating Solutions Algeria',
    description: 'Professional heating equipment, installation and maintenance services for homes and businesses in Algeria. Quality boilers, expert installation, reliable maintenance.',
    keywords: ['heating', 'boilers', 'installation', 'maintenance', 'chauffage', 'Algeria'],
    path: '',
    locale,
  }),
  
  products: (locale: string) => ({
    title: 'Heating Products & Equipment',
    description: 'Browse our comprehensive range of heating products including boilers, radiators, thermostats, and accessories. Professional quality equipment for all heating needs.',
    keywords: ['heating products', 'boilers', 'radiators', 'thermostats', 'heating equipment'],
    path: '/products',
    locale,
  }),
  
  services: (locale: string) => ({
    title: 'Heating Services & Installation',
    description: 'Professional heating services including installation, maintenance, and repair. Expert technicians providing reliable heating solutions for homes and businesses.',
    keywords: ['heating services', 'installation', 'maintenance', 'repair', 'professional'],
    path: '/services',
    locale,
  }),
  
  about: (locale: string) => ({
    title: 'About MJ CHAUFFAGE',
    description: 'Learn about MJ CHAUFFAGE, Algeria\'s trusted heating solutions provider. Our commitment to quality, professional service, and customer satisfaction.',
    keywords: ['about', 'company', 'heating experts', 'professional team', 'Algeria'],
    path: '/about',
    locale,
  }),
  
  contact: (locale: string) => ({
    title: 'Contact Us',
    description: 'Get in touch with MJ CHAUFFAGE for professional heating solutions. Contact our expert team for consultations, quotes, and support.',
    keywords: ['contact', 'consultation', 'quote', 'support', 'heating experts'],
    path: '/contact',
    locale,
  }),
}

// Generate structured data for different content types
export function generateStructuredData(type: string, data: any) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mjchauffage.com'
  
  switch (type) {
    case 'organization':
      return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': `${baseUrl}/#organization`,
        name: 'MJ CHAUFFAGE',
        url: baseUrl,
        logo: `${baseUrl}/logo.png`,
        description: 'Professional heating solutions and services in Algeria',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'DZ',
          addressLocality: 'Algeria',
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+213-XXX-XXX-XXX',
          contactType: 'customer service',
          availableLanguage: ['French', 'Arabic', 'English'],
        },
        sameAs: [
          // Add social media URLs here
        ],
      }
      
    case 'website':
      return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${baseUrl}/#website`,
        url: baseUrl,
        name: 'MJ CHAUFFAGE',
        description: 'Professional heating solutions and services',
        publisher: {
          '@id': `${baseUrl}/#organization`,
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${baseUrl}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      }
      
    case 'product':
      return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: data.name,
        description: data.description,
        image: data.images || [],
        brand: {
          '@type': 'Brand',
          name: 'MJ CHAUFFAGE',
        },
        offers: {
          '@type': 'Offer',
          price: data.price,
          priceCurrency: 'DZD',
          availability: data.inStock 
            ? 'https://schema.org/InStock' 
            : 'https://schema.org/OutOfStock',
          seller: {
            '@type': 'Organization',
            name: 'MJ CHAUFFAGE',
          },
        },
        aggregateRating: data.rating ? {
          '@type': 'AggregateRating',
          ratingValue: data.rating.value,
          reviewCount: data.rating.count,
        } : undefined,
      }
      
    case 'breadcrumb':
      return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: data.items.map((item: any, index: number) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      }
      
    default:
      return null
  }
}

// SEO validation utilities
export function validateSEO(config: SEOConfig) {
  const errors: string[] = []
  
  if (!config.title || config.title.length < 10) {
    errors.push('Title should be at least 10 characters long')
  }
  
  if (config.title && config.title.length > 60) {
    errors.push('Title should be less than 60 characters for optimal display')
  }
  
  if (!config.description || config.description.length < 120) {
    errors.push('Description should be at least 120 characters long')
  }
  
  if (config.description && config.description.length > 160) {
    errors.push('Description should be less than 160 characters for optimal display')
  }
  
  if (!config.keywords || config.keywords.length === 0) {
    errors.push('Keywords should be provided for better SEO')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}