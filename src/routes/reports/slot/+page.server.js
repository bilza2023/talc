// Stock Slots — all MMAs, every slot (supplierId × shade × size) with qty > 0
// Data source: stock.slots({ mmaCode, positiveOnly: true })

import { prisma, stock } from '$lib/stocks/stockEngine.js';

const MMA_CODES = [
  'ABS_RAW',
  'ABS_SCREENED',
  'PSS_SCREENED',
  'PSS_SORTED',
  'KEF_SORTED'
];

export async function load() {
  // Fetch slots for each MMA (positiveOnly = true by default)
  const perMma = await Promise.all(
    MMA_CODES.map(async (mmaCode) => {
      const rows = await stock.slots({ mmaCode, positiveOnly: true }); // [{ mmaCode, supplierId, shade, size, qty }]
      return rows;
    })
  );

  // Flatten → items
  const itemsRaw = perMma.flat();

  // Resolve supplier names (server-side)
  const supplierIds = Array.from(new Set(itemsRaw.map(r => Number(r.supplierId)).filter(Boolean)));
  const suppliers = supplierIds.length
    ? await prisma.supplier.findMany({
        where: { id: { in: supplierIds } },
        select: { id: true, name: true, code: true }
      })
    : [];
  const supplierMap = new Map(suppliers.map(s => [Number(s.id), String(s.name || s.code || s.id)]));

  // Normalize for ListTable (unique rowKey, numbers stay numbers, strings as strings)
  const items = itemsRaw
    .map(r => ({
      id: `${r.mmaCode}::${r.supplierId}::${r.shade}::${r.size}`,
      mmaCode: r.mmaCode,
      supplierId: Number(r.supplierId),
      supplierName: supplierMap.get(Number(r.supplierId)) || `#${r.supplierId}`,
      shade: String(r.shade),
      size: String(r.size),
      qty: Number(r.qty)
    }))
    // Default initial order: group by MMA asc, then qty desc, then supplier asc
    .sort((a, b) =>
      a.mmaCode.localeCompare(b.mmaCode) ||
      b.qty - a.qty ||
      a.supplierName.localeCompare(b.supplierName)
    );

  return {
    title: 'Stock — Slots by MMA',
    items
  };
}