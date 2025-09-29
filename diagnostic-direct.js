const axios = require('axios');

async function diagnosticDirect() {
    console.log('🔍 DIAGNOSTIC DIRECT - Problème Admin/Site Web');
    console.log('='.repeat(50));
    
    try {
        // Test 2A: API Products (ce que le site web devrait voir)
        console.log('\n📦 TEST 2A: API Products (site web)');
        const siteProducts = await axios.get('http://localhost:3001/api/products');
        console.log('Status:', siteProducts.status);
        console.log('Structure:', Object.keys(siteProducts.data));
        console.log('Nombre de produits:', siteProducts.data.data?.products?.length || 'Structure inconnue');
        console.log('Produits:', JSON.stringify(siteProducts.data, null, 2));
        
        // Test 2B: Créer un produit via API (simulation admin)
        console.log('\n➕ TEST 2B: Création produit (simulation admin)');
        const newProduct = {
            name: 'TEST DIAGNOSTIC - Chaudière Test',
            description: 'Produit de test pour diagnostic',
            price: 1500,
            category: 'Boilers',
            brand: 'TestBrand',
            stockQuantity: 5
        };
        
        const createResponse = await axios.post('http://localhost:3001/api/products', newProduct);
        console.log('Création Status:', createResponse.status);
        console.log('Produit créé ID:', createResponse.data.data?.id);
        
        // Test 2C: Vérifier que le produit apparaît maintenant
        console.log('\n🔄 TEST 2C: Vérification après création');
        const afterCreate = await axios.get('http://localhost:3001/api/products');
        console.log('Nombre de produits après création:', afterCreate.data.data?.products?.length);
        
        // Test 2D: Tester les autres endpoints
        console.log('\n🔍 TEST 2D: Autres endpoints');
        
        try {
            const categories = await axios.get('http://localhost:3001/api/categories');
            console.log('Categories API:', categories.status);
        } catch (e) {
            console.log('Categories API ERROR:', e.response?.status, e.response?.data?.message);
        }
        
        try {
            const manufacturers = await axios.get('http://localhost:3001/api/manufacturers');
            console.log('Manufacturers API:', manufacturers.status);
        } catch (e) {
            console.log('Manufacturers API ERROR:', e.response?.status, e.response?.data?.message);
        }
        
    } catch (error) {
        console.error('❌ ERREUR DIAGNOSTIC:', error.response?.data || error.message);
    }
}

diagnosticDirect();
