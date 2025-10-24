import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding manufacturers...');

  const manufacturers = [
    {
      name: 'Chappee',
      slug: 'chappee',
      description: 'Chappee - Fabricant français de chauffage'
    },
    {
      name: 'De Dietrich',
      slug: 'de-dietrich',
      description: 'De Dietrich - Solutions de chauffage premium'
    },
    {
      name: 'Viessmann',
      slug: 'viessmann',
      description: 'Viessmann - Technologie de chauffage allemande'
    },
    {
      name: 'Bosch',
      slug: 'bosch',
      description: 'Bosch - Équipements de chauffage fiables'
    },
    {
      name: 'Atlantic',
      slug: 'atlantic',
      description: 'Atlantic - Solutions de chauffage françaises'
    },
    {
      name: 'Saunier Duval',
      slug: 'saunier-duval',
      description: 'Saunier Duval - Chauffage et eau chaude'
    }
  ];

  for (const manufacturer of manufacturers) {
    const existing = await prisma.manufacturer.findFirst({
      where: { slug: manufacturer.slug }
    });

    if (existing) {
      console.log(`✅ Manufacturer already exists: ${manufacturer.name} (ID: ${existing.id})`);
    } else {
      const created = await prisma.manufacturer.create({
        data: manufacturer
      });
      console.log(`✅ Created manufacturer: ${manufacturer.name} (ID: ${created.id})`);
    }
  }

  console.log('✅ Manufacturers seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding manufacturers:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });