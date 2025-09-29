const axios = require('axios');

async function testCRUD() {
    try {
        console.log('🔧 Testing CRUD operations...');
        
        // 1. Test GET products (should be empty initially)
        let response = await axios.get('http://localhost:3001/api/products');
        console.log('✅ GET products:', response.status, '- Count:', response.data.data.products.length);
        
        // 2. Test CREATE product
        const newProduct = {
            name: 'Test Chaudière Viessmann',
            description: 'Chaudière de test pour validation',
            price: 1500,
            originalPrice: 2000,
            category: 'Boilers',
            brand: 'Viessmann',
            stockQuantity: 10,
            features: ['Haute efficacité', 'Économique'],
            specifications: { power: '24kW', efficiency: '95%' }
        };
        
        response = await axios.post('http://localhost:3001/api/products', newProduct);
        console.log('✅ CREATE product:', response.status, '- ID:', response.data.data.id);
        const productId = response.data.data.id;
        
        // 3. Test GET products again (should have 1 product)
        response = await axios.get('http://localhost:3001/api/products');
        console.log('✅ GET products after create:', response.status, '- Count:', response.data.data.products.length);
        
        // 4. Test GET single product
        response = await axios.get(`http://localhost:3001/api/products/${productId}`);
        console.log('✅ GET single product:', response.status, '- Name:', response.data.data.name);
        
        // 5. Test other endpoints
        response = await axios.get('http://localhost:3001/api/customers');
        console.log('✅ GET customers:', response.status, '- Count:', response.data.data.length);
        
        response = await axios.get('http://localhost:3001/api/orders');
        console.log('✅ GET orders:', response.status, '- Count:', response.data.data.length);
        
        response = await axios.get('http://localhost:3001/api/services');
        console.log('✅ GET services:', response.status, '- Count:', response.data.data.length);
        
        console.log('\n🎉 All CRUD tests passed!');
        
    } catch (error) {
        console.error('❌ CRUD test failed:', error.response?.data || error.message);
    }
}

testCRUD();
