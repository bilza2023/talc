// /src/routes/mma4s/deposit/+page.server.js
import { fail, error } from '@sveltejs/kit';
import { z } from 'zod';
import { createMMA4S } from '$lib/mma/mma4s.js';
import { MMA, SHADE_LIST, SIZE_LIST, zMmaCode, zShade, zSize } from '$lib/mma/enums.js';

// ---- Zod schema for action payload ----
const DepositSchema = z.object({
  mmaCode: zMmaCode,
  supplierId: z.union([z.coerce.number().int().positive(), z.literal(0), z.null()]).transform(v => (v === 0 ? null : v)),
  shade: zShade,
  size: zSize,
  qty: z.coerce.number().positive(),
  amount: z.coerce.number().nonnegative().optional(),   // amount used in deposit flow only
  meta: z
    .union([z.string(), z.record(z.any())])
    .optional()
    .transform((v) => {
      if (v == null || v === '') return null;
      if (typeof v === 'string') {
        try { return JSON.parse(v); } catch { throw new Error('meta must be valid JSON'); }
      }
      return v;
    })
});

// ---- load(): read ?mma (or ?station) and prep dropdowns ----
export async function load({ url }) {
  const urlMma = (url.searchParams.get('mma') || url.searchParams.get('station') || '').trim();
  if (!urlMma) throw error(400, 'Missing ?mma=<MMA_CODE>');

  // Validate MMA from URL using your central enum
  const mmaCode = zMmaCode.parse(urlMma);

  // Optional prefills (useful when linking from dashboards)
  const supplierId = url.searchParams.get('supplierId') ?? '';
  const shade = url.searchParams.get('shade') ?? '';
  const size = url.searchParams.get('size') ?? '';
  const qty = url.searchParams.get('qty') ?? '';
  const amount = url.searchParams.get('amount') ?? '';
  const meta = url.searchParams.get('meta') ?? '';

  return {
    mmaCode,
    options: {
      shades: SHADE_LIST,   // for selects
      sizes: SIZE_LIST
    },
    initial: {
      supplierId,
      shade,
      size,
      qty,
      amount,
      meta
    }
  };
}

// ---- actions.deposit(): validate + call engine ----
export const actions = {
  deposit: async ({ request }) => {
    const form = await request.formData();

    // extract raw values
    const raw = {
      mmaCode: String(form.get('mmaCode') ?? ''),
      supplierId: form.get('supplierId'),
      shade: String(form.get('shade') ?? ''),
      size: String(form.get('size') ?? ''),
      qty: form.get('qty'),
      amount: form.get('amount'),
      meta: form.get('meta')
    };

    // validate
    let parsed;
    try {
      parsed = DepositSchema.parse(raw);
    } catch (e) {
      const message = e?.message || 'Validation failed';
      const errors = (e?.issues || []).map((i) => i.message);
      return fail(400, {
        success: false,
        message,
        errors,
        values: {
          mmaCode: raw.mmaCode,
          supplierId: raw.supplierId ?? '',
          shade: raw.shade,
          size: raw.size,
          qty: raw.qty ?? '',
          amount: raw.amount ?? '',
          meta: typeof raw.meta === 'string' ? raw.meta : JSON.stringify(raw.meta ?? '')
        }
      });
    }

    try {
      // whitelist the route's mmaCode for this request (engine enforces registry)
      const engine = createMMA4S({ registry: [parsed.mmaCode] });

      const row = await engine.deposit({
        mmaCode: parsed.mmaCode,
        supplierId: parsed.supplierId, // nullable
        shade: parsed.shade,
        size: parsed.size,
        qty: parsed.qty,
        amount: parsed.amount,         // you added this to deposit flow
        meta: parsed.meta ?? null
      });

      return {
        success: true,
        message: `Deposit created (row #${row?.id ?? 'N/A'})`,
        rowId: row?.id ?? null
      };
    } catch (e) {
      return fail(400, {
        success: false,
        message: e?.message || 'Deposit failed',
        errors: [e?.message || 'Unknown error']
      });
    }
  }
};
