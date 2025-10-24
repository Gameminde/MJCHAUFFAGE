import 'dotenv/config';

console.log('🔍 Testing server startup step by step...');

async function testServerStartup() {
  try {
    console.log('1. Loading imports...');
    const express = await import('express');
    const { config } = await import('./src/config/environment');
    const { prisma } = await import('./src/lib/database');
    const { connectRedis, redisClient } = await import('./src/config/redis');
    console.log('✅ All imports loaded');

    console.log('2. Creating Express app...');
    const app = express.default();
    console.log('✅ Express app created');

    console.log('3. Testing database connection...');
    // Test simple de connexion
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connected');

    console.log('4. Testing Redis connection...');
    await connectRedis();
    console.log('✅ Redis connected');

    console.log('5. Getting port configuration...');
    const port = config.api.port || 3001;
    console.log(`✅ Port configured: ${port}`);

    console.log('6. Creating HTTP server...');
    const { createServer } = await import('http');
    const server = createServer(app);
    console.log('✅ HTTP server created');

    console.log('7. Starting server...');
    const serverInstance = server.listen(port, () => {
      console.log(`🎉 SERVER STARTED SUCCESSFULLY on port ${port}`);
      console.log('✅ All steps completed without error');
      
      // Cleanup
      setTimeout(() => {
        console.log('🔄 Shutting down test server...');
        serverInstance.close();
        prisma.$disconnect();
        redisClient.quit();
        process.exit(0);
      }, 2000);
    });

    serverInstance.on('error', (error) => {
      console.error('❌ Server error:', error);
      process.exit(1);
    });

  } catch (error: any) {
    console.error('❌ STARTUP FAILED at step:', error.message);
    console.error('❌ STACK:', error.stack);
    process.exit(1);
  }
}

testServerStartup();