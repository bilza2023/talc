// /src/routes/ore/unload/+page.server.js
import { error } from '@sveltejs/kit';
import createOreService from '../../../lib/services/oreServices.js';
import { R } from '../../../lib/formKit/readers.js';
import prisma from '../../../lib/server/prisma.js';
import { makeAction } from '../../../lib/formKit/actionFactory.js';

const ore = createOreService(prisma);
const GRADES = ['WL', 'WC', 'WF', 'GL', 'GC', 'GF'];

export const load = async ({ url }) => {
  const stationParam = url.searchParams.get('station');
  if (!stationParam) throw error(400, 'Station code is required in query (?station=XYZ)');
  const stationCode = String(stationParam).toUpperCase();
  return { stationCode, grades: GRADES };
};

export const actions = {
  unload: makeAction({
    spec: {
      transportId:      R.intId('transportId', { required: true }),
      stationCode:      R.str('stationCode', { upper: true, required: true }),
      receiveWeightTon: R.num('receiveWeightTon', { required: true, gt: 0 }),
      receiveGradeCode: R.str('receiveGradeCode', { upper: true, required: true }),
      receivedBy:       R.str('receivedBy', { trim: true, required: true })
    },
    service: (v) => ore.unload(v),
    success: (_row, v) => ({ success: true, transportId: v.transportId, station: v.stationCode, status: 'received' })
  })
};
