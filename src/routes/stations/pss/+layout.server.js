// /src/routes/stations/pss/+layout.server.js
import { prisma, processedStock, sortedStock } from '$lib/stocks/index.js';

/** @type {import('./$types').LayoutServerLoad} */
export async function load() {
  const stationCode = 'PSS';

  // Basic lists (keep as-is for dropdowns)
  const suppliers = await prisma.supplier.findMany({
    where: {},
    orderBy: { name: 'asc' },
    select: { id: true, name: true, code: true }
  });

  const shadeOptions = ['WHITE', 'GREY', 'LIGHTGREY', 'GREEN', 'MIXED'];
  const sizeOptions  = ['LUMPS', 'CHIPS', 'FINE', 'ANY'];

  const mmas = [
    { mmaCode: 'PSS_PROCESSED', label: 'Processed (SCREENED)' },
    { mmaCode: 'PSS_SORTED',    label: 'Sorted' }
  ];

  // Use the tested Stock API to compute inbound (pending receives)
  const [procInboundRows, sortInboundRows] = await Promise.all([
    processedStock.inbound({ mmaCode: 'PSS_SCREENED' }),
    sortedStock.inbound({ mmaCode: 'PSS_SORTED' })
  ]);

  const inboundCounts = {
    PSS_PROCESSED: procInboundRows.length,
    PSS_SORTED:    sortInboundRows.length
  };

  return {
    stationCode,
    suppliers,
    shadeOptions,
    sizeOptions,
    mmas,
    inboundCounts
  };
}
