// src/routes/stations/+page.server.js
import createOreService from '../../../services/oreService.js';
import { R } from '../../lib/formKit/readers.js';
import { makeAction } from '../../lib/formKit/actionFactory.js';

const ore = createOreService();

export const actions = {
  // POST /stations?/deposit
  deposit: makeAction({
    spec: {
      stationCode: R.str('stationCode', { upper: true, required: true }),
      supplierId:  R.intId('supplierId', { required: true }),
      weightTon:   R.num('weightTon',   { required: true, gt: 0 }),
      truckNo:     R.str('truckNo',   { upper: false, required: true }),
      gradeCode:   R.str('gradeCode',   { upper: true, required: true })
    },
    service: (v) => ore.deposit(v),
    success: (_r, v) => ({ station: v.stationCode })
  }),

  // POST /stations?/dispatch
  dispatch: makeAction({
    spec: {
      fromStation: R.str('fromStation', { upper: true, required: true }),
      toStation:   R.str('toStation',   { upper: true, required: true }),
      truckNo:     R.str('truckNo',     { trim: true, required: true }),
      weightTon:   R.num('weightTon',   { required: true, gt: 0 }),
      gradeCode:   R.str('gradeCode',   { upper: true, required: true }),
      supplierId:  R.intId('supplierId')  // optional if you want to track supplier in transport
    },
    prepare: (v) => {
      if (v.fromStation === v.toStation) {
        const e = new Error('fromStation and toStation cannot be the same');
        e.code = 'VALIDATION';
        throw e;
      }
      return v;
    },
    service: (v) => ore.dispatch(v),
    success: (_r, v) => ({ routeFrom: v.fromStation, routeTo: v.toStation })
  }),

  // POST /stations?/unload
  unload: makeAction({
    spec: {
      transportId:    R.intId('transportId', { required: true }),
      receivedWeight: R.num('receivedWeight', { required: true, gt: 0 }),
      receivedGrade:  R.str('receivedGrade', { upper: true, required: true }),
      receivedBy:     R.str('receivedBy', { trim: true, required: true }),
      receivedAt:     R.str('receivedAt', { trim: true }) // optional datetime-local
    },
    prepare: (v) => ({
      transportId: v.transportId,
      receivedWeight: v.receivedWeight,
      receivedGrade: v.receivedGrade,
      receivedBy: v.receivedBy,
      receivedAt: v.receivedAt || null
    }),
    service: (v) => ore.unload(v),
    success: (_r, v) => ({ transportId: v.transportId })
  })
};
