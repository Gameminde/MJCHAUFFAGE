import { prisma } from '@/lib/database';
import { RealtimeService } from './realtimeService';
import { logger } from '@/utils/logger';

export interface CacheEntry {
  key: string;
  value: string;
  expiresAt?: Date;
  tags?: string[];
}

export class CacheService {
  private static memoryCache = new Map<string, { value: any; expiresAt?: Date; tags?: string[] }>();
  // Configuration constants for future use
  // private static maxMemoryEntries = 1000; // Limit memory cache size
  // private static compressionThreshold = 1024; // Compress values larger than 1KB

  /**
   * Set cache entry
   */
  static async set(key: string, value: any, ttlSeconds?: number, tags?: string[]): Promise<void> {
    const expiresAt = ttlSeconds ? new Date(Date.now() + ttlSeconds * 1000) : undefined;
    const serializedValue = JSON.stringify(value);

    try {
      // Store in database
      await prisma.cacheEntry.upsert({
        where: { key },
        update: {
          value: serializedValue,
          expiresAt: expiresAt || null,
        },
        create: {
          key,
          value: serializedValue,
          expiresAt: expiresAt || null,
        },
      });

      // Store in memory cache
      const cacheEntry: { value: any; expiresAt?: Date; tags?: string[] } = { value };
      if (expiresAt) cacheEntry.expiresAt = expiresAt;
      if (tags) cacheEntry.tags = tags;
      this.memoryCache.set(key, cacheEntry);

      logger.debug(`Cache set: ${key}`);
    } catch (error) {
      logger.error(`Error setting cache for key ${key}:`, error);
    }
  }

