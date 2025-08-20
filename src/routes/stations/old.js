
// src/routes/stations/+page.server.js
import { fail, redirect } from '@sveltejs/kit';
import createOreService from '../../../services/oreService.js';

const ore = createOreService();

export const actions = {
 
  async dispatch({ request }) {
    const fd = await request.formData();
    const fromStation = String(fd.get('fromStation') || '').toUpperCase();
    const toStation   = String(fd.get('toStation') || '').toUpperCase();
    const truckNo     = String(fd.get('truckNo') || '').trim();
    const weightTon   = Number(fd.get('weightTon') || 0);
    const gradeCode   = (fd.get('gradeCode') || '').toString().toUpperCase() || null;

    const values = { fromStation, toStation, truckNo, weightTon, gradeCode };

    if (!fromStation || !toStation || !truckNo || !weightTon) {
      return fail(400, { message: 'fromStation, toStation, truckNo, weightTon required', values });
    }
    if (fromStation === toStation) {
      return fail(400, { message: 'fromStation and toStation cannot be the same', values });
    }
    if (!(weightTon > 0)) {
      return fail(400, { message: 'weightTon must be > 0', values });
    }

    try {
      await ore.dispatch(values); // may throw INSUFFICIENT_STOCK
      throw redirect(303, `/stations/${fromStation.toLowerCase()}`);
    } catch (e) {
      if (e?.code === 'INSUFFICIENT_STOCK') {
        return fail(400, { message: e.message, values });
      }
      if (e?.code === 'P2025') {
        return fail(404, { message: 'Record not found', values });
      }
      console.error('dispatch error:', e);
      return fail(400, { message: e?.message || 'Dispatch failed', values });
    }
  },
  
  async deposit({ request }) {
    const fd = await request.formData();

    const stationCode = String(fd.get('stationCode') || '').toUpperCase();
    const supplierId  = Number(fd.get('supplierId') || 0);
    const truckNo     = String(fd.get('truckNo') || '').trim(); // UI/display only (service can ignore)
    const weightTon   = Number(fd.get('weightTon') || 0);
    const gradeCode   = String(fd.get('gradeCode') || '').toUpperCase();

    const values = { stationCode, supplierId, truckNo, weightTon, gradeCode };

    // Basic validation (same strictness as dispatch)
    if (!stationCode || !supplierId || !truckNo || !weightTon || !gradeCode) {
      return fail(400, {
        message: 'stationCode, supplierId, truckNo, weightTon, gradeCode required',
        values
      });
    }
    if (!(weightTon > 0)) {
      return fail(400, { message: 'weightTon must be > 0', values });
    }

    try {
      // Service only needs the fields it actually stores
      await ore.deposit({ stationCode, supplierId, weightTon, gradeCode });

      // ✅ No redirect — return a success payload for `enhance` to handle
      return {
        success: true,
        stationCode,
        // include any UI-useful echoes:
        saved: { stationCode, supplierId, weightTon, gradeCode }
      };
    } catch (e) {
      // Prisma/logic errors surface here; keep payload shape consistent for enhance error UI
      return fail(400, {
        message: e?.message || 'Deposit failed',
        values
      });
    }
  },

  async unload({ request }) {
    const fd = await request.formData();
    const transportId = Number(fd.get('transportId') || 0);
    if (!transportId) return fail(400, { message: 'transportId required' });

    await ore.unload({ transportId });

    // Optional hidden field from form to decide where to land after unload
    const nextStation = (fd.get('nextStation') || '').toString().toLowerCase() || 'jss';
    throw redirect(303, `/stations/${nextStation}`);
  }
};
