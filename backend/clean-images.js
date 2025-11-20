// Script pour nettoyer les URLs d'images corrompues
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanImageUrls() {
  console.log('🔍 Recherche des URLs d\'images corrompues...');

  // Trouver toutes les images avec des URLs problématiques
  const corruptedImages = await prisma.productImage.findMany({
    where: {
      OR: [
        { url: { contains: 'http:' } },  // URLs absolues anciennes
        { url: { contains: '&#x2F;' } }, // URLs avec entités HTML échappées
        { url: { contains: ':3001/files/' } }, // URLs corrompues
      ]
    }
  });

  console.log(`📊 Trouvé ${corruptedImages.length} images avec URLs problématiques`);

  for (const image of corruptedImages) {
    console.log(`🔧 Nettoyage: ${image.url}`);

    let cleanUrl = image.url;

    // Supprimer les URLs absolues localhost
    if (cleanUrl.includes('http://localhost:3001/files/')) {
      cleanUrl = cleanUrl.replace('http://localhost:3001/files/', '/files/');
    }

    // Supprimer les entités HTML échappées
    if (cleanUrl.includes('&#x2F;')) {
      cleanUrl = cleanUrl.replace(/&#x2F;/g, '/');
    }

    // Supprimer les URLs corrompues commençant par :3001
    if (cleanUrl.startsWith(':3001/files/')) {
      // Extraire juste le nom du fichier
      const parts = cleanUrl.split('/');
      const filename = parts[parts.length - 1];
      cleanUrl = `/files/${filename}`;
    }

    // S'assurer que l'URL commence par /files/
    if (!cleanUrl.startsWith('/files/')) {
      const filename = cleanUrl.split('/').pop();
      cleanUrl = `/files/${filename}`;
    }

    // Mettre à jour l'URL
    await prisma.productImage.update({
      where: { id: image.id },
      data: { url: cleanUrl }
    });

    console.log(`✅ Corrigé: ${image.url} → ${cleanUrl}`);
  }

  // Vérifier qu'il reste des URLs valides
  const validImages = await prisma.productImage.findMany({
    where: {
      url: { startsWith: '/files/' }
    }
  });

  console.log(`🎉 Nettoyage terminé! ${validImages.length} images avec URLs valides.`);
}

cleanImageUrls()
  .catch(console.error)
  .finally(() => prisma.$disconnect());








