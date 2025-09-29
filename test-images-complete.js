const axios = require('axios');

async function testImagesComplete() {
    console.log('🖼️ TEST COMPLET - SYSTÈME D\'IMAGES');
    console.log('='.repeat(50));
    
    try {
        // 1. Créer un produit avec une image base64 (simulation admin)
        console.log('\n📤 Étape 1: Simulation upload image via admin');
        
        // Image base64 simple (1x1 pixel rouge)
        const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
        
        const productWithImage = {
            name: 'TEST IMAGE - Chaudière avec Photo',
            description: 'Produit test avec image uploadée',
            price: 3500,
            originalPrice: 4000,
            category: 'Boilers',
            brand: 'ImageTest',
            stockQuantity: 8,
            features: ['Avec image', 'Test upload'],
            specifications: { power: '35kW', efficiency: '96%' },
            isActive: true,
            isFeatured: true,
            images: [testImageBase64] // Image en base64
        };
        
        console.log('📋 Données produit avec image:');
        console.log('  - Nom:', productWithImage.name);
        console.log('  - Images:', productWithImage.images.length, 'image(s)');
        console.log('  - Taille image base64:', productWithImage.images[0].length, 'caractères');
        
        // 2. Envoyer à l'API
        console.log('\n🚀 Étape 2: Envoi à l\'API backend');
        const createResponse = await axios.post('http://localhost:3001/api/products', productWithImage);
        console.log('✅ Produit créé:', createResponse.status);
        console.log('📦 ID produit:', createResponse.data.data.id);
        console.log('🖼️ Images stockées:', createResponse.data.data.images.length);
        
        // 3. Vérifier que le produit est dans la liste
        console.log('\n📋 Étape 3: Vérification dans la liste API');
        const listResponse = await axios.get('http://localhost:3001/api/products');
        console.log('✅ Total produits:', listResponse.data.data.products.length);
        
        const productWithImageFromAPI = listResponse.data.data.products.find(p => p.id === createResponse.data.data.id);
        if (productWithImageFromAPI) {
            console.log('✅ Produit trouvé dans la liste');
            console.log('🖼️ Images dans API:', productWithImageFromAPI.images.length);
            console.log('📏 Taille première image:', productWithImageFromAPI.images[0]?.length || 0, 'caractères');
        }
        
        // 4. Créer un produit sans image pour comparaison
        console.log('\n📦 Étape 4: Produit sans image (comparaison)');
        const productWithoutImage = {
            name: 'TEST SANS IMAGE - Chaudière Standard',
            description: 'Produit test sans image',
            price: 2500,
            category: 'Boilers',
            brand: 'NoImage',
            stockQuantity: 5,
            features: ['Sans image', 'Emoji par défaut'],
            isActive: true,
            isFeatured: false,
            images: [] // Pas d'images
        };
        
        const createResponse2 = await axios.post('http://localhost:3001/api/products', productWithoutImage);
        console.log('✅ Produit sans image créé:', createResponse2.data.data.id);
        
        // 5. Résumé final
        console.log('\n🎯 RÉSUMÉ DES CORRECTIONS:');
        console.log('1. ✅ Backend: Ajout endpoint POST /api/products');
        console.log('2. ✅ Backend: Stockage des images en base64 dans le produit');
        console.log('3. ✅ Frontend: Ajout images dans productData lors de la soumission');
        console.log('4. ✅ Frontend: Affichage conditionnel des images vs emoji');
        console.log('5. ✅ Frontend: Gestion d\'erreur si image ne charge pas');
        
        console.log('\n📋 INSTRUCTIONS POUR TESTER:');
        console.log('1. Ouvrez http://localhost:3000/admin/products');
        console.log('2. Créez un nouveau produit');
        console.log('3. Uploadez une image (JPG, PNG, etc.)');
        console.log('4. Sauvegardez le produit');
        console.log('5. Allez sur http://localhost:3000/fr/products');
        console.log('6. Votre image devrait apparaître à la place de l\'emoji 🔥');
        
        console.log('\n🔍 SI L\'IMAGE N\'APPARAÎT PAS:');
        console.log('- Vérifiez la console du navigateur pour les erreurs');
        console.log('- Vérifiez que l\'image est bien en base64 dans l\'API');
        console.log('- Essayez avec une image plus petite (<1MB)');
        
    } catch (error) {
        console.error('❌ ERREUR:', error.response?.data || error.message);
    }
}

testImagesComplete();
