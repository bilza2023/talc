// src/lib/services/oreService.js
import { PrismaClient } from '@prisma/client';
import OreGrade    from './enums/oreGraders.js';
import * as logService from './logService.js';   // <- fixed import

const prisma = new PrismaClient();

/* ────────── helpers ────────── */
function assertGrade(code) {
  if (!Object.values(OreGrade).includes(code)) {
    throw new Error(
      `Invalid gradeCode '${code}'. Must be one of ${Object.values(OreGrade).join(', ')}`
    );
  }
}

function generateBatchRef(supplierCode, gradeCode) {
  const ts = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  return `${supplierCode}-${gradeCode}-${ts}-${Math.floor(Math.random() * 1e4)
    .toString()
    .padStart(4, '0')}`;
}

/* ────────── service API ────────── */
export async function deposit({ stationId, supplierId, gradeCode, weightTon }) {
  assertGrade(gradeCode);

  const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });
  if (!supplier) throw new Error('Supplier not found');

  const batchRef = generateBatchRef(supplier.code, gradeCode);

  const ore = await prisma.ore.create({
    data: { stationId, supplierId, batchRef, weightTon, gradeCode }
  });

  // Correct logging call: level, type, metadata
  await logService.log(
    'info',
    'ORE_DEPOSIT',
    { oreId: ore.id, stationId, supplierId, gradeCode, weightTon }
  );

  return ore;
}

export async function despatch({ oreId, fromStationId, toStationId, truckNo }) {
  return prisma.$transaction(async (tx) => {
    const ore = await tx.ore.findUnique({ where: { id: oreId } });
    if (!ore) throw new Error('Ore batch not found');
    if (ore.stationId !== fromStationId) {
      throw new Error('Ore is not located at the fromStation');
    }

    const transport = await tx.oreTransport.create({
      data: {
        oreId,
        fromStationId,
        toStationId,
        truckNo,
        weightTon: ore.weightTon,
        status: 'in_transit',
        departedAt: new Date()
      }
    });

    await logService.log(
      'info',
      'ORE_DESPATCH',
      { transportId: transport.id, oreId, fromStationId, toStationId, truckNo, weightTon: ore.weightTon }
    );

    return transport;
  });
}

export async function receive({ transportId }) {
  return prisma.$transaction(async (tx) => {
    const transport = await tx.oreTransport.findUnique({ where: { id: transportId } });
    if (!transport || transport.status !== 'in_transit') {
      throw new Error('Transport not in transit');
    }

    // Move stock to the destination station
    await tx.ore.update({
      where: { id: transport.oreId },
      data: { stationId: transport.toStationId }
    });

    const updated = await tx.oreTransport.update({
      where: { id: transportId },
      data: { status: 'received', receivedAt: new Date() }
    });

    await logService.log(
      'info',
      'ORE_RECEIVE',
      {
        transportId,
        oreId: transport.oreId,
        fromStationId: transport.fromStationId,
        toStationId: transport.toStationId,
        weightTon: transport.weightTon
      }
    );

    return updated;
  });
}
