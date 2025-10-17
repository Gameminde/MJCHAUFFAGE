import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // eslint-disable-next-line no-console
    console.log('🔐 Creating admin user...');

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@mjchauffage.com' }
    });

    if (existingAdmin) {
      // eslint-disable-next-line no-console
      console.log('✅ Admin user already exists:', existingAdmin.email);
      // eslint-disable-next-line no-console
      console.log('📊 User details:', {
        id: existingAdmin.id,
        email: existingAdmin.email,
        firstName: existingAdmin.firstName,
        lastName: existingAdmin.lastName,
        role: existingAdmin.role,
        isActive: existingAdmin.isActive,
        hasPassword: !!existingAdmin.password
      });
      return existingAdmin;
    }

    // Hash password
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@mjchauffage.com',
        firstName: 'Admin',
        lastName: 'MJ Chauffage',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
        isVerified: true,
        emailVerified: new Date()
      }
    });

    // eslint-disable-next-line no-console
    console.log('✅ Admin user created successfully!');
    // eslint-disable-next-line no-console
    console.log('📊 User details:', {
      id: adminUser.id,
      email: adminUser.email,
      firstName: adminUser.firstName,
      lastName: adminUser.lastName,
      role: adminUser.role,
      isActive: adminUser.isActive
    });
    // eslint-disable-next-line no-console
    console.log('🔑 Login credentials:');
    // eslint-disable-next-line no-console
    console.log('   Email: admin@mjchauffage.com');
    // eslint-disable-next-line no-console
    console.log('   Password: admin123');

    return adminUser;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Error creating admin user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createAdminUser()
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('🎉 Script completed successfully!');
    // eslint-disable-next-line no-process-exit
    process.exit(0);
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('💥 Script failed:', error);
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  });