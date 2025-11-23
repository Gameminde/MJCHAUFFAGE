import { supabase } from '@/lib/supabaseClient'
import React from 'react'

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

const convertSupabaseProduct = (data: any): Product => {
  // Handle JSON fields
  let specifications = {};
  try {
    specifications = typeof data.specifications === 'string'
      ? JSON.parse(data.specifications)
      : data.specifications || {};
  } catch (e) {
    console.warn('Failed to parse specifications:', e);
  }

  let features: string[] = [];
  if (Array.isArray(data.features)) {
    features = data.features;
  } else if (typeof data.features === 'string') {
    features = data.features.split(',').map((f: string) => f.trim()).filter(Boolean);
  }

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    sku: data.sku,
    description: data.description,
    shortDescription: data.short_description, // snake_case from DB
    price: Number(data.price),
    salePrice: data.sale_price ? Number(data.sale_price) : null,
    stockQuantity: data.stock_quantity,
    weight: data.weight ? Number(data.weight) : null,
    dimensions: data.dimensions,
    specifications,
    features,
    images: Array.isArray(data.product_images)
      ? data.product_images.map((img: any) => ({
        id: img.id,
        url: img.url,
        altText: img.alt_text
      }))
      : [],
    category: data.categories ? {
      id: data.categories.id,
      name: data.categories.name,
      slug: data.categories.slug
    } : { id: 'unknown', name: 'Unknown', slug: 'unknown' },
    manufacturer: data.manufacturers ? {
      id: data.manufacturers.id,
      name: data.manufacturers.name,
      slug: data.manufacturers.slug
    } : null,
    isFeatured: data.is_featured,
    isActive: data.is_active,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  }
}

const productService = {
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
      let query = supabase
        .from('products')
        .select(`
  *,
  categories!inner(*),
    manufacturers(*),
    product_images(*)
      `)
        .eq('is_active', true);

      if (filters?.search) {
        query = query.ilike('name', `% ${filters.search}% `);
      }
      if (filters?.category) {
        query = query.eq('categories.slug', filters.category);
      }
      if (filters?.categories?.length) {
        query = query.in('categories.slug', filters.categories);
      }
      if (filters?.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters?.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }
      if (filters?.inStock) {
        query = query.gt('stock_quantity', 0);
      }
      if (filters?.featured) {
        query = query.eq('is_featured', true);
      }

      // Sorting
      const sortColumn = filters?.sortBy === 'price' ? 'price' : 'created_at';
      const ascending = filters?.sortOrder === 'asc';
      query = query.order(sortColumn, { ascending });

      // Pagination
      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(convertSupabaseProduct);
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  async getProduct(slugOrId: string): Promise<Product | null> {
    try {
      // Try by slug first, then ID
      let query = supabase
        .from('products')
        .select(`
  *,
  categories(*),
  manufacturers(*),
  product_images(*)
    `);

      // Check if it looks like a UUID
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);

      if (isUuid) {
        query = query.eq('id', slugOrId);
      } else {
        query = query.eq('slug', slugOrId);
      }

      const { data, error } = await query.single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return convertSupabaseProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  },

  async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;

      return (data || []).map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.image,
        productCount: 0, // TODO: Count products
        sortOrder: cat.sort_order
      }));
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  async getManufacturers(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('manufacturers')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching manufacturers:', error);
      return [];
    }
  },

  async getFeaturedProducts(): Promise<Product[]> {
    return this.getProducts({ featured: true, limit: 8 });
  },

  // Admin methods - simplified for now
  async createProduct(productData: any): Promise<Product> {
    throw new Error('Not implemented in simple mode');
  },

  async updateProduct(id: string, productData: any): Promise<Product> {
    throw new Error('Not implemented in simple mode');
  },

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  },

  async uploadImages(files: File[]): Promise<string[]> {
    const urls: string[] = [];
    for (const file of files) {
      const fileName = `${Date.now()} -${file.name} `;
      const { data, error } = await supabase.storage
        .from('products')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(fileName);

      urls.push(publicUrl);
    }
    return urls;
  },

  async getBatchProducts(productIds: string[]): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
  *,
  categories(*),
  manufacturers(*),
  product_images(*)
    `)
        .in('id', productIds);

      if (error) throw error;
      return (data || []).map(convertSupabaseProduct);
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

  React.useEffect(() => {
    loadProducts()
  }, [])

  return { products, loading, error, loadProducts }
}

export default productService
