import * as dotenv from 'dotenv';
import * as path from 'path';
import { execSync } from 'child_process';

// This function is executed once before all test suites.
const setup = () => {
  // Load environment variables from .env.test
  dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

  // Ensure the test database is up-to-date before running tests
  try {
    execSync('npx prisma migrate reset --force --skip-seed', { stdio: 'ignore' });
};

export default setup;
