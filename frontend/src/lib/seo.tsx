// frontend/src/lib/seo.ts
// 🔍 Service SEO refactorisé avec Supabase

import { createClient } from '@/lib/supabase/client';
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
 */
export const seoService = {
  /**
   * Récupère les données SEO pour une page
   */
  async getPageSeo(path: string): Promise<SeoData> {
    // In a real app, you might fetch this from a 'pages' table in Supabase
    // For now, return defaults or specific overrides based on path
    return {
      ...DEFAULT_SEO,
      canonical: `${process.env.NEXT_PUBLIC_APP_URL || 'https://mjchauffage.com'}${path}`,
    };
  },

  /**
   * Récupère les métadonnées SEO pour un produit
   */
  async getProductSeo(productId: string): Promise<ProductSeoData> {
    const supabase = createClient();
    const { data: product, error } = await supabase
      .from('products')
      .select('*, category:categories(name), manufacturer:manufacturers(name)')
      .eq('id', productId)
      .single();

    if (error || !product) {
      console.error('Error fetching product SEO:', error);
      return {
        ...DEFAULT_SEO,
        productId,
        title: 'Produit non trouvé',
        description: 'Ce produit n\'existe pas ou a été supprimé.',
      } as ProductSeoData;
    }

    return {
      title: `${product.name} - MJ Chauffage`,
      description: product.description || `Achetez ${product.name} au meilleur prix chez MJ Chauffage.`,
      keywords: [product.name, product.category?.name, product.manufacturer?.name, 'chauffage', 'pièces détachées'].filter(Boolean) as string[],
      ogImage: product.image_url,
      ogType: 'website',
      productId: product.id,
      price: product.price,
      availability: product.stock > 0 ? 'in_stock' : 'out_of_stock',
      brand: product.manufacturer?.name,
      category: product.category?.name,
    };
  },

  /**
   * Récupère les métadonnées SEO pour un article de blog
   */
  async getBlogPostSeo(postId: string): Promise<BlogPostSeoData> {
    // Mock implementation for now
    return {
      ...DEFAULT_SEO,
      postId,
      title: 'Article de Blog',
      ogType: 'article',
    } as BlogPostSeoData;
  },

  /**
   * Génère le sitemap.xml
   */
  async getSitemap(): Promise<PageSeoConfig[]> {
    // Mock implementation
    return [];
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
    // Mock implementation
    return { ...DEFAULT_SEO, ...data };
  },

  /**
   * Analyse SEO d'une page (scoring, suggestions)
   */
  async analyzePage(url: string): Promise<{
    score: number;
    issues: Array<{ severity: 'error' | 'warning' | 'info'; message: string }>;
    suggestions: string[];
  }> {
    // Mock implementation
    return {
      score: 100,
      issues: [],
      suggestions: []
    };
  },

  /**
   * Soumet un sitemap aux moteurs de recherche
   */
  async submitSitemap(sitemapUrl: string): Promise<{
    google: boolean;
    bing: boolean;
  }> {
    // Mock implementation
    return { google: true, bing: true };
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
