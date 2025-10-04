import { productCache } from './cacheService'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

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
    products: Product[]
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

class ProductService {
  // Helper function to convert API product to frontend format
  private static convertApiProduct(apiProduct: any): Product {
    return {
      id: apiProduct.id,
      name: apiProduct.name,
      slug: apiProduct.slug || apiProduct.name.toLowerCase().replace(/\s+/g, '-'),
      sku: apiProduct.sku || `SKU-${apiProduct.id}`,
      description: apiProduct.description,
      shortDescription: apiProduct.shortDescription || null,
      price: parseFloat(apiProduct.price) || 0,
      salePrice: apiProduct.salePrice ? parseFloat(apiProduct.salePrice) : null,
      stockQuantity: parseInt(apiProduct.stockQuantity) || 0,
      weight: apiProduct.weight ? parseFloat(apiProduct.weight) : null,
      dimensions: apiProduct.dimensions || null,
      specifications: apiProduct.specifications || {},
      features: Array.isArray(apiProduct.features) ? apiProduct.features : [],
      images: Array.isArray(apiProduct.images) ? apiProduct.images.map((img: any) => ({
        id: img.id || Math.random().toString(),
        url: typeof img === 'string' ? img : img.url,
        altText: typeof img === 'object' ? img.altText : null
      })) : [],
      category: {
        id: apiProduct.category?.id || apiProduct.categoryId || 'unknown',
        name: apiProduct.category?.name || 'Unknown Category',
        slug: apiProduct.category?.slug || 'unknown'
      },
      manufacturer: apiProduct.manufacturer ? {
        id: apiProduct.manufacturer.id,
        name: apiProduct.manufacturer.name,
        slug: apiProduct.manufacturer.slug
      } : null,
      isFeatured: Boolean(apiProduct.isFeatured),
      isActive: apiProduct.isActive !== false, // Default to true if not specified
      createdAt: apiProduct.createdAt || new Date().toISOString(),
      updatedAt: apiProduct.updatedAt || new Date().toISOString()
    }
  }

  static async getProducts(): Promise<Product[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success && result.data && result.data.products) {
        // Convert API products to frontend format
        return result.data.products.map(this.convertApiProduct)
      } else {
        console.warn('No products found in API response')
        return []
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      return [] // Return empty array instead of throwing to prevent page crash
    }
  }

  static async getProduct(id: string): Promise<Product | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        return result.data.product
      } else {
        throw new Error('Failed to fetch product')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      throw error
    }
  }

  static async getCategories(): Promise<Category[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result: CategoriesResponse = await response.json()
      
      if (result.success) {
        return result.data.categories
      } else {
        throw new Error('Failed to fetch categories')
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw error
    }
  }

  static async getFeaturedProducts(): Promise<Product[]> {
    try {
      const products = await this.getProducts()
      return products.filter(product => product.isFeatured)
    } catch (error) {
      console.error('Error fetching featured products:', error)
      throw error
    }
  }

  static async createProduct(productData: any): Promise<Product> {
    try {
      // Get auth token from localStorage or session
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
      
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(productData),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        return result.data.product
      } else {
        throw new Error(result.message || 'Failed to create product')
      }
    } catch (error) {
      console.error('Error creating product:', error)
      throw error
    }
  }

  static async updateProduct(id: string, productData: any): Promise<Product> {
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
      
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(productData),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        return result.data.product
      } else {
        throw new Error(result.message || 'Failed to update product')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      throw error
    }
  }

  static async deleteProduct(id: string): Promise<boolean> {
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
      
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      return result.success
    } catch (error) {
      console.error('Error deleting product:', error)
      throw error
    }
  }

  static async getManufacturers(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/manufacturers`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        return result.data.manufacturers
      } else {
        throw new Error('Failed to fetch manufacturers')
      }
    } catch (error) {
      console.error('Error fetching manufacturers:', error)
      return []
    }
  }
}

export default ProductService