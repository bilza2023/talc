// Server load for: Reports → Stock Ledger
import { run as runLedger } from '$lib/reports/ledger.js';

export const load = async ({ url, locals }) => {
  const prisma = locals?.prisma;

  // Pull filters from the URL (all optional)
  const params = {
    supplierId: url.searchParams.get('supplierId') || undefined,
    mmaCode:    url.searchParams.get('mmaCode')    || undefined,
    shade:      url.searchParams.get('shade')      || undefined,
    size:       url.searchParams.get('size')       || undefined,
    from:       url.searchParams.get('from')       || undefined, // ISO date/string
    to:         url.searchParams.get('to')         || undefined  // ISO date/string
  };

  const { envelope } = await runLedger({ prisma, url, params });
  return { envelope, filters: params };
};
