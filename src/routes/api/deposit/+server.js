// /api/deposit
import { json } from '@sveltejs/kit';
import { stock } from '../../../lib/stocks/stockEngine.js';

const n = (v) => (v === null || v === undefined || v === '' ? null : Number(v));

export async function POST({ url }) {
  try {
    const toMmaCode = url.searchParams.get('toMmaCode')?.trim();
    const supplierId = n(url.searchParams.get('supplierId'));
    const shade      = url.searchParams.get('shade')?.trim()?.toUpperCase();
    const size       = (url.searchParams.get('size') || 'ANY').toUpperCase();
    const qty        = n(url.searchParams.get('qty'));
    const reason     = (url.searchParams.get('reason') || '').toUpperCase();

    // Optional purchase fields (all via query to keep consistency with your APIs)
    const docDate         = url.searchParams.get('docDate'); // ISO or yyyy-mm-dd
    const paymentMode     = url.searchParams.get('paymentMode') || null;
    const lumps           = n(url.searchParams.get('lumps'));
    const chips           = n(url.searchParams.get('chips'));
    const fines           = n(url.searchParams.get('fines'));
    const ratePerMt       = n(url.searchParams.get('ratePerMt'));
    const freightPerMt    = n(url.searchParams.get('freightPerMt'));
    const supplierFreight = n(url.searchParams.get('supplierFreight'));
    const roadExp         = n(url.searchParams.get('roadExp'));
    const cashPaid        = n(url.searchParams.get('cashPaid'));
    const remarks         = url.searchParams.get('remarks') || null;

    // Basic guards (common)
    if (!toMmaCode || !supplierId || !shade) {
      return json({ ok: false, error: 'Missing required params: toMmaCode, supplierId, shade' }, { status: 400 });
    }

    // Decide path: PURCHASE if any breakdown is provided or reason=PURCHASE; else legacy qty path
    const hasBreakdown = (lumps ?? 0) > 0 || (chips ?? 0) > 0 || (fines ?? 0) > 0;
    const isPurchase   = hasBreakdown || reason === 'PURCHASE';

    if (isPurchase) {
      const sum = (lumps ?? 0) + (chips ?? 0) + (fines ?? 0);
      if (!qty && sum <= 0) {
        return json({ ok: false, error: 'Provide qty OR a positive breakdown (lumps/chips/fines).' }, { status: 400 });
      }

      const result = await stock.deposit({
        toMmaCode,
        supplierId,
        shade,
        size,
        reason: 'PURCHASE',
        qty: qty ?? undefined, // optional; Stock.deposit will sum breakdown if not given
        purchase: {
          docDate,
          paymentMode,
          lumps: lumps ?? 0,
          chips: chips ?? 0,
          fines: fines ?? 0,
          ratePerMt,
          freightPerMt,
          supplierFreight,
          roadExp,
          cashPaid,
          remarks
        }
      });

      return json({ ok: true, data: result });
    }

    // Legacy / generic deposit (e.g., ADJUST). Qty required.
    if (!(qty > 0)) {
      return json({ ok: false, error: 'qty must be > 0' }, { status: 400 });
    }

    const result = await stock.deposit({
      toMmaCode,
      supplierId,
      shade,
      size,
      qty,
      reason: reason || 'ADJUST'
    });

    return json({ ok: true, data: result });
  } catch (err) {
    return json({ ok: false, error: err.message || String(err) }, { status: 500 });
  }
}
