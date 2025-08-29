// /src/routes/ore/dispatch/+page.server.js
import { error } from '@sveltejs/kit';
import createOreService from '../../../lib/services/oreServices.js';
import { R } from '../../../lib/formKit/readers.js';
import { makeAction } from '../../../lib/formKit/actionFactory.js';

const ore = createOreService();
const GRADES = ['WL', 'WC', 'WF', 'GL', 'GC', 'GF'];
const STATIONS = ['JSS', 'PSS', 'KEF'];

export const load = async ({ url }) => {
  const stationParam = url.searchParams.get('station');
  if (!stationParam) throw error(400, 'Station code is required in query (?station=XYZ)');
  const stationCode = String(stationParam).toUpperCase();
  const toStations = STATIONS.filter(s => s !== stationCode);
  return { stationCode, grades: GRADES, toStations };
};

export const actions = {
  dispatch: makeAction({
    spec: {
      stationCode: R.str('stationCode', { upper: true, required: true }),
      toStation:   R.str('toStation',   { upper: true, required: true }),
      truckNo:     R.str('truckNo',     { trim: true, required: true }),
      weightTon:   R.num('weightTon',   { required: true, gt: 0 }),
      gradeCode:   R.str('gradeCode',   { upper: true, required: true })
    },
    service: (v) => ore.dispatch(v),
    success: (_row, v) => ({ success: true, station: v.stationCode, toStation: v.toStation })
  })
};
