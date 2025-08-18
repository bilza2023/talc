
import { fail, redirect } from '@sveltejs/kit';
import createOreService from '/services/oreService.js';

const ore = createOreService();

export const actions = {
  async deposit({ request }) {
    const fd = await request.formData();
    const stationCode = String(fd.get('stationCode') || '').toUpperCase();
    const supplierId  = Number(fd.get('supplierId') || 0);
    const weightTon   = Number(fd.get('weightTon') || 0);
    const gradeCode   = String(fd.get('gradeCode') || '').toUpperCase();
    const batchRef    = (fd.get('batchRef') || '').toString().trim() || null;

    if (!stationCode || !supplierId || !weightTon || !gradeCode)
      return fail(400, { message: 'stationCode, supplierId, weightTon, gradeCode required' });

    await ore.createDeposit({ stationCode, supplierId, weightTon, gradeCode, batchRef });
    throw redirect(303, `/stations/${stationCode.toLowerCase()}`);
  },

  async dispatch({ request }) {
    const fd = await request.formData();
    const fromStation = String(fd.get('fromStation') || '').toUpperCase();
    const toStation   = String(fd.get('toStation') || '').toUpperCase();
    const truckNo     = String(fd.get('truckNo') || '').trim();
    const weightTon   = Number(fd.get('weightTon') || 0);
    const gradeCode   = (fd.get('gradeCode') || '').toString().toUpperCase() || null;

    if (!fromStation || !toStation || !truckNo || !weightTon)
      return fail(400, { message: 'fromStation, toStation, truckNo, weightTon required' });

    await ore.dispatch({ fromStation, toStation, truckNo, weightTon, gradeCode });
    throw redirect(303, `/stations/${fromStation.toLowerCase()}`);
  },

  async unload({ request }) {
    const fd = await request.formData();
    const transportId = Number(fd.get('transportId') || 0);
    if (!transportId) return fail(400, { message: 'transportId required' });

    await ore.receive({ transportId });
    // You may also pass a hidden nextStation to redirect properly
    const nextStation = (fd.get('nextStation') || '').toString().toLowerCase() || 'jss';
    throw redirect(303, `/stations/${nextStation}`);
  }
};
