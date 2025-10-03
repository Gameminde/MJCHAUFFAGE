import { PrismaClient } from '@prisma/client';
import { config } from './environment';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: config.env === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: config.database.url,
      },
    },
  });

if (config.env !== 'production') globalForPrisma.prisma = prisma;

// Connection test
export async function connectDatabase() {
  try {
    await prisma.$connect();
  } catch (error) {
    process.exit(1);
  }
}

// Graceful shutdown
export async function disconnectDatabase() {
  await prisma.$disconnect();
}