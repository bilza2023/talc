// tests/abs.screened.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';

import AbsScreened from '../src/lib/core/abs/abs.screened.js';

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
  Object.values(spies.proc).forEach(s => s.mockClear());
});

describe('ABS Screened MMA', () => {
  it('purchaseScreened → processedStock.deposit (ABS_SCREENED)', async () => {
    const row = await AbsScreened.purchaseScreened({
      supplierId: 263, shade: 'WHITE', size: 'LUMPS', qty: 3.0, meta: {}
    });
    expect(spies.proc.deposit).toHaveBeenCalledTimes(1);
    expect(spies.proc.deposit.mock.calls[0][0]).toMatchObject({
      stationCode: 'ABS', mmaCode: 'ABS_SCREENED', bornAs: 'purchase',
      supplierId: 263, createdTon: 3.0
    });
    expect(row).toMatchObject({ id: 111 });
  });

  it('dispatchScreenedToPss → processedStock.dispatch to PSS_SORTED', async () => {
    await AbsScreened.dispatchScreenedToPss({
      supplierId: 263, shade: 'WHITE', size: 'LUMPS', qty: 1, meta: {}
    });
    expect(spies.proc.dispatch.mock.calls[0][0]).toMatchObject({
      fromMmaCode: 'ABS_SCREENED', toStationCode: 'PSS', toMmaCode: 'PSS_SORTED'
    });
  });

  it('dispatchScreenedToKef → processedStock.dispatch to KEF_SORTED', async () => {
    await AbsScreened.dispatchScreenedToKef({
      supplierId: 263, shade: 'WHITE', size: 'LUMPS', qty: 1, meta: {}
    });
    expect(spies.proc.dispatch.mock.calls[0][0]).toMatchObject({
      toStationCode: 'KEF', toMmaCode: 'KEF_SORTED'
    });
  });

  it('receiveScreened → processedStock.receive (rowId only)', async () => {
    const row = await AbsScreened.receiveScreened({ rowId: 321, meta: {} });
    expect(spies.proc.receive).toHaveBeenCalledTimes(1);
    expect(spies.proc.receive.mock.calls[0][0]).toMatchObject({
      stationCode: 'ABS', mmaCode: 'ABS_SCREENED', rowId: 321
    });
    expect(row).toMatchObject({ id: 333 });
  });
});
