import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import Stock from '../stock/Stock.js';

export { prisma };

export const stock = new Stock({
  prisma,
  ledgerDelegate: 'stockLedger',
  transportDelegate: 'stockTransport',
  sizeDefault: 'ANY',
});
