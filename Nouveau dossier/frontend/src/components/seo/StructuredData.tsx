// Define schema types locally since schema-dts might not be available
type Organization = {
  '@type': 'Organization'
  '@id'?: string
  name: string
  url?: string
  logo?: string
  description?: string
  address?: {
    '@type': 'PostalAddress'
    addressCountry?: string
    addressLocality?: string
  }
  contactPoint?: {
    '@type': 'ContactPoint'
    telephone?: string
    contactType?: string
    availableLanguage?: string[]
  }
  sameAs?: string[]
}

type Product = {
  '@type': 'Product'
  name: string
  description: string
  image?: string[]
  brand?: {
    '@type': 'Brand'
    name: string
  }
  offers?: {
    '@type': 'Offer'
    price: string
    priceCurrency: string
    availability: string
    seller: {
      '@type': 'Organization'
      name: string
    }
  }
  aggregateRating?: {
    '@type': 'AggregateRating'
    ratingValue: number
    reviewCount: number
  }
}

type BreadcrumbList = {
  '@type': 'BreadcrumbList'
  itemListElement: Array<{
    '@type': 'ListItem'
    position: number
    name: string
    item: string
  }>
}

type WebSite = {
  '@type': 'WebSite'
  '@id'?: string
  url?: string
  name: string
  description?: string
  publisher?: {
    '@id': string
  }
  potentialAction?: {
    '@type': 'SearchAction'
    target: {
      '@type': 'EntryPoint'
      urlTemplate: string
    }
    'query-input': string
  }
}

interface StructuredDataProps {
  type: 'organization' | 'product' | 'breadcrumb' | 'website'
  data: any
}

export function StructuredData({ type, data }: StructuredDataProps) {
  let structuredData: Organization | Product | BreadcrumbList | WebSite

  switch (type) {
    case 'organization':
      structuredData = {
        '@type': 'Organization',
        '@id': `${process.env.NEXT_PUBLIC_BASE_URL}/#organization`,
        name: 'MJ CHAUFFAGE',
        url: process.env.NEXT_PUBLIC_BASE_URL,
        logo: `${process.env.NEXT_PUBLIC_BASE_URL}/logo.png`,
        description: 'Professional heating solutions and services in Algeria',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'DZ',
          addressLocality: data.city || 'Algeria',
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: data.phone || '+213-XXX-XXX-XXX',
          contactType: 'customer service',
          availableLanguage: ['French', 'Arabic', 'English'],
        },
        sameAs: data.socialMedia || [],
      }
      break

    case 'product':
      structuredData = {
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
          availability: data.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
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
      break

    case 'breadcrumb':
      structuredData = {
        '@type': 'BreadcrumbList',
        itemListElement: data.items.map((item: any, index: number) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      }
      break

    case 'website':
      structuredData = {
        '@type': 'WebSite',
        '@id': `${process.env.NEXT_PUBLIC_BASE_URL}/#website`,
        url: process.env.NEXT_PUBLIC_BASE_URL,
        name: 'MJ CHAUFFAGE',
        description: 'Professional heating solutions and services',
        publisher: {
          '@id': `${process.env.NEXT_PUBLIC_BASE_URL}/#organization`,
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${process.env.NEXT_PUBLIC_BASE_URL}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      }
      break

    default:
      return null
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          ...structuredData,
        }),
      }}
    />
  )
}

// Specific structured data components
export function OrganizationStructuredData(props: { 
  phone?: string
  city?: string
  socialMedia?: string[]
}) {
  return <StructuredData type="organization" data={props} />
}

export function ProductStructuredData(props: {
  name: string
  description: string
  price: string
  images?: string[]
  inStock: boolean
  rating?: { value: number; count: number }
}) {
  return <StructuredData type="product" data={props} />
}

export function BreadcrumbStructuredData(props: {
  items: Array<{ name: string; url: string }>
}) {
  return <StructuredData type="breadcrumb" data={props} />
}

export function WebsiteStructuredData() {
  return <StructuredData type="website" data={{}} />
}