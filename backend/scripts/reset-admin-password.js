const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

(async () => {
  const prisma = new PrismaClient();
  try {
    const email = 'admin@mjchauffage.com';
    const newPassword = 'Admin123!';
    console.log('🔄 Resetting password for', email);

    const user = await prisma.user.findUnique({ where: { email } });
    const hashed = await bcrypt.hash(newPassword, 10);

    if (!user) {
      console.log('⚠️ Admin not found. Creating new admin user...');
      const created = await prisma.user.create({
        data: {
          email,
          firstName: 'Admin',
          lastName: 'User',
          password: hashed,
          role: 'ADMIN',
          isActive: true,
          isVerified: true,
        },
      });
      console.log('✅ Created admin:', created.id);
    } else {
      await prisma.user.update({
        where: { email },
        data: { password: hashed },
      });
      console.log('✅ Password updated successfully.');
    }

    console.log('🔑 New password:', newPassword);
  } catch (err) {
    console.error('❌ Error resetting admin password:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();