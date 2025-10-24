console.log('🔍 DEBUG: Starting minimal server debug...');

try {
  console.log('📦 Step 1: Testing basic imports...');
  
  console.log('📦 Step 1.1: Testing express import...');
  const express = require('express');
  console.log('✅ Express imported successfully');
  
  console.log('📦 Step 1.2: Testing dotenv...');
  require('dotenv').config();
  console.log('✅ Dotenv loaded successfully');
  
  console.log('📦 Step 1.3: Testing config import...');
  const { config } = require('./src/config/environment');
  console.log('✅ Config imported successfully:', config.api.port);
  
  console.log('📦 Step 1.4: Testing database import...');
  const { prisma } = require('./src/lib/database');
  console.log('✅ Database imported successfully');
  
  console.log('📦 Step 1.5: Testing Redis import...');
  const { connectRedis } = require('./src/config/redis');
  console.log('✅ Redis imported successfully');
  
  console.log('🚀 All imports successful - creating basic server...');
  
  const app = express();
  const port = config.api.port || 3001;
  
  app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });
  
  const server = app.listen(port, () => {
    console.log(`✅ DEBUG SERVER RUNNING ON PORT ${port}`);
    console.log(`🔍 Test: http://localhost:${port}/health`);
  });
  
} catch (error) {
  console.error('❌ CRITICAL ERROR DETECTED:', error);
  console.error('❌ Stack trace:', error.stack);
  process.exit(1);
}