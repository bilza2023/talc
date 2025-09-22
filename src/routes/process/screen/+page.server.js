// src/routes/process/screen/+page.server.js
import { fail } from '@sveltejs/kit';
import { processes } from '$lib/mma/process.js';

export const actions = {
  default: async ({ request }) => {
    try {
      const fd = await request.formData();

      const fromMmaCode = String(fd.get('fromMmaCode') || '');
      const toMmaCode   = String(fd.get('toMmaCode') || '');
      const supplierId  = Number(fd.get('supplierId'));
      const shade       = String(fd.get('shade') || '');
      const inputQty    = Number(fd.get('inputQty'));

      let outputs;
      try {
        outputs = JSON.parse(String(fd.get('outputs') || '[]'));
      } catch {
        return fail(400, { error: 'Invalid outputs JSON' });
      }

      if (!fromMmaCode || !toMmaCode) return fail(400, { error: 'MMA codes are required' });
      if (!supplierId || supplierId <= 0) return fail(400, { error: 'supplierId must be a positive number' });
      if (!shade) return fail(400, { error: 'shade is required' });
      if (!inputQty || inputQty <= 0) return fail(400, { error: 'inputQty must be > 0' });
      if (!Array.isArray(outputs) || outputs.length === 0) return fail(400, { error: 'At least one output split is required' });

      const result = await processes.screen({
        fromMmaCode,
        toMmaCode,
        supplierId,
        shade,
        inputQty,
        outputs,
        meta: {} // add batch IDs etc. if needed
      });

      return { success: true, result };
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      return fail(400, { error: msg });
    }
  }
};
