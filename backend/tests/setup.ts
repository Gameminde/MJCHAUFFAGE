import * as dotenv from 'dotenv';
import * as path from 'path';
import { execSync } from 'child_process';

// This function is executed once before all test suites.
const setup = () => {
  // Load environment variables from .env.test
  dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

  // Ensure the test database is up-to-date before running tests
  try {
    console.log('Setting up test database...');
    // The --skip-seed flag is used because we will seed data specifically for each test.
    execSync('npx prisma migrate reset --force --skip-seed', { stdio: 'inherit' });
    console.log('Test database setup complete.');
  } catch (error) {
    console.error('Failed to set up the test database:', error);
    process.exit(1);
  }
};

export default setup;
