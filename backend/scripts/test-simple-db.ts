import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

console.log('🔍 Test de connexion simple à la base de données...');
console.log('DATABASE_URL:', process.env.DATABASE_URL);

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testSimpleConnection() {
  try {
    console.log('1. Tentative de connexion...');
    
    // Test de connexion simple
    await prisma.$connect();
    console.log('✅ Connexion réussie');
    
    // Test de requête simple
    console.log('2. Test de requête...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Requête réussie:', result);
    
    await prisma.$disconnect();
    console.log('✅ Déconnexion réussie');
    
  } catch (error) {
    console.error('❌ ERREUR:', error);
    process.exit(1);
  }
}

testSimpleConnection();