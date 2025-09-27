// scripts/wipeSuppliers.js  (ESM)
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const { count } = await prisma.supplier.deleteMany({}); // no where → delete ALL rows
  console.log(`Deleted ${count} suppliers`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
