import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkWilayas() {
  try {
    const wilayas = await prisma.wilaya.findMany({
      orderBy: { code: 'asc' }
    });
    
    console.log(`\n✅ Total wilayas trouvées: ${wilayas.length}\n`);
    
    if (wilayas.length === 0) {
      console.log('❌ Aucune wilaya trouvée dans la base de données!');
      console.log('💡 Exécutez: npx ts-node prisma/seed-wilayas.ts\n');
    } else {
      console.log('📋 Liste des wilayas:');
      wilayas.forEach(w => {
        console.log(`  ${w.code.padStart(2, '0')} - ${w.name} (${w.nameAr || 'N/A'}) - Frais: ${w.shippingCost} DZD`);
      });
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkWilayas();

