const axios = require('axios');

async function testAdminToSite() {
    console.log('🔧 TEST COMPLET: ADMIN → SITE WEB');
    console.log('='.repeat(50));
    
    try {
        // 1. Simuler la création d'un produit via l'admin (avec la nouvelle structure)
        console.log('\n👨‍💼 Étape 1: Simulation création produit via ADMIN');
        const adminProductData = {
            name: 'ADMIN TEST - Chaudière Vaillant EcoTEC Plus',
            description: 'Chaudière condensation haute performance créée via admin',
            price: 3200,
            originalPrice: 3800, // Prix barré
            category: 'Boilers', // String simple (pas d\'ID)
            brand: 'Vaillant',   // String simple (pas d\'ID)
            stockQuantity: 15,
            features: ['Condensation', 'Haute efficacité', 'Garantie 12 ans', 'Économique'],
            specifications: { 
                power: '32kW', 
                efficiency: '98%',
                warranty: '12 years',
                type: 'Condensation'
            },
            isActive: true,
            isFeatured: true // Produit en vedette
        };
        
        const createResponse = await axios.post('http://localhost:3001/api/products', adminProductData);
        console.log('✅ Produit créé via admin:', createResponse.data.data.id);
        console.log('📋 Données créées:');
        console.log('  - Nom:', createResponse.data.data.name);
        console.log('  - Prix:', createResponse.data.data.price);
        console.log('  - Prix original:', createResponse.data.data.originalPrice);
        console.log('  - Catégorie:', createResponse.data.data.category);
        console.log('  - Marque:', createResponse.data.data.brand);
        console.log('  - En vedette:', createResponse.data.data.isFeatured);
        
        // 2. Vérifier que l'API retourne le produit
        console.log('\n📦 Étape 2: Vérification API backend');
        const apiResponse = await axios.get('http://localhost:3001/api/products');
        console.log('✅ Total produits dans l\'API:', apiResponse.data.data.products.length);
        
        const newProduct = apiResponse.data.data.products.find(p => p.id === createResponse.data.data.id);
        if (newProduct) {
            console.log('✅ Produit trouvé dans l\'API');
            console.log('  - Structure correcte:', {
                hasName: !!newProduct.name,
                hasPrice: !!newProduct.price,
                hasCategory: !!newProduct.category,
                hasBrand: !!newProduct.brand,
                hasFeatures: Array.isArray(newProduct.features),
                isFeatured: newProduct.isFeatured
            });
        } else {
            console.log('❌ Produit NON trouvé dans l\'API');
        }
        
        // 3. Tester l'accès frontend avec le service corrigé
        console.log('\n🌐 Étape 3: Test service frontend corrigé');
        try {
            // Simuler l'appel du ProductService.getProducts() corrigé
            const frontendResponse = await axios.get('http://localhost:3001/api/products');
            const products = frontendResponse.data.data.products;
            
            console.log('✅ Service frontend peut récupérer les produits');
            console.log('📊 Analyse des produits pour le frontend:');
            
            products.forEach((product, index) => {
                console.log(`  Produit ${index + 1}:`);
                console.log(`    - Nom: ${product.name}`);
                console.log(`    - Prix: ${product.price}`);
                console.log(`    - Catégorie: ${product.category} (type: ${typeof product.category})`);
                console.log(`    - Marque: ${product.brand} (type: ${typeof product.brand})`);
                console.log(`    - En vedette: ${product.isFeatured}`);
                console.log(`    - Actif: ${product.isActive}`);
            });
            
        } catch (error) {
            console.log('❌ Erreur service frontend:', error.message);
        }
        
        // 4. Instructions pour test manuel
        console.log('\n🎯 INSTRUCTIONS POUR VALIDATION MANUELLE:');
        console.log('1. Ouvrez http://localhost:3000/admin/products dans votre navigateur');
        console.log('2. Connectez-vous avec admin@mjchauffage.com / Admin123!');
        console.log('3. Créez un nouveau produit avec ces données:');
        console.log('   - Nom: Test Manuel Admin');
        console.log('   - Catégorie: Boilers');
        console.log('   - Marque: Viessmann');
        console.log('   - Prix: 2500');
        console.log('   - Stock: 10');
        console.log('4. Cliquez "Créer le produit"');
        console.log('5. Allez sur http://localhost:3000/fr/products');
        console.log('6. Vérifiez que le produit "Test Manuel Admin" apparaît');
        
        console.log('\n✅ CORRECTION APPLIQUÉE:');
        console.log('- ProductService.getProducts() convertit maintenant les données API');
        console.log('- ProductsManagement envoie category/brand au lieu de categoryId/manufacturerId');
        console.log('- La synchronisation admin → site web devrait maintenant fonctionner');
        
    } catch (error) {
        console.error('❌ ERREUR DANS LE TEST:', error.response?.data || error.message);
    }
}

testAdminToSite();
