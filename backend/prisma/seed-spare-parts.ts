// ✅ NOUVEAU SEED SPÉCIFIQUE PIÈCES DÉTACHÉES

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Seeding pièces détachées...');

  // Catégories spécifiques
  const categories = [
    {
      name: 'Brûleurs',
      slug: 'bruleurs',
      description: 'Brûleurs gaz et fioul pour chaudières'
    },
    {
      name: 'Vannes et Robinets',
      slug: 'vannes-robinets',
      description: 'Vannes gaz, robinets thermostatiques'
    },
    {
      name: 'Circulateurs',
      slug: 'circulateurs',
      description: 'Pompes et circulateurs de chauffage'
    },
    {
      name: 'Électrodes et Allumage',
      slug: 'electrodes-allumage',
      description: 'Électrodes d\'ionisation et allumage'
    },
    {
      name: 'Échangeurs',
      slug: 'echangeurs',
      description: 'Échangeurs thermiques et condenseurs'
    }
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat
    });
  }

  // Produits pièces détachées réalistes
  const viessmann = await prisma.manufacturer.findUnique({ where: { slug: 'viessmann' } });
  const bruleursCat = await prisma.category.findUnique({ where: { slug: 'bruleurs' } });

  const spareParts = [
    {
      name: 'Brûleur gaz Viessmann Vitodens 100-W',
      slug: 'bruleur-gaz-viessmann-vitodens-100w',
      sku: 'VIT-BRU-7828745',
      ean: '4042787282745',
      internalRef: 'BR-VD100-01',
      description: 'Brûleur gaz d\'origine Viessmann pour chaudière Vitodens 100-W. Compatible avec les modèles 24kW et 35kW.',
      shortDescription: 'Brûleur gaz d\'origine Viessmann',
      categoryId: bruleursCat?.id,
      manufacturerId: viessmann?.id,
      partType: 'Brûleur',
      compatibleModels: 'Vitodens 100-W 24kW, Vitodens 100-W 35kW',
      compatibleBrands: 'Viessmann',
      originalPart: true,
      price: 285.00,
      priceHT: 239.50,
      taxRate: 19,
      stockQuantity: 12,
      minStock: 3,
      deliveryDelay: 3,
      warranty: 24,
      weight: 2.5,
      dimensions: JSON.stringify({ length: 250, width: 180, height: 120 }),
      specifications: JSON.stringify({
        'Référence fabricant': '7828745',
        'Type de gaz': 'Naturel (G20)',
        'Puissance nominale': '24 kW',
        'Tension': '230V',
        'Certification': 'CE'
      }),
      features: 'Pièce d\'origine,Installation simple,Garantie 2 ans,Livraison rapide',
      isActive: true,
      isFeatured: true,
      condition: 'NEW'
    },
    {
      name: 'Vanne 3 voies motorisée Grundfos',
      slug: 'vanne-3-voies-motorisee-grundfos',
      sku: 'GRU-V3V-59926899',
      ean: '5712876599268',
      description: 'Vanne 3 voies motorisée Grundfos pour circuits de chauffage. Compatible avec la plupart des chaudières murales.',
      shortDescription: 'Vanne 3 voies avec moteur intégré',
      categoryId: bruleursCat?.id, // À remplacer par vannesCat
      partType: 'Vanne',
      compatibleModels: 'Vitodens 100/200, Greenstar, Saunier Duval',
      originalPart: false, // Pièce compatible
      price: 145.00,
      priceHT: 121.85,
      salePrice: 129.00, // Promo
      taxRate: 19,
      stockQuantity: 8,
      minStock: 2,
      warranty: 12,
      weight: 1.2,
      specifications: JSON.stringify({
        'Diamètre': '1" (26/34)',
        'Kvs': '6.3',
        'Température max': '110°C',
        'Pression max': '10 bar'
      }),
      features: 'Moteur silencieux,Montage facile,Longue durée de vie',
      isActive: true,
      isOnSale: true,
      condition: 'NEW'
    }
  ];

  for (const part of spareParts) {
    await prisma.product.upsert({
      where: { sku: part.sku },
      update: part,
      create: part
    });
  }

  console.log('✅ Seed pièces détachées terminé');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
