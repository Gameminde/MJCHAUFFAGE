const axios = require('axios');

async function testAuth() {
    try {
        console.log('🔐 Testing authentication...');
        
        // Test login
        const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
            email: 'admin@mjchauffage.com',
            password: 'Admin123!'
        });
        
        console.log('✅ Login successful:', loginResponse.status);
        console.log('📝 Token received:', !!loginResponse.data.token);
        
        // Test protected route
        const token = loginResponse.data.token;
        const protectedResponse = await axios.get('http://localhost:3001/api/admin/dashboard', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ Protected route accessible:', protectedResponse.status);
        
    } catch (error) {
        console.error('❌ Auth test failed:', error.response?.data || error.message);
    }
}

testAuth();
