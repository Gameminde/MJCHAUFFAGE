const axios = require('axios');

async function testFrontendFix() {
    console.log('🔧 TEST CORRECTION FRONTEND');
    console.log('='.repeat(40));
    
    try {
        // 1. Créer un nouveau produit via API
        console.log('\n➕ Étape 1: Création d\'un produit test');
        const newProduct = {
            name: 'CORRECTION TEST - Chaudière Bosch Premium',
            description: 'Test de correction frontend-backend',
            price: 2500,
            originalPrice: 3000,
            category: 'Boilers',
            brand: 'Bosch',
            stockQuantity: 8,
            features: ['Haute efficacité', 'Économique', 'Garantie 10 ans'],
            specifications: { 
                power: '28kW', 
                efficiency: '96%',
                warranty: '10 years'
            },
            isFeatured: true
        };
        
        const createResponse = await axios.post('http://localhost:3001/api/products', newProduct);
        console.log('✅ Produit créé:', createResponse.data.data.id);
        
        // 2. Vérifier que l'API retourne bien le produit
        console.log('\n📦 Étape 2: Vérification API');
        const apiResponse = await axios.get('http://localhost:3001/api/products');
        console.log('✅ Nombre de produits dans l\'API:', apiResponse.data.data.products.length);
        
        const lastProduct = apiResponse.data.data.products[apiResponse.data.data.products.length - 1];
        console.log('📋 Dernier produit créé:');
        console.log('  - Nom:', lastProduct.name);
        console.log('  - Prix:', lastProduct.price);
        console.log('  - Prix original:', lastProduct.originalPrice);
        console.log('  - Catégorie:', lastProduct.category);
        console.log('  - Marque:', lastProduct.brand);
        console.log('  - En vedette:', lastProduct.isFeatured);
        
        // 3. Tester l'accès frontend
        console.log('\n🌐 Étape 3: Test accès page frontend');
        try {
            const frontendResponse = await axios.get('http://localhost:3000/fr/products');
            console.log('✅ Page produits accessible:', frontendResponse.status);
        } catch (error) {
            console.log('❌ Erreur page frontend:', error.message);
        }
        
        console.log('\n🎯 INSTRUCTIONS POUR VALIDATION MANUELLE:');
        console.log('1. Ouvrez http://localhost:3000/fr/products dans votre navigateur');
        console.log('2. Vérifiez que le produit "CORRECTION TEST - Chaudière Bosch Premium" apparaît');
        console.log('3. Vérifiez que le prix affiché est correct (2500 DA)');
        console.log('4. Vérifiez que le badge "Premium" apparaît (isFeatured = true)');
        
    } catch (error) {
        console.error('❌ ERREUR:', error.response?.data || error.message);
    }
}

testFrontendFix();
