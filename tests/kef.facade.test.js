// tests/kef.facade.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Hoist the spies so vi.mock (which is hoisted) can reference them safely
const spies = vi.hoisted(() => ({
  sorted: { receive: vi.fn() },
  prisma: { sortedTransport: { findFirst: vi.fn() } }
}));

// Mock the stocks/index so Kef pulls our test doubles
vi.mock('../src/lib/stocks/index.js', () => ({
  prisma: spies.prisma,
  sortedStock: {
    receive: (...args) => (spies.sorted.receive(...args), { ok: true, id: 9001 })
  }
}));

// Now import Kef (after the mock above)
import Kef from '../src/lib/core/kef/kef.js';

beforeEach(() => {
  spies.sorted.receive.mockClear();
  spies.prisma.sortedTransport.findFirst.mockReset();
});

describe('KEF façade — receive sorted from PSS', () => {
  it('receiveSorted: with supplierId provided → calls sortedStock.receive into KEF_SORTED', async () => {
    const res = await Kef.receiveSorted({
      transportId: 'T-ABC-1',
      supplierId: 555,
      meta: { truck: 'PX-11' }
    });

    expect(res).toMatchObject({ ok: true, id: 9001 });
    expect(spies.sorted.receive).toHaveBeenCalledTimes(1);
    expect(spies.sorted.receive.mock.calls[0][0]).toMatchObject({
      transportId: 'T-ABC-1',
      toStationCode: 'KEF',
      toMmaCode: 'KEF_SORTED',
      supplierId: 555,
      meta: { truck: 'PX-11' }
    });
  });

  it('receiveSorted: infers supplierId from DISPATCH when not provided', async () => {
    spies.prisma.sortedTransport.findFirst.mockResolvedValueOnce({ supplierId: 777 });

    await Kef.receiveSorted({ transportId: 'T-DEF-2' });

    expect(spies.prisma.sortedTransport.findFirst).toHaveBeenCalledWith({
      where: { transportId: 'T-DEF-2', type: 'DISPATCH' },
      select: { supplierId: true }
    });

    expect(spies.sorted.receive).toHaveBeenCalledTimes(1);
    expect(spies.sorted.receive.mock.calls[0][0]).toMatchObject({
      transportId: 'T-DEF-2',
      toStationCode: 'KEF',
      toMmaCode: 'KEF_SORTED',
      supplierId: 777
    });
  });
});
