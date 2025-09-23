// /home/bilal-tariq/ab/src/lib/stocks/index.js
import { PrismaClient } from '@prisma/client';
import Stock from '../stock/Stock.js';

export const prisma = new PrismaClient();

export const rawStock = new Stock({
  prisma,
  ledgerModel: 'rawLedger',
  transportModel: 'rawTransport',
  sizeDefault: 'ANY',
});

export const processedStock = new Stock({
  prisma,
  ledgerModel: 'processedLedger',
  transportModel: 'processedTransport',
});

export const sortedStock = new Stock({
  prisma,
  ledgerModel: 'sortedLedger',
  transportModel: 'sortedTransport',
});

export default { prisma, rawStock, processedStock, sortedStock };
