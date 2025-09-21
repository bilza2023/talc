// /src/routes/mma4s/deposit/+page.server.js
import { fail, error } from '@sveltejs/kit';
import { z } from 'zod';
import { createMMA4S } from '$lib/mma/mma4s.js';
import { SHADE_LIST, SIZE_LIST, zMmaCode, zShade, zSize } from '$lib/mma/enums.js';
import createSupplierService from '$lib/services/supplierService.js';
import prisma from '$lib/server/prisma.js';

const suppliersSvc = createSupplierService(prisma);

// ---- Zod schema for action payload ----
const DepositSchema = z.object({
  mmaCode: zMmaCode,
  supplierId: z
    .union([z.coerce.number().int().positive(), z.literal(''), z.null()])
    .transform((v) => (v === '' || v == null ? null : v)),
  shade: zShade,
  size: zSize,
  qty: z.coerce.number().positive(),
  amount: z.coerce.number().nonnegative().optional(),
  meta: z
  .union([z.string(), z.record(z.any()), z.null()])
  .transform((v) => {
    if (v == null || v === '') return null;
    if (typeof v === 'string') {
      try {
        return JSON.parse(v);
      } catch {
        throw new Error('meta must be valid JSON');
      }
    }
    return v;
  })
  .optional()

});

// ---- load(): get MMA from URL + supplier list ----
export async function load({ url }) {
  const urlMma = (url.searchParams.get('mma') || url.searchParams.get('station') || '').trim();
  if (!urlMma) throw error(400, 'Missing ?mma=<MMA_CODE>');

  const mmaCode = zMmaCode.parse(urlMma);

  let suppliers = [];
  try {
    suppliers = await suppliersSvc.list();
  } catch (e) {
    console.error('supplier list failed', e);
  }

  return {
    mmaCode,
    options: {
      shades: SHADE_LIST,
      sizes: SIZE_LIST,
      suppliers
    },
    initial: {
      supplierId: url.searchParams.get('supplierId') ?? '',
      shade: url.searchParams.get('shade') ?? '',
      size: url.searchParams.get('size') ?? '',
      qty: url.searchParams.get('qty') ?? '',
      amount: url.searchParams.get('amount') ?? '',
      meta: url.searchParams.get('meta') ?? ''
    }
  };
}

// ---- actions.deposit(): validate + call engine ----
export const actions = {
  deposit: async ({ request }) => {
    const form = await request.formData();

    const raw = {
      mmaCode: String(form.get('mmaCode') ?? ''),
      supplierId: form.get('supplierId'),
      shade: String(form.get('shade') ?? ''),
      size: String(form.get('size') ?? ''),
      qty: form.get('qty'),
      amount: form.get('amount'),
      meta: form.get('meta')
    };

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
          ...raw,
          supplierId: raw.supplierId ?? '',
          qty: raw.qty ?? '',
          amount: raw.amount ?? '',
          meta:
            typeof raw.meta === 'string'
              ? raw.meta
              : JSON.stringify(raw.meta ?? '')
        }
      });
    }

    try {
      const engine = createMMA4S({ registry: [parsed.mmaCode] });

      const row = await engine.deposit({
        mmaCode: parsed.mmaCode,
        supplierId: parsed.supplierId,
        shade: parsed.shade,
        size: parsed.size,
        qty: parsed.qty,
        amount: parsed.amount,
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
