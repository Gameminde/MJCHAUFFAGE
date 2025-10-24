const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createCategory() {
  try {
    console.log('🔄 Création de la catégorie...');
    
    const category = await prisma.category.create({
      data: {
        name: 'Chaudières',
        slug: 'chaudieres',
        description: 'Chaudières de chauffage'
      }
    });
    
    console.log('✅ Catégorie créée avec succès:', category);
    return category;
  } catch (error) {
    console.error('❌ Erreur lors de la création:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createCategory()
  .then(() => {
    console.log('✅ Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Échec du script:', error);
    process.exit(1);
  });