import { Prisma } from '@prisma/client';
import { CacheService } from '@/services/cacheService';
import { logger } from '@/utils/logger';

interface QueryOptions {
  cache?: {
    key: string;
    ttl?: number;
    tags?: string[];
  };
  timeout?: number;
  retries?: number;
}

export class QueryOptimizer {
  /**
   * Execute a Prisma query with caching and optimization
   */
  static async execute<T>(
    queryFn: () => Promise<T>,
    options: QueryOptions = {}
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      // Check cache first if caching is enabled
      if (options.cache) {
        const cached = await CacheService.get<T>(options.cache.key);
        if (cached !== null) {
          const duration = Date.now() - startTime;
          logger.debug(`Query cache hit: ${options.cache.key} (${duration}ms)`);
          return cached;
        }
      }

      // Execute query with timeout
      const result = await this.executeWithTimeout(queryFn, options.timeout || 30000);
      
      const duration = Date.now() - startTime;
      
      // Log slow queries
      if (duration > 1000) {
        logger.warn(`Slow query detected: ${duration}ms`);
      }
      
      // Cache result if caching is enabled
      if (options.cache) {
        await CacheService.set(
          options.cache.key,
          result,
          options.cache.ttl,
          options.cache.tags
        );
      }
      
      logger.debug(`Query executed: ${duration}ms`);
      return result;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`Query failed after ${duration}ms:`, error);
      
      // Retry logic
      if (options.retries && options.retries > 0) {
        logger.info(`Retrying query (${options.retries} attempts left)`);
        return this.execute(queryFn, { ...options, retries: options.retries - 1 });
      }
      
      throw error;
    }
  }

  /**
   * Execute query with timeout
   */
  private static async executeWithTimeout<T>(
    queryFn: () => Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return Promise.race([
      queryFn(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Query timeout after ${timeoutMs}ms`)), timeoutMs)
      ),
    ]);
  }

  /**
   * Optimized product queries
   */
  static async getProducts(filters: {
    categoryId?: string;
    search?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
    sortBy?: 'name' | 'price' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    const cacheKey = `products:${JSON.stringify(filters)}`;
    
    return this.execute(
      async () => {
        const where: Prisma.ProductWhereInput = {};
        
        if (filters.categoryId) {
          where.categoryId = filters.categoryId;
        }
        
        if (filters.search) {
          where.OR = [
            { name: { contains: filters.search } },
            { description: { contains: filters.search } },
            { shortDescription: { contains: filters.search } },
          ];
        }
        
        if (filters.featured !== undefined) {
          where.isFeatured = filters.featured;
        }

        const orderBy: Prisma.ProductOrderByWithRelationInput = {};
        if (filters.sortBy) {
          orderBy[filters.sortBy] = filters.sortOrder || 'asc';
        } else {
          orderBy.createdAt = 'desc';
        }

        // Use optimized query with selected fields only
        const products = await prisma.product.findMany({
          where,
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            salePrice: true,
            shortDescription: true,
            stockQuantity: true,
            isFeatured: true,
            images: {
              select: {
                id: true,
                url: true,
                altText: true,
              },
              take: 1, // Only get first image for listing
            },
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            _count: {
              select: {
                reviews: true,
              },
            },
          },
          orderBy,
          take: filters.limit || 20,
          skip: filters.offset || 0,
        });

        return products;
      },
      {
        cache: {
          key: cacheKey,
          ttl: 300, // 5 minutes
          tags: ['products', 'categories'],
        },
        timeout: 5000,
        retries: 2,
      }
    );
  }

  /**
   * Optimized single product query
   */
  static async getProduct(slug: string) {
    const cacheKey = `product:${slug}`;
    
    return this.execute(
      async () => {
        const product = await prisma.product.findUnique({
          where: { slug },
          include: {
            images: {
              orderBy: { sortOrder: 'asc' },
            },
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            reviews: {
              include: {
                customer: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
              take: 10,
            },
            _count: {
              select: {
                reviews: true,
              },
            },
          },
        });

        if (!product) {
          throw new Error('Product not found');
        }

        // Calculate average rating
        const avgRating = await prisma.review.aggregate({
          where: { productId: product.id },
          _avg: { rating: true },
        });

        return {
          ...product,
          averageRating: avgRating._avg.rating || 0,
        };
      },
      {
        cache: {
          key: cacheKey,
          ttl: 600, // 10 minutes
          tags: ['products', `product:${slug}`],
        },
        timeout: 5000,
        retries: 2,
      }
    );
  }

  /**
   * Optimized categories query
   */
  static async getCategories() {
    const cacheKey = 'categories:all';
    
    return this.execute(
      async () => {
        return prisma.category.findMany({
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            image: true,
            _count: {
              select: {
                products: {
                  where: {
                    stockQuantity: { gt: 0 }, // Only count products in stock
                  },
                },
              },
            },
          },
          orderBy: { sortOrder: 'asc' },
        });
      },
      {
        cache: {
          key: cacheKey,
          ttl: 1800, // 30 minutes
          tags: ['categories'],
        },
        timeout: 3000,
        retries: 2,
      }
    );
  }

  /**
   * Optimized orders query for customer
   */
  static async getCustomerOrders(customerId: string, limit = 10, offset = 0) {
    const cacheKey = `customer:${customerId}:orders:${limit}:${offset}`;
    
    return this.execute(
      async () => {
        return prisma.order.findMany({
          where: { customerId },
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalAmount: true,
            createdAt: true,
            items: {
              select: {
                id: true,
                quantity: true,
                unitPrice: true,
                product: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    images: {
                      select: { url: true },
                      take: 1,
                    },
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        });
      },
      {
        cache: {
          key: cacheKey,
          ttl: 300, // 5 minutes
          tags: ['orders', `customer:${customerId}`],
        },
        timeout: 5000,
        retries: 2,
      }
    );
  }

  /**
   * Batch operations for better performance
   */
  static async batchUpdateProductStock(updates: { id: string; quantity: number }[]) {
    const startTime = Date.now();
    
    try {
      // Use transaction for consistency
      const result = await prisma.$transaction(
        updates.map(update =>
          prisma.product.update({
            where: { id: update.id },
            data: { stockQuantity: update.quantity },
            select: { id: true, stockQuantity: true },
          })
        )
      );
      
      // Invalidate related cache
      await CacheService.invalidateProductCache();
      
      const duration = Date.now() - startTime;
      logger.info(`Batch stock update completed: ${updates.length} products in ${duration}ms`);
      
      return result;
    } catch (error) {
      logger.error('Batch stock update failed:', error);
      throw error;
    }
  }
}

// Import prisma instance
import { prisma } from '@/lib/database';