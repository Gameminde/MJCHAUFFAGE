import { connectRedis } from './src/config/redis';

async function testRedis() {
  try {
    console.log('Testing Redis connection...');
    await connectRedis();
    console.log('✅ Redis connection successful');
    process.exit(0);
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    process.exit(1);
  }
}

testRedis();