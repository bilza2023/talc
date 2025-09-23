// tests/sorted.stock.audit.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { prisma, sortedStock as sorted } from '../src/lib/stocks/index.js';

function uniqCode(prefix = 'SUP') {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}
async function seedSupplier(name = 'Sorted Audit Sup') {
  return prisma.supplier.create({
    data: { name: `${name} ${Date.now() % 100000}`, code: uniqCode('SOR') },
  });
}

beforeEach(async () => {
  await prisma.sortedTransport.deleteMany();
  await prisma.sortedLedger.deleteMany();
});

describe.sequential('Stock(sorted) — audit (math & lists)', () => {
  it('onHand equals Σ(qtyDelta) in sortedLedger for same key', async () => {
    const sup = await seedSupplier();
    const where = {
      mmaCode: 'PSS_SORTED',
      supplierId: sup.id,
      shade: 'WHITE',
      size: 'CHIPS',
    };

    await sorted.deposit({
      toMmaCode: 'PSS_SORTED', supplierId: sup.id, shade: 'WHITE', size: 'CHIPS', qty: 7.4,
    });
    const { transportId } = await sorted.dispatch({
      fromMmaCode: 'PSS_SORTED', toMmaCode: 'PSS_SORTED',
      supplierId: sup.id, shade: 'WHITE', size: 'CHIPS', qty: 2.2, amount: 22,
    });
    await sorted.receive({
      transportId, toMmaCode: 'PSS_SORTED', supplierId: sup.id, shade: 'WHITE', qty: 2.1, amount: 21,
    });

    const onHand = Number(await sorted.onHand(where));
    const sumLed = await prisma.sortedLedger.aggregate({
      _sum: { qtyDelta: true },
      where,
    });

    expect(onHand).toBeCloseTo(Number(sumLed._sum.qtyDelta ?? 0), 6);
  });

  it('lists behavior (receive clears, cancel removes)', async () => {
    const sup = await seedSupplier('Sorted Flow');
    await sorted.deposit({
      toMmaCode: 'PSS_SORTED', supplierId: sup.id, shade: 'LIGHTGREY', size: 'FINE', qty: 6.2,
    });

    const { transportId } = await sorted.dispatch({
      fromMmaCode: 'PSS_SORTED', toMmaCode: 'PSS_SORTED',
      supplierId: sup.id, shade: 'LIGHTGREY', size: 'FINE', qty: 2.6,
    });

    await sorted.receive({ transportId, toMmaCode: 'PSS_SORTED', supplierId: sup.id, shade: 'LIGHTGREY' });
    {
      const inn = await sorted.inbound({ mmaCode: 'PSS_SORTED' });
      expect(inn.some(r => r.transportId === transportId)).toBe(false);
    }

    const { transportId: tid2 } = await sorted.dispatch({
      fromMmaCode: 'PSS_SORTED', toMmaCode: 'PSS_SORTED',
      supplierId: sup.id, shade: 'LIGHTGREY', size: 'FINE', qty: 1.1,
    });
    await sorted.cancel({ transportId: tid2 });

    const out2 = await sorted.outbound({ mmaCode: 'PSS_SORTED' });
    const inn2 = await sorted.inbound({ mmaCode: 'PSS_SORTED' });
    expect(out2.some(r => r.transportId === tid2)).toBe(false);
    expect(inn2.some(r => r.transportId === tid2)).toBe(false);
  });
});
