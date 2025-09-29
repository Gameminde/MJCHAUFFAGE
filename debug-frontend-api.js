const axios = require('axios');

async function debugFrontendAPI() {
    console.log('🔍 DEBUG: Pourquoi les produits n\'apparaissent pas sur /fr/produits');
    console.log('='.repeat(60));
    
    try {
        // 1. Vérifier l'API directement
        console.log('\n📦 Étape 1: Test API directe');
        const apiResponse = await axios.get('http://localhost:3001/api/products');
        console.log('✅ API Status:', apiResponse.status);
        console.log('📊 Nombre de produits dans l\'API:', apiResponse.data.data.products.length);
        
        if (apiResponse.data.data.products.length > 0) {
            console.log('📋 Produits dans l\'API:');
            apiResponse.data.data.products.forEach((product, index) => {
                console.log(`  ${index + 1}. ${product.name} - ${product.price} DA`);
            });
        }
        
        // 2. Tester le ProductService avec la même URL que le frontend
        console.log('\n🔧 Étape 2: Test ProductService (simulation frontend)');
        const frontendApiUrl = 'http://localhost:3001/api/products'; // Même URL que le frontend
        
        try {
            const frontendResponse = await axios.get(frontendApiUrl);
            console.log('✅ ProductService URL accessible:', frontendResponse.status);
            
            // Simuler la conversion que fait ProductService.convertApiProduct
            const rawProducts = frontendResponse.data.data.products;
            console.log('📊 Produits bruts reçus:', rawProducts.length);
            
            if (rawProducts.length > 0) {
                console.log('🔄 Simulation conversion ProductService:');
                rawProducts.forEach((apiProduct, index) => {
                    const converted = {
                        id: apiProduct.id,
                        name: apiProduct.name,
                        price: apiProduct.price,
                        category: {
                            id: apiProduct.category || 'unknown',
                            name: apiProduct.category || 'Unknown Category',
                            slug: (apiProduct.category || 'unknown').toLowerCase().replace(/\s+/g, '-')
                        },
                        manufacturer: apiProduct.brand ? {
                            id: apiProduct.brand,
                            name: apiProduct.brand,
                            slug: apiProduct.brand.toLowerCase().replace(/\s+/g, '-')
                        } : null,
                        salePrice: apiProduct.originalPrice || null,
                        stockQuantity: apiProduct.stockQuantity,
                        isFeatured: apiProduct.isFeatured,
                        isActive: apiProduct.isActive
                    };
                    console.log(`  ${index + 1}. Converti: ${converted.name} - ${converted.price} DA`);
                });
            }
            
        } catch (error) {
            console.log('❌ Erreur ProductService:', error.message);
        }
        
        // 3. Vérifier la page frontend
        console.log('\n🌐 Étape 3: Test page frontend');
        try {
            const pageResponse = await axios.get('http://localhost:3000/fr/products');
            console.log('✅ Page /fr/products accessible:', pageResponse.status);
            
            // Chercher des indices dans le HTML
            const html = pageResponse.data;
            const hasProducts = html.includes('produits disponibles') || html.includes('products available');
            const hasEmptyState = html.includes('Aucun produit') || html.includes('No products');
            
            console.log('🔍 Analyse du HTML:');
            console.log('  - Contient des produits:', hasProducts);
            console.log('  - État vide:', hasEmptyState);
            
        } catch (error) {
            console.log('❌ Erreur page frontend:', error.message);
        }
        
        // 4. Instructions de debug
        console.log('\n🎯 INSTRUCTIONS DE DEBUG:');
        console.log('1. Ouvrez http://localhost:3000/fr/products dans votre navigateur');
        console.log('2. Ouvrez les DevTools (F12)');
        console.log('3. Allez dans l\'onglet Network');
        console.log('4. Rechargez la page');
        console.log('5. Cherchez une requête vers /api/products');
        console.log('6. Vérifiez si elle retourne vos produits');
        
        console.log('\n🔍 VÉRIFICATIONS À FAIRE:');
        console.log('- La page appelle-t-elle vraiment ProductService.getProducts() ?');
        console.log('- Y a-t-il des erreurs dans la console du navigateur ?');
        console.log('- Le ProductService utilise-t-il la bonne URL d\'API ?');
        console.log('- Les produits sont-ils filtrés quelque part ?');
        
    } catch (error) {
        console.error('❌ ERREUR DANS LE DEBUG:', error.message);
    }
}

debugFrontendAPI();
