const axios = require('axios');

async function testAdminFix() {
    console.log('🔧 TEST CORRECTION ADMIN - Erreur manufacturers.map()');
    console.log('='.repeat(50));
    
    try {
        // 1. Vérifier que l'API backend fonctionne
        console.log('\n📦 Étape 1: Vérification API Backend');
        const healthCheck = await axios.get('http://localhost:3001/health');
        console.log('✅ Backend santé:', healthCheck.status);
        
        // 2. Tester les endpoints que l'admin essaie d'appeler
        console.log('\n🔍 Étape 2: Test endpoints admin');
        
        try {
            const products = await axios.get('http://localhost:3001/api/products');
            console.log('✅ Products API:', products.status, '- Count:', products.data.data.products.length);
        } catch (e) {
            console.log('❌ Products API ERROR:', e.response?.status, e.response?.data?.message);
        }
        
        try {
            const categories = await axios.get('http://localhost:3001/api/categories');
            console.log('✅ Categories API:', categories.status);
        } catch (e) {
            console.log('❌ Categories API ERROR:', e.response?.status, e.response?.data?.message);
            console.log('ℹ️  Normal - pas implémenté dans le serveur de dev');
        }
        
        try {
            const manufacturers = await axios.get('http://localhost:3001/api/manufacturers');
            console.log('✅ Manufacturers API:', manufacturers.status);
        } catch (e) {
            console.log('❌ Manufacturers API ERROR:', e.response?.status, e.response?.data?.message);
            console.log('ℹ️  Normal - pas implémenté dans le serveur de dev');
        }
        
        // 3. Tester l'authentification admin
        console.log('\n🔐 Étape 3: Test authentification admin');
        try {
            const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
                email: 'admin@mjchauffage.com',
                password: 'Admin123!'
            });
            console.log('✅ Login admin:', loginResponse.status);
            console.log('📝 Token reçu:', !!loginResponse.data.data?.token);
        } catch (e) {
            console.log('❌ Login ERROR:', e.response?.status, e.response?.data?.message);
        }
        
        console.log('\n🎯 CORRECTION APPLIQUÉE:');
        console.log('- Ajout de protections manufacturers && manufacturers.length > 0');
        console.log('- Ajout de protections categories && categories.length > 0');
        console.log('- Ajout d\'options de fallback si les APIs échouent');
        
        console.log('\n📋 INSTRUCTIONS POUR TESTER:');
        console.log('1. Ouvrez http://localhost:3000/admin/products');
        console.log('2. L\'erreur "Cannot read properties of undefined" ne devrait plus apparaître');
        console.log('3. Les selects devraient afficher des options par défaut');
        console.log('4. Vous devriez pouvoir créer un produit même sans API categories/manufacturers');
        
    } catch (error) {
        console.error('❌ ERREUR DANS LE TEST:', error.message);
    }
}

testAdminFix();
