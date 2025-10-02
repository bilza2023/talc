import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { resetDb, seedSupplier, disconnect } from './_util.js';
import * as Deposit from '../../src/routes/api/deposit/+server.js';
import * as Withdraw from '../../src/routes/api/withdraw/+server.js';
import * as Audit from '../../src/routes/api/audit-process/+server.js';
import * as OnHand from '../../src/routes/api/onhand/+server.js';

const MMA = 'ABS_SCREENED';

describe('API: withdraw + audit-process', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await disconnect();
  });

  it('withdraw requires processId and is visible in audit-process', async () => {
    const sup = await seedSupplier('Charlie');

    // deposit 10
    {
      const u = new URL('http://localhost/api/deposit');
      u.searchParams.set('toMmaCode', MMA);
      u.searchParams.set('supplierId', String(sup.id));
      u.searchParams.set('shade', 'WHITE');
      u.searchParams.set('size', 'ANY');
      u.searchParams.set('qty', '10');
      const r = await Deposit.POST({ url: u });
      expect((await r.json()).ok).toBe(true);
    }

    // withdraw 4 with processId
    const proc = 'proc-123';
    {
      const u = new URL('http://localhost/api/withdraw');
      u.searchParams.set('fromMmaCode', MMA);
      u.searchParams.set('supplierId', String(sup.id));
      u.searchParams.set('shade', 'WHITE');
      u.searchParams.set('size', 'ANY');
      u.searchParams.set('qty', '4');
      u.searchParams.set('processId', proc);
      const r = await Withdraw.POST({ url: u });
      const b = await r.json();
      expect(b.ok).toBe(true);
    }

    // onhand should be 6
    {
      const u = new URL('http://localhost/api/onhand');
      u.searchParams.set('mmaCode', MMA);
      u.searchParams.set('supplierId', String(sup.id));
      u.searchParams.set('shade', 'WHITE');
      u.searchParams.set('size', 'ANY');
      const r = await OnHand.GET({ url: u });
      const b = await r.json();
      expect(b.ok).toBe(true);
      expect(b.data).toBeCloseTo(6, 6);
    }

    // audit-process should show total = -4
    {
      const u = new URL('http://localhost/api/audit-process?processId=' + proc);
      const r = await Audit.GET({ url: u });
      const b = await r.json();
      expect(b.ok).toBe(true);
      expect(b.data.total).toBeCloseTo(-4, 6);
      expect(Array.isArray(b.data.rows)).toBe(true);
      expect(b.data.rows.length).toBe(1);
      expect(b.data.rows[0].qtyDelta).toBe(-4);
    }
  });
});
