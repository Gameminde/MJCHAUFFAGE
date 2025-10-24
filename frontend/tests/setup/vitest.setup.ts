import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';

// Global test setup for Vitest integration tests

beforeAll(async () => {
  // Global setup before all tests
  console.log('Setting up integration test environment...');
  
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.API_BASE_URL = 'http://localhost:5000';
  process.env.FRONTEND_URL = 'http://localhost:3000';
  
  // Wait a bit for servers to be ready
  await new Promise(resolve => setTimeout(resolve, 2000));
});

afterAll(async () => {
  // Global cleanup after all tests
  console.log('Cleaning up integration test environment...');
});

beforeEach(async () => {
  // Setup before each test
  // This could include clearing test data, resetting mocks, etc.
});

afterEach(async () => {
  // Cleanup after each test
  // This could include clearing test data, resetting state, etc.
});