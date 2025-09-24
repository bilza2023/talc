// /src/routes/stations/abs/purchase/+page.server.js
import { rawStock } from '$lib/stocks/index.js';

// Hard-set for this route
const STATION_CODE = 'ABS';
const RAW_MMA_CODE = 'ABS_RAW';

// Temporary mock suppliers (id must be numeric for stock.deposit)
const MOCK_SUPPLIERS = [
  { id: 540, name: '540 — Default Supplier' },
  { id: 187, name: '187 — Supplier A' },
  { id: 188, name: '188 — Supplier B' },
  { id: 189, name: '189 — Supplier C' }
];

export async function load({ url }) {
  // Optional defaults from URL
  const supplierIdParam = url.searchParams.get('supplierId');
  const shade = url.searchParams.get('shade') ?? 'WHITE';
  const size = url.searchParams.get('size') ?? 'CHIPS';
  const qty = url.searchParams.get('qty') ?? '';

  const fallbackId = MOCK_SUPPLIERS[0].id;
  const supplierId = supplierIdParam ? Number(supplierIdParam) : fallbackId;

  return {
    stationCode: STATION_CODE,
    mmaCode: RAW_MMA_CODE,
    suppliers: MOCK_SUPPLIERS,
    defaults: { supplierId, shade, size, qty }
  };
}

export const actions = {
  default: async ({ request }) => {
    const form = await request.formData();

    const supplierId = Number(form.get('supplierId'));
    const shade = String(form.get('shade') || '');
    const size = String(form.get('size') || '');
    const qty = Number(form.get('qty'));

    if (!supplierId || !shade || !size || !qty || qty <= 0) {
      return { success: false, error: 'Please select supplier, shade, size and enter a positive quantity.' };
    }

    await rawStock.deposit({
      toMmaCode: RAW_MMA_CODE,
      toStationCode: STATION_CODE,
      supplierId,
      shade,
      size,
      qty
    });

    const supplier = MOCK_SUPPLIERS.find(s => s.id === supplierId);

    return {
      success: true,
      posted: {
        supplierId,
        supplierName: supplier?.name ?? String(supplierId),
        shade,
        size,
        qty
      }
    };
  }
};
