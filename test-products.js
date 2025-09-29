const axios = require('axios');

async function testProducts() {
    try {
        console.log('📦 Testing products API...');
        
        // Test get products
        const productsResponse = await axios.get('http://localhost:3001/api/products');
        console.log('✅ Products API accessible:', productsResponse.status);
        console.log('📊 Products count:', productsResponse.data.length || 'No data');
        
        // Test categories
        const categoriesResponse = await axios.get('http://localhost:3001/api/categories');
        console.log('✅ Categories API accessible:', categoriesResponse.status);
        console.log('📊 Categories count:', categoriesResponse.data.length || 'No data');
        
        // Test manufacturers
        const manufacturersResponse = await axios.get('http://localhost:3001/api/manufacturers');
        console.log('✅ Manufacturers API accessible:', manufacturersResponse.status);
        console.log('📊 Manufacturers count:', manufacturersResponse.data.length || 'No data');
        
    } catch (error) {
        console.error('❌ Products test failed:', error.response?.data || error.message);
    }
}

testProducts();
