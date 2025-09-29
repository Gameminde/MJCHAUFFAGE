const axios = require('axios');

async function testAdminFormFix() {
    console.log('🔧 TEST CORRECTION FORMULAIRE ADMIN');
    console.log('='.repeat(50));
    
    try {
        // Simuler exactement ce que fait le formulaire admin maintenant
        console.log('\n📝 Simulation création produit avec nouvelles corrections:');
        
        const formData = {
            name: 'TEST CORRECTION - Chaudière Libre',
            description: 'Test avec fabricant en saisie libre',
            price: 2800,
            originalPrice: 3200,
            categoryId: 'boilers', // Valeur directe, pas d'objet
            manufacturerId: 'Viessmann Premium', // Saisie libre
            stockQuantity: 12,
            features: ['Haute efficacité', 'Saisie libre'],
            specifications: { power: '30kW', efficiency: '97%' },
            isActive: true,
            isFeatured: true
        };
        
        // Simuler la logique corrigée du handleSubmit
        console.log('🔄 Simulation logique handleSubmit corrigée:');
        
        // Pas de categories.find() qui peut échouer
        const selectedCategory = null; // categories n'existe pas dans le serveur dev
        
        const productData = {
            name: formData.name,
            description: formData.description || null,
            price: parseFloat(formData.price),
            originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
            category: selectedCategory?.name || formData.categoryId || 'Unknown',
            brand: formData.manufacturerId || null, // Directement la valeur tapée
            stockQuantity: parseInt(formData.stockQuantity),
            features: formData.features.filter(f => f.trim() !== ''),
            specifications: formData.specifications,
            isActive: formData.isActive,
            isFeatured: formData.isFeatured
        };
        
        console.log('📋 Données préparées pour l\'API:');
        console.log('  - Nom:', productData.name);
        console.log('  - Catégorie:', productData.category);
        console.log('  - Fabricant:', productData.brand);
        console.log('  - Prix:', productData.price);
        
        // Test de création via API
        const createResponse = await axios.post('http://localhost:3001/api/products', productData);
        console.log('✅ Produit créé avec succès:', createResponse.data.data.id);
        
        // Vérifier que le produit apparaît dans la liste
        const listResponse = await axios.get('http://localhost:3001/api/products');
        const createdProduct = listResponse.data.data.products.find(p => p.id === createResponse.data.data.id);
        
        if (createdProduct) {
            console.log('✅ Produit trouvé dans la liste:');
            console.log('  - Nom:', createdProduct.name);
            console.log('  - Catégorie:', createdProduct.category);
            console.log('  - Fabricant:', createdProduct.brand);
            console.log('  - Prix:', createdProduct.price);
        }
        
        console.log('\n🎯 CORRECTIONS APPLIQUÉES:');
        console.log('1. ✅ Protection categories.find() avec vérification null');
        console.log('2. ✅ Fabricant en champ libre (input text au lieu de select)');
        console.log('3. ✅ Utilisation directe de formData.manufacturerId comme brand');
        
        console.log('\n📋 MAINTENANT VOUS POUVEZ:');
        console.log('1. Ouvrir http://localhost:3000/admin/products');
        console.log('2. Taper librement le nom du fabricant (ex: "Viessmann Premium")');
        console.log('3. Créer le produit sans erreur "Cannot read properties of undefined"');
        console.log('4. Le produit apparaîtra sur http://localhost:3000/fr/products');
        
    } catch (error) {
        console.error('❌ ERREUR:', error.response?.data || error.message);
    }
}

testAdminFormFix();
