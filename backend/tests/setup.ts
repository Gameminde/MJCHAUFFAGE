/// <reference types="jest" />
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.test for all test suites
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });
