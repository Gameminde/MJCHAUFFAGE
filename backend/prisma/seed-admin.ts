import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding admin user...');

  // Check if admin already exists
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });

  if (existingAdmin) {
    console.log('✅ Admin user already exists:', existingAdmin.email);
    return;
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin@123', 12);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@mjchauffage.com',
      firstName: 'Admin',
      lastName: 'MJ CHAUFFAGE',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
      isVerified: true,
    },
  });

  console.log('✅ Admin user created successfully!');
  console.log('📧 Email:', adminUser.email);
  console.log('🔑 Password: Admin@123');
  console.log('');
  console.log('⚠️  IMPORTANT: Please change this password after first login!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
