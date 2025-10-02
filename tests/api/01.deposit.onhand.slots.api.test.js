import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { resetDb, seedSupplier, disconnect } from './_util.js';
import * as Deposit from '../../src/routes/api/deposit/+server.js';
import * as OnHand from '../../src/routes/api/onhand/+server.js';
import * as Slots from '../../src/routes/api/slots/+server.js';

const MMA = 'ABS_SCREENED';

describe('API: deposit → onhand/slots', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await disconnect();
  });

  it('records deposit and reflects in onhand + slots', async () => {
    const sup = await seedSupplier('Acme');

    // deposit 10t
    {
      const url = new URL('http://localhost/api/deposit');
      url.searchParams.set('toMmaCode', MMA);
      url.searchParams.set('supplierId', String(sup.id));
      url.searchParams.set('shade', 'WHITE');
      url.searchParams.set('size', 'ANY');
      url.searchParams.set('qty', '10');

      const res = await Deposit.POST({ url });
      const body = await res.json();
      expect(body.ok).toBe(true);
    }

    // onHand should be 10
    {
      const url = new URL('http://localhost/api/onhand');
      url.searchParams.set('mmaCode', MMA);
      url.searchParams.set('supplierId', String(sup.id));
      url.searchParams.set('shade', 'WHITE');
      url.searchParams.set('size', 'ANY');

      const res = await OnHand.GET({ url });
      const body = await res.json();
      expect(body.ok).toBe(true);
      expect(body.data).toBeCloseTo(10, 6);
    }

    // slots should include one row with qty=10
    {
      const url = new URL('http://localhost/api/slots?mmaCode=' + MMA);
      const res = await Slots.GET({ url });
      const body = await res.json();
      expect(body.ok).toBe(true);
      expect(body.data.length).toBe(1);
      expect(body.data[0]).toMatchObject({
        mmaCode: MMA,
        supplierId: sup.id,
        shade: 'WHITE',
        size: 'ANY',
      });
      expect(body.data[0].qty).toBeCloseTo(10, 6);
    }
  });
});
