// src/routes/ore/deposit/+page.server.js
import { parseFormData, callServiceMethod } from '$lib/server/formUtils.js';
import * as supplierService from '$lib/services/supplierService.js';
import * as stationService  from '$lib/services/stationService.js';

export async function load() {
  const [suppliers, stations] = await Promise.all([
    supplierService.list(),
    stationService.list()
  ]);
  return { suppliers, stations };
}

export const actions = {
  default: async (event) => {
    try {
      const data = await parseFormData(event.request);
      const ore  = await callServiceMethod('oreService.deposit', data);
      return { success: true, ore };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
};
