// tests/abs.unscreened.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';

import AbsUnscreened from '../src/lib/core/abs/abs.unscreened.js';

const spies = {
  raw: { deposit: vi.fn(), dispatch: vi.fn(), receive: vi.fn() },
  proc: { deposit: vi.fn(), dispatch: vi.fn(), receive: vi.fn() }
};

vi.mock('../src/lib/stocks/index.js', () => ({
  rawStock: {
    deposit:  (...a) => (spies.raw.deposit(...a),  { id: 101 }),
    dispatch: (...a) => (spies.raw.dispatch(...a), { id: 202 }),
    receive:  (...a) => (spies.raw.receive(...a),  { id: 303 })
  },
  processedStock: {
    deposit:  (...a) => (spies.proc.deposit(...a),  { id: 111 }),
    dispatch: (...a) => (spies.proc.dispatch(...a), { id: 222 }),
    receive:  (...a) => (spies.proc.receive(...a),  { id: 333 })
  }
}));

beforeEach(() => {
  Object.values(spies.raw).forEach(s => s.mockClear());
});

describe('ABS Unscreened MMA', () => {
  it('purchaseUnscreened → rawStock.deposit (ABS_UNSCREENED_RAW)', async () => {
    const row = await AbsUnscreened.purchaseUnscreened({
      supplierId: 263, shade: 'WHITE', size: 'LUMPS', qty: 2.5, meta: { note: 't' }
    });
    expect(spies.raw.deposit).toHaveBeenCalledTimes(1);
    expect(spies.raw.deposit.mock.calls[0][0]).toMatchObject({
      stationCode: 'ABS', mmaCode: 'ABS_UNSCREENED_RAW', bornAs: 'purchase',
      supplierId: 263, shade: 'WHITE', size: 'LUMPS', createdTon: 2.5
    });
    expect(row).toMatchObject({ id: 101 });
  });

  it('dispatchUnscreenedToPss → rawStock.dispatch to PSS_SORTED', async () => {
    const row = await AbsUnscreened.dispatchUnscreenedToPss({
      supplierId: 263, shade: 'WHITE', size: 'LUMPS', qty: 1.2, meta: {}
    });
    expect(spies.raw.dispatch).toHaveBeenCalledTimes(1);
    expect(spies.raw.dispatch.mock.calls[0][0]).toMatchObject({
      fromStationCode: 'ABS', fromMmaCode: 'ABS_UNSCREENED_RAW',
      toStationCode: 'PSS', toMmaCode: 'PSS_SORTED',
      supplierId: 263, createdTon: 1.2
    });
    expect(row).toMatchObject({ id: 202 });
  });

  it('dispatchUnscreenedToKef → rawStock.dispatch to KEF_SORTED', async () => {
    await AbsUnscreened.dispatchUnscreenedToKef({
      supplierId: 265, shade: 'GREY', size: 'CHIPS', qty: 0.75, meta: {}
    });
    expect(spies.raw.dispatch.mock.calls[0][0]).toMatchObject({
      toStationCode: 'KEF', toMmaCode: 'KEF_SORTED'
    });
  });

  it('receiveUnscreened → rawStock.receive (rowId only)', async () => {
    const row = await AbsUnscreened.receiveUnscreened({ rowId: 999, meta: { ok: true } });
    expect(spies.raw.receive).toHaveBeenCalledTimes(1);
    expect(spies.raw.receive.mock.calls[0][0]).toMatchObject({
      stationCode: 'ABS', mmaCode: 'ABS_UNSCREENED_RAW', rowId: 999
    });
    expect(row).toMatchObject({ id: 303 });
  });

  it('guards: qty<=0 → throws', async () => {
    await expect(AbsUnscreened.purchaseUnscreened({
      supplierId: 1, shade: 'WHITE', size: 'LUMPS', qty: 0
    })).rejects.toThrow(/Invalid qty/);
  });
});
