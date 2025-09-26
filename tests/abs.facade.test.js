// tests/abs.facade.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Abs from '../src/lib/core/abs/abs.js';

const spies = {
  raw: { deposit: vi.fn(), dispatch: vi.fn(), receive: vi.fn() },
  proc: { deposit: vi.fn(), dispatch: vi.fn(), receive: vi.fn() }
};

vi.mock('../src/lib/stocks/index.js', () => ({
  rawStock: {
    deposit:  (...a) => (spies.raw.deposit(...a),  { id: 101 }),
    dispatch: (...a) => (spies.raw.dispatch(...a), { id: 202 }), // ← will be used by screening()
    receive:  (...a) => (spies.raw.receive(...a),  { id: 303 })
  },
  processedStock: {
    deposit:  (...a) => (spies.proc.deposit(...a),  { id: 111 }),
    dispatch: (...a) => (spies.proc.dispatch(...a), { id: 222 }),
    receive:  (...a) => (spies.proc.receive(...a),  { id: 333 }) // ← called with rowId from raw.dispatch
  }
}));


beforeEach(() => {
  Object.values(spies.raw).forEach(s => s.mockClear());
  Object.values(spies.proc).forEach(s => s.mockClear());
});

describe('ABS façade (orchestration)', () => {
  it('screening: raw.dispatch (UNSCREENED→SCREENED) then processed.receive with returned id', async () => {
    const input = { supplierId: 263, shade: 'WHITE', size: 'LUMPS', qty: 4.2, meta: { p: 1 } };
    const res = await Abs.screening(input);

    // Step 1: internal dispatch
    expect(spies.raw.dispatch).toHaveBeenCalledTimes(1);
    expect(spies.raw.dispatch.mock.calls[0][0]).toMatchObject({
      fromStationCode: 'ABS', fromMmaCode: 'ABS_UNSCREENED_RAW',
      toStationCode: 'ABS', toMmaCode: 'ABS_SCREENED',
      supplierId: 263, createdTon: 4.2
    });

    // Step 2: receive at SCREENED using id from dispatch ({ id: 202 } per mock)
    expect(spies.proc.receive).toHaveBeenCalledTimes(1);
    expect(spies.proc.receive.mock.calls[0][0]).toMatchObject({
      stationCode: 'ABS', mmaCode: 'ABS_SCREENED', rowId: 202
    });

    expect(res).toMatchObject({ id: 333 });
  });
});
