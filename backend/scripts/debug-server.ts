import 'dotenv/config';

console.log('🔍 DEBUG: Starting server debug...');

async function debugServer() {
  try {
    console.log('🔍 DEBUG: Loading environment...');
    const { config } = await import('./src/config/environment');
    console.log('✅ Environment loaded successfully');
    console.log('🔍 DEBUG: Environment vars count:', Object.keys(process.env).length);
    
    console.log('🔍 DEBUG: Loading database...');
    const { prisma } = await import('./src/lib/database');
    console.log('✅ Database client loaded');
    
    console.log('🔍 DEBUG: Loading Redis...');
    const { connectRedis } = await import('./src/config/redis');
    console.log('✅ Redis config loaded');
    
    console.log('🔍 DEBUG: Loading Express...');
    const express = await import('express');
    const app = express.default();
    console.log('✅ Express loaded');
    
    console.log('🔍 DEBUG: Loading middlewares...');
    const { applySecurity } = await import('./src/middleware/security');
    console.log('✅ Security middleware loaded');
    
    console.log('🔍 DEBUG: Loading routes...');
    const authRoutes = await import('./src/routes/auth');
    console.log('✅ Auth routes loaded');
    
    console.log('🔍 DEBUG: Starting server...');
    const server = app.listen(3001, () => {
      console.log('🚀 DEBUG SERVER STARTED SUCCESSFULLY ON PORT 3001');
    });
    
    // Keep server running
    process.on('SIGTERM', () => {
      console.log('🔍 DEBUG: Received SIGTERM, shutting down...');
      server.close();
    });
    
  } catch (error: any) {
    console.error('❌ DEBUG ERROR:', error);
    console.error('❌ DEBUG STACK:', error.stack);
    process.exit(1);
  }
}

debugServer();