// /src/routes/talc/deposit/+page.server.js
import { error } from '@sveltejs/kit';
import createTalcService from '../../../lib/services/talcServices.js';
import createOreService  from '../../../lib/services/oreServices.js';
import { R } from '../../../lib/formKit/readers.js';
import { makeAction } from '../../../lib/formKit/actionFactory.js';
import prisma from '../../../lib/server/prisma.js';

const talc = createTalcService(prisma);
const ore  = createOreService(prisma);

const GRADES = ['WL', 'WC', 'WF', 'GL', 'GC', 'GF'];

export const load = async ({ url }) => {
  const stationParam = url.searchParams.get('station');
  if (!stationParam) throw error(400, 'Station code is required in query (?station=XYZ)');
  const stationCode = String(stationParam).toUpperCase();

  // Get all RECEIVED ore-transport lots for this station, newest first, excluding those already used by a talc deposit
  const transports = await ore.listOreByStation({
    stationCode,
    onlyReceived: true,
    excludeLinked: true,
    limit: 200
  });

  // Build compact labels for dropdown
  const oreOptions = transports.map(r => ({
    id: r.id,
    label: `#${r.id} • ${r.fromStation}→${r.toStation} • ${r.truckNo} • ${r.receiveWeightTon ?? r.sendWeightTon}t`
  }));

  return { stationCode, grades: GRADES, oreOptions };
};

export const actions = {
  deposit: makeAction({
    spec: {
      stationCode:    R.str('stationCode', { upper: true, required: true }),
      weightTon:      R.num('weightTon',   { required: true, gt: 0 }),
      gradeCode:      R.str('gradeCode',   { upper: true, required: true }),
      oreTransportId: R.intId('oreTransportId') // optional link for traceability
    },
    service: (v) => talc.deposit(v),
    success: (row, v) => ({ success: true, station: v.stationCode, depositId: row?.id ?? null })
  })
};
