
import { parseFormData, callServiceMethod } from '$lib/server/formUtils.js';

export const actions = {
	default: async (event) => {
		try {
			const data = await parseFormData(event.request);
			const result = await callServiceMethod('supplierService.create', data);
			return { success: true, result };
		} catch (err) {
			return { success: false, error: err.message };
		}
	}
};
