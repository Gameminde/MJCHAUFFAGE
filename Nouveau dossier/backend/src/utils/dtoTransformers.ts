import { Prisma } from '@prisma/client';
import { config } from '@/config/environment';

/**
 * Transform image URL - now that we store relative paths,
 * just ensure URLs are properly formatted
 */
export const transformImageUrl = (image: any): string => {
  let url = image?.url ?? '';
  if (!url || typeof url !== 'string') return '';

  // Repair malformed absolute URLs like http:/ or https:/
  if (/^https?:\/(?!\/)/i.test(url)) {
    url = url.replace(/^http:\/(?!\/)/i, 'http://').replace(/^https:\/(?!\/)/i, 'https://');
  }

  // Normalize any accidental double /files prefixes
  const normalizeFilesPath = (p: string) => p
    .replace(/\/files\/+/g, '/files/')
    .replace(/\/files\/(?:files\/)+/g, '/files/')
    .replace(/\/files\/+/g, '/files/');

  // If URL is absolute and points to our backend, return relative /files path
  try {
    if (/^https?:\/\//i.test(url)) {
      const u = new URL(url);
      const backendOrigin = new URL(config.api.baseUrl).origin;
      if (u.origin === backendOrigin) {
        let rel = u.pathname;
        // strip API prefix if present
        if (rel.startsWith('/api/v1/')) rel = rel.replace('/api/v1', '');
        rel = normalizeFilesPath(rel);
        if (rel.startsWith('/files/')) return rel;
        // if it's a plain filename path
        if (!rel.startsWith('/')) return `/files/${rel}`;
        return rel;
      }
      // External absolute URL
      return url;
    }
  } catch (_) {
    // fall through to relative handling
  }

  // Already proper relative paths
  if (url.startsWith('/files/') || url.startsWith('/images/')) {
    return normalizeFilesPath(url);
  }
  if (url.startsWith('/api/v1/files/')) {
    return normalizeFilesPath(url.replace('/api/v1', ''));
  }
  if (url.startsWith('/')) {
    return url;
  }

  // For bare filenames, prefix with /files/
  return `/files/${url}`;
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
  customerId: string;
  customerName: string;
  customerEmail: string | null; // Null if no real email (not mock email)
  customerPhone: string | null; // Phone number for contact
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  totalAmount: number; // Keep for backward compatibility
  orderDate: string;
  createdAt: string; // Alias for orderDate for frontend compatibility
  updatedAt: string;
  shippedAt: string | null;
  deliveredAt: string | null;
  estimatedDelivery: string | null;
  trackingNumber: string | null;
  shippingCarrier: string | null;
  notes: string | null;
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

// Map backend status (uppercase) to frontend status (lowercase)
const normalizeStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'PENDING': 'pending',
    'CONFIRMED': 'processing',
    'PROCESSING': 'processing',
    'SHIPPED': 'shipped',
    'DELIVERED': 'delivered',
    'CANCELLED': 'cancelled',
    'REFUNDED': 'refunded',
  };
  return statusMap[status.toUpperCase()] || status.toLowerCase();
};

export const transformOrderToDTO = (order: any): OrderDTO => {
  const orderDate = order.orderDate?.toISOString?.() || order.createdAt?.toISOString?.() || new Date().toISOString();
  
  // Get customer phone (primary identifier for guests)
  const customerPhone = order.customer?.phone || null;
  
  // Determine customer name - use real firstName/lastName from User (even for guests now)
  let customerName: string;
  if (order.customer?.user && order.customer.user.firstName) {
    // Use real name from User (works for both registered users and guests)
    const firstName = order.customer.user.firstName || '';
    const lastName = order.customer.user.lastName || '';
    customerName = `${firstName} ${lastName}`.trim();
    
    // Fallback to phone if name is still empty or just "Guest Customer"
    if (!customerName || customerName === 'Guest Customer' || customerName === 'Guest') {
      customerName = customerPhone ? `Client ${customerPhone}` : 'Guest Customer';
    }
  } else if (customerPhone) {
    // Fallback: use phone as identifier if no user data
    customerName = `Client ${customerPhone}`;
  } else {
    customerName = 'Guest Customer';
  }
  
  // Get real email (not mock email from temporary User)
  // Priority: Customer.email (real email) > User.email (if not mock)
  let customerEmail: string | null = null;
  
  // First check Customer.email (this is the real email from the form)
  if (order.customer?.email && !order.customer.email.includes('@guest.mjchauffage.com')) {
    customerEmail = order.customer.email;
  } 
  // Then check User.email only if it's not a mock email
  else if (order.customer?.user?.email && !order.customer.user.email.includes('@guest.mjchauffage.com')) {
    customerEmail = order.customer.user.email;
  }
  // Otherwise customerEmail stays null (no real email)

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerId: order.customer?.id || order.customerId || '',
    customerName,
    customerEmail, // null if no real email
    customerPhone, // Phone number for contact
    status: normalizeStatus(order.status || 'PENDING'),
    paymentStatus: order.paymentStatus || 'PENDING',
    paymentMethod: order.payments?.[0]?.method || order.payment?.method || null,
    subtotal: decimalToNumber(order.subtotal),
    tax: decimalToNumber(order.taxAmount),
    shipping: decimalToNumber(order.shippingAmount),
    discount: decimalToNumber(order.discountAmount),
    total: decimalToNumber(order.totalAmount),
    totalAmount: decimalToNumber(order.totalAmount), // Keep for backward compatibility
    orderDate,
    createdAt: orderDate, // Alias for frontend compatibility
    updatedAt: order.updatedAt?.toISOString?.() || new Date().toISOString(),
    shippedAt: order.shippedAt?.toISOString?.() || null,
    deliveredAt: order.deliveredAt?.toISOString?.() || null,
    estimatedDelivery: order.estimatedDelivery?.toISOString?.() || null,
    trackingNumber: order.trackingNumber ?? null,
    shippingCarrier: order.shippingCarrier ?? null,
    notes: order.notes ?? null,
    items: (order.items ?? []).map(transformOrderItemToDTO),
    shippingAddress: order.shippingAddress ? {
      street: order.shippingAddress.street || '',
      city: order.shippingAddress.city || '',
      postalCode: order.shippingAddress.postalCode || '',
      country: order.shippingAddress.country || 'Algeria',
      region: order.shippingAddress.region || null,
    } : null,
  };
};

export const transformOrderList = (orders: any[]): OrderDTO[] =>
  orders.map(transformOrderToDTO);
