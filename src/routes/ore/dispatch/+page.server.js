// /src/routes/ore/dispatch/+page.server.js
import { error } from '@sveltejs/kit';
import prisma from '../../../lib/server/prisma.js';
import createOreService from '../../../lib/services/oreServices.js';
import { R } from '../../../lib/formKit/readers.js';
import { makeAction } from '../../../lib/formKit/actionFactory.js';

const ore = createOreService(prisma);
const GRADES   = ['WL', 'WC', 'WF', 'GL', 'GC', 'GF'];
const STATIONS = ['JSS', 'PSS', 'KEF'];

export const load = async ({ url }) => {
  const stationParam = url.searchParams.get('station');
  if (!stationParam) throw error(400, 'Station code is required in query (?station=XYZ)');
  const stationCode = String(stationParam).toUpperCase();

  // Parent batches open at this station
  const batches = await prisma.oreBatch.findMany({
    where: { stationCode, remainingTon: { gt: 0 } },
    select: { id: true, gradeCode: true, remainingTon: true, createdTon: true, stationCode: true },
    orderBy: { id: 'desc' }
  });

  // In-transit commitments per parent
  const committed = await prisma.oreEdge.groupBy({
    by: ['parentBatchId'],
    where: { status: 'in_transit', parentBatch: { stationCode } },
    _sum: { dispatchWeight: true }
  });

  const committedMap = new Map(committed.map(r => [r.parentBatchId, Number(r._sum.dispatchWeight || 0)]));

  const parents = batches.map(b => {
    const committedTon = committedMap.get(b.id) || 0;
    const availableTon = Math.max(0, Number(b.remainingTon) - committedTon);
    return {
      id: b.id,
      gradeCode: b.gradeCode,
      createdTon: Number(b.createdTon),
      remainingTon: Number(b.remainingTon),
      committedTon,
      availableTon
    };
  });

  const toStations = STATIONS.filter(s => s !== stationCode);

  return { stationCode, grades: GRADES, toStations, parents };
};


export const actions = {
  dispatch: makeAction({
    spec: {
      stationCode:    R.str('stationCode',    { upper: true, required: true }),
      parentBatchId:  R.intId('parentBatchId', { required: true }),
      toStation:      R.str('toStation',      { upper: true, required: true }),
      dispatchWeight: R.num('dispatchWeight', { required: true, gt: 0 }),
      dispatchGrade:  R.str('dispatchGrade',  { upper: true, required: true }),
      truckNo:        R.str('truckNo',        { trim: true }),
      amount:         R.num('amount',         { gte: 0 }),              // ← was {min:0}
      dispatchedAt:   R.str('dispatchedAt',   { trim: true })
    },
    prepare: (v) => {
      // Optional → null, and normalize names if your service expects gradeCode
      return {
        ...v, // keep dispatchGrade as-is (do NOT rename)
        amount: v.amount === '' || v.amount == null ? null : Math.trunc(Number(v.amount)),
        dispatchedAt: v.dispatchedAt?.trim() ? v.dispatchedAt : null
      };
    },
    service: (v) => ore.dispatch(v),
    success: (edge, v) => ({
      success: true,
      message: `Dispatch created from ${v.stationCode} → ${v.toStation}`, // ← add message
      station: v.stationCode,
      toStation: v.toStation,
      edgeId: edge?.id ?? null
    })
  })
};
