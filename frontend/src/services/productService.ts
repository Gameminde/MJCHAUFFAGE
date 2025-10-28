import { api, ApiError } from '@/lib/api'
import React from 'react'
import { productCache } from './cacheService'

export interface Product {
  id: string
  name: string
  slug: string
  sku: string
  description: string | null
  shortDescription: string | null
  price: number
  salePrice: number | null
  stockQuantity: number
  weight: number | null
  dimensions: any
  specifications: any
  features: string[]
  images: ProductImage[]
  category: {
    id: string
    name: string
    slug: string
  }
  manufacturer: {
    id: string
    name: string
    slug: string
  } | null
  isFeatured: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductImage {
  id: string
  url: string
  altText: string | null
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  productCount: number
  sortOrder: number
}

export interface ProductsResponse {
  success: boolean
  data: {
    products: any[]
    total: number
    hasMore: boolean
  }
}

export interface CategoriesResponse {
  success: boolean
  data: {
    categories: Category[]
  }
}

// Normalize image URLs to absolute backend URLs when needed
const BASE_API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const DEFAULT_IMAGE = '/placeholder-product.jpg'; // ✅ Image placeholder pertinente

const normalizeImageUrl = (img: any): string => {
  let src = typeof img === 'string' ? img : img?.url;

  // ✅ Retourner placeholder si pas d'image
  if (!src) return DEFAULT_IMAGE;

  // ✅ Décoder les entités HTML dans l'URL
  src = src.replace(/&#x2F;/g, '/').replace(/&amp;/g, '&');

  // ✅ Si déjà une URL absolue, retourner tel quel
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }

  // ✅ Ajouter le base URL pour les chemins relatifs
  const path = src.startsWith('/') ? src : `/${src}`;
  return `${BASE_API}${path}`;
};

const convertApiProduct = (apiProduct: any): Product => {
  // ✅ FIX: Définir les variables de prix AVANT de les utiliser
  const price = typeof apiProduct.price === 'number'
    ? apiProduct.price
    : parseFloat(apiProduct.price) || 0;

  const salePrice = apiProduct.salePrice !== null && apiProduct.salePrice !== undefined
    ? (typeof apiProduct.salePrice === 'number'
        ? apiProduct.salePrice
        : parseFloat(apiProduct.salePrice) || 0)
    : null;

  // ✅ FIX: Gérer les features comme array OU string
  let features: string[] = [];
  if (Array.isArray(apiProduct.features)) {
    features = apiProduct.features;
  } else if (typeof apiProduct.features === 'string' && apiProduct.features) {
    // Split par virgule si c'est une string (venant de SQLite)
    features = apiProduct.features.split(',').map((f: string) => f.trim()).filter(Boolean);
  }

  // ✅ FIX: Gérer les specifications comme object OU string JSON
  let specifications: any = {};
  if (typeof apiProduct.specifications === 'object' && apiProduct.specifications !== null) {
    specifications = apiProduct.specifications;
  } else if (typeof apiProduct.specifications === 'string' && apiProduct.specifications) {
    try {
      specifications = JSON.parse(apiProduct.specifications);
    } catch (e) {
      console.warn('Failed to parse specifications JSON:', e);
    }
  }

  const result = {
    id: apiProduct.id,
    name: apiProduct.name,
    slug: apiProduct.slug || apiProduct.name?.toLowerCase()?.replace(/\s+/g, '-') || `${apiProduct.id}`,
    sku: apiProduct.sku || `SKU-${apiProduct.id}`,
    description: apiProduct.description ?? null,
    shortDescription: apiProduct.shortDescription ?? null,
    price: price, // ✅ Utiliser la variable définie
    salePrice: salePrice, // ✅ Utiliser la variable définie
    stockQuantity: apiProduct.stockQuantity ? Number(apiProduct.stockQuantity) : 0,
    weight: apiProduct.weight ? Number(apiProduct.weight) : null,
    dimensions: apiProduct.dimensions || null,
    specifications: specifications,
    features: features, // ✅ Array correctement formé
    images: Array.isArray(apiProduct.images)
      ? apiProduct.images.map((img: any) => ({
          id: (typeof img === 'object' && img.id) ? img.id : Math.random().toString(),
          url: normalizeImageUrl(img),
          altText: typeof img === 'object' ? (img.altText ?? null) : null,
        }))
      : [],
    category: {
      id: apiProduct.category?.id || apiProduct.categoryId || 'unknown',
      name: apiProduct.category?.name || 'Unknown Category',
      slug: apiProduct.category?.slug || 'unknown',
    },
    manufacturer: apiProduct.manufacturer
      ? {
          id: apiProduct.manufacturer.id,
          name: apiProduct.manufacturer.name,
          slug: apiProduct.manufacturer.slug,
        }
      : null,
    isFeatured: Boolean(apiProduct.isFeatured),
    isActive: apiProduct.isActive !== false,
    createdAt: apiProduct.createdAt || new Date().toISOString(),
    updatedAt: apiProduct.updatedAt || new Date().toISOString(),
  }
  return result;
}

export const productService = {
  async getProducts(filters?: {
    search?: string;
    category?: string;
    categories?: string[];
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    featured?: boolean;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    limit?: number;
  }): Promise<Product[]> {
    try {
      // Build query parameters
      const params = new URLSearchParams();

      if (filters?.search) params.set('search', filters.search);
      if (filters?.category) params.set('category', filters.category);
      if (filters?.categories?.length) params.set('categories', filters.categories.join(','));
      if (filters?.minPrice !== undefined) params.set('minPrice', filters.minPrice.toString());
      if (filters?.maxPrice !== undefined) params.set('maxPrice', filters.maxPrice.toString());
      if (filters?.inStock !== undefined) params.set('inStock', filters.inStock.toString());
      if (filters?.featured !== undefined) params.set('featured', filters.featured.toString());
      if (filters?.sortBy) params.set('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.set('sortOrder', filters.sortOrder);
      if (filters?.page) params.set('page', filters.page.toString());
      if (filters?.limit) params.set('limit', filters.limit.toString());

      const queryString = params.toString();
      const endpoint = `/products${queryString ? `?${queryString}` : ''}`;

      const result = await api.get<{ success: boolean; data: { products: any[]; pagination: any; total: number } }>(endpoint);

      if (result.success && result.data && Array.isArray(result.data.products)) {
        return result.data.products
          .filter(product => product && product.id) // Filter out null/undefined products
          .map(convertApiProduct);
      }

      console.warn('Products API returned unexpected format:', result);
      return [];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  async getProduct(id: string): Promise<Product | null> {
    try {
      const result = await api.get<{ success: boolean; data: { product: any } }>(`/products/${id}`)
      if (result.success && result.data?.product) {
        return convertApiProduct(result.data.product)
      }
      return null
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null
      }
      console.error('Error fetching product:', error)
      throw error
    }
  },

  async getCategories(): Promise<Category[]> {
    try {
      const result = await api.get<{ success: boolean; data: { categories: Category[] } }>('/products/categories')
      console.log('📦 Categories response:', result)
      return result.data?.categories ?? []
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw error
    }
  },

  async getManufacturers(): Promise<any[]> {
    try {
      const result = await api.get<{ success: boolean; data: { manufacturers: any[] } }>(
        '/products/manufacturers'  // ✅ Correct route: /api/v1/products/manufacturers
      )
      return result.data?.manufacturers ?? []
    } catch (error) {
      console.error('Error fetching manufacturers:', error)
      return []
    }
  },

  async getFeaturedProducts(): Promise<Product[]> {
    try {
      const result = await api.get<ProductsResponse>('/products/featured')
      const products = Array.isArray(result.data?.products) ? result.data!.products : []
      return products.map(convertApiProduct)
    } catch (error) {
      console.error('Error fetching featured products:', error)
      throw error
    }
  },

  async createProduct(productData: any): Promise<Product> {
    try {
      const result = await api.post<{ success: boolean; data: { product: any } }>(
        '/products',
        productData
      )
      if (result.success && result.data?.product) {
        return convertApiProduct(result.data.product)
      }
      throw new Error('Failed to create product')
    } catch (error) {
      console.error('Error creating product:', error)
      throw error
    }
  },

  async updateProduct(id: string, productData: any): Promise<Product> {
    try {
      const result = await api.put<{ success: boolean; data: { product: any } }>(
        `/products/${id}`,
        productData
      )
      if (result.success && result.data?.product) {
        return convertApiProduct(result.data.product)
      }
      throw new Error('Failed to update product')
    } catch (error) {
      console.error('Error updating product:', error)
      throw error
    }
  },

  async deleteProduct(id: string): Promise<void> {
    try {
      await api.delete(`/products/${id}`)
    } catch (error) {
      console.error('Error deleting product:', error)
      throw error
    }
  },

  async uploadImages(files: File[]): Promise<string[]> {
    try {
      const formData = new FormData()
      files.forEach((file) => formData.append('images', file))

      const result = await api.upload<{ success: boolean; data: { urls: string[] } }>(
        `/uploads`,
        formData
      )

      return result.data?.urls ?? []
    } catch (error) {
      console.error("Error uploading images:", error)
      throw error
    }
  },

  async getBatchProducts(productIds: string[]): Promise<Product[]> {
    try {
      // Since the backend doesn't have a batch endpoint, fetch products individually
      // In a real app, we'd implement a batch endpoint in the backend
      const promises = productIds.map(id => this.getProduct(id));
      const results = await Promise.all(promises);
      return results.filter((product): product is Product => product !== null);
    } catch (error) {
      console.error('Error fetching batch products:', error);
      return [];
    }
  },
}

export const useProducts = (initialFilters?: {
  search?: string;
  category?: string;
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}) => {
  const [products, setProducts] = React.useState<Product[]>([])
  const [total, setTotal] = React.useState(0)
  const [hasMore, setHasMore] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const loadProducts = async (filters?: typeof initialFilters) => {
    setLoading(true)
    setError(null)

    try {
      const result = await productService.getProducts(filters || initialFilters)
      setProducts(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return { products, loading, error, loadProducts }
}

export default productService
