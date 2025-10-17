import { cache } from 'react';
import type { Product } from '@/services/productService';

const DEFAULT_TIMEOUT = 5000;

const API_URL =
  process.env.API_URL_SSR ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3001';

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

type ProductsApiResponse = ApiResponse<{
  products?: Record<string, any>[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  total?: number;
  hasMore?: boolean;
}>;

type ProductDetailApiResponse = ApiResponse<{
  product?: Record<string, any>;
}>;

type CategoriesApiResponse = ApiResponse<{
  categories?: Array<{
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    image?: string | null;
    productCount?: number;
    sortOrder?: number;
  }>;
}>;

const convertApiProduct = (product: Record<string, any>): Product => ({
  id: product.id,
  name: product.name,
  slug:
    product.slug ??
    product.name?.toLowerCase?.().replace?.(/\s+/g, '-') ??
    product.id,
  sku: product.sku ?? `SKU-${product.id}`,
  description: product.description ?? null,
  shortDescription: product.shortDescription ?? null,
  price: Number(product.price ?? 0),
  salePrice:
    product.salePrice !== undefined && product.salePrice !== null
      ? Number(product.salePrice)
      : null,
  stockQuantity: Number(product.stockQuantity ?? 0),
  weight:
    product.weight !== undefined && product.weight !== null
      ? Number(product.weight)
      : null,
  dimensions: product.dimensions ?? null,
  specifications: product.specifications ?? {},
  features: Array.isArray(product.features) ? product.features : [],
  images: Array.isArray(product.images)
    ? product.images.map((img: any) => ({
        id: img?.id ?? Math.random().toString(),
        url: typeof img === 'string' ? img : img?.url ?? '',
        altText: typeof img === 'object' ? img?.altText ?? null : null,
      }))
    : [],
  category: {
    id: product.category?.id ?? product.categoryId ?? 'unknown',
    name: product.category?.name ?? 'Unknown Category',
    slug: product.category?.slug ?? 'unknown',
  },
  manufacturer: product.manufacturer
    ? {
        id: product.manufacturer.id,
        name: product.manufacturer.name,
        slug: product.manufacturer.slug,
      }
    : null,
  isFeatured: Boolean(product.isFeatured),
  isActive: product.isActive !== false,
  createdAt: product.createdAt ?? new Date().toISOString(),
  updatedAt: product.updatedAt ?? new Date().toISOString(),
});

export const FALLBACKS = {
  products: {
    products: [] as Product[],
    pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
  },
  categories: {
    categories: [] as CategoriesApiResponse['data']['categories'],
  },
};

export const fetchSSR = cache(
  async <T>(
    endpoint: string,
    init?: RequestInit & { timeout?: number },
  ): Promise<T | null> => {
    const controller = new AbortController();
    const timeout = init?.timeout ?? DEFAULT_TIMEOUT;
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const url = `${API_URL}/api${endpoint}`;

      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
        next: init?.next,
      });

      if (!response.ok) {
        throw new Error(
          `API error ${response.status}: ${response.statusText}`,
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : JSON.stringify(error);

      if (process.env.NODE_ENV === 'development') {
        console.warn(`[SSR] Fetch failed (${endpoint}): ${message}`);
      }

      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  },
);

export async function fetchProductsSSR(
  page = 1,
  limit = 20,
): Promise<{
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  const fallback = FALLBACKS.products;
  const data = await fetchSSR<ProductsApiResponse>(
    `/products?page=${page}&limit=${limit}`,
    {
      next: { revalidate: 3600 },
    },
  );

  if (!data || !data.success) {
    return fallback;
  }

  const pagination = (
    data.data.pagination ?? {
      page,
      limit,
      total: data.data.total ?? data.data.products?.length ?? 0,
      totalPages:
        data.data.total !== undefined
          ? Math.ceil(data.data.total / limit)
          : data.data.products
          ? Math.ceil(data.data.products.length / limit)
          : 0,
    }
  ) as {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  return {
    products: Array.isArray(data.data.products)
      ? data.data.products.map(convertApiProduct)
      : fallback.products,
    pagination,
  };
}

export async function fetchCategoriesSSR() {
  const data = await fetchSSR<CategoriesApiResponse>(
    '/products/categories',
    {
      next: { revalidate: 7200 },
    },
  );

  if (!data || !data.success) {
    return FALLBACKS.categories;
  }

  return {
    categories: data.data.categories ?? FALLBACKS.categories.categories,
  };
}

export async function fetchProductDetailSSR(id: string): Promise<Product | null> {
  const data = await fetchSSR<ProductDetailApiResponse>(`/products/${id}`);

  if (!data || !data.success || !data.data.product) {
    return null;
  }

  return convertApiProduct(data.data.product);
}
