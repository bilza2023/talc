// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,                                  // makes beforeAll/afterAll available
    setupFiles: ['tests/setup.prisma.js', 'tests/setup.db.js'],
    threads: false,                                  // shared in-memory sqlite
    reporters: 'verbose',
  },
});
