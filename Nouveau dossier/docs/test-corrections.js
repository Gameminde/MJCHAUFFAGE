// Script de test rapide pour vérifier les corrections
console.log('🔍 Test des corrections appliquées...\n');

// Test 1: Vérification des rôles normalisés
console.log('✅ Test 1: Normalisation des rôles');
const testRoles = (role) => ['ADMIN', 'SUPER_ADMIN'].includes(role?.toUpperCase());
console.log('  - admin (minuscule):', testRoles('admin') ? 'PASS' : 'FAIL');
console.log('  - ADMIN (majuscule):', testRoles('ADMIN') ? 'PASS' : 'FAIL');
console.log('  - super_admin:', testRoles('super_admin') ? 'PASS' : 'FAIL');
console.log('  - user (non admin):', testRoles('user') ? 'FAIL (correct)' : 'ERROR');

// Test 2: Vérification des URLs d'images
console.log('\n✅ Test 2: Transformation des URLs d\'images');
const transformImageUrl = (image) => {
  if (/^https?:\/\//i.test(image.url)) return image.url;
  if (image.url.startsWith('/')) return image.url;
  return `/files/${image.url}`;
};

const testImages = [
  { url: 'https://external.com/image.jpg' },
  { url: '/files/image.jpg' },
  { url: 'image.jpg' }
];

testImages.forEach((img, i) => {
  const result = transformImageUrl(img);
  console.log(`  - Image ${i+1} (${img.url}): ${result}`);
});

console.log('\n🎉 Tests terminés! Vérifiez les résultats ci-dessus.');
console.log('📋 Prochaines étapes:');
console.log('   1. Démarrer le backend: npm run dev');
console.log('   2. Démarrer le frontend: npm run dev');
console.log('   3. Tester le login admin');
console.log('   4. Tester l\'upload d\'images');
console.log('   5. Tester l\'affichage des produits');
