import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding boiler models...');

  // 1. Saunier Duval
  let saunierDuval = await prisma.manufacturer.findUnique({ where: { name: 'Saunier Duval' } });
  if (!saunierDuval) {
    saunierDuval = await prisma.manufacturer.create({
      data: { name: 'Saunier Duval', slug: 'saunier-duval' }
    });
  }

  const saunierModels = [
    { name: 'Thema F25', series: 'Thema', type: 'Ventouse' },
    { name: 'Thema C25', series: 'Thema', type: 'Cheminée' },
    { name: 'ThemaFast F25', series: 'ThemaFast', type: 'Ventouse' },
    { name: 'Isofast F35', series: 'Isofast', type: 'Condensation' },
    { name: 'Semia F24', series: 'Semia', type: 'Ventouse' },
  ];

  for (const model of saunierModels) {
    await upsertBoilerModel(saunierDuval.id, model);
  }

  // 2. Beretta
  let beretta = await prisma.manufacturer.findUnique({ where: { name: 'Beretta' } });
  if (!beretta) {
    beretta = await prisma.manufacturer.create({
      data: { name: 'Beretta', slug: 'beretta' }
    });
  }

  const berettaModels = [
    { name: 'Ciao S', series: 'Ciao', type: 'Ventouse' },
    { name: 'Mynute Green', series: 'Mynute', type: 'Condensation' },
    { name: 'Exclusive Green', series: 'Exclusive', type: 'Condensation' },
  ];

  for (const model of berettaModels) {
    await upsertBoilerModel(beretta.id, model);
  }

  // 3. Junkers / Bosch
  let junkers = await prisma.manufacturer.findUnique({ where: { name: 'Junkers' } });
  if (!junkers) {
    junkers = await prisma.manufacturer.create({
      data: { name: 'Junkers', slug: 'junkers' }
    });
  }

  const junkersModels = [
    { name: 'Euroline', series: 'Euroline', type: 'Atmosphérique' },
    { name: 'Ceraclass', series: 'Ceraclass', type: 'Ventouse' },
  ];

  for (const model of junkersModels) {
    await upsertBoilerModel(junkers.id, model);
  }
  
  // 4. Chaffoteaux
  let chaffoteaux = await prisma.manufacturer.findUnique({ where: { name: 'Chaffoteaux' } });
  if (!chaffoteaux) {
    chaffoteaux = await prisma.manufacturer.create({
      data: { name: 'Chaffoteaux', slug: 'chaffoteaux' }
    });
  }

  const chaffoteauxModels = [
    { name: 'Urbia', series: 'Urbia', type: 'Condensation' },
    { name: 'Maury', series: 'Maury', type: 'Atmosphérique' },
    { name: 'Pigma', series: 'Pigma', type: 'Ventouse' },
  ];

  for (const model of chaffoteauxModels) {
    await upsertBoilerModel(chaffoteaux.id, model);
  }

  console.log('Seeding finished.');
}

async function upsertBoilerModel(manufacturerId: string, model: any) {
  const exists = await prisma.boilerModel.findFirst({
    where: {
      manufacturerId,
      name: model.name
    }
  });

  if (!exists) {
    await prisma.boilerModel.create({
      data: {
        manufacturerId,
        name: model.name,
        series: model.series,
        type: model.type
      }
    });
    console.log(`Created model: ${model.name}`);
  } else {
    console.log(`Model already exists: ${model.name}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

