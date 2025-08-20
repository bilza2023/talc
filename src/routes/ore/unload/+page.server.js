
import { error } from '@sveltejs/kit';
import createOreService from '../../../../services/oreService.js';
import { R } from '$lib/formKit/readers.js';
import { makeAction } from '$lib/formKit/actionFactory.js';

const ore = createOreService();
const GRADES = ['WL', 'WC', 'WF', 'GL', 'GC', 'GF'];

export const load = async ({ url }) => {
  const stationParam = url.searchParams.get('station');
  if (!stationParam) throw error(400, 'Station code is required in query (?station=XYZ)');

  const stationCode = String(stationParam).toUpperCase();
  return { stationCode, grades: GRADES };
};

export const actions = {
  // POST /ore/unload?station=XYZ&/unload
  unload: makeAction({
    spec: {
      stationCode: R.str('stationCode', { upper: true, required: true }),
      truckNo:     R.str('truckNo',     { trim: true, required: true }),
      weightTon:   R.num('weightTon',   { required: true, gt: 0 }),
      gradeCode:   R.str('gradeCode',   { upper: true, required: true }),
      // receivedAt:  R.str('receivedAt') // optional if you add the input
      // remarks:     R.str('remarks', { trim: true })
    },
    service: (v) => ore.unload(v),
    success: (_row, v) => ({ success: true, station: v.stationCode })
  })
};
