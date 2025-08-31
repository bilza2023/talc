// /src/routes/talc/receive/+page.server.js
import { error } from '@sveltejs/kit';
import prisma from '../../../lib/server/prisma.js';
import createTalcService from '../../../lib/services/talcServices.js';
import { R } from '../../../lib/formKit/readers.js';
import { makeAction } from '../../../lib/formKit/actionFactory.js';

const talc = createTalcService(prisma);
const GRADES = ['TL1', 'TL2', 'TL3', 'GL', 'GC', 'GF']; // adjust to your set

export const load = async ({ url }) => {
  const stationParam = url.searchParams.get('station');
  if (!stationParam) throw error(400, 'Station code is required in query (?station=XYZ)');
  const stationCode = String(stationParam).toUpperCase();

  // Incoming TALC edges to this station, not yet received
  const incomingEdges = await prisma.talcEdge.findMany({
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
      // talcService.receive will validate status and ≤ dispatchWeight, create child batch, etc.
      return talc.receive(v);
    },
    success: (res, v) => ({
      success: true,
      station: v.stationCode,
      edgeId: res?.edge?.id ?? v.edgeId,
      childBatchId: res?.childBatch?.id ?? null
    })
  })
};
