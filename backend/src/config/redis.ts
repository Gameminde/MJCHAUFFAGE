// Simplified Redis client for development (no Redis server required)
// In production, replace with actual Redis implementation

class MockRedisClient {
  private cache = new Map<string, any>();
  private lists = new Map<string, any[]>();
  private hashes = new Map<string, Map<string, any>>();

  async connect() {
    console.log('Mock Redis client connected');
  }

  async disconnect() {
    console.log('Mock Redis client disconnected');
  }

  async quit() {
    this.cache.clear();
    this.lists.clear();
    this.hashes.clear();
  }

  async get(key: string) {
    return this.cache.get(key) || null;
  }

  async set(key: string, value: any, _options?: any) {
    this.cache.set(key, value);
    return 'OK';
  }

  async setEx(key: string, seconds: number, value: any) {
    this.cache.set(key, value);
    // Simple implementation - in production use proper TTL
    setTimeout(() => {
      this.cache.delete(key);
    }, seconds * 1000);
    return 'OK';
  }

  async del(key: string) {
    const deleted = this.cache.delete(key) ? 1 : 0;
    this.lists.delete(key);
    this.hashes.delete(key);
    return deleted;
  }

  async exists(key: string) {
    return this.cache.has(key) || this.lists.has(key) || this.hashes.has(key) ? 1 : 0;
  }

  async expire(key: string, seconds: number) {
    // Simple implementation - in production use proper TTL
    setTimeout(() => {
      this.cache.delete(key);
      this.lists.delete(key);
      this.hashes.delete(key);
    }, seconds * 1000);
    return 1;
  }

  async flushAll() {
    this.cache.clear();
    this.lists.clear();
    this.hashes.clear();
    return 'OK';
  }

  // List operations
  async lPush(key: string, ...values: any[]) {
    if (!this.lists.has(key)) {
      this.lists.set(key, []);
    }
    const list = this.lists.get(key)!;
    list.unshift(...values);
    return list.length;
  }

  async lRange(key: string, start: number, stop: number) {
    const list = this.lists.get(key) || [];
    if (stop === -1) {
      return list.slice(start);
    }
    return list.slice(start, stop + 1);
  }

  async lTrim(key: string, start: number, stop: number) {
    const list = this.lists.get(key);
    if (list) {
      const trimmed = list.slice(start, stop + 1);
      this.lists.set(key, trimmed);
    }
    return 'OK';
  }

  // Hash operations
  async hSet(key: string, field: string, value: any) {
    if (!this.hashes.has(key)) {
      this.hashes.set(key, new Map());
    }
    const hash = this.hashes.get(key)!;
    hash.set(field, value);
    return 1;
  }

  async hGet(key: string, field: string) {
    const hash = this.hashes.get(key);
    return hash ? hash.get(field) || null : null;
  }

  async hKeys(key: string) {
    const hash = this.hashes.get(key);
    return hash ? Array.from(hash.keys()) : [];
  }

  async keys(pattern: string) {
    const allKeys = [
      ...this.cache.keys(),
      ...this.lists.keys(),
      ...this.hashes.keys()
    ];
    
    if (pattern === '*') {
      return allKeys;
    }
    
    // Simple pattern matching for blocked_ip:*
    if (pattern.endsWith('*')) {
      const prefix = pattern.slice(0, -1);
      return allKeys.filter(key => key.startsWith(prefix));
    }
    
    return allKeys.filter(key => key === pattern);
  }
}

const redisClient = new MockRedisClient();

// Connect to Redis (mock)
export async function connectRedis() {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('Redis connection failed:', error);
  }
}

export { redisClient };