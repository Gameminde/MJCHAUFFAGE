import { createClient } from 'redis';
import { config } from './environment';

const redisClient = createClient({
  url: config.redis.url,
  socket: {
    host: config.redis.host,
    port: config.redis.port,
    reconnectStrategy: (retries) => Math.min(retries * 50, 500),
  },
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redisClient.on('disconnect', () => {
  console.log('🔌 Redis disconnected');
});

// Connect to Redis
export async function connectRedis() {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    // Don't exit process for Redis connection failure in development
    if (config.env === 'production') {
      process.exit(1);
    }
  }
}

export { redisClient };