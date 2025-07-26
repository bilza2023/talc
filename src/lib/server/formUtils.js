// Lightweight utilities – no JSON-schema dependency

import * as oreService from '../services/oreService.js';
import * as supplierService from '../services/supplierService.js';
import * as stationService from '../services/stationService.js';
import * as logService from '../services/logService.js';

// Registry (add other service modules here when needed)
const serviceRegistry = { oreService , supplierService , stationService , logService };

/** Convert FormData → plain object (numeric strings → numbers) */
export async function parseFormData(request) {
  const fd = await request.formData();
  const obj = {};
  for (const [key, value] of fd.entries()) {
    if (typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value)) {
      obj[key] = Number(value);
    } else {
      obj[key] = value; // string or File
    }
  }
  return obj;
}

/** Call a service method by `"module.method"` (e.g. "oreService.deposit") */
export async function callServiceMethod(path, data) {
  const [serviceName, methodName] = path.split('.');
  const service = serviceRegistry[serviceName];
  if (!service) throw new Error(`Unknown service “${serviceName}”`);
  const fn = service[methodName];
  if (typeof fn !== 'function') {
    throw new Error(`Service “${serviceName}” has no method “${methodName}”`);
  }
  return await fn(data);
}
