console.log('🔍 DEBUG: Starting JavaScript server debug...');

try {
  console.log('📦 Step 1: Testing basic imports...');
  
  console.log('📦 Step 1.1: Testing express import...');
  const express = require('express');
  console.log('✅ Express imported successfully');
  
  console.log('📦 Step 1.2: Testing dotenv...');
  require('dotenv').config();
  console.log('✅ Dotenv loaded successfully');
  
  console.log('🚀 Creating basic server...');
  
  const app = express();
  const port = process.env.PORT || 3001;
  
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      message: 'Backend server is running successfully!'
    });
  });
  
  const server = app.listen(port, () => {
    console.log(`✅ DEBUG SERVER RUNNING ON PORT ${port}`);
    console.log(`🔍 Test: http://localhost:${port}/health`);
    console.log('🎉 SERVER STARTED SUCCESSFULLY!');
  });
  
} catch (error) {
  console.error('❌ CRITICAL ERROR DETECTED:', error);
  console.error('❌ Stack trace:', error.stack);
  process.exit(1);
}