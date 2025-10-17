import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Resetting admin user...');

  // Delete existing admin user
  await prisma.user.deleteMany({
    where: { email: 'admin@mjchauffage.com' }
  });

  console.log('🗑️ Existing admin user deleted');

  // Create new admin user with correct password
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

  console.log('✅ New admin user created successfully!');
  console.log('📧 Email:', adminUser.email);
  console.log('🔑 Password: Admin@123');
  console.log('🆔 User ID:', adminUser.id);
  console.log('');
  console.log('⚠️  IMPORTANT: Please change this password after first login!');
}

main()
  .catch((e) => {
    console.error('❌ Error resetting admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });