// backend/src/utils/dtoTransformers.ts - CONTRACT ALIGNMENT

import { Prisma } from '@prisma/client';

// ========================================
// TYPE GUARDS
// ========================================

export function isDecimal(value: any): value is Prisma.Decimal {
  return value && typeof value === 'object' && 'd' in value && 'e' in value && 's' in value;
}

// ========================================
// DECIMAL CONVERSION
// ========================================

/**
 * Convert Prisma Decimal to JavaScript number
 * Handles null, undefined, and already-converted numbers
 */
export function decimalToNumber(value: Prisma.Decimal | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (isDecimal(value)) return parseFloat(value.toString());
  return 0;
}

/**
 * Convert multiple Decimal fields in an object
 */
export function convertDecimalFields<T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const result = { ...obj };
  fields.forEach(field => {
    if (field in result) {
      result[field] = decimalToNumber(result[field] as any) as any;
    }
  });
  return result;
}

// ========================================
// PRODUCT DTOs
// ========================================

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
  minStock: number;
  maxStock: number | null;
  weight: number | null;
  isActive: boolean;
  isFeatured: boolean;
  categoryId: string;
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
  specifications: Record<string, any> | null;
  features: string | null;
  dimensions: Record<string, any> | null;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

export function transformProductToDTO(product: any): ProductDTO {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description: product.description,
    shortDescription: product.shortDescription,
    price: decimalToNumber(product.price),
    costPrice: decimalToNumber(product.costPrice),
    salePrice: decimalToNumber(product.salePrice),
    stockQuantity: product.stockQuantity,
    minStock: product.minStock || 10,
    maxStock: product.maxStock,
    weight: decimalToNumber(product.weight),
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    categoryId: product.categoryId,
    category: product.category ? {
      id: product.category.id,
      name: product.category.name,
      slug: product.category.slug
    } : undefined,
    manufacturerId: product.manufacturerId,
    manufacturer: product.manufacturer ? {
      id: product.manufacturer.id,
      name: product.manufacturer.name,
      slug: product.manufacturer.slug
    } : null,
    images: (product.images || []).map((img: any) => ({
      id: img.id,
      url: img.url,
      altText: img.altText,
      sortOrder: img.sortOrder
    })),
    specifications: product.specifications as Record<string, any> | null,
    features: product.features,
    dimensions: product.dimensions as Record<string, any> | null,
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString()
  };
}

// ========================================
// ORDER DTOs
// ========================================

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
    phone: string | null;
  };
  items: OrderItemDTO[];
  shippingAddress: any;
  billingAddress: any;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemDTO {
  id: string;
  productId: string;
  productName: string;
  productSku: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  image: string | null;
}

export function transformOrderToDTO(order: any): OrderDTO {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus || 'PENDING',
    paymentMethod: order.payments?.[0]?.method || order.payment?.method || null,
    subtotal: decimalToNumber(order.subtotal),
    taxAmount: decimalToNumber(order.taxAmount),
    shippingAmount: decimalToNumber(order.shippingAmount),
    discountAmount: decimalToNumber(order.discountAmount),
    totalAmount: decimalToNumber(order.totalAmount),
    orderDate: order.orderDate?.toISOString() || order.createdAt.toISOString(),
    shippedAt: order.shippedAt?.toISOString() || null,
    deliveredAt: order.deliveredAt?.toISOString() || null,
    estimatedDelivery: order.estimatedDelivery?.toISOString() || null,
    trackingNumber: order.trackingNumber,
    shippingCarrier: order.shippingCarrier,
    notes: order.notes,
    customer: {
      id: order.customer?.id || order.customerId,
      name: order.customer?.user 
        ? `${order.customer.user.firstName} ${order.customer.user.lastName}`
        : order.customer?.firstName && order.customer?.lastName
        ? `${order.customer.firstName} ${order.customer.lastName}`
        : 'Guest Customer',
      email: order.customer?.user?.email || order.customer?.email || 'N/A',
      phone: order.customer?.user?.phone || order.customer?.phone || null
    },
    items: (order.items || []).map((item: any) => transformOrderItemToDTO(item)),
    shippingAddress: order.shippingAddress || {},
    billingAddress: order.billingAddress || {},
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString()
  };
}

export function transformOrderItemToDTO(item: any): OrderItemDTO {
  return {
    id: item.id,
    productId: item.productId,
    productName: item.product?.name || 'Unknown Product',
    productSku: item.product?.sku || null,
    quantity: item.quantity,
    unitPrice: decimalToNumber(item.unitPrice),
    totalPrice: decimalToNumber(item.totalPrice),
    image: item.product?.images?.[0]?.url || null
  };
}

// ========================================
// CUSTOMER DTOs
// ========================================

export interface CustomerDTO {
  id: string;
  userId: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  companyName: string | null;
  customerType: string;
  vatNumber: string | null;
  isGuest: boolean;
  totalSpent: number;
  orderCount: number;
  lastOrderAt: string | null;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    avatar: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export function transformCustomerToDTO(customer: any): CustomerDTO {
  return {
    id: customer.id,
    userId: customer.userId,
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email,
    phone: customer.phone,
    companyName: customer.companyName,
    customerType: customer.customerType,
    vatNumber: customer.vatNumber,
    isGuest: customer.isGuest,
    totalSpent: decimalToNumber(customer.totalSpent),
    orderCount: customer.orderCount,
    lastOrderAt: customer.lastOrderAt?.toISOString() || null,
    user: customer.user ? {
      id: customer.user.id,
      email: customer.user.email,
      firstName: customer.user.firstName,
      lastName: customer.user.lastName,
      phone: customer.user.phone,
      avatar: customer.user.avatar
    } : null,
    createdAt: customer.createdAt.toISOString(),
    updatedAt: customer.updatedAt.toISOString()
  };
}

// ========================================
// CATEGORY DTOs
// ========================================

export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  isActive: boolean;
  sortOrder: number;
  productCount?: number;
  children?: CategoryDTO[];
  parent?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export function transformCategoryToDTO(category: any): CategoryDTO {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    image: category.image,
    parentId: category.parentId,
    isActive: category.isActive,
    sortOrder: category.sortOrder,
    productCount: category._count?.products || undefined,
    children: category.children?.map(transformCategoryToDTO) || undefined,
    parent: category.parent ? {
      id: category.parent.id,
      name: category.parent.name,
      slug: category.parent.slug
    } : null,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString()
  };
}

// ========================================
// USER DTOs
// ========================================

export interface UserDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatar: string | null;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function transformUserToDTO(user: any): UserDTO {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    avatar: user.avatar,
    role: user.role,
    isActive: user.isActive,
    isVerified: user.isVerified || false,
    lastLoginAt: user.lastLoginAt?.toISOString() || null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString()
  };
}

// ========================================
// ANALYTICS DTOs
// ========================================

export interface DashboardStatsDTO {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
}

export interface RevenueDataPointDTO {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProductDTO {
  id: string;
  name: string;
  revenue: number;
  quantity: number;
  image: string | null;
}

// ========================================
// BULK TRANSFORMERS
// ========================================

export function transformProductList(products: any[]): ProductDTO[] {
  return products.map(transformProductToDTO);
}

export function transformOrderList(orders: any[]): OrderDTO[] {
  return orders.map(transformOrderToDTO);
}

export function transformCustomerList(customers: any[]): CustomerDTO[] {
  return customers.map(transformCustomerToDTO);
}

export function transformCategoryList(categories: any[]): CategoryDTO[] {
  return categories.map(transformCategoryToDTO);
}

export function transformUserList(users: any[]): UserDTO[] {
  return users.map(transformUserToDTO);
}
