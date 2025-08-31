// /src/routes/ore/receive/+page.server.js
import { error } from '@sveltejs/kit';
import prisma from '../../../lib/server/prisma.js';
import createOreService from '../../../lib/services/oreServices.js';
import { R } from '../../../lib/formKit/readers.js';
import { makeAction } from '../../../lib/formKit/actionFactory.js';

const ore = createOreService(prisma);
const GRADES = ['WL', 'WC', 'WF', 'GL', 'GC', 'GF'];

export const load = async ({ url }) => {
  const stationParam = url.searchParams.get('station');
  if (!stationParam) throw error(400, 'Station code is required in query (?station=XYZ)');
  const stationCode = String(stationParam).toUpperCase();

  // Incoming edges destined to this station (no child batch yet)
  const incomingEdges = await prisma.oreEdge.findMany({
    where: { status: 'in_transit', toStation: stationCode },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      fromStation: true,
      toStation: true,
      dispatchWeight: true,
      dispatchGrade: true,
      truckNo: true,
      parentBatchId: true,
      createdAt: true
    }
  });

  return { stationCode, grades: GRADES, incomingEdges };
};

export const actions = {
  receive: makeAction({
    spec: {
      stationCode:   R.str('stationCode',   { upper: true, required: true }),
      edgeId:        R.intId('edgeId',      { required: true }),
      receiveWeight: R.num('receiveWeight', { required: true, gt: 0 }),
      receiveGrade:  R.str('receiveGrade',  { upper: true, required: false }),
      receivedAt:    R.str('receivedAt',    { required: false, trim: true }),
      receivedBy:    R.str('receivedBy',    { required: false, trim: true })
    },
    async service(v) {
      // call service (it will validate edge.status, ≤ dispatchWeight, etc.)
      return ore.receive(v);
    },
    success: (result, v) => ({
      success: true,
      station: v.stationCode,
      edgeId: result?.edge?.id ?? v.edgeId,
      childBatchId: result?.childBatch?.id ?? null
    })
  })
};