  /**
   * Get cache entry
   */
  static async get<T = any>(key: string): Promise<T | null> {
    try {
      // Check memory cache first
      const memoryEntry = this.memoryCache.get(key);
      if (memoryEntry) {
        if (!memoryEntry.expiresAt || memoryEntry.expiresAt > new Date()) {
          logger.debug(`Cache hit (memory): ${key}`);
          return memoryEntry.value as T;
        } else {
          // Expired, remove from memory
          this.memoryCache.delete(key);
        }
      }

      // Check database cache
      const dbEntry = await prisma.cacheEntry.findUnique({
        where: { key },
      });

      if (dbEntry) {
        if (!dbEntry.expiresAt || dbEntry.expiresAt > new Date()) {
          const value = JSON.parse(dbEntry.value);
          
          // Store back in memory cache
          if (dbEntry.expiresAt) {
            this.memoryCache.set(key, { value, expiresAt: dbEntry.expiresAt });
          } else {
            this.memoryCache.set(key, { value });
          }

          logger.debug(`Cache hit (database): ${key}`);
          return value as T;
        } else {
          // Expired, remove from database
          await this.delete(key);
        }
      }

      logger.debug(`Cache miss: ${key}`);
      return null;
    } catch (error) {
      logger.error(`Error getting cache for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Delete cache entry
   */
  static async delete(key: string): Promise<void> {
    try {
      // Remove from memory
      this.memoryCache.delete(key);

      // Remove from database
      await prisma.cacheEntry.delete({
        where: { key },
      }).catch(() => {
        // Ignore if key doesn't exist
      });

      logger.debug(`Cache deleted: ${key}`);
    } catch (error) {
      logger.error(`Error deleting cache for key ${key}:`, error);
    }
  }

  /**
   * Delete multiple cache entries by pattern
   */
  static async deleteByPattern(pattern: string): Promise<void> {
    try {
      // Convert pattern to regex (simple * wildcard support)
      const regexPattern = pattern.replace(/\*/g, '.*');
      const regex = new RegExp(`^${regexPattern}$`);

      // Clear from memory cache
      const memoryKeysToDelete: string[] = [];
      for (const [key] of this.memoryCache) {
        if (regex.test(key)) {
          memoryKeysToDelete.push(key);
        }
      }
      memoryKeysToDelete.forEach(key => this.memoryCache.delete(key));

      // Clear from database
      const dbEntries = await prisma.cacheEntry.findMany({
        where: {
          key: {
            // PostgreSQL regex match
            // Note: This is a simplified approach, might need adjustment based on exact requirements
          }
        },
        select: { key: true }
      });

      const dbKeysToDelete = dbEntries
        .map(entry => entry.key)
        .filter(key => regex.test(key));

      if (dbKeysToDelete.length > 0) {
        await prisma.cacheEntry.deleteMany({
          where: {
            key: {
              in: dbKeysToDelete
            }
          }
        });
      }

      logger.debug(`Cache pattern deleted: ${pattern} (${memoryKeysToDelete.length + dbKeysToDelete.length} keys)`);

      // Notify clients about cache invalidation
      RealtimeService.invalidateCache(memoryKeysToDelete.concat(dbKeysToDelete), `Cache invalidated: ${pattern}`);
    } catch (error) {
      logger.error(`Error deleting cache by pattern ${pattern}:`, error);
    }
  }

  /**
   * Delete cache entries by tags
   */
  static async deleteByTags(tags: string[]): Promise<void> {
    try {
      const keysToDelete: string[] = [];

      // Find keys in memory cache with matching tags
      for (const [key, entry] of this.memoryCache) {
        if (entry.tags && entry.tags.some((tag: string) => tags.includes(tag))) {
          keysToDelete.push(key);
        }
      }

      // Delete from memory
      keysToDelete.forEach(key => this.memoryCache.delete(key));

      // Note: For database cache with tags, we'd need to modify the schema
      // For now, we'll use pattern-based deletion for common tag patterns

      logger.debug(`Cache tags deleted: ${tags.join(', ')} (${keysToDelete.length} keys)`);

      // Notify clients about cache invalidation
      RealtimeService.invalidateCache(keysToDelete, `Cache invalidated by tags: ${tags.join(', ')}`);
    } catch (error) {
      logger.error(`Error deleting cache by tags ${tags.join(', ')}:`, error);
    }
  }

  /**
   * Clear all cache
   */
  static async clear(): Promise<void> {
    try {
      // Clear memory cache
      const memoryKeys = Array.from(this.memoryCache.keys());
      this.memoryCache.clear();

      // Clear database cache
      await prisma.cacheEntry.deleteMany();

      logger.info(`All cache cleared (${memoryKeys.length} keys)`);

      // Notify clients about cache invalidation
      RealtimeService.invalidateCache(['*'], 'All cache cleared');
    } catch (error) {
      logger.error('Error clearing all cache:', error);
    }
  }

  /**
   * Clean expired entries
   */
  static async cleanExpired(): Promise<void> {
    try {
      const now = new Date();

      // Clean memory cache
      let memoryCleanedCount = 0;
      for (const [key, entry] of this.memoryCache) {
        if (entry.expiresAt && entry.expiresAt <= now) {
          this.memoryCache.delete(key);
          memoryCleanedCount++;
        }
      }

      // Clean database cache
      const dbResult = await prisma.cacheEntry.deleteMany({
        where: {
          expiresAt: {
            lte: now
          }
        }
      });

      logger.debug(`Expired cache cleaned: ${memoryCleanedCount} memory + ${dbResult.count} database entries`);
    } catch (error) {
      logger.error('Error cleaning expired cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  static async getStats() {
    try {
      const memoryCount = this.memoryCache.size;
      const dbCount = await prisma.cacheEntry.count();
      const expiredDbCount = await prisma.cacheEntry.count({
        where: {
          expiresAt: {
            lte: new Date()
          }
        }
      });

      return {
        memoryEntries: memoryCount,
        databaseEntries: dbCount,
        expiredEntries: expiredDbCount,
        totalEntries: memoryCount + dbCount,
      };
    } catch (error) {
      logger.error('Error getting cache stats:', error);
      return {
        memoryEntries: this.memoryCache.size,
        databaseEntries: 0,
        expiredEntries: 0,
        totalEntries: this.memoryCache.size,
      };
    }
  }

  /**
   * Cache wrapper function
   */
  static async remember<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds?: number,
    tags?: string[]
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const data = await fetcher();

    // Store in cache
    await this.set(key, data, ttlSeconds, tags);

    return data;
  }

  /**
   * Product-specific cache helpers
   */
  static async invalidateProductCache(productId?: string) {
    const patterns = [
      'products:*',
      'categories:*',
      'manufacturers:*',
      'featured_products:*'
    ];

    if (productId) {
      patterns.push(`product:${productId}:*`);
    }

    for (const pattern of patterns) {
      await this.deleteByPattern(pattern);
    }
  }

  /**
   * Order-specific cache helpers
   */
  static async invalidateOrderCache(customerId?: string, orderId?: string) {
    const patterns = ['orders:*'];

    if (customerId) {
      patterns.push(`customer:${customerId}:orders:*`);
    }

    if (orderId) {
      patterns.push(`order:${orderId}:*`);
    }

    for (const pattern of patterns) {
      await this.deleteByPattern(pattern);
    }
  }

  /**
   * Customer-specific cache helpers
   */
  static async invalidateCustomerCache(customerId?: string) {
    const patterns = ['customers:*'];

    if (customerId) {
      patterns.push(`customer:${customerId}:*`);
    }

    for (const pattern of patterns) {
      await this.deleteByPattern(pattern);
    }
  }
}