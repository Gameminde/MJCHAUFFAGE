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
  images?: string[];  // Add images support
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
   * Get all products without pagination (for admin/export)
   */
  static async getAllProducts() {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        manufacturer: true,
        images: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return transformProductList(products);
  }

  /**
   * Get product by ID with optional related products
   */
  static async getProductById(id: string, includeRelated = false) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        manufacturer: true,
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        reviews: {
          select: { rating: true }
        }
      },
    });

    if (!product) return null;

    // Calculate average rating
    const ratings = product.reviews.map(r => r.rating);
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
      : 0;

    // Get related products if requested
    let relatedProducts: Product[] = [];
    if (includeRelated && product.categoryId) {
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
      relatedProducts: relatedDtos
    };
  }

  /**
   * Create new product with images
   */
  static async createProduct(data: ProductCreateData) {
    console.log('📦 ProductService.createProduct appelé avec:', data);
    
    // Extract images from data if present
    const { images, ...productData } = data;
    
    const product = await prisma.product.create({
      data: {
        ...productData,
        // features is already a string from frontend, or convert array to string
        features: typeof productData.features === 'string' ? productData.features : (productData.features || []).join(','),
        // specifications is already a JSON string from frontend, or convert object to string
        specifications: typeof productData.specifications === 'string' ? productData.specifications : JSON.stringify(productData.specifications || {}),
        price: productData.price,
        costPrice: productData.costPrice || null,
        salePrice: productData.salePrice || null,
        weight: productData.weight || null,
        // Create images if provided
        images: images && images.length > 0 ? {
          create: images.map((url, index) => ({
            url,
            altText: productData.name,
            sortOrder: index + 1
          }))
        } : undefined
      },
      include: {
        category: true,
        manufacturer: true,
        images: true,
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
   * Update product with images
   */
  static async updateProduct(id: string, data: Partial<ProductCreateData>) {
    const { images, ...updateData } = data;
    
    // Format data properly
    if (data.features) {
      updateData.features = typeof data.features === 'string' ? data.features : data.features.join(',');
    }
    if (data.specifications) {
      updateData.specifications = typeof data.specifications === 'string' ? data.specifications : JSON.stringify(data.specifications);
    }
    
    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        manufacturer: true,
        images: true,
      },
    });

    // Update images if provided
    if (images !== undefined) {
      // Delete existing images
      await prisma.productImage.deleteMany({
        where: { productId: id }
      });
      
      // Create new images
      if (images.length > 0) {
        await prisma.productImage.createMany({
          data: images.map((url, index) => ({
            productId: id,
            url,
            altText: product.name,
            sortOrder: index + 1
          }))
        });
      }
    }

    // Get updated product with images
    const updatedProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        manufacturer: true,
        images: true,
      }
    });

    // Invalidate cache
    await CacheService.invalidateProductCache(id);

    // Emit realtime event
    RealtimeService.notifyProductUpdate({
      type: 'product_updated',
      data: {
        productId: id,
        product: updatedProduct,
        changes: updateData,
      },
      timestamp: new Date(),
    });

    return transformProductToDTO(updatedProduct!);
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
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Update product stock
   */
  static async updateStock(id: string, quantity: number, operation: 'increase' | 'decrease' | 'set') {
    const product = await prisma.product.findUnique({
      where: { id },
      select: { stockQuantity: true },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    let newQuantity: number;
    switch (operation) {
      case 'increase':
        newQuantity = product.stockQuantity + quantity;
        break;
      case 'decrease':
        newQuantity = Math.max(0, product.stockQuantity - quantity);
        break;
      case 'set':
        newQuantity = Math.max(0, quantity);
        break;
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { stockQuantity: newQuantity },
    });

    // Check if stock is low
    if (updatedProduct.minStock && updatedProduct.stockQuantity <= updatedProduct.minStock) {
      // TODO: Send low stock notification
      console.log(`Low stock alert for product ${updatedProduct.name}: ${updatedProduct.stockQuantity} units remaining`);
    }

    // Invalidate cache
    await CacheService.invalidateProductCache(id);

    return transformProductToDTO(updatedProduct);
  }

  /**
   * Bulk update product prices
   */
  static async bulkUpdatePrices(updates: { id: string; price?: number; salePrice?: number }[]) {
    const results = await Promise.all(
      updates.map(update =>
        prisma.product.update({
          where: { id: update.id },
          data: {
            price: update.price,
            salePrice: update.salePrice,
          },
        })
      )
    );

    // Invalidate cache for all updated products
    await Promise.all(updates.map(update => CacheService.invalidateProductCache(update.id)));

    return results.map(transformProductToDTO);
  }

  /**
   * Search products
   */
  static async searchProducts(query: string, limit = 10) {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
          { sku: { contains: query } },
        ],
      },
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: 'asc' },
          take: 1,
        },
      },
      take: limit,
    });

    return transformProductList(products);
  }

  /**
   * Get featured products
   */
  static async getFeaturedProducts(limit = 8) {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        isFeatured: true,
        stockQuantity: { gt: 0 },
      },
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: 'asc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return transformProductList(products);
  }

  /**
   * Get products by category
   */
  static async getProductsByCategory(categoryId: string, limit = 20) {
    const products = await prisma.product.findMany({
      where: {
        categoryId,
        isActive: true,
      },
      include: {
        category: true,
        manufacturer: true,
        images: {
          orderBy: { sortOrder: 'asc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return transformProductList(products);
  }

  /**
   * Get product availability
   */
  static async checkAvailability(productIds: string[]) {
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
      select: {
        id: true,
        stockQuantity: true,
        minStock: true,
        maxStock: true,
      },
    });

    return products.map(product => ({
      id: product.id,
      available: product.stockQuantity > 0,
      stockQuantity: product.stockQuantity,
      lowStock: product.minStock ? product.stockQuantity <= product.minStock : false,
    }));
  }

  /**
   * Get product stats
   */
  static async getProductStats() {
    const [total, active, featured, outOfStock, lowStock] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({ where: { isFeatured: true } }),
      prisma.product.count({ where: { stockQuantity: 0 } }),
      prisma.product.count({
        where: {
          AND: [
            { stockQuantity: { gt: 0 } },
            { minStock: { not: null } },
            { stockQuantity: { lte: prisma.product.fields.minStock } },
          ],
        },
      }),
    ]);

    return {
      total,
      active,
      featured,
      outOfStock,
      lowStock,
    };
  }
}