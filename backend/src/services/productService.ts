import { prisma } from '@/lib/database';
import { RealtimeService } from './realtimeService';
import { CacheService } from './cacheService';
import { transformProductList, transformProductToDTO } from '@/utils/dtoTransformers';
import { Prisma, Product } from '@prisma/client';

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  manufacturerId?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  inStock?: boolean;
}

interface Pagination {
  page: number;
  limit: number;
}

interface Sort {
  field: string;
  order: 'asc' | 'desc';
}

interface ProductCreateData {
  name: string;
  slug: string;
  sku: string;
  description?: string;
  shortDescription?: string;
  categoryId: string;
  manufacturerId?: string;
  price: number;
  costPrice?: number;
  salePrice?: number;
  stockQuantity: number;
  minStock?: number;
  maxStock?: number;
  weight?: number;
  dimensions?: any;
  specifications?: any;
  features?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  isDigital?: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

export class ProductService {
  /**
   * Get products with filtering, pagination, and search
   */
  static async getProducts(filters: ProductFilters, pagination: Pagination, sort: Sort) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.ProductWhereInput = {
      isActive: true,
    };

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { description: { contains: filters.search } },
        { sku: { contains: filters.search } },
      ];
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.manufacturerId) {
      where.manufacturerId = filters.manufacturerId;
    }

    if (filters.minPrice || filters.maxPrice) {
      where.price = {};
      if (filters.minPrice) where.price.gte = filters.minPrice;
      if (filters.maxPrice) where.price.lte = filters.maxPrice;
    }

    if (filters.featured) {
      where.isFeatured = true;
    }

    if (filters.inStock) {
      where.stockQuantity = { gt: 0 };
    }

    // Build orderBy
    const orderBy: Prisma.ProductOrderByWithRelationInput = {};
    orderBy[sort.field as keyof Prisma.ProductOrderByWithRelationInput] = sort.order;

    // Execute queries
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, slug: true }
          },
          manufacturer: {
            select: { id: true, name: true, slug: true }
          },
          images: {
            orderBy: { sortOrder: 'asc' },
            take: 1
          },
          reviews: {
            select: { rating: true }
          }
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    // Calculate average ratings
    const productsWithRating = products.map(product => {
      const ratings = product.reviews.map(r => r.rating);
      const averageRating = ratings.length > 0 
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
        : 0;

      const productDto = transformProductToDTO(product);

      return {
        ...productDto,
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount: ratings.length
      };
    });

    return {
      products: productsWithRating,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get product by ID or slug
   */
  static async getProductById(identifier: string, includeRelated = false) {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    
    const where = isUUID ? { id: identifier } : { slug: identifier };

    const product = await prisma.product.findUnique({
      where,
      include: {
        category: true,
        manufacturer: true,
        images: {
          orderBy: { sortOrder: 'asc' }
        },
        reviews: {
          include: {
            customer: {
              include: {
                user: {
                  select: { firstName: true, lastName: true }
                }
              }
            }
          },
          where: { isPublished: true },
          orderBy: { createdAt: 'desc' }
        }
      },
    });

    if (!product) return null;

    // Calculate average rating
    const ratings = product.reviews.map(r => r.rating);
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
      : 0;

    let relatedProducts: Product[] = [];
    if (includeRelated) {
      relatedProducts = await prisma.product.findMany({
        where: {
          categoryId: product.categoryId,
          id: { not: product.id },
          isActive: true,
        },
        include: {
          images: {
            orderBy: { sortOrder: 'asc' },
            take: 1
          }
        },
        take: 4,
      });
    }

    const productDto = transformProductToDTO(product);
    const relatedDtos = transformProductList(relatedProducts);

    return {
      ...productDto,
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount: ratings.length,
      reviews: product.reviews,
      relatedProducts: relatedDtos,
    };
  }

  /**
   * Create a new product
   */
  static async createProduct(data: ProductCreateData) {
    const product = await prisma.product.create({
      data: {
        ...data,
        features: JSON.stringify(data.features || []),
        price: data.price,
        costPrice: data.costPrice || null,
        salePrice: data.salePrice || null,
        weight: data.weight || null,
      },
      include: {
        category: true,
        manufacturer: true,
      },
    });

    // Invalidate cache
    await CacheService.invalidateProductCache();

    // Emit realtime event
    RealtimeService.notifyProductUpdate({
      type: 'product_created',
      data: {
        productId: product.id,
        product,
      },
      timestamp: new Date(),
    });

    return transformProductToDTO(product);
  }

  /**
   * Update product
   */
  static async updateProduct(id: string, data: Partial<ProductCreateData>) {
    const updateData: any = { ...data };
    
    if (data.price) updateData.price = data.price;
    if (data.costPrice) updateData.costPrice = data.costPrice;
    if (data.salePrice) updateData.salePrice = data.salePrice;
    if (data.weight) updateData.weight = data.weight;
    if (data.features && Array.isArray(data.features)) {
      updateData.features = data.features;
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        manufacturer: true,
      },
    });

    // Invalidate cache
    await CacheService.invalidateProductCache(id);

    // Emit realtime event
    RealtimeService.notifyProductUpdate({
      type: 'product_updated',
      data: {
        productId: id,
        product,
        changes: updateData,
      },
      timestamp: new Date(),
    });

    return transformProductToDTO(product);
  }

  /**
   * Delete product (soft delete by setting isActive to false)
   */
  static async deleteProduct(id: string) {
    try {
      const product = await prisma.product.update({
        where: { id },
        data: { isActive: false },
        include: {
          category: true,
          manufacturer: true,
        },
      });

      // Invalidate cache
      await CacheService.invalidateProductCache(id);

      // Emit realtime event
      RealtimeService.notifyProductUpdate({
        type: 'product_deleted',
        data: {
          productId: id,
          product,
        },
        timestamp: new Date(),
      });

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get categories with optional product count
   */
  static async getCategories(includeProducts = false) {
    return prisma.category.findMany({
      where: { isActive: true },
      include: {
        children: includeProducts,
        parent: true,
        _count: includeProducts ? { select: { products: true } } : false,
      },
      orderBy: [
        { parentId: { sort: 'asc', nulls: 'first' } },
        { sortOrder: 'asc' },
        { name: 'asc' }
      ],
    });
  }

  /**
   * Get manufacturers
   */
  static async getManufacturers() {
    return prisma.manufacturer.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { products: true } }
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Update product inventory
   */
  static async updateInventory(
    productId: string,
    quantity: number,
    type: string,
    reason?: string
  ) {
    return prisma.$transaction(async (tx) => {
      // Get current product
      const product = await tx.product.findUnique({
        where: { id: productId },
        select: { stockQuantity: true }
      });

      if (!product) return null;

      const oldQuantity = product.stockQuantity;
      let newQuantity: number;

      switch (type) {
        case 'STOCK_IN':
          newQuantity = oldQuantity + quantity;
          break;
        case 'STOCK_OUT':
          newQuantity = Math.max(0, oldQuantity - quantity);
          break;
        case 'ADJUSTMENT':
          newQuantity = quantity;
          break;
        default:
          newQuantity = oldQuantity;
      }

      // Update product stock
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { stockQuantity: newQuantity },
      });

      // Create inventory log
      await tx.inventoryLog.create({
        data: {
          productId,
          type: type as any,
          quantity: type === 'ADJUSTMENT' ? quantity - oldQuantity : quantity,
          reason: reason ?? null,
          oldQuantity,
          newQuantity,
        },
      });

      const result = {
        product: updatedProduct,
        oldQuantity,
        newQuantity,
        change: newQuantity - oldQuantity,
      };

      // Invalidate cache (after transaction)
      await CacheService.invalidateProductCache(productId);

      // Emit realtime event
      RealtimeService.notifyProductUpdate({
        type: 'inventory_updated',
        data: {
          productId,
          product: updatedProduct,
          oldQuantity,
          newQuantity,
        },
        timestamp: new Date(),
      });

      return result;
    });
  }

  /**
   * Get product reviews with pagination
   */
  static async getProductReviews(productId: string, pagination: Pagination) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: {
          productId,
          isPublished: true,
        },
        include: {
          customer: {
            include: {
              user: {
                select: { firstName: true, lastName: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({
        where: {
          productId,
          isPublished: true,
        },
      }),
    ]);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Add product review
   */
  static async addProductReview(
    productId: string,
    customerId: string,
    rating: number,
    title?: string,
    comment?: string
  ) {
    // Check if customer already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        customerId_productId: {
          customerId,
          productId,
        },
      },
    });

    if (existingReview) {
      throw new Error('Customer has already reviewed this product');
    }

    return prisma.review.create({
      data: {
        customerId,
        productId,
        rating,
        title: title ?? null,
        comment: comment ?? null,
        isVerified: false, // Would be set to true if customer purchased the product
      },
      include: {
        customer: {
          include: {
            user: {
              select: { firstName: true, lastName: true }
            }
          }
        }
      },
    });
  }

  /**
   * Get featured products
   */
  static async getFeaturedProducts(limit = 8) {
    return prisma.product.findMany({
      where: {
        isFeatured: true,
        isActive: true,
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true }
        },
        manufacturer: {
          select: { id: true, name: true, slug: true }
        },
        images: {
          orderBy: { sortOrder: 'asc' },
          take: 1
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Search products by text
   */
  static async searchProducts(query: string, limit = 10) {
    return prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
          { sku: { contains: query } },
        ],
      },
      include: {
        category: {
          select: { name: true }
        },
        images: {
          orderBy: { sortOrder: 'asc' },
          take: 1
        },
      },
      take: limit,
    });
  }

  /**
   * Get multiple products by IDs
   */
  static async getBatchProducts(productIds: string[]) {
    return prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true }
        },
        manufacturer: {
          select: { id: true, name: true, slug: true }
        },
        images: {
          orderBy: { sortOrder: 'asc' },
          take: 1
        },
      },
    });
  }
}