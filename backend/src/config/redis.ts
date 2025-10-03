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

redisClient.on('error', () => {});

redisClient.on('connect', () => {});

redisClient.on('disconnect', () => {});

// Connect to Redis
export async function connectRedis() {
  try {
    await redisClient.connect();
  } catch (error) {
    // Don't exit process for Redis connection failure in development
    if (config.env === 'production') {
      process.exit(1);
    }
  }
}

export { redisClient };