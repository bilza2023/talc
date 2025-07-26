import { deposit, despatch, receive, getStock } from '../lib/services/oreService.js';
import OreGrade from '../lib/oreGrade.js';
import { createPrisma } from './prismaTestEnv.js';

let prisma;

beforeAll(async () => {
  prisma = await createPrisma();
  // basic fixtures
  await prisma.station.createMany({ data: [{ id: 1, name: 'BS1' }, { id: 2, name: 'JSS' }] });
  await prisma.supplier.create({ data: { id: 1, name: 'ACME Mining', code: 'SUP001' } });
});

afterAll(() => prisma.$disconnect());

test('deposit → despatch → receive pipeline', async () => {
  const ore = await deposit({ stationId: 1, supplierId: 1, gradeCode: OreGrade.WL, weightTon: 20 });
  const transport = await despatch({ oreId: ore.id, fromStationId: 1, toStationId: 2, truckNo: 'TRK-99' });
  await receive({ transportId: transport.id });

  const stock = await getStock(2);
  const wlSum = stock.onHand.find(r => r.gradeCode === 'WL')._sum.weightTon;
  expect(wlSum).toBe(20);
});
