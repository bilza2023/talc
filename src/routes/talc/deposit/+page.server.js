// /src/routes/talc/deposit/+page.server.js
import { error } from '@sveltejs/kit';
import prisma from '../../../lib/server/prisma.js';
import createTalcService from '../../../lib/services/talcServices.js';
import { R } from '../../../lib/formKit/readers.js';
import { makeAction } from '../../../lib/formKit/actionFactory.js';

const talc = createTalcService(prisma);
const GRADES = ['TL1','TL2','TL3','GL','GC','GF']; // adjust to your talc grades

export const load = async ({ url }) => {
  const stationParam = url.searchParams.get('station');
  if (!stationParam) throw error(400, 'Station code is required in query (?station=XYZ)');
  const stationCode = String(stationParam).toUpperCase();

  // Ore batches at this station that have stock to process
  const oreParents = await prisma.oreBatch.findMany({
    where: { stationCode, remainingTon: { gt: 0 } },
    select: { id: true, gradeCode: true, remainingTon: true, createdTon: true },
    orderBy: { id: 'desc' }
  });

  return { stationCode, grades: GRADES, oreParents };
};

export const actions = {
  // We keep the action name "deposit" (UI compatibility), but it performs a process
  deposit: makeAction({
    spec: {
      stationCode:     R.str('stationCode',     { upper: true, required: true }),
      parentOreBatchId:R.intId('parentOreBatchId', { required: true }),
      gradeCode:       R.str('gradeCode',       { upper: true, required: true }), // TALC grade
      oreDeltaTon:     R.num('oreDeltaTon',     { required: true, gt: 0 }),
      talcCreatedTon:  R.num('talcCreatedTon',  { required: true, gt: 0 }),
      talcDeltaTon:    R.num('talcDeltaTon',    { required: false, gte: 0 }),
      runKey:          R.str('runKey',          { required: false, trim: true }),
      processAt:       R.str('processAt',       { required: false, trim: true })
    },
    service: (v) => talc.process(v),
    success: (result, v) => ({
      success: true,
      station: v.stationCode,
      talcBatchId: result?.talcBatch?.id ?? null
    })
  })
};
