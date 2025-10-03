import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin123!', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@mjchauffage.com' },
    update: {},
    create: {
      email: 'admin@mjchauffage.com',
      firstName: 'Admin',
      lastName: 'User',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
      isVerified: true,
    },
  });

  // Create manufacturers
  const manufacturers = [
    {
      name: 'Viessmann',
      slug: 'viessmann',
      description: 'Leading heating technology manufacturer',
      website: 'https://www.viessmann.com',
    },
    {
      name: 'Bosch',
      slug: 'bosch',
      description: 'Premium heating and hot water solutions',
      website: 'https://www.bosch.com',
    },
    {
      name: 'Vaillant',
      slug: 'vaillant',
      description: 'Innovative heating and cooling technology',
      website: 'https://www.vaillant.com',
    },
    {
      name: 'De Dietrich',
      slug: 'de-dietrich',
      description: 'French heating systems manufacturer',
      website: 'https://www.dedietrich-thermique.fr',
    },
  ];

  for (const manufacturer of manufacturers) {
    await prisma.manufacturer.upsert({
      where: { slug: manufacturer.slug },
      update: manufacturer,
      create: manufacturer,
    });
  }

  // Create categories
  const categories = [
    {
      name: 'Boilers',
      slug: 'boilers',
      description: 'Gas, oil, and electric boilers for heating and hot water',
    },
    {
      name: 'Heating Systems',
      slug: 'heating-systems',
      description: 'Complete heating system solutions',
    },
    {
      name: 'Heat Pumps',
      slug: 'heat-pumps',
      description: 'Energy-efficient heat pump systems',
    },
    {
      name: 'Radiators',
      slug: 'radiators',
      description: 'Modern and traditional radiator solutions',
    },
    {
      name: 'Spare Parts',
      slug: 'spare-parts',
      description: 'Replacement parts and components',
    },
    {
      name: 'Thermostats',
      slug: 'thermostats',
      description: 'Smart and programmable thermostats',
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  // Create service types
  const serviceTypes = [
    {
      name: 'Boiler Installation',
      description: 'Professional boiler installation service',
      duration: 480, // 8 hours
      price: 500.00,
    },
    {
      name: 'Annual Boiler Service',
      description: 'Annual maintenance and safety check',
      duration: 120, // 2 hours
      price: 150.00,
    },
    {
      name: 'Emergency Repair',
      description: 'Emergency heating system repair',
      duration: 180, // 3 hours
      price: 200.00,
    },
    {
      name: 'System Upgrade',
      description: 'Heating system upgrade and modernization',
      duration: 720, // 12 hours
      price: 800.00,
    },
    {
      name: 'Radiator Installation',
      description: 'New radiator installation service',
      duration: 240, // 4 hours
      price: 300.00,
    },
  ];

  for (const serviceType of serviceTypes) {
    await prisma.serviceType.upsert({
      where: { name: serviceType.name },
      update: serviceType,
      create: serviceType,
    });
  }

  // Get created manufacturers and categories for products
  const viessmann = await prisma.manufacturer.findUnique({ where: { slug: 'viessmann' } });
  const bosch = await prisma.manufacturer.findUnique({ where: { slug: 'bosch' } });
  const boilersCategory = await prisma.category.findUnique({ where: { slug: 'boilers' } });
  const heatPumpsCategory = await prisma.category.findUnique({ where: { slug: 'heat-pumps' } });
  const radiatorsCategory = await prisma.category.findUnique({ where: { slug: 'radiators' } });

  // Create sample products
  const products = [
    {
      name: 'Viessmann Vitodens 100-W Gas Condensing Boiler',
      slug: 'viessmann-vitodens-100w',
      sku: 'VIT-VD100W-24',
      description: 'High-efficiency gas condensing boiler with compact design. Perfect for small to medium homes.',
      shortDescription: 'Compact gas condensing boiler with high efficiency ratings',
      categoryId: boilersCategory?.id!,
      manufacturerId: viessmann?.id!,
      price: 1200.00,
      costPrice: 800.00,
      stockQuantity: 15,
      minStock: 5,
      weight: 35.5,
      dimensions: JSON.stringify({ length: 440, width: 350, height: 720 }),
      specifications: JSON.stringify({
        output: '24kW',
        efficiency: '94%',
        fuelType: 'Natural Gas',
        warranty: '5 years',
      }),
      features: 'Compact design,High efficiency,Easy installation,Digital display',
      isFeatured: true,
    },
    {
      name: 'Bosch Greenstar 8000 Life Heat Pump',
      slug: 'bosch-greenstar-8000-life',
      sku: 'BSH-GS8000L-12',
      description: 'Air source heat pump for heating and hot water with excellent seasonal efficiency.',
      shortDescription: 'Energy-efficient air source heat pump system',
      categoryId: heatPumpsCategory?.id!,
      manufacturerId: bosch?.id!,
      price: 3500.00,
      costPrice: 2500.00,
      stockQuantity: 8,
      minStock: 2,
      weight: 125.0,
      dimensions: JSON.stringify({ length: 1200, width: 600, height: 1400 }),
      specifications: JSON.stringify({
        output: '12kW',
        cop: '4.2',
        refrigerant: 'R32',
        warranty: '7 years',
      }),
      features: 'High COP rating,Low noise operation,Smart controls,Weather compensation',
      isFeatured: true,
    },
    {
      name: 'Premium Steel Panel Radiator 600x1200mm',
      slug: 'premium-steel-radiator-600x1200',
      sku: 'RAD-PSR-6012',
      description: 'High-quality steel panel radiator with excellent heat output and modern design.',
      shortDescription: 'Premium steel panel radiator for efficient heating',
      categoryId: radiatorsCategory?.id!,
      price: 180.00,
      costPrice: 120.00,
      stockQuantity: 25,
      minStock: 10,
      weight: 18.5,
      dimensions: JSON.stringify({ length: 1200, width: 100, height: 600 }),
      specifications: JSON.stringify({
        output: '2200W',
        material: 'Steel',
        finish: 'White RAL 9010',
        pressure: '10 bar',
      }),
      features: 'Double panel double convector,Side connections,Pre-painted finish,TÜV certified',
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  }

  // Create demo customer
  const customerPassword = await bcrypt.hash('Customer123!', 12);
  
  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: customerPassword,
      role: 'CUSTOMER',
      isActive: true,
      isVerified: true,
    },
  });

  await prisma.customer.upsert({
    where: { userId: customerUser.id },
    update: {},
    create: {
      userId: customerUser.id,
      customerType: 'B2C',
    },
  });

  // Create technician
  const technicianPassword = await bcrypt.hash('Tech123!', 12);
  
  const technicianUser = await prisma.user.upsert({
    where: { email: 'technician@mjchauffage.com' },
    update: {},
    create: {
      email: 'technician@mjchauffage.com',
      firstName: 'Mike',
      lastName: 'Smith',
      password: technicianPassword,
      role: 'TECHNICIAN',
      isActive: true,
      isVerified: true,
    },
  });

  await prisma.technician.upsert({
    where: { userId: technicianUser.id },
    update: {},
    create: {
      userId: technicianUser.id,
      employeeId: 'TECH001',
      specialties: 'Boiler Installation,Heat Pump Service,System Maintenance',
    },
  });
}

main()
  .catch((e) => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });