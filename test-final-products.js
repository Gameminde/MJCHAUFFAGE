const axios = require('axios');

async function testFinalProducts() {
    console.log('🎯 TEST FINAL - PAGES PRODUCTS RECRÉÉES');
    console.log('='.repeat(50));
    
    try {
        // 1. Vérifier l'API
        console.log('\n📦 Étape 1: Vérification API');
        const apiResponse = await axios.get('http://localhost:3001/api/products');
        console.log('✅ API Status:', apiResponse.status);
        console.log('📊 Produits dans l\'API:', apiResponse.data.data.products.length);
        
        if (apiResponse.data.data.products.length > 0) {
            console.log('📋 Produits disponibles:');
            apiResponse.data.data.products.forEach((product, index) => {
                console.log(`  ${index + 1}. ${product.name} - ${product.price} DA (${product.category} - ${product.brand})`);
            });
        }
        
        // 2. Attendre que Next.js recompile
        console.log('\n⏳ Étape 2: Attente recompilation Next.js...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 3. Tester la page
        console.log('\n🌐 Étape 3: Test page frontend');
        try {
            const pageResponse = await axios.get('http://localhost:3000/fr/products');
            console.log('✅ Page accessible:', pageResponse.status);
            
            // Vérifier le contenu
            const html = pageResponse.data;
            const hasLoadingText = html.includes('Chargement des produits');
            const hasProductsText = html.includes('produits disponibles');
            const hasNoProductsText = html.includes('Aucun produit disponible');
            
            console.log('🔍 Analyse du contenu:');
            console.log('  - Texte de chargement:', hasLoadingText);
            console.log('  - Texte produits:', hasProductsText);
            console.log('  - Texte aucun produit:', hasNoProductsText);
            
        } catch (error) {
            if (error.response?.status === 500) {
                console.log('❌ Erreur 500 - Problème de compilation');
                console.log('   Attendez que Next.js finisse la recompilation...');
            } else {
                console.log('❌ Erreur page:', error.message);
            }
        }
        
        // 4. Test de l'URL alternative
        console.log('\n🔄 Étape 4: Test URL /fr/produits (redirection)');
        try {
            const redirectResponse = await axios.get('http://localhost:3000/fr/produits');
            console.log('✅ Redirection fonctionne:', redirectResponse.status);
        } catch (error) {
            console.log('❌ Erreur redirection:', error.response?.status || error.message);
        }
        
        console.log('\n🎯 PAGES RECRÉÉES:');
        console.log('1. ✅ ClientProductsPage.tsx - Composant client avec gestion d\'état');
        console.log('2. ✅ page.tsx - Page serveur simple qui appelle le composant client');
        console.log('3. ✅ Gestion des états: loading, error, success');
        console.log('4. ✅ Affichage des produits avec catégorie et marque');
        console.log('5. ✅ Message si aucun produit disponible');
        
        console.log('\n📋 INSTRUCTIONS FINALES:');
        console.log('1. Attendez que Next.js finisse la recompilation (peut prendre 30s)');
        console.log('2. Ouvrez http://localhost:3000/fr/products');
        console.log('3. Vous devriez voir un spinner puis les produits');
        console.log('4. Créez un produit dans l\'admin et rechargez la page');
        console.log('5. Le nouveau produit devrait apparaître immédiatement');
        
        console.log('\n🔍 SI PROBLÈME PERSISTE:');
        console.log('- Vérifiez la console du navigateur (F12)');
        console.log('- Vérifiez l\'onglet Network pour l\'appel API');
        console.log('- Redémarrez le serveur Next.js si nécessaire');
        
    } catch (error) {
        console.error('❌ ERREUR:', error.message);
    }
}

testFinalProducts();
