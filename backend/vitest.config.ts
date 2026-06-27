import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    globals: true,
    setupFiles: ['tests/setup.ts'],
    restoreMocks: true,
    clearMocks: true,
    // Keep runtime simple; concurrency test will seed its own data.
    testTimeout: 30_000,
  },
});

