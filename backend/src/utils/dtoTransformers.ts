import { Prisma } from '@prisma/client';

/**
 * Transform image URL - now that we store relative paths,
 * just ensure URLs are properly formatted
 */
export const transformImageUrl = (image: any): string => {
  // If already an absolute URL (external), return as-is
  if (/^https?:\/\//i.test(image.url)) {
    return image.url;
  }

  // If already starts with /files/ or /images/, return as-is
  if (image.url.startsWith('/files/') || image.url.startsWith('/images/')) {
    return image.url;
  }

  // If starts with /, return as-is (avoid adding extra prefixes)
  if (image.url.startsWith('/')) {
    return image.url;
  }

  // For filenames without path, prepend with /files/
  return `/files/${image.url}`;
};

export const isDecimal = (value: unknown): value is Prisma.Decimal => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return (
    Object.prototype.hasOwnProperty.call(value, 'd') &&
    Object.prototype.hasOwnProperty.call(value, 'e') &&
    Object.prototype.hasOwnProperty.call(value, 's')
  );
};

export const decimalToNumber = (
  value: Prisma.Decimal | number | null | undefined
): number => {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === 'number') {
    return value;
  }

  if (isDecimal(value)) {
    return parseFloat(value.toString());
  }

  return 0;
};

export const convertDecimalFields = <
  T extends Record<string, unknown>,
  K extends keyof T
>(
  obj: T,
  fields: K[]
): T => {
  const result = { ...obj };

  fields.forEach((field) => {
    if (field in result) {
      result[field] = decimalToNumber(result[field] as any) as T[K];
    }
  });

  return result;
};

export interface ProductDTO {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  shortDescription: string | null;
  price: number;
  costPrice: number | null;
  salePrice: number | null;
  stockQuantity: number;
  minStock: number | null;
  maxStock: number | null;
  weight: number | null;
  isActive: boolean;
  isFeatured: boolean;
  categoryId: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  manufacturerId: string | null;
  manufacturer?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  images: Array<{
    id: string;
    url: string;
    altText: string | null;
    sortOrder: number;
  }>;
  specifications: Record<string, unknown> | null;
  features: string | null;
  dimensions: Record<string, unknown> | null;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

export const transformProductToDTO = (product: any): ProductDTO => {
  const dto: ProductDTO = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description: product.description,
    shortDescription: product.shortDescription,
    price: decimalToNumber(product.price),
    costPrice:
      product.costPrice !== undefined
        ? decimalToNumber(product.costPrice)
        : null,
    salePrice:
      product.salePrice !== undefined ? decimalToNumber(product.salePrice) : null,
    stockQuantity: product.stockQuantity,
    minStock: product.minStock ?? null,
    maxStock: product.maxStock ?? null,
    weight:
      product.weight !== undefined ? decimalToNumber(product.weight) : null,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    categoryId: product.categoryId ?? null,
    manufacturerId: product.manufacturerId ?? null,
    images: (product.images ?? []).map((image: any) => ({
      id: image.id,
      url: transformImageUrl(image),
      altText: image.altText ?? null,
      sortOrder: image.sortOrder ?? 0,
    })),
    specifications:
      (product.specifications as Record<string, unknown> | null) ?? null,
    features: product.features ?? null,
    dimensions:
      (product.dimensions as Record<string, unknown> | null) ?? null,
    metaTitle: product.metaTitle ?? null,
    metaDescription: product.metaDescription ?? null,
    createdAt:
      product.createdAt?.toISOString?.() ??
      new Date(product.createdAt).toISOString(),
    updatedAt:
      product.updatedAt?.toISOString?.() ??
      new Date(product.updatedAt).toISOString(),
  };

  if (product.category) {
    dto.category = {
      id: product.category.id,
      name: product.category.name,
      slug: product.category.slug,
    };
  }

  if (product.manufacturer) {
    dto.manufacturer = {
      id: product.manufacturer.id,
      name: product.manufacturer.name,
      slug: product.manufacturer.slug,
    };
  }

  return dto;
};

export const transformProductList = (products: any[]): ProductDTO[] =>
  products.map(transformProductToDTO);

export interface OrderItemDTO {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  image?: string | null;
}

export interface OrderDTO {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  orderDate: string;
  shippedAt: string | null;
  deliveredAt: string | null;
  estimatedDelivery: string | null;
  trackingNumber: string | null;
  shippingCarrier: string | null;
  notes: string | null;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  items: OrderItemDTO[];
  shippingAddress: Record<string, unknown> | null;
}

export const transformOrderItemToDTO = (item: any): OrderItemDTO => ({
  id: item.id,
  productId: item.productId,
  productName: item.product?.name || 'Unknown Product',
  quantity: item.quantity,
  unitPrice: decimalToNumber(item.unitPrice),
  totalPrice: decimalToNumber(item.totalPrice),
  image: item.product?.images?.[0] ? transformImageUrl(item.product.images[0]) : null,
});

export const transformOrderToDTO = (order: any): OrderDTO => ({
  id: order.id,
  orderNumber: order.orderNumber,
  status: order.status,
  paymentStatus: order.paymentStatus || 'PENDING',
  paymentMethod:
    order.payments?.[0]?.method || order.payment?.method || null,
  subtotal: decimalToNumber(order.subtotal),
  taxAmount: decimalToNumber(order.taxAmount),
  shippingAmount: decimalToNumber(order.shippingAmount),
  discountAmount: decimalToNumber(order.discountAmount),
  totalAmount: decimalToNumber(order.totalAmount),
  orderDate: order.orderDate?.toISOString?.() || order.createdAt.toISOString(),
  shippedAt: order.shippedAt?.toISOString?.() || null,
  deliveredAt: order.deliveredAt?.toISOString?.() || null,
  estimatedDelivery: order.estimatedDelivery?.toISOString?.() || null,
  trackingNumber: order.trackingNumber ?? null,
  shippingCarrier: order.shippingCarrier ?? null,
  notes: order.notes ?? null,
  customer: {
    id: order.customer?.id || order.customerId,
    name: order.customer?.user
      ? `${order.customer.user.firstName} ${order.customer.user.lastName}`
      : order.customer?.firstName
      ? `${order.customer.firstName} ${order.customer.lastName}`
      : 'Guest Customer',
    email:
      order.customer?.user?.email ||
      order.customer?.email ||
      order.customerEmail ||
      'N/A',
  },
  items: (order.items ?? []).map(transformOrderItemToDTO),
  shippingAddress: order.shippingAddress ?? null,
});

export const transformOrderList = (orders: any[]): OrderDTO[] =>
  orders.map(transformOrderToDTO);
