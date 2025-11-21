import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCategories() {
  console.log('📂 Création des catégories de pièces détachées...\n');

  // ✅ CATÉGORIES PRINCIPALES avec sous-catégories
  const categories = [
    {
      name: 'Brûleurs et Allumage',
      slug: 'bruleurs-allumage',
      description: 'Brûleurs complets, électrodes, transformateurs pour système d\'allumage',
      sortOrder: 1,
      subcategories: [
        'Brûleurs Gaz Complets',
        'Électrodes d\'Allumage',
        'Électrodes d\'Ionisation',
        'Transformateurs d\'Allumage',
        'Têtes de Combustion',
        'Buses et Injecteurs Gaz',
      ]
    },
    {
      name: 'Vannes et Robinetterie',
      slug: 'vannes-robinetterie',
      description: 'Vannes gaz, vannes 3 voies, robinets thermostatiques et clapets',
      sortOrder: 2,
      subcategories: [
        'Vannes Gaz',
        'Vannes 3 Voies Motorisées',
        'Robinets Thermostatiques',
        'Clapets Anti-Retour',
        'Soupapes de Sécurité',
        'Détendeurs Gaz',
      ]
    },
    {
      name: 'Circulateurs et Pompes',
      slug: 'circulateurs-pompes',
      description: 'Circulateurs de chauffage Grundfos, Wilo, Salmson et accessoires',
      sortOrder: 3,
      subcategories: [
        'Circulateurs Grundfos',
        'Circulateurs Wilo',
        'Circulateurs Salmson',
        'Kits de Remplacement',
      ]
    },
    {
      name: 'Échangeurs Thermiques',
      slug: 'echangeurs-thermiques',
      description: 'Échangeurs primaires, secondaires, corps de chauffe et serpentins',
      sortOrder: 4,
      subcategories: [
        'Échangeurs Primaires',
        'Échangeurs Secondaires',
        'Corps de Chauffe',
        'Serpentins',
      ]
    },
    {
      name: 'Vases d\'Expansion et Sécurité',
      slug: 'vases-expansion',
      description: 'Vases d\'expansion, membranes, soupapes et groupes de sécurité',
      sortOrder: 5,
      subcategories: [
        'Vases d\'Expansion 6-8L',
        'Vases d\'Expansion 12-18L',
        'Membranes de Vases',
        'Soupapes de Sécurité',
        'Groupes de Sécurité',
      ]
    },
    {
      name: 'Électronique et Régulation',
      slug: 'electronique-regulation',
      description: 'Cartes électroniques, thermostats, sondes et capteurs',
      sortOrder: 6,
      subcategories: [
        'Cartes Électroniques',
        'Thermostats d\'Ambiance',
        'Thermostats Radio',
        'Sondes de Température',
        'Pressostats',
        'Capteurs de Débit',
        'Afficheurs',
      ]
    },
    {
      name: 'Ventilation et Extraction',
      slug: 'ventilation-extraction',
      description: 'Ventilateurs, turbines, extracteurs et accessoires ventouse',
      sortOrder: 7,
      subcategories: [
        'Ventilateurs',
        'Turbines',
        'Extracteurs Fumées',
        'Kits Ventouse',
        'Conduits',
      ]
    },
    {
      name: 'Production Eau Chaude Sanitaire',
      slug: 'production-ecs',
      description: 'Ballons ECS, résistances, anodes et accessoires sanitaires',
      sortOrder: 8,
      subcategories: [
        'Ballons ECS',
        'Résistances Électriques',
        'Anodes',
        'Thermostats Boiler',
        'Mitigeurs',
      ]
    },
    {
      name: 'Filtres et Traitement Eau',
      slug: 'filtres-traitement',
      description: 'Filtres magnétiques, désemboueurs et anti-tartre',
      sortOrder: 9,
      subcategories: [
        'Filtres Magnétiques',
        'Désemboueurs',
        'Pots à Boues',
        'Anti-Tartre',
      ]
    },
    {
      name: 'Connectique et Câblage',
      slug: 'connectique-cablage',
      description: 'Faisceaux électriques, connecteurs et câbles de sondes',
      sortOrder: 10,
      subcategories: [
        'Faisceaux Électriques',
        'Connecteurs',
        'Câbles de Sondes',
        'Thermocouples',
      ]
    },
    {
      name: 'Joints et Étanchéité',
      slug: 'joints-etancheite',
      description: 'Joints toriques, plats, fibres et kits d\'étanchéité',
      sortOrder: 11,
      subcategories: [
        'Joints Toriques',
        'Joints Plats',
        'Joints Fibres',
        'Kits Joints',
      ]
    },
    {
      name: 'Organes Hydrauliques',
      slug: 'organes-hydrauliques',
      description: 'By-pass, disconnecteurs, réducteurs de pression et accessoires',
      sortOrder: 12,
      subcategories: [
        'By-pass',
        'Disconnecteurs',
        'Réducteurs de Pression',
        'Purgeurs',
        'Vannes de Vidange',
      ]
    },
  ];

  let totalCategories = 0;
  let totalSubcategories = 0;

  // ✅ Créer chaque catégorie principale et ses sous-catégories
  for (const category of categories) {
    const { subcategories, ...categoryData } = category;

    // Créer catégorie principale
    const createdCategory = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: categoryData.name,
        description: categoryData.description,
        sortOrder: categoryData.sortOrder,
      },
      create: {
        ...categoryData,
        isActive: true,
      },
    });

    totalCategories++;
    console.log(`✅ ${createdCategory.name}`);

    // Créer sous-catégories
    if (subcategories && subcategories.length > 0) {
      for (const [index, subcatName] of subcategories.entries()) {
        const subcatSlug = subcatName
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        await prisma.category.upsert({
          where: { slug: subcatSlug },
          update: {
            name: subcatName,
            parentId: createdCategory.id,
            sortOrder: index + 1,
          },
          create: {
            name: subcatName,
            slug: subcatSlug,
            description: `Pièces de ${subcatName.toLowerCase()} pour chaudières`,
            parentId: createdCategory.id,
            sortOrder: index + 1,
            isActive: true,
          },
        });

        totalSubcategories++;
      }
      console.log(`   ↳ ${subcategories.length} sous-catégories\n`);
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ ${totalCategories} catégories principales créées`);
  console.log(`✅ ${totalSubcategories} sous-catégories créées`);
  console.log(`✅ Total: ${totalCategories + totalSubcategories} catégories`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🎉 Catégories prêtes! Vous pouvez maintenant ajouter vos produits depuis le dashboard admin.');
}

async function main() {
  try {
    await seedCategories();
  } catch (error) {
    console.error('❌ Erreur lors de la création des catégories:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();