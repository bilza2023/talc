// /src/routes/ore/deposit/+page.server.js
import { error } from '@sveltejs/kit';
import createOreService from '../../../lib/services/oreServices.js';
import createSupplierService from '../../../lib/services/supplierService.js'; // ⬅️ change
import { R } from '../../../lib/formKit/readers.js';
import { makeAction } from '../../../lib/formKit/actionFactory.js';
import prisma from '../../../lib/server/prisma.js';

const ore = createOreService(prisma);
const suppliersSvc = createSupplierService(prisma);             // ⬅️ add
const GRADES = ['WL', 'WC', 'WF', 'GL', 'GC', 'GF'];

export const load = async ({ url }) => {
  const stationParam = url.searchParams.get('station');
  if (!stationParam) throw error(400, 'Station code is required in query (?station=XYZ)');
  const stationCode = String(stationParam).toUpperCase();

  let suppliers = [];
  try {
    suppliers = await suppliersSvc.list();                      // ⬅️ call factory method
  } catch (e) {
    console.error('supplier list failed', e);
  }

  return { stationCode, suppliers, grades: GRADES };
};

export const actions = {
  deposit: makeAction({
    spec: {
      stationCode: R.str('stationCode', { upper: true, required: true }),
      supplierId:  R.intId('supplierId', { required: true }),
      weightTon:   R.num('weightTon',   { required: true, gt: 0 }),
      truckNo:     R.str('truckNo',     { trim: true, required: true }),
      gradeCode:   R.str('gradeCode',   { upper: true, required: true })
    },
    service: (v) => ore.deposit(v),
    success: (row, v) => ({ success: true, station: v.stationCode, depositId: row?.id ?? null })
  })
};
