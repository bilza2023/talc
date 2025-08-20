
// /src/routes/ore/deposit/+page.server.js
import createOreService from '../../../../services/oreService.js';
import { list as listSuppliers } from '../../../../services/supplierService.js'; // ✅ real module
import { R } from '../../../lib/formKit/readers.js';
import { makeAction } from '../../../lib/formKit/actionFactory.js';

const ore = createOreService();
const GRADES = ['WL', 'WC', 'WF', 'GL', 'GC', 'GF'];

//////////////////////////////////////////////////////////
import { error } from '@sveltejs/kit';

export const load = async ({ url }) => {
  const stationParam = url.searchParams.get('station');
  if (!stationParam) {
    throw error(400, 'Station code is required in query (?station=XYZ)');
  }

  const stationCode = String(stationParam).toUpperCase();

  let suppliers = [];
  try {
    suppliers = await listSuppliers(); // [{ id, code, name }]
  } catch {
    suppliers = [];
  }

  return { stationCode, suppliers, grades: GRADES };
};

  

export const actions = {
  // POST /ore/deposit?/deposit
  deposit: makeAction({
    spec: {
      stationCode: R.str('stationCode', { upper: true, required: true }),
      supplierId:  R.intId('supplierId', { required: true }),
      weightTon:   R.num('weightTon',   { required: true, gt: 0 }),
      truckNo:     R.str('truckNo',     { trim: true, required: true }),
      gradeCode:   R.str('gradeCode',   { upper: true, required: true }),
      // depositedAt: R.str('depositedAt', { trim: true }) // optional later
    },
    service: (v) => ore.deposit(v),
    success: (row, v) => ({
      success: true,
      station: v.stationCode,
      depositId: row?.id ?? null
    })
  })
};
