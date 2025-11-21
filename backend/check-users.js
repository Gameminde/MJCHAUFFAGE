// Script pour vérifier les utilisateurs dans la base de données
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  console.log('🔍 Recherche des utilisateurs...');

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      firstName: true,
      lastName: true
    }
  });

  console.log(`📊 Trouvé ${users.length} utilisateurs:`);

  users.forEach(user => {
    console.log(`- ${user.email} (${user.role}) - ${user.isActive ? 'Actif' : 'Inactif'}`);
  });

  // Chercher spécifiquement les admins
  const admins = users.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN');
  console.log(`👑 Administrateurs: ${admins.length}`);
  admins.forEach(admin => {
    console.log(`  - ${admin.email} (${admin.role})`);
  });

  if (admins.length === 0) {
    console.log('⚠️  Aucun administrateur trouvé! Création d\'un admin par défaut...');

    const hashedPassword = await require('bcrypt').hash('admin123', 12);

    const newAdmin = await prisma.user.create({
      data: {
        email: 'admin@mjchauffage.dz',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'MJ Chauffage',
        role: 'SUPER_ADMIN',
        isActive: true,
        isVerified: true
      }
    });

    console.log('✅ Admin créé:', newAdmin.email);
    console.log('🔑 Mot de passe: admin123');
  }
}

checkUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());











