// tests/appServices/receiveService.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock before importing the service
vi.mock('$lib/stocks/stockEngine.js', () => {
  return {
    stock: {
      onHand: vi.fn(),
      dispatch: vi.fn(),
      inbound: vi.fn(),
      receive: vi.fn()
    }
  };
});

import { stock } from '$lib/stocks/stockEngine.js';
import {
  listInboundFor,
  executeReceive
} from '../../src/lib/appServices/receiveService.js';

describe('receiveService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('listInboundFor → filters by lane and shapes rows', async () => {
    const now = new Date();

    stock.inbound.mockResolvedValueOnce([
      {
        transportId: 'T-ABS-1',
        fromMmaCode: 'ABS_SCREENED',
        toMmaCode: 'PSS_SCREENED',
        supplierId: 77,
        shade: 'WHITE',
        size: 'LUMPS',
        qty: 10,
        createdAt: now
      },
      {
        transportId: 'T-ABS-2',
        fromMmaCode: 'ABS_SCREENED',
        toMmaCode: 'PSS_SCREENED',
        supplierId: 78,
        shade: 'GREY',
        size: 'CHIPS',
        qty: 20,
        createdAt: now
      },
      {
        transportId: 'T-KEF-1',
        fromMmaCode: 'KEF_SORTED',
        toMmaCode: 'PSS_SCREENED',
        supplierId: 99,
        shade: 'GREEN',
        size: 'ANY',
        qty: 5,
        createdAt: now
      }
    ]);

    const out = await listInboundFor({
      fromMmaCode: 'ABS_SCREENED',
      toMmaCode: 'PSS_SCREENED'
    });

    // Asked domain for inbound to target MMA
    expect(stock.inbound).toHaveBeenCalledWith({ mmaCode: 'PSS_SCREENED' });

    // Only ABS→PSS rows, shaped with qty from dispatch
    expect(out).toMatchObject({
      fromMmaCode: 'ABS_SCREENED',
      toMmaCode: 'PSS_SCREENED'
    });
    expect(out.rows).toHaveLength(2);

    const [r1, r2] = out.rows;
    expect(r1).toMatchObject({
      transportId: 'T-ABS-1',
      supplierId: 77,
      shade: 'WHITE',
      size: 'LUMPS',
      qty: 10
    });
    expect(r1.createdAt).toBe(now);
    expect(r2.qty).toBe(20);
  });

  it('listInboundFor → when fromMmaCode omitted, returns all inbound to target MMA', async () => {
    stock.inbound.mockResolvedValueOnce([
      { transportId: 'A', fromMmaCode: 'ABS_SCREENED', toMmaCode: 'PSS_SCREENED', supplierId: 1, shade: 'W', size: 'ANY', qty: 3, createdAt: new Date() },
      { transportId: 'B', fromMmaCode: 'KEF_SORTED',   toMmaCode: 'PSS_SCREENED', supplierId: 2, shade: 'G', size: 'ANY', qty: 4, createdAt: new Date() }
    ]);

    const out = await listInboundFor({ toMmaCode: 'PSS_SCREENED' });

    expect(stock.inbound).toHaveBeenCalledWith({ mmaCode: 'PSS_SCREENED' });
    expect(out.rows.map(r => r.transportId)).toEqual(['A', 'B']);
  });

  it('executeReceive → forwards normalized payload to stock.receive', async () => {
    stock.receive.mockResolvedValueOnce({ ok: true, posted: 1 });

    const result = await executeReceive({
      transportId: 123,           // stringified by service
      toMmaCode: 'PSS_SCREENED',
      supplierId: '45',           // coerced to number
      qty: '9.5',                 // coerced to number
      amount: '111.25',           // coerced to number
      shade: 'WHITE',
      meta: { seal: 'SEAL-9' }
    });

    expect(stock.receive).toHaveBeenCalledTimes(1);
    expect(stock.receive).toHaveBeenCalledWith({
      transportId: '123',
      toMmaCode: 'PSS_SCREENED',
      supplierId: 45,
      qty: 9.5,
      amount: 111.25,
      shade: 'WHITE',
      meta: { seal: 'SEAL-9' }
    });

    expect(result).toEqual({ ok: true, posted: 1 });
  });
});
