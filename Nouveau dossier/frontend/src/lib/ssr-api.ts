import { cache } from 'react';
import type { Product } from '@/services/productService';
import { config } from './config';

const DEFAULT_TIMEOUT = 5000;

// Use centralized config for SSR API URL
const API_URL = config.api.ssrBaseURL;

const normalizeImageUrl = (img: any): string => {
  const src = typeof img === 'string' ? img : img?.url;

  // ✅ Retourner placeholder si pas d'image
  if (!src) return '/placeholder-product.svg';

  // ✅ Si déjà une URL absolue, retourner tel quel
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }

  // ✅ Décoder les entités HTML
  let decodedSrc = src;
  if (src.includes('&#x')) {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const textarea = document.createElement('textarea');
      textarea.innerHTML = src;
      decodedSrc = textarea.value;
    } else {
      // Server-side decode for common entities
      decodedSrc = src
        .replace(/&#x2F;/g, '/')  // &#x2F; -> /
        .replace(/&amp;/g, '&')  // &amp; -> &
        .replace(/&lt;/g, '<')   // &lt; -> <
        .replace(/&gt;/g, '>')   // &gt; -> >
        .replace(/&quot;/g, '"') // &quot; -> "
        .replace(/&#39;/g, "'"); // &#39; -> '
    }
  }

  // ✅ Nettoyer les doubles /files/
  let cleanSrc = decodedSrc;
  if (cleanSrc.includes('/files//files/')) {
    cleanSrc = cleanSrc.replace('/files//files/', '/files/');
  }

  // ✅ Si déjà un chemin /files/, retourner tel quel
  if (cleanSrc.startsWith('/files/')) {
    return cleanSrc;
  }

  // ✅ Pour les autres chemins, ajouter /files/ si nécessaire
  const path = cleanSrc.startsWith('/') ? cleanSrc : `/${cleanSrc}`;
  return path.startsWith('/files/') ? path : `/files${path}`;
};

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

const toNumber = (v: any): number => {
  if (v === null || v === undefined) return 0;
  if (typeof v === 'number') return v;
  if (typeof v === 'string') return parseFloat(v);
  // Prisma Decimal or other objects
  if (typeof v === 'object' && 'toString' in v) {
    const s = (v as any).toString();
    const n = parseFloat(s);
    return isNaN(n) ? 0 : n;
  }
  return Number(v) || 0;
};

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
  price: toNumber(product.price),
  salePrice:
    product.salePrice !== undefined && product.salePrice !== null
      ? toNumber(product.salePrice)
      : null,
  stockQuantity: toNumber(product.stockQuantity),
  weight:
    product.weight !== undefined && product.weight !== null
      ? toNumber(product.weight)
      : null,
  dimensions: product.dimensions ?? null,
  specifications: product.specifications ?? {},
  features: Array.isArray(product.features) ? product.features : [],
  images: Array.isArray(product.images)
    ? product.images.map((img: any) => ({
        id: img?.id ?? Math.random().toString(),
        url: normalizeImageUrl(img),
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
      // API_URL already includes /api/v1 from config
      const url = `${API_URL}${endpoint}`;

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
    `/products?page=${page}&limit=${limit}&include=images,category,manufacturer`,
    {
      cache: 'no-store',
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
// Helper: build query string from params (supports arrays)
function buildQueryString(params: Record<string, any>): string {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) {
      value.filter(Boolean).forEach((v) => q.append(key, String(v)));
    } else {
      q.append(key, String(value));
    }
  });
  return q.toString();
}

export async function fetchProductsSSRWithParams(
  params: Record<string, any> = {},
): Promise<{
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  const page = Number(params.page ?? 1) || 1;
  const limit = Number(params.limit ?? 20) || 20;
  const fallback = FALLBACKS.products;

  const query = buildQueryString({
    page,
    limit,
    search: params.search,
    category: params.category, // single category
    categories: params.categories, // multi categories[]
    manufacturer: params.manufacturer, // single manufacturer
    manufacturers: params.manufacturers, // multi manufacturers[]
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    inStock: params.inStock,
    featured: params.featured,
    sortBy: params.sortBy,
    sortOrder: params.sortOrder,
    include: 'images,category,manufacturer', // Always include related data
  });

  const data = await fetchSSR<ProductsApiResponse>(`/products?${query}`, {
    cache: 'no-store',
  });

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
          ? Math.ceil((data.data.total as number) / limit)
          : data.data.products
          ? Math.ceil((data.data.products.length as number) / limit)
          : 0,
    }
  ) as { page: number; limit: number; total: number; totalPages: number };

  return {
    products: Array.isArray(data.data.products)
      ? (data.data.products as Record<string, any>[]).map(convertApiProduct)
      : fallback.products,
    pagination,
  };
}
export async function fetchManufacturersSSR(): Promise<{
  manufacturers: Array<{ id: string; name: string; slug: string; productCount?: number }>
}> {
  type ManufacturersApiResponse = ApiResponse<{
    manufacturers?: Array<{ id: string; name: string; slug: string; _count?: { products: number } }>
  }>;

  const data = await fetchSSR<ManufacturersApiResponse>('/products/manufacturers', {
    next: { revalidate: 7200 },
  });

  if (!data || !data.success) {
    return { manufacturers: [] };
  }

  const list = (data.data.manufacturers ?? []).map((m) => ({
    id: m.id,
    name: m.name,
    slug: m.slug,
    productCount: m._count?.products ?? undefined,
  }));

  return { manufacturers: list };
}
