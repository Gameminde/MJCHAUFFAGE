const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    const user = await prisma.user.findFirst({ 
      where: { role: 'ADMIN' } 
    });
    
    if (user) {
      console.log('Admin user found:');
      console.log('Email:', user.email);
      console.log('Password hash:', user.password);
      console.log('Is Active:', user.isActive);
      console.log('Is Verified:', user.isVerified);
      console.log('Role:', user.role);
    } else {
      console.log('No admin user found');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();