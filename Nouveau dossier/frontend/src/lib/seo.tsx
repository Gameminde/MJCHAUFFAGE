// frontend/src/lib/seo.ts
// 🔍 Service SEO refactorisé avec client API centralisé

import { api } from '@/lib/api';
import type { Metadata } from 'next';

/**
 * Types pour les données SEO
 */
export interface SeoData {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: 'website' | 'article';
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

export interface ProductSeoData extends SeoData {
  productId: string;
  price?: number;
  availability?: 'in_stock' | 'out_of_stock' | 'preorder';
  brand?: string;
  category?: string;
}

export interface BlogPostSeoData extends SeoData {
  postId: string;
  author?: string;
  publishedDate?: string;
  modifiedDate?: string;
  tags?: string[];
}

export interface PageSeoConfig {
  path: string;
  title: string;
  description: string;
  priority?: number;
  changeFreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
}

/**
 * Service de gestion du SEO
 * Récupère les métadonnées depuis l'API et génère les balises appropriées
 */
export const seoService = {
  /**
   * Récupère les données SEO pour une page
   */
  async getPageSeo(path: string): Promise<SeoData> {
    const result = await api.get<{ success: boolean; data: SeoData }>(
      `/seo/page?path=${encodeURIComponent(path)}`
    );
    return result.data as SeoData;
  },

  /**
   * Récupère les métadonnées SEO pour un produit
   */
  async getProductSeo(productId: string): Promise<ProductSeoData> {
    const result = await api.get<{ success: boolean; data: ProductSeoData }>(
      `/seo/products/${productId}`
    );
    return result.data as ProductSeoData;
  },

  /**
   * Récupère les métadonnées SEO pour un article de blog
   */
  async getBlogPostSeo(postId: string): Promise<BlogPostSeoData> {
    const result = await api.get<{ success: boolean; data: BlogPostSeoData }>(
      `/seo/blog/${postId}`
    );
    return result.data as BlogPostSeoData;
  },

  /**
   * Génère le sitemap.xml
   */
  async getSitemap(): Promise<PageSeoConfig[]> {
    const result = await api.get<{ success: boolean; data: PageSeoConfig[] }>(
      '/seo/sitemap'
    );
    return result.data ?? [];
  },

  /**
   * Génère les métadonnées Next.js à partir des données SEO
   */
  generateMetadata(seoData: SeoData, baseUrl: string): Metadata {
    const {
      title,
      description,
      keywords,
      ogImage,
      ogType = 'website',
      canonical,
      noindex,
      nofollow,
    } = seoData;

    return {
      title,
      description,
      keywords: keywords?.join(', '),
      robots: {
        index: !noindex,
        follow: !nofollow,
      },
      openGraph: {
        title,
        description,
        type: ogType,
        images: ogImage ? [{ url: ogImage }] : undefined,
        url: canonical || baseUrl,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: ogImage ? [ogImage] : undefined,
      },
      alternates: {
        canonical: canonical || baseUrl,
      },
    };
  },

  /**
   * Génère les métadonnées pour un produit (avec données structurées)
   */
  generateProductMetadata(
    productData: ProductSeoData,
    baseUrl: string
  ): Metadata & { structuredData?: any } {
    const metadata = this.generateMetadata(productData, baseUrl);

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: productData.title,
      description: productData.description,
      image: productData.ogImage,
      brand: productData.brand
        ? {
            '@type': 'Brand',
            name: productData.brand,
          }
        : undefined,
      offers: productData.price
        ? {
            '@type': 'Offer',
            price: productData.price,
            priceCurrency: 'EUR',
            availability:
              productData.availability === 'in_stock'
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
          }
        : undefined,
    };

    return {
      ...metadata,
      structuredData,
    };
  },
  /**
   * Génère les métadonnées pour un article de blog
   */
  generateBlogPostMetadata(
    blogData: BlogPostSeoData,
    baseUrl: string
  ): Metadata & { structuredData?: any } {
    const metadata = this.generateMetadata(blogData, baseUrl);

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: blogData.title,
      description: blogData.description,
      image: blogData.ogImage,
      author: blogData.author
        ? {
            '@type': 'Person',
            name: blogData.author,
          }
        : undefined,
      datePublished: blogData.publishedDate,
      dateModified: blogData.modifiedDate || blogData.publishedDate,
      keywords: blogData.tags?.join(', '),
    };

    return {
      ...metadata,
      structuredData,
    };
  },

  /**
   * Met à jour les métadonnées SEO d'une page (admin)
   */
  async updatePageSeo(path: string, data: Partial<SeoData>): Promise<SeoData> {
    const result = await api.put<{ success: boolean; data: SeoData }>(`/seo/page`, {
      path,
      ...data,
    });
    return result.data as SeoData;
  },

  /**
   * Analyse SEO d'une page (scoring, suggestions)
   */
  async analyzePage(url: string): Promise<{
    score: number;
    issues: Array<{ severity: 'error' | 'warning' | 'info'; message: string }>;
    suggestions: string[];
  }> {
    const result = await api.post<{
      success: boolean;
      data: {
        score: number;
        issues: Array<{ severity: 'error' | 'warning' | 'info'; message: string }>;
        suggestions: string[];
      };
    }>(
      '/seo/analyze',
      { url }
    );
    return result.data as {
      score: number;
      issues: Array<{ severity: 'error' | 'warning' | 'info'; message: string }>;
      suggestions: string[];
    };
  },

  /**
   * Soumet un sitemap aux moteurs de recherche
   */
  async submitSitemap(sitemapUrl: string): Promise<{
    google: boolean;
    bing: boolean;
  }> {
    const result = await api.post<{
      success: boolean;
      data: { google: boolean; bing: boolean };
    }>(
      '/seo/submit-sitemap',
      { sitemapUrl }
    );
    return result.data as { google: boolean; bing: boolean };
  },

  /**
   * Génère un breadcrumb pour le SEO
   */
  generateBreadcrumb(items: Array<{ name: string; url: string }>) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    };
  },
};

/**
 * Helper pour injecter les données structurées dans une page Next.js
 */
export function StructuredData({ data }: { data: any }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * Constantes SEO par défaut
 */
export const DEFAULT_SEO: SeoData = {
  title: 'MJ Chauffage - Chauffage et Climatisation',
  description:
    'Expert en installation et maintenance de systèmes de chauffage et climatisation. Service professionnel et fiable.',
  keywords: [
    'chauffage',
    'climatisation',
    'installation',
    'maintenance',
    'réparation',
  ],
  ogType: 'website',
};

export default seoService;
