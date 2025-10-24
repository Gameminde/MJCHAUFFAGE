#!/usr/bin/env tsx

import { runDatabaseTests } from '../src/lib/database-test';
import { logger } from '../src/utils/logger';

async function main() {
  try {
    logger.info('Starting database test script...');
    await runDatabaseTests();
    logger.info('Database test script completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Database test script failed:', error);
    process.exit(1);
  }
}

main();