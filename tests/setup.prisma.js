// tests/setup.prisma.js
import { config as loadEnv } from 'dotenv';
import { execSync } from 'child_process';
import { beforeAll } from 'vitest';

loadEnv({ path: '.env.test' });

beforeAll(() => {
  execSync('npx prisma db push --force-reset --skip-generate --accept-data-loss', { stdio: 'inherit' });
});
