import Head from 'next/head'

interface SEOHeadProps {
  title: string
  description: string
  keywords?: string[]
  canonical?: string
  ogImage?: string
  ogType?: 'website' | 'article' | 'product'
  locale?: string
  alternateLanguages?: { [key: string]: string }
  noindex?: boolean
  nofollow?: boolean
  structuredData?: object
}

export function SEOHead({
  title,
  description,
  keywords = [],
  canonical,
  ogImage,
  ogType = 'website',
  locale = 'fr',
  alternateLanguages = {},
  noindex = false,
  nofollow = false,
  structuredData,
}: SEOHeadProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mjchauffage.com'
  const fullTitle = title.includes('MJ CHAUFFAGE') ? title : `${title} | MJ CHAUFFAGE`
  const robotsContent = `${noindex ? 'noindex' : 'index'},${nofollow ? 'nofollow' : 'follow'}`
  
  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      <meta name="robots" content={robotsContent} />
      
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Language Alternates */}
      {Object.entries(alternateLanguages).map(([lang, url]) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={url} />
      ))}
      
      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical || baseUrl} />
      <meta property="og:site_name" content="MJ CHAUFFAGE" />
      <meta property="og:locale" content={locale === 'ar' ? 'ar_DZ' : locale === 'en' ? 'en_US' : 'fr_FR'} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {ogImage && <meta property="og:image:alt" content={title} />}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      
      {/* Additional SEO Meta Tags */}
      <meta name="author" content="MJ CHAUFFAGE" />
      <meta name="publisher" content="MJ CHAUFFAGE" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      )}
    </Head>
  )
}

// Hook for generating SEO data
export function useSEO(pageData: {
  title: string
  description: string
  path: string
  locale?: string
  keywords?: string[]
  ogImage?: string
  ogType?: 'website' | 'article' | 'product'
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mjchauffage.com'
  const locale = pageData.locale || 'fr'
  
  const canonical = `${baseUrl}/${locale}${pageData.path}`
  
  const alternateLanguages = {
    'fr': `${baseUrl}/fr${pageData.path}`,
    'ar': `${baseUrl}/ar${pageData.path}`,
    'en': `${baseUrl}/en${pageData.path}`,
    'x-default': `${baseUrl}/fr${pageData.path}`,
  }
  
  return {
    ...pageData,
    canonical,
    alternateLanguages,
    locale,
  }
}