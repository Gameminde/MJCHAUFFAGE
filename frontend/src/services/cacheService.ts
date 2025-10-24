interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

class CacheService {
  private cache = new Map<string, CacheItem<any>>()
  private defaultTTL = 5 * 60 * 1000 // 5 minutes

  // Set cache item with TTL
  set<T>(key: string, data: T, ttl?: number): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    }
    this.cache.set(key, item)
  }

  // Get cache item if not expired
  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    const now = Date.now()
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data as T
  }

  // Check if key exists and is not expired
  has(key: string): boolean {
    return this.get(key) !== null
  }

  // Delete cache item
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  // Clear all cache
  clear(): void {
    this.cache.clear()
  }

  // Clear expired items
  clearExpired(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }

  // Cached fetch function
  async cachedFetch<T>(
    key: string, 
    fetchFn: () => Promise<T>, 
    ttl?: number
  ): Promise<T> {
    // Check cache first
    const cached = this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    // Fetch and cache
    try {
      const data = await fetchFn()
      this.set(key, data, ttl)
      return data
    } catch (error) {
      // Don't cache errors
      throw error
    }
  }

  // Invalidate cache by pattern
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  // Preload cache with data
  preload<T>(entries: Array<{ key: string; data: T; ttl?: number }>): void {
    entries.forEach(({ key, data, ttl }) => {
      this.set(key, data, ttl)
    })
  }
}

// Create singleton instance
const cacheService = new CacheService()

// Auto-cleanup expired items every 5 minutes
setInterval(() => {
  cacheService.clearExpired()
}, 5 * 60 * 1000)

export default cacheService

// Specialized cache functions for common use cases
export const productCache = {
  getProducts: () => cacheService.get<any[]>('products:all'),
  setProducts: (products: any[]) => cacheService.set('products:all', products, 10 * 60 * 1000), // 10 min
  
  getProduct: (id: string) => cacheService.get<any>(`product:${id}`),
  setProduct: (id: string, product: any) => cacheService.set(`product:${id}`, product, 15 * 60 * 1000), // 15 min
  
  getCategories: () => cacheService.get<any[]>('categories:all'),
  setCategories: (categories: any[]) => cacheService.set('categories:all', categories, 30 * 60 * 1000), // 30 min
  
  invalidateProduct: (id: string) => {
    cacheService.delete(`product:${id}`)
    cacheService.delete('products:all')
  },
  
  invalidateAll: () => {
    cacheService.invalidatePattern('^product')
    cacheService.delete('categories:all')
  }
}

export const analyticsCache = {
  getDashboard: (timeframe: string) => cacheService.get<any>(`analytics:dashboard:${timeframe}`),
  setDashboard: (timeframe: string, data: any) => cacheService.set(`analytics:dashboard:${timeframe}`, data, 2 * 60 * 1000), // 2 min
  
  getTrafficSources: () => cacheService.get<any[]>('analytics:traffic-sources'),
  setTrafficSources: (data: any[]) => cacheService.set('analytics:traffic-sources', data, 5 * 60 * 1000), // 5 min
  
  invalidateAll: () => {
    cacheService.invalidatePattern('^analytics')
  }
}

export const orderCache = {
  getOrders: () => cacheService.get<any[]>('orders:all'),
  setOrders: (orders: any[]) => cacheService.set('orders:all', orders, 3 * 60 * 1000), // 3 min
  
  getOrder: (id: string) => cacheService.get<any>(`order:${id}`),
  setOrder: (id: string, order: any) => cacheService.set(`order:${id}`, order, 5 * 60 * 1000), // 5 min
  
  invalidateOrder: (id: string) => {
    cacheService.delete(`order:${id}`)
    cacheService.delete('orders:all')
  },
  
  invalidateAll: () => {
    cacheService.invalidatePattern('^order')
  }
}