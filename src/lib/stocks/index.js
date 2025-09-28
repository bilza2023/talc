// /home/bilal-tariq/ab/src/lib/stocks/index.js
import { PrismaClient } from '@prisma/client';
import Stock from '../stock/Stock.js';

export const prisma = new PrismaClient();

export const rawStock = new Stock({
  prisma,
  ledgerModel: 'rawLedger', // new name --->unscreened
  transportModel: 'rawTransport',
  sizeDefault: 'ANY',
});

export const processedStock = new Stock({
  prisma,
  ledgerModel: 'processedLedger',// new name --->screened
  transportModel: 'processedTransport',
});

export const sortedStock = new Stock({
  prisma,
  ledgerModel: 'sortedLedger', // new name --->production
  transportModel: 'sortedTransport',
});

export const exportGradeStock = new Stock({
  prisma,
  ledgerModel: 'exportGradeLedger', // new name --->production
  transportModel: 'exportGradeTransport',
});

export default { prisma, rawStock, processedStock, sortedStock,exportGradeStock };


///===Aliasis for the  App

export const unscreenedStock = rawStock;
export const screenedStock   = processedStock;
export const productionStock = sortedStock;

