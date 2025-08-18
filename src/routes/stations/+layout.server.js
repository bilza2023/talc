
import { list as listSuppliers } from '/services/supplierService.js';

export async function load() {
  const suppliers = await listSuppliers();
  return { suppliers };
}
