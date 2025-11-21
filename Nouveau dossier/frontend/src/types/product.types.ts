export interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ProductManufacturer {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  shortDescription: string | null;
  price: number;
  salePrice: number | null;
  stockQuantity: number;
  weight: number | null;
  dimensions: Record<string, number> | null;
  specifications: Record<string, string>;
  features: string[];
  images: ProductImage[];
  category: ProductCategory;
  manufacturer: ProductManufacturer | null;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  categories?: string[];
  manufacturerId?: string;
  manufacturers?: string[];
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  inStock?: boolean;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: string;
  salePrice: string;
  categoryId: string;
  manufacturerId: string;
  sku: string;
  stockQuantity: string;
  features: string[];
  specifications: Record<string, string>;
  isActive: boolean;
  isFeatured: boolean;
}
