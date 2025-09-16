// /src/routes/ore/deposit/+page.server.js
import { error } from '@sveltejs/kit';
import createOreService from '../../../lib/services/oreServices.js';
import createSupplierService from '../../../lib/services/supplierService.js';
import { R } from '../../../lib/formKit/readers.js';
import { makeAction } from '../../../lib/formKit/actionFactory.js';
import prisma from '../../../lib/server/prisma.js';

const ore = createOreService(prisma);
const suppliersSvc = createSupplierService(prisma);
const GRADES = ['WL', 'WC', 'WF', 'GL', 'GC', 'GF'];

export const load = async ({ url }) => {
  const stationParam = url.searchParams.get('station');
  if (!stationParam) throw error(400, 'Station code is required in query (?station=XYZ)');
  const stationCode = String(stationParam).toUpperCase();

  let suppliers = [];
  try {
    suppliers = await suppliersSvc.list();
    // console.log("suppliers" , suppliers);
  } catch (e) {
    console.error('supplier list failed', e);
  }

  return { stationCode, suppliers, grades: GRADES };
};

export const actions = {
  deposit: makeAction({
    spec: {
      stationCode: R.str('stationCode', { upper: true, required: true }),
      gradeCode:   R.str('gradeCode',   { upper: true, required: true }),
      createdTon:  R.num('createdTon',  { required: true, gt: 0 }),
      supplierId:  R.intId('supplierId', { required: false }),     // optional
      amount:      R.num('amount',      { required: false, gt: 0 }), // NEW (optional, > 0 if sent)
      depositedAt: R.str('depositedAt', { required: false, trim: true }) // optional
    },
    service: (v) => ore.deposit(v), // ore service can ignore fields it doesn't persist
    success: (row, v) => ({ success: true, station: v.stationCode, batchId: row?.id ?? null })
  })
};
