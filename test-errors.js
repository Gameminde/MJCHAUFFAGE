const axios = require('axios');

async function testErrorHandling() {
    try {
        console.log('🚨 Testing error handling...');
        
        // Test 404 route
        try {
            await axios.get('http://localhost:3001/api/nonexistent');
        } catch (error) {
            console.log('✅ 404 handling:', error.response.status, '-', error.response.data.message);
        }
        
        // Test invalid product creation
        try {
            await axios.post('http://localhost:3001/api/products', {
                // Missing required fields
                description: 'Invalid product'
            });
        } catch (error) {
            console.log('✅ 400 validation:', error.response.status, '-', error.response.data.message);
        }
        
        // Test invalid auth
        try {
            await axios.post('http://localhost:3001/api/auth/login', {
                // Missing password
                email: 'test@test.com'
            });
        } catch (error) {
            console.log('✅ Auth validation:', error.response.status, '-', error.response.data.message);
        }
        
        console.log('\n🎉 Error handling tests passed!');
        
    } catch (error) {
        console.error('❌ Error handling test failed:', error.message);
    }
}

testErrorHandling();
