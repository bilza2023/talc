
// /src/routes/talc/deposit/+page.server.js
import { error } from '@sveltejs/kit';
import createTalcService from '../../../lib/services/talcServices.js';
import { R } from '../../../lib/formKit/readers.js';
import { makeAction } from '../../../lib/formKit/actionFactory.js';

import prisma from '$lib/server/prisma.js';

const talc = createTalcService(prisma);


const GRADES = ['WL', 'WC', 'WF', 'GL', 'GC', 'GF'];

export const load = async ({ url }) => {
  const stationParam = url.searchParams.get('station');
  if (!stationParam) throw error(400, 'Station code is required in query (?station=XYZ)');
  const stationCode = String(stationParam).toUpperCase();
  return { stationCode, grades: GRADES };
};

export const actions = {
  deposit: makeAction({
    spec: {
      stationCode:    R.str('stationCode', { upper: true, required: true }),
      weightTon:      R.num('weightTon',   { required: true, gt: 0 }),
      gradeCode:      R.str('gradeCode',   { upper: true, required: true }),
      // Optional traceability link to OreTransport
      oreTransportId: R.intId('oreTransportId') // optional on purpose
    },
    service: (v) => talc.deposit(v),
    success: (row, v) => ({ success: true, station: v.stationCode, depositId: row?.id ?? null })
  })
};
