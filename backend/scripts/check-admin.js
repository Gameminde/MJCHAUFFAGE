const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    console.log('🔍 Recherche de l\'utilisateur admin...');
    
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@mjchauffage.com' }
    });
    
    if (admin) {
      console.log('✅ Admin trouvé:', {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        firstName: admin.firstName,
        lastName: admin.lastName,
        isEmailVerified: admin.isEmailVerified,
        createdAt: admin.createdAt
      });
      
      // Vérifier aussi s'il y a d'autres admins
      const allAdmins = await prisma.user.findMany({
        where: {
          role: 'ADMIN'
        }
      });
      
      console.log(`📊 Total d'administrateurs: ${allAdmins.length}`);
      allAdmins.forEach((admin, index) => {
        console.log(`   ${index + 1}. ${admin.email} (${admin.role})`);
      });
      
    } else {
      console.log('❌ Aucun admin trouvé avec l\'email admin@mjchauffage.com');
      
      // Chercher tous les utilisateurs pour diagnostic
      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          role: true,
          firstName: true,
          lastName: true
        }
      });
      
      console.log(`📊 Total d'utilisateurs dans la base: ${allUsers.length}`);
      if (allUsers.length > 0) {
        console.log('👥 Utilisateurs existants:');
        allUsers.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.email} (${user.role})`);
        });
      }
    }
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Connexion Prisma fermée');
  }
}

checkAdmin();