import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom', // Changed to jsdom for React components
    setupFiles: ['./jest.setup.ts', './tests/setup/vitest.setup.ts'],
    // Add Jest compatibility
    globalSetup: [],
    mockReset: true,
    restoreMocks: true,
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'src/**/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'tests/unit/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'tests/integration/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    exclude: ['tests/e2e/**/*', 'tests/performance/**/*'],
    // Enable Jest compatibility
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 5000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        '.next/',
        'coverage/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.ts',
        '**/types.ts',
        'src/test/',
        'tests/setup/',
        'tests/e2e/',
        'tests/performance/',
        'src/app/api/',
        'src/pages/api/',
      ],
      thresholds: {
        global: {
          branches: 75,
          functions: 75,
          lines: 75,
          statements: 75,
        },
        './src/components/': {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        './src/hooks/': {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
        },
        './src/services/': {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        './src/lib/': {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
        },
      },
    },
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/tests': resolve(__dirname, './tests')
    }
  }
});