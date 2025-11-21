import { execSync } from 'child_process';
import { unlinkSync, existsSync } from 'fs';
import { PrismaClient } from '@prisma/client';

// Configure test environment
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'file:./prisma/test.db';

// Create test database and run migrations
beforeAll(async () => {
  try {
    // Clean up any existing test database
    if (existsSync('prisma/test.db')) {
      unlinkSync('prisma/test.db');
    }

    // Run migrations for test database
    execSync('npx prisma migrate dev --name test-setup --create-db', {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: 'file:./prisma/test.db' }
    });

    // Note: Seeding is handled by individual test files if needed
  } catch (error) {
    console.error('Test setup failed:', error);
    throw error;
  }
});

// Clean up after tests
afterAll(async () => {
  const prisma = new PrismaClient({
    datasourceUrl: 'file:./prisma/test.db'
  });

  try {
    // Clean all tables
    await prisma.$executeRaw`DELETE FROM user_sessions;`;
    await prisma.$executeRaw`DELETE FROM password_resets;`;
    await prisma.$executeRaw`DELETE FROM cart_items;`;
    await prisma.$executeRaw`DELETE FROM reviews;`;
    await prisma.$executeRaw`DELETE FROM order_items;`;
    await prisma.$executeRaw`DELETE FROM payments;`;
    await prisma.$executeRaw`DELETE FROM orders;`;
    await prisma.$executeRaw`DELETE FROM customers;`;
    await prisma.$executeRaw`DELETE FROM users;`;
    await prisma.$executeRaw`DELETE FROM products;`;
    await prisma.$executeRaw`DELETE FROM categories;`;
    await prisma.$executeRaw`DELETE FROM manufacturers;`;
  } catch (error) {
    console.warn('Cleanup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
});