import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mjchauffage.com'
  const locales = ['fr', 'ar', 'en']
  
  // Static pages for each locale
  const staticPages = [
    '',
    '/products',
    '/services',
    '/about',
    '/contact',
    '/admin/login',
  ]
  
  // Generate sitemap entries for all locales
  const sitemapEntries: MetadataRoute.Sitemap = []
  
  locales.forEach(locale => {
    staticPages.forEach(page => {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'daily' : 'weekly',
        priority: page === '' ? 1 : 0.8,
        alternates: {
          languages: {
            fr: `${baseUrl}/fr${page}`,
            ar: `${baseUrl}/ar${page}`,
            en: `${baseUrl}/en${page}`,
          }
        }
      })
    })
  })
  
  // Add product pages (these would be dynamically generated in a real app)
  const productCategories = [
    'boilers',
    'radiators',
    'thermostats',
    'accessories'
  ]
  
  locales.forEach(locale => {
    productCategories.forEach(category => {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}/products/${category}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
        alternates: {
          languages: {
            fr: `${baseUrl}/fr/products/${category}`,
            ar: `${baseUrl}/ar/products/${category}`,
            en: `${baseUrl}/en/products/${category}`,
          }
        }
      })
    })
  })
  
  return sitemapEntries
}