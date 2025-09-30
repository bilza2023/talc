// tests/setup.prisma.js
import { config as loadEnv } from 'dotenv';
import { execSync } from 'child_process';
import { beforeAll } from 'vitest';

// Load .env.test first (or keep if you prefer to only force below)
loadEnv({ path: '.env.test' });

// Force DATABASE_URL for the *current test process*
const TEST_DB_URL = 'file:memdb1?mode=memory&cache=shared';
process.env.DATABASE_URL = TEST_DB_URL;
process.env.PRISMA_IGNORE_ENV_FILE = '1'; // stop Prisma from re-reading .env

beforeAll(() => {
  // Now stamp the schema into the same in-memory DB
  execSync('npx prisma db push --force-reset --skip-generate --accept-data-loss', {
    stdio: 'inherit',
    env: {
      ...process.env,               // includes our forced DATABASE_URL + PRISMA_IGNORE_ENV_FILE
    },
  });
});
