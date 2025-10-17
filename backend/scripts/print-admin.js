const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@mjchauffage.com' },
      select: {
        id: true,
        email: true,
        role: true,
        isVerified: true,
        isActive: true,
        password: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    console.log('Admin user:', user);
  } catch (err) {
    console.error('Error reading admin user:', err);
  } finally {
    await prisma.$disconnect();
  }
})();