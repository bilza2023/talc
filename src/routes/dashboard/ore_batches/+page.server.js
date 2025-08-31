import prisma from '$lib/server/prisma.js';

export async function load() {
  const rows = await prisma.oreBatch.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return { rows };
}
