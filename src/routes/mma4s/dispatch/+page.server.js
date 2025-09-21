// /src/routes/mma4s/dispatch/+page.server.js
import { fail, error } from '@sveltejs/kit';
import { z } from 'zod';
import { createMMA4S } from '$lib/mma/mma4s.js';
import {
  SHADE_LIST,
  SIZE_LIST,
  MMA_LIST,
  zMmaCode,
  zShade,
  zSize
} from '$lib/mma/enums.js';
import createSupplierService from '$lib/services/supplierService.js';
import prisma from '$lib/server/prisma.js';

const suppliersSvc = createSupplierService(prisma);

// ---- Zod schema for action payload ----
const DispatchSchema = z.object({
  fromMmaCode: zMmaCode,
  toMmaCode: zMmaCode,
  supplierId: z
    .union([z.coerce.number().int().positive(), z.literal(''), z.null()])
    .transform((v) => (v === '' || v == null ? null : v)),
  shade: zShade,
  size: zSize,
  qty: z.coerce.number().positive(),
  amount: z.coerce.number().nonnegative(),   // required by your Prisma model
  meta: z
    .union([z.string(), z.record(z.any()), z.null()])
    .transform((v) => {
      if (v == null || v === '') return null;
      if (typeof v === 'string') {
        try { return JSON.parse(v); } catch { throw new Error('meta must be valid JSON'); }
      }
      return v;
    })
    .optional()
});

// ---- load(): read ?mma (source), optional prefilled/locked fields, suppliers, targets ----
export async function load({ url }) {
  const urlMma = (url.searchParams.get('mma') || url.searchParams.get('station') || '').trim();
  if (!urlMma) throw error(400, 'Missing ?mma=<MMA_CODE>');
  const fromMmaCode = zMmaCode.parse(urlMma);

  // Prefill/lock from URL (coming from “slot” links)
  const supplierId = url.searchParams.get('supplierId') ?? '';
  const size = url.searchParams.get('size') ?? '';
  const shade = url.searchParams.get('shade') ?? '';
  const qty = url.searchParams.get('qty') ?? '';
  const amount = url.searchParams.get('amount') ?? '';
  const toMmaCodeInitial = url.searchParams.get('to') ?? '';
  const meta = url.searchParams.get('meta') ?? '';

  let suppliers = [];
  try {
    suppliers = await suppliersSvc.list();
  } catch (e) {
    console.error('supplier list failed', e);
  }

  // Allow any target except the same source
  const mmaTargets = MMA_LIST.filter((c) => c !== fromMmaCode);

  return {
    fromMmaCode,
    options: {
      shades: SHADE_LIST,
      sizes: SIZE_LIST,
      suppliers,
      mmaTargets
    },
    initial: {
      toMmaCode: toMmaCodeInitial,
      supplierId,
      size,
      shade,
      qty,
      amount,
      meta
    },
    locks: {
      supplierIdLocked: supplierId !== '',
      sizeLocked: size !== '',
      shadeLocked: shade !== '' // ← add shade lock
    }
  };
}

// ---- actions.dispatch(): validate + call engine ----
export const actions = {
  dispatch: async ({ request }) => {
    const form = await request.formData();

    const raw = {
      fromMmaCode: String(form.get('fromMmaCode') ?? ''),
      toMmaCode: String(form.get('toMmaCode') ?? ''),
      supplierId: form.get('supplierId'),
      shade: String(form.get('shade') ?? ''),
      size: String(form.get('size') ?? ''),
      qty: form.get('qty'),
      amount: form.get('amount'),
      meta: form.get('meta')
    };

    let parsed;
    try {
      parsed = DispatchSchema.parse(raw);
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
          meta: typeof raw.meta === 'string' ? raw.meta : JSON.stringify(raw.meta ?? '')
        }
      });
    }

    try {
      // Whitelist both source and target for this request (engine enforces registry)
      const engine = createMMA4S({ registry: [parsed.fromMmaCode, parsed.toMmaCode] });

      const row = await engine.dispatch({
        fromMmaCode: parsed.fromMmaCode,
        toMmaCode: parsed.toMmaCode,
        supplierId: parsed.supplierId, // nullable
        shade: parsed.shade,
        size: parsed.size,
        qty: parsed.qty,
        amount: parsed.amount,
        meta: parsed.meta ?? null
      });

      return {
        success: true,
        message: `Dispatch created (row #${row?.id ?? 'N/A'})`,
        rowId: row?.id ?? null
      };
    } catch (e) {
      return fail(400, {
        success: false,
        message: e?.message || 'Dispatch failed',
        errors: [e?.message || 'Unknown error']
      });
    }
  }
};
