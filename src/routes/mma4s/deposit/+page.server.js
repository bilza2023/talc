// /src/routes/mma4s/deposit/+page.server.js
import { fail } from '@sveltejs/kit';
import { createMMA4S } from '$lib/mma/mma4s.js';

// Hard-coded MMA code + payload for a smoke test.
// NOTE: We pass a per-request registry that ALLOWS this code.
const MMA_CODE = 'ABS_PROCESSED';

export const actions = {
  deposit: async () => {
    try {
      // allow our MMA code for this one request
      const engine = createMMA4S({ registry: [MMA_CODE] });

      // hard-coded test data
      const row = await engine.deposit({
        mmaCode: MMA_CODE,
        supplierId: 1,
        shade: 'WHITE',
        size: 'CHIPS', 
        amount: 5000, 
        qty: 1,
        meta: { source: 'smoke-test' }
      });

      return {
        success: true,
        message: `OK: deposit created (row #${row?.id ?? 'N/A'})`
      };
    } catch (e) {
      return fail(400, {
        success: false,
        message: e?.message ?? 'Deposit failed'
      });
    }
  }
};

// Optional load (not required, but nice to keep structure consistent)
export async function load() {
  return {};
}
