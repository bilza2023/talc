// /home/bilal-tariq/ab/tests/appServices/dispatchService.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';

// IMPORTANT: mock BEFORE importing the SUT so the mock is applied to its imports
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
  prepareDispatchForm,
  executeDispatch
} from '../../src/lib/appServices/dispatchService.js';

describe('dispatchService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('prepareDispatchForm → computes onHand and returns DTO (complete URL)', async () => {
    stock.onHand.mockResolvedValueOnce(42);

    const url = new URL('http://local/dispatch?supplierId=12&shade=WHITE&size=LUMPS&qty=3');

    const res = await prepareDispatchForm({
      url,
      lane: { fromMmaCode: 'ABS_SCREENED', toMmaCode: 'PSS_SCREENED' },
      options: { requireSize: true, defaultSize: 'ANY', defaultQty: 1 }
    });

    // called once with normalized args
    expect(stock.onHand).toHaveBeenCalledTimes(1);
    expect(stock.onHand).toHaveBeenCalledWith({
      mmaCode: 'ABS_SCREENED',
      supplierId: 12,
      shade: 'WHITE',
      size: 'LUMPS'
    });

    // shaped DTO
    expect(res).toMatchObject({
      fromMmaCode: 'ABS_SCREENED',
      toMmaCode: 'PSS_SCREENED',
      supplierId: 12,
      shade: 'WHITE',
      size: 'LUMPS',
      qty: 3,
      onHand: 42,
      error: null
    });
  });

  it('prepareDispatchForm → missing fields → no onHand call, error string, onHand=0', async () => {
    const url = new URL('http://local/dispatch?supplierId=12&size=LUMPS'); // shade missing

    const res = await prepareDispatchForm({
      url,
      lane: { fromMmaCode: 'ABS_SCREENED', toMmaCode: 'PSS_SCREENED' }
    });

    expect(stock.onHand).not.toHaveBeenCalled();
    expect(res.onHand).toBe(0);
    expect(typeof res.error).toBe('string');
    expect(res.error).toContain('Missing'); // heuristic check
  });

  it('prepareDispatchForm → requireSize=false uses default ANY when size omitted', async () => {
    stock.onHand.mockResolvedValueOnce(7);

    // no size provided; qty explicitly provided as 2
    const url = new URL('http://local/dispatch?supplierId=9&shade=GREY&qty=2');

    const res = await prepareDispatchForm({
      url,
      lane: { fromMmaCode: 'PSS_UNSCREENED', toMmaCode: 'PSS_SCREENED' },
      options: { requireSize: false, defaultSize: 'ANY' }
    });

    expect(stock.onHand).toHaveBeenCalledWith({
      mmaCode: 'PSS_UNSCREENED',
      supplierId: 9,
      shade: 'GREY',
      size: 'ANY'
    });

    expect(res).toMatchObject({
      supplierId: 9,
      shade: 'GREY',
      size: 'ANY',
      qty: 2, // respects explicit qty from URL
      onHand: 7,
      error: null
    });
  });

  it('executeDispatch → forwards normalized payload to stock.dispatch', async () => {
    stock.dispatch.mockResolvedValueOnce({ transportId: 'T-001' });

    const result = await executeDispatch({
      fromMmaCode: 'ABS_SCREENED',
      toMmaCode: 'PSS_SCREENED',
      supplierId: '15', // string to test numeric coercion
      shade: 'WHITE',
      size: 'LUMPS',
      qty: '5',         // string → number
      amount: '1234.5', // string → number
      meta: { note: 'rush' }
    });

    expect(stock.dispatch).toHaveBeenCalledTimes(1);
    expect(stock.dispatch).toHaveBeenCalledWith({
      fromMmaCode: 'ABS_SCREENED',
      toMmaCode: 'PSS_SCREENED',
      supplierId: 15,
      shade: 'WHITE',
      size: 'LUMPS',
      qty: 5,
      amount: 1234.5,
      meta: { note: 'rush' },
      transportId: undefined
    });

    expect(result).toEqual({ transportId: 'T-001' });
  });
});
