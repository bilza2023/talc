// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    globalSetup: 'tests/global.prisma.setup.js', // <-- run once before all tests
    setupFiles: ['tests/setup.db.js'],          // <-- per-suite cleanup only
    threads: false,                              // single worker (shared in-memory DB)
    reporters: 'verbose',
  },
});
