import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin123!', 10)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@mjchauffage.com' },
    update: {},
    create: {
      email: 'admin@mjchauffage.com',
      firstName: 'Admin',
      lastName: 'User',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
      isVerified: true,
    },
  })

  console.log('✅ Admin user created:', adminUser.email)

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'chaudieres' },
      update: {},
      create: {
        name: 'Chaudières',
        slug: 'chaudieres',
        description: 'Chaudières à gaz et électriques haute performance',
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'radiateurs' },
      update: {},
      create: {
        name: 'Radiateurs',
        slug: 'radiateurs',
        description: 'Radiateurs en aluminium et fonte',
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'accessoires' },
      update: {},
      create: {
        name: 'Accessoires',
        slug: 'accessoires',
        description: 'Accessoires et pièces de chauffage',
        isActive: true,
      },
    }),
  ])

  console.log('✅ Categories created:', categories.length)

  // Create manufacturers
  const manufacturers = await Promise.all([
    prisma.manufacturer.upsert({
      where: { slug: 'bosch' },
      update: {},
      create: {
        name: 'Bosch',
        slug: 'bosch',
        description: 'Leader mondial en technologie de chauffage - Germany',
        website: 'https://www.bosch.com',
        isActive: true,
      },
    }),
    prisma.manufacturer.upsert({
      where: { slug: 'vaillant' },
      update: {},
      create: {
        name: 'Vaillant',
        slug: 'vaillant',
        description: 'Solutions de chauffage innovantes - Germany',
        website: 'https://www.vaillant.com',
        isActive: true,
      },
    }),
  ])

  console.log('✅ Manufacturers created:', manufacturers.length)

  // Create sample products
  const products = await Promise.all([
    prisma.product.upsert({
      where: { sku: 'CHD-001' },
      update: {},
      create: {
        name: 'Chaudière Gaz Condensation Bosch',
        slug: 'chaudiere-gaz-condensation-bosch',
        description: 'Chaudière à gaz haute performance avec technologie de condensation',
        sku: 'CHD-001',
        price: 2500.00,
        salePrice: 2200.00,
        stockQuantity: 10,
        categoryId: categories[0].id,
        manufacturerId: manufacturers[0].id,
        isActive: true,
        isFeatured: true,
        specifications: JSON.stringify({
          power: '24kW',
          efficiency: '95%',
          fuel: 'Natural Gas',
          warranty: '5 years'
        }),
        features: ['Haute efficacité', 'Compact', 'Silencieux', 'Écologique'],
        dimensions: JSON.stringify({
          width: 440,
          height: 720,
          depth: 338
        }),
      },
    }),
    prisma.product.upsert({
      where: { sku: 'RAD-001' },
      update: {},
      create: {
        name: 'Radiateur Aluminium Design',
        slug: 'radiateur-aluminium-design',
        description: 'Radiateur en aluminium avec design moderne',
        sku: 'RAD-001',
        price: 150.00,
        salePrice: 120.00,
        stockQuantity: 25,
        categoryId: categories[1].id,
        manufacturerId: manufacturers[1].id,
        isActive: true,
        specifications: JSON.stringify({
          material: 'Aluminum',
          height: '600mm',
          sections: '8',
          output: '1200W'
        }),
        features: ['Design moderne', 'Chauffage rapide', 'Durable', 'Facile à installer'],
        dimensions: JSON.stringify({
          width: 640,
          height: 600,
          depth: 95
        }),
      },
    }),
  ])

  console.log('✅ Products created:', products.length)

  // Create product images
  await Promise.all([
    prisma.productImage.create({
      data: {
        productId: products[0].id,
        url: '/images/chaudiere-bosch.jpg',
        altText: 'Chaudière Bosch',
        sortOrder: 1,
      },
    }),
    prisma.productImage.create({
      data: {
        productId: products[1].id,
        url: '/images/radiateur-aluminium.jpg',
        altText: 'Radiateur Aluminium',
        sortOrder: 1,
      },
    }),
  ])

  console.log('✅ Product images created')

  console.log('🎉 Database seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })