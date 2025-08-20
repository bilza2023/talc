import { error } from '@sveltejs/kit';
import createOreService from '../../../../services/oreService.js';
import { R } from '$lib/formKit/readers.js';
import { makeAction } from '$lib/formKit/actionFactory.js';

const ore = createOreService();
const GRADES = ['WL', 'WC', 'WF', 'GL', 'GC', 'GF'];
// If you have a Station table/service, swap this constant out.
const STATIONS = ['JSS', 'PSS', 'KEF'];

export const load = async ({ url }) => {
  const stationParam = url.searchParams.get('station');
  if (!stationParam) throw error(400, 'Station code is required in query (?station=XYZ)');

  const stationCode = String(stationParam).toUpperCase();

  // destination list: all stations except current
  const toStations = STATIONS.filter(s => s !== stationCode);

  return { stationCode, grades: GRADES, toStations };
};

export const actions = {
  // POST /ore/dispatch?station=XYZ&/dispatch
  dispatch: makeAction({
    spec: {
      stationCode: R.str('stationCode', { upper: true, required: true }), // fromStation
      toStation:   R.str('toStation',   { upper: true, required: true }),
      truckNo:     R.str('truckNo',     { trim: true, required: true }),
      weightTon:   R.num('weightTon',   { required: true, gt: 0 }),
      gradeCode:   R.str('gradeCode',   { upper: true, required: true }),
    },
    service: (v) => ore.dispatch(v), // should write to OreTransport (see patch below)
    success: (_row, v) => ({ success: true, station: v.stationCode, toStation: v.toStation })
  })
};
