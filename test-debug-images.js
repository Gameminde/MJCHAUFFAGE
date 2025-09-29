const axios = require('axios');

async function testDebugImages() {
    console.log('🔍 DEBUG IMAGES - Analyse détaillée');
    console.log('='.repeat(50));
    
    try {
        // 1. Test avec image base64 simple
        console.log('\n📤 Test 1: Envoi direct avec image base64');
        
        const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
        
        const productData = {
            name: 'DEBUG IMAGE TEST',
            description: 'Test debug images',
            price: 1000,
            category: 'Test',
            brand: 'Debug',
            stockQuantity: 1,
            features: ['Debug'],
            specifications: {},
            isActive: true,
            isFeatured: false,
            images: [testImage]
        };
        
        console.log('📋 Données à envoyer:');
        console.log('  - Nom:', productData.name);
        console.log('  - Images array length:', productData.images.length);
        console.log('  - Image type:', typeof productData.images[0]);
        console.log('  - Image starts with:', productData.images[0].substring(0, 30));
        
        // 2. Envoyer à l'API avec logs détaillés
        console.log('\n🚀 Envoi à l\'API...');
        const response = await axios.post('http://localhost:3001/api/products', productData);
        
        console.log('✅ Réponse API:');
        console.log('  - Status:', response.status);
        console.log('  - Product ID:', response.data.data.id);
        console.log('  - Images in response:', response.data.data.images.length);
        
        if (response.data.data.images.length > 0) {
            console.log('  - First image in response:', response.data.data.images[0].substring(0, 30));
        }
        
        // 3. Vérifier dans la liste
        console.log('\n📋 Vérification dans la liste...');
        const listResponse = await axios.get('http://localhost:3001/api/products');
        const createdProduct = listResponse.data.data.products.find(p => p.id === response.data.data.id);
        
        if (createdProduct) {
            console.log('✅ Produit trouvé dans la liste:');
            console.log('  - Images count:', createdProduct.images.length);
            if (createdProduct.images.length > 0) {
                console.log('  - Image data type:', typeof createdProduct.images[0]);
                console.log('  - Image starts with:', createdProduct.images[0].substring(0, 30));
            }
        }
        
        // 4. Test sans images pour comparaison
        console.log('\n📦 Test 2: Produit sans images');
        const productNoImages = {
            name: 'NO IMAGES TEST',
            description: 'Test sans images',
            price: 500,
            category: 'Test',
            brand: 'NoImg',
            stockQuantity: 1,
            features: [],
            specifications: {},
            isActive: true,
            isFeatured: false
            // Pas de propriété images
        };
        
        const response2 = await axios.post('http://localhost:3001/api/products', productNoImages);
        console.log('✅ Produit sans images créé:', response2.data.data.id);
        console.log('  - Images array:', response2.data.data.images);
        
        console.log('\n🎯 ANALYSE:');
        console.log('- Les images sont-elles envoyées correctement ?');
        console.log('- Le serveur reçoit-il les images ?');
        console.log('- Les images sont-elles stockées dans le produit ?');
        console.log('- Y a-t-il une différence entre les logs frontend et backend ?');
        
    } catch (error) {
        console.error('❌ ERREUR:', error.response?.data || error.message);
    }
}

testDebugImages();
