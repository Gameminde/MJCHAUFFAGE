import { cache } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { Product } from '@/services/productService';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
);

const normalizeImageUrl = (img: any): string => {
  if (typeof img === 'string') return img;
  return img?.url || '/placeholder-product.svg';
};

const toNumber = (v: any): number => {
  if (v === null || v === undefined) return 0;
  return Number(v) || 0;
};

// Normalize search text by removing accents for fuzzy matching
const normalizeSearchText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remove diacritics
};

const convertSupabaseProduct = (product: any): Product => ({
  id: product.id,
  name: product.name,
  slug: product.slug || product.id,
  sku: product.sku || `SKU-${product.id}`,
  description: product.description,
  shortDescription: product.short_description,
  price: toNumber(product.price),
  salePrice: product.sale_price ? toNumber(product.sale_price) : null,
  stockQuantity: toNumber(product.stock_quantity),
  weight: product.weight ? toNumber(product.weight) : null,
  dimensions: product.dimensions,
  specifications: product.specifications || {},
  features: product.features || [],
  images: (product.product_images || []).map((img: any) => ({
    id: img.id,
    url: normalizeImageUrl(img.url),
    altText: img.alt_text
  })),
  category: {
    id: product.category?.id || 'unknown',
    name: product.category?.name || 'Unknown Category',
    slug: product.category?.slug || 'unknown',
  },
  manufacturer: product.manufacturer
    ? {
      id: product.manufacturer.id,
      name: product.manufacturer.name,
      slug: product.manufacturer.slug,
    }
    : null,
  isFeatured: Boolean(product.is_featured),
  isActive: product.is_active !== false,
  createdAt: product.created_at,
  updatedAt: product.updated_at,
});

export const FALLBACKS = {
  products: {
    products: [] as Product[],
    pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
  },
  categories: {
    categories: [] as any[],
  },
};

export const fetchProductsSSR = cache(async (page = 1, limit = 20) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  try {
    const { data, count, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        manufacturer:manufacturers(*),
        product_images(*)
      `, { count: 'exact' })
      .range(from, to);

    if (error) throw error;

    return {
      products: (data || []).map(convertSupabaseProduct),
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };
  } catch (error) {
    console.error('Error fetching products SSR:', error);
    return FALLBACKS.products;
  }
});

export const fetchCategoriesSSR = cache(async (includeInactive = false) => {
  try {
    let query = supabase
      .from('categories')
      .select('*');
    
    if (!includeInactive) {
      query = query.eq('is_active', true);
    }
    
    const { data, error } = await query.order('sort_order').order('name');

    if (error) throw error;

    // Get product counts per category
    const { data: productCounts } = await supabase
      .from('products')
      .select('category_id')
      .eq('is_active', true);

    const countMap = new Map<string, number>();
    productCounts?.forEach(p => {
      if (p.category_id) {
        countMap.set(p.category_id, (countMap.get(p.category_id) || 0) + 1);
      }
    });

    // Organize categories hierarchically
    const categoriesMap = new Map(data.map(c => [c.id, { ...c, children: [] as any[] }]));
    const rootCategories: any[] = [];
    
    data.forEach(cat => {
      const category = categoriesMap.get(cat.id);
      if (cat.parent_id && categoriesMap.has(cat.parent_id)) {
        categoriesMap.get(cat.parent_id)!.children.push(category);
      } else {
        rootCategories.push(category);
      }
    });

    return {
      categories: rootCategories.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        image: c.image,
        parentId: c.parent_id,
        children: c.children.map((child: any) => ({
          id: child.id,
          name: child.name,
          slug: child.slug,
          description: child.description,
          parentId: child.parent_id,
          productCount: countMap.get(child.id) || 0
        })),
        productCount: countMap.get(c.id) || 0
      })),
      allCategories: data.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        parentId: c.parent_id,
        sortOrder: c.sort_order
      }))
    };
  } catch (error) {
    console.error('Error fetching categories SSR:', error);
    return FALLBACKS.categories;
  }
});

export const fetchProductDetailSSR = cache(async (id: string): Promise<Product | null> => {
  // Validate UUID format to prevent PostgreSQL errors
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        manufacturer:manufacturers(*),
        product_images(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    return convertSupabaseProduct(data);
  } catch (error) {
    console.error('Error fetching product detail SSR:', error);
    return null;
  }
});

export const fetchProductsSSRWithParams = cache(async (params: Record<string, any> = {}) => {
  const page = Number(params.page ?? 1) || 1;
  const limit = Number(params.limit ?? 20) || 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  try {
    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        manufacturer:manufacturers(*),
        product_images(*)
      `, { count: 'exact' });

    if (params.search) {
      // Support fuzzy search with and without accents
      const normalizedSearch = normalizeSearchText(params.search);
      // Use OR to search both original and normalized text
      query = query.or(`name.ilike.%${params.search}%,name.ilike.%${normalizedSearch}%`);
    }
    
    // Handle categories filter (can be single ID or comma-separated IDs)
    if (params.categories) {
      const categoryIds = typeof params.categories === 'string' 
        ? params.categories.split(',').filter(Boolean)
        : params.categories;
      if (categoryIds.length > 0) {
        query = query.in('category_id', categoryIds);
      }
    }
    
    // Handle manufacturers filter (can be single ID or comma-separated IDs)
    if (params.manufacturers) {
      const manufacturerIds = typeof params.manufacturers === 'string'
        ? params.manufacturers.split(',').filter(Boolean)
        : params.manufacturers;
      if (manufacturerIds.length > 0) {
        query = query.in('manufacturer_id', manufacturerIds);
      }
    }
    
    if (params.minPrice) query = query.gte('price', params.minPrice);
    if (params.maxPrice) query = query.lte('price', params.maxPrice);
    if (params.inStock) query = query.gt('stock_quantity', 0);
    if (params.featured) query = query.eq('is_featured', true);

    // Sorting
    if (params.sortBy === 'price') {
      query = query.order('price', { ascending: params.sortOrder === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, count, error } = await query.range(from, to);

    if (error) throw error;

    return {
      products: (data || []).map(convertSupabaseProduct),
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };
  } catch (error) {
    console.error('Error fetching products with params SSR:', error);
    return FALLBACKS.products;
  }
});

export const fetchManufacturersSSR = cache(async () => {
  try {
    const { data, error } = await supabase
      .from('manufacturers')
      .select('*');

    if (error) throw error;

    // Get product counts per manufacturer
    const { data: productCounts } = await supabase
      .from('products')
      .select('manufacturer_id')
      .eq('is_active', true);

    const countMap = new Map<string, number>();
    productCounts?.forEach(p => {
      if (p.manufacturer_id) {
        countMap.set(p.manufacturer_id, (countMap.get(p.manufacturer_id) || 0) + 1);
      }
    });

    return {
      manufacturers: data.map(m => ({
        id: m.id,
        name: m.name,
        slug: m.slug,
        productCount: countMap.get(m.id) || 0
      }))
    };
  } catch (error) {
    console.error('Error fetching manufacturers SSR:', error);
    return { manufacturers: [] };
  }
});
