const axios = require('axios');

async function testClientProducts() {
    console.log('🔧 TEST CORRECTION CLIENT PRODUCTS PAGE');
    console.log('='.repeat(50));
    
    try {
        // 1. Vérifier que l'API a des produits
        console.log('\n📦 Étape 1: Vérification API');
        const apiResponse = await axios.get('http://localhost:3001/api/products');
        console.log('✅ API Status:', apiResponse.status);
        console.log('📊 Produits dans l\'API:', apiResponse.data.data.products.length);
        
        // 2. Tester l'accès à la page
        console.log('\n🌐 Étape 2: Test page frontend');
        try {
            const pageResponse = await axios.get('http://localhost:3000/fr/products');
            console.log('✅ Page accessible:', pageResponse.status);
            
            // Chercher des indices que la page utilise le composant client
            const html = pageResponse.data;
            const hasClientComponent = html.includes('Chargement des produits') || html.includes('Loading products');
            console.log('🔍 Page utilise composant client:', hasClientComponent);
            
        } catch (error) {
            console.log('❌ Erreur page:', error.message);
        }
        
        console.log('\n🎯 CORRECTION APPLIQUÉE:');
        console.log('1. ✅ Création de ClientProductsPage (composant client)');
        console.log('2. ✅ Remplacement de la page SSR par un composant CSR');
        console.log('3. ✅ Appel API côté client au lieu de côté serveur');
        console.log('4. ✅ Gestion des états de chargement et d\'erreur');
        
        console.log('\n📋 MAINTENANT:');
        console.log('1. Ouvrez http://localhost:3000/fr/products dans votre navigateur');
        console.log('2. Vous devriez voir un spinner de chargement au début');
        console.log('3. Puis les produits créés dans l\'admin devraient apparaître');
        console.log('4. Ouvrez F12 > Network pour voir l\'appel à /api/products');
        
        console.log('\n🔍 SI LES PRODUITS N\'APPARAISSENT TOUJOURS PAS:');
        console.log('- Vérifiez la console du navigateur (F12) pour les erreurs');
        console.log('- Vérifiez l\'onglet Network pour voir si l\'API est appelée');
        console.log('- Vérifiez que NEXT_PUBLIC_API_URL est bien configuré');
        
    } catch (error) {
        console.error('❌ ERREUR:', error.message);
    }
}

testClientProducts();
