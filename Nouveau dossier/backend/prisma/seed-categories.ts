import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding categories...');

  const categories = [
    {
      name: 'Chaudières',
      slug: 'chaudieres',
      description: 'Chaudières à gaz, fioul et électriques'
    },
    {
      name: 'Radiateurs',
      slug: 'radiateurs',
      description: 'Radiateurs électriques et à eau chaude'
    },
    {
      name: 'Pompes à Chaleur',
      slug: 'pompes-a-chaleur',
      description: 'Pompes à chaleur air-air et air-eau'
    },
    {
      name: 'Chauffe-eau',
      slug: 'chauffe-eau',
      description: 'Chauffe-eau électriques et thermodynamiques'
    },
    {
      name: 'Climatisation',
      slug: 'climatisation',
      description: 'Systèmes de climatisation'
    },
    {
      name: 'Accessoires',
      slug: 'accessoires',
      description: 'Accessoires et pièces détachées'
    }
  ];

  for (const category of categories) {
    const existing = await prisma.category.findFirst({
      where: { slug: category.slug }
    });

    if (existing) {
      console.log(`✅ Category already exists: ${category.name}`);
    } else {
      const created = await prisma.category.create({
        data: category
      });
      console.log(`✅ Created category: ${category.name} (ID: ${created.id})`);
    }
  }

  console.log('✅ Categories seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding categories:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
