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

const convertApiProduct = (apiProduct: any): Product => {
  return {
    id: apiProduct.id,
    name: apiProduct.name,
    slug: apiProduct.slug || apiProduct.name?.toLowerCase()?.replace(/\s+/g, '-') || `${apiProduct.id}`,
    sku: apiProduct.sku || `SKU-${apiProduct.id}`,
    description: apiProduct.description ?? null,
    shortDescription: apiProduct.shortDescription ?? null,
    price: apiProduct.price ? Number(apiProduct.price) : 0,
    salePrice: apiProduct.salePrice ? Number(apiProduct.salePrice) : null,
    stockQuantity: apiProduct.stockQuantity ? Number(apiProduct.stockQuantity) : 0,
    weight: apiProduct.weight ? Number(apiProduct.weight) : null,
    dimensions: apiProduct.dimensions || null,
    specifications: apiProduct.specifications || {},
    features: Array.isArray(apiProduct.features) ? apiProduct.features : [],
    images: Array.isArray(apiProduct.images)
      ? apiProduct.images.map((img: any) => ({
          id: img.id || Math.random().toString(),
          url: typeof img === 'string' ? img : img.url,
          altText: typeof img === 'object' ? img.altText : null,
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
}

export const productService = {
  async getProducts(): Promise<Product[]> {
    try {
      const result = await api.get<ProductsResponse>('/products')
      const products = Array.isArray(result.data?.products) ? result.data!.products : []
      return products.map(convertApiProduct)
    } catch (error) {
      console.error('Error fetching products:', error)
      return []
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

  async uploadImages(productId: string, files: File[]): Promise<string[]> {
    try {
      const formData = new FormData()
      files.forEach((file) => formData.append('images', file))

      const result = await api.upload<{ success: boolean; data: string[] }>(
        `/products/${productId}/images`,
        formData
      )

      return result.data ?? []
    } catch (error) {
      console.error("Error uploading images:", error)
      throw error
    }
  },
}

export const useProducts = () => {
  const [products, setProducts] = React.useState<Product[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const loadProducts = async () => {
    setLoading(true)
    setError(null)

    try {
      const list = await productService.getProducts()
      setProducts(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return { products, loading, error, loadProducts }
}

export default productService
