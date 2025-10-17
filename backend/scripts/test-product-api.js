const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testProductAPI() {
  console.log('🧪 Testing Product API Endpoints...\n');

  try {
    // Test 1: Get all products
    console.log('1. Testing GET /api/products');
    try {
      const response = await axios.get(`${API_BASE}/products`);
      console.log('✅ GET /products - Status:', response.status);
      console.log('   Response structure:', {
        success: response.data.success,
        hasData: !!response.data.data,
        productsCount: response.data.data?.products?.length || 0,
        hasPagination: !!response.data.data?.pagination
      });
    } catch (error) {
      console.log('❌ GET /products failed:', error.response?.status, error.response?.data?.message || error.message);
    }

    // Test 2: Get categories
    console.log('\n2. Testing GET /api/products/categories');
    try {
      const response = await axios.get(`${API_BASE}/products/categories`);
      console.log('✅ GET /products/categories - Status:', response.status);
      console.log('   Categories count:', response.data.data?.categories?.length || 0);
    } catch (error) {
      console.log('❌ GET /products/categories failed:', error.response?.status, error.response?.data?.message || error.message);
    }

    // Test 3: Get manufacturers
    console.log('\n3. Testing GET /api/products/manufacturers');
    try {
      const response = await axios.get(`${API_BASE}/products/manufacturers`);
      console.log('✅ GET /products/manufacturers - Status:', response.status);
      console.log('   Manufacturers count:', response.data.data?.manufacturers?.length || 0);
    } catch (error) {
      console.log('❌ GET /products/manufacturers failed:', error.response?.status, error.response?.data?.message || error.message);
    }

    // Test 4: Get featured products
    console.log('\n4. Testing GET /api/products/featured');
    try {
      const response = await axios.get(`${API_BASE}/products/featured`);
      console.log('✅ GET /products/featured - Status:', response.status);
      console.log('   Featured products count:', response.data.data?.products?.length || 0);
    } catch (error) {
      console.log('❌ GET /products/featured failed:', error.response?.status, error.response?.data?.message || error.message);
    }

    // Test 5: Search products
    console.log('\n5. Testing GET /api/products with search');
    try {
      const response = await axios.get(`${API_BASE}/products?search=chauffage&limit=5`);
      console.log('✅ GET /products?search=chauffage - Status:', response.status);
      console.log('   Search results count:', response.data.data?.products?.length || 0);
    } catch (error) {
      console.log('❌ GET /products with search failed:', error.response?.status, error.response?.data?.message || error.message);
    }

    console.log('\n🎉 Product API testing completed!');

  } catch (error) {
    console.error('❌ Test setup failed:', error.message);
  }
}

// Check if server is running first
async function checkServerHealth() {
  try {
    const response = await axios.get(`${API_BASE}/products`, { timeout: 5000 });
    return true;
  } catch (error) {
    console.log('⚠️  Server not responding. Please make sure the backend server is running on port 3001');
    console.log('   Run: npm run dev (in backend directory)');
    return false;
  }
}

async function main() {
  const isServerRunning = await checkServerHealth();
  if (isServerRunning) {
    await testProductAPI();
  }
}

main();