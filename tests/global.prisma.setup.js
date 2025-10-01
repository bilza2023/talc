// tests/global.prisma.setup.js
import { config as loadEnv } from 'dotenv';
import { execSync } from 'child_process';

export default async function() {
  // Prefer .env.test but hard force the DB URL so .env is ignored
  loadEnv({ path: '.env.test' });
  process.env.DATABASE_URL = 'file:memdb1?mode=memory&cache=shared';
  process.env.PRISMA_IGNORE_ENV_FILE = '1';

  execSync('npx prisma db push --force-reset --skip-generate --accept-data-loss', {
    stdio: 'inherit',
    env: { ...process.env },
  });
}
