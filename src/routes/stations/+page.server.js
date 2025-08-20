
import createOreService from '../../../services/oreService.js';
import { R } from '../../lib/formKit/readers.js';
import { makeAction } from '../../lib/formKit/actionFactory.js';

const ore = createOreService();

export const actions = {
  // POST /stations?/_action=deposit
  deposit: makeAction({
    spec: {
      stationCode: R.str('stationCode', { upper: true, required: true }),
      supplierId:  R.intId('supplierId', { required: true }),
      truckNo:     R.str('truckNo',     { trim: true, required: true }), // UI-only
      weightTon:   R.num('weightTon',   { required: true, gt: 0 }),
      gradeCode:   R.str('gradeCode',   { upper: true, required: true })
    },
    // Optionally strip UI-only fields before service call
    prepare: (v) => ({ stationCode: v.stationCode, supplierId: v.supplierId, weightTon: v.weightTon, gradeCode: v.gradeCode }),
    service: (v) => ore.deposit(v),
    success: (_result, v) => ({ station: v.stationCode })
  }),

  // POST /stations?/_action=dispatch
  dispatch: makeAction({
    spec: {
      fromStation: R.str('fromStation', { upper: true, required: true }),
      toStation:   R.str('toStation',   { upper: true, required: true }),
      truckNo:     R.str('truckNo',     { trim: true, required: true }),
      weightTon:   R.num('weightTon',   { required: true, gt: 0 }),
      gradeCode:   R.str('gradeCode',   { upper: true }) // keep optional if that’s your rule
    },
    // simple rule examples
    prepare: (v) => {
      if (v.fromStation === v.toStation) {
        const err = new Error('fromStation and toStation cannot be the same');
        err.code = 'VALIDATION';
        throw err;
      }
      return v;
    },
    service: (v) => ore.dispatch(v),
    success: (_result, v) => ({ routeFrom: v.fromStation, routeTo: v.toStation })
  })
};
