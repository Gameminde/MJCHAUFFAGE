const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function testPassword() {
  try {
    console.log('🔍 Récupération de l\'utilisateur admin...');
    
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@mjchauffage.com' }
    });
    
    if (!admin) {
      console.log('❌ Admin non trouvé');
      return;
    }
    
    console.log('✅ Admin trouvé:', {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      hasPassword: !!admin.password,
      passwordLength: admin.password ? admin.password.length : 0
    });
    
    // Tester différents mots de passe
    const passwordsToTest = [
      'Admin@123',
      'admin123',
      'admin',
      'Admin123',
      'ADMIN@123',
      'mjchauffage123'
    ];
    
    console.log('\n🔐 Test des mots de passe...');
    
    for (const password of passwordsToTest) {
      try {
        const isValid = await bcrypt.compare(password, admin.password);
        console.log(`   ${password}: ${isValid ? '✅ VALIDE' : '❌ Invalide'}`);
        
        if (isValid) {
          console.log(`\n🎉 MOT DE PASSE TROUVÉ: "${password}"`);
          break;
        }
      } catch (error) {
        console.log(`   ${password}: ❌ Erreur - ${error.message}`);
      }
    }
    
    // Afficher le hash pour diagnostic
    console.log('\n🔍 Hash stocké:', admin.password.substring(0, 20) + '...');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testPassword();