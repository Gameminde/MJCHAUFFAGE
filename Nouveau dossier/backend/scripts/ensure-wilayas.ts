import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAndSeedWilayas() {
  try {
    // Check existing wilayas
    const count = await prisma.wilaya.count();
    console.log(`\n📊 Wilayas dans la base de données: ${count}\n`);

    if (count === 0) {
      console.log('⚠️ Aucune wilaya trouvée! Exécution du seed...\n');
      // Import and run seed
      const { execSync } = require('child_process');
      execSync('npx ts-node prisma/seed-wilayas.ts', { stdio: 'inherit', cwd: __dirname });
    } else {
      // Show first few wilayas
      const wilayas = await prisma.wilaya.findMany({
        take: 5,
        orderBy: { code: 'asc' }
      });
      console.log('✅ Exemples de wilayas trouvées:');
      wilayas.forEach(w => {
        console.log(`   ${w.code} - ${w.name} (${w.nameAr})`);
      });
      console.log(`\n   ... et ${count - 5} autres\n`);
    }

    // Verify all 58 are present
    const allWilayas = await prisma.wilaya.findMany({
      orderBy: { code: 'asc' }
    });

    if (allWilayas.length < 58) {
      console.log(`⚠️ Seulement ${allWilayas.length}/58 wilayas présentes. Exécution du seed...\n`);
      const { execSync } = require('child_process');
      execSync('npx ts-node prisma/seed-wilayas.ts', { stdio: 'inherit', cwd: __dirname });
    } else {
      console.log(`✅ Toutes les ${allWilayas.length} wilayas sont présentes!\n`);
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndSeedWilayas();

