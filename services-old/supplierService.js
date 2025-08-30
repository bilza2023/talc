// lib/services/supplierService.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function create({ name, code }) {
  return prisma.supplier.create({ data: { name, code } });
}

export async function update({ id, name, code }) {
  return prisma.supplier.update({
    where: { id },
    data: { name, code }
  });
}

export async function remove({ id }) {
  return prisma.supplier.delete({ where: { id } });
}

export async function list() {
  return prisma.supplier.findMany({ orderBy: { id: 'asc' } });
}

export async function get({ id }) {
  return prisma.supplier.findUnique({ where: { id } });
}
