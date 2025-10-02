import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { resetDb, seedSupplier, disconnect } from './_util.js';
import * as Deposit from '../../src/routes/api/deposit/+server.js';
import * as Dispatch from '../../src/routes/api/dispatch/+server.js';
import * as Receive from '../../src/routes/api/receive/+server.js';
import * as Inbound from '../../src/routes/api/inbound/+server.js';
import * as OnHand from '../../src/routes/api/onhand/+server.js';

const FROM = 'ABS_SCREENED';
const TO   = 'PSS_SCREENED';

describe('API: dispatch → inbound → receive', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await disconnect();
  });

  it('creates a dispatch, shows in inbound, then receive settles it', async () => {
    const sup = await seedSupplier('Bravo');

    // seed 5t at source
    {
      const u = new URL('http://localhost/api/deposit');
      u.searchParams.set('toMmaCode', FROM);
      u.searchParams.set('supplierId', String(sup.id));
      u.searchParams.set('shade', 'WHITE');
      u.searchParams.set('size', 'ANY');
      u.searchParams.set('qty', '5');
      const r = await Deposit.POST({ url: u });
      expect((await r.json()).ok).toBe(true);
    }

    // dispatch 3t to TO
    let transportId;
    {
      const u = new URL('http://localhost/api/dispatch');
      u.searchParams.set('fromMmaCode', FROM);
      u.searchParams.set('toMmaCode', TO);
      u.searchParams.set('supplierId', String(sup.id));
      u.searchParams.set('shade', 'WHITE');
      u.searchParams.set('size', 'ANY');
      u.searchParams.set('qty', '3');
      const r = await Dispatch.POST({ url: u });
      const b = await r.json();
      expect(b.ok).toBe(true);
      transportId = b.data.transportId;
      expect(transportId).toBeTruthy();
    }

    // source onhand now 2
    {
      const u = new URL('http://localhost/api/onhand');
      u.searchParams.set('mmaCode', FROM);
      u.searchParams.set('supplierId', String(sup.id));
      u.searchParams.set('shade', 'WHITE');
      u.searchParams.set('size', 'ANY');
      const r = await OnHand.GET({ url: u });
      const b = await r.json();
      expect(b.ok).toBe(true);
      expect(b.data).toBeCloseTo(2, 6);
    }

    // inbound for TO shows one item
    {
      const u = new URL('http://localhost/api/inbound?mmaCode=' + TO);
      const r = await Inbound.GET({ url: u });
      const b = await r.json();
      expect(b.ok).toBe(true);
      expect(b.data.length).toBe(1);
      expect(b.data[0].transportId).toBe(transportId);
    }

    // receive at TO (default qty=dispatched)
    {
      const u = new URL('http://localhost/api/receive');
      u.searchParams.set('transportId', transportId);
      u.searchParams.set('toMmaCode', TO);
      u.searchParams.set('supplierId', String(sup.id));
      const r = await Receive.POST({ url: u });
      const b = await r.json();
      expect(b.ok).toBe(true);
    }

    // inbound cleared; TO onhand 3
    {
      const u = new URL('http://localhost/api/inbound?mmaCode=' + TO);
      const r = await Inbound.GET({ url: u });
      expect((await r.json()).data.length).toBe(0);
    }
    {
      const u = new URL('http://localhost/api/onhand');
      u.searchParams.set('mmaCode', TO);
      u.searchParams.set('supplierId', String(sup.id));
      u.searchParams.set('shade', 'WHITE');
      u.searchParams.set('size', 'ANY');
      const r = await OnHand.GET({ url: u });
      const b = await r.json();
      expect(b.ok).toBe(true);
      expect(b.data).toBeCloseTo(3, 6);
    }
  });
});
