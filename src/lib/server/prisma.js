// src/lib/server/prisma.js
import { PrismaClient } from '@prisma/client';

// prevent multiple instances in dev (Vite HMR)
const prisma = globalThis.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

export default prisma;
