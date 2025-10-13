// /procurement/screened/+page.server.js
import { fail, redirect } from '@sveltejs/kit';
import { prisma } from '$lib/stocks/stockEngine.js';

// number coercion: '' | null | undefined -> null, else Number(v)
const n = (v) => (v === '' || v == null ? null : Number(v));

export async function load({ fetch, url }) {
  // Suppliers for the dropdown
  const res = await fetch('/api/suppliers');
  const j = await res.json().catch(() => ({ ok: false, data: [] }));
  const suppliers = j.ok ? j.data : [];

  // Defaults from query (optional)
  const SHADES = ['WHITE', 'LIGHTGREY', 'GREY', 'BLACK', 'BROWN'];
  const qsSupplier = Number(url.searchParams.get('supplierId') || 0);
  const qsShade = (url.searchParams.get('shade') || '').trim().toUpperCase();

  return {
    suppliers,
    defaults: {
      supplierId: qsSupplier || (suppliers[0]?.id ?? ''),
      // Default screened MMA; change per station via query (?toMmaCode=...)
      toMmaCode: url.searchParams.get('toMmaCode') || 'ABS_SCREENED',
      shade: qsShade || SHADES[0],
    }
  };
}

export const actions = {
  async purchase({ request }) {
    const fd = await request.formData();

    // Required inputs
    const toMmaCode = String(fd.get('toMmaCode') || '').trim();
    const supplierId = n(fd.get('supplierId'));
    const shade = String(fd.get('shade') || '').trim().toUpperCase();

    if (!toMmaCode || supplierId == null || !Number.isFinite(supplierId) || supplierId <= 0 || !shade) {
      return fail(400, {
        error: 'Please select supplier & shade (and ensure the screened MMA is set).',
        values: Object.fromEntries(fd)
      });
    }

    // Breakdown (must sum > 0)
    const lumps = Math.max(0, n(fd.get('lumps')) ?? 0);
    const chips = Math.max(0, n(fd.get('chips')) ?? 0);
    const fines = Math.max(0, n(fd.get('fines')) ?? 0);
    const total = (lumps || 0) + (chips || 0) + (fines || 0);

    if (!(total > 0)) {
      return fail(400, {
        error: 'Enter a positive breakdown: at least one of Lumps/Chips/Fines must be > 0.',
        values: Object.fromEntries(fd)
      });
    }

    // Optional numeric costs
    const ratePerMt       = n(fd.get('ratePerMt'));
    const freightPerMt    = n(fd.get('freightPerMt'));
    const supplierFreight = n(fd.get('supplierFreight'));
    const roadExp         = n(fd.get('roadExp'));
    const cashPaid        = n(fd.get('cashPaid'));

    // Optional text fields
    const paymentMode = (fd.get('paymentMode') ?? '').toString().trim() || null;
    const remarks     = (fd.get('remarks') ?? '').toString().trim() || null;
    const purchaseDate = (fd.get('date') || new Date().toISOString().slice(0, 10)).toString();

    // Common meta blob (stored on each ledger line)
    const meta = {
      kind: 'PURCHASE',
      purchaseDate,
      costs: {
        ratePerMt:       ratePerMt ?? null,
        freightPerMt:    freightPerMt ?? null,
        supplierFreight: supplierFreight ?? null,
        roadExp:         roadExp ?? null,
        cashPaid:        cashPaid ?? null,
      },
      paymentMode,
      remarks,
    };

    try {
      // Make all size-specific postings atomically
      await prisma.$transaction(async (tx) => {
        const L = tx.stockLedger;

        // helper to create a ledger row
        const post = async (size, qty) => {
          if (!qty || qty <= 0) return;
          await L.create({
            data: {
              mmaCode: toMmaCode,
              supplierId: Number(supplierId),
              shade,
              size,                     // 'LUMPS' | 'CHIPS' | 'FINE'
              qtyDelta: Number(qty),    // positive
              reason: 'PURCHASE',
              linkId: null,             // not a process/transport
              meta
            }
          });
        };

        await post('LUMPS', lumps);
        await post('CHIPS', chips);
        await post('FINE',  fines);
      });

      // Success
      throw redirect(303, `/procurement/screened?ok=1&mma=${encodeURIComponent(toMmaCode)}&sup=${supplierId}`);
    } catch (err) {
      console.error('Purchase (3-size transaction) failed:', err);
      return fail(500, {
        error: err?.message || 'Unexpected error while saving purchase.',
        values: Object.fromEntries(fd)
      });
    }
  },

  async cancel() {
    throw redirect(303, '/');
  }
};
