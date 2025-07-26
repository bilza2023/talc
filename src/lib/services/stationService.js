// lib/services/stationService.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/** Create a station (name must be unique if you add a DB constraint) */
export async function create({ name }) {
  return prisma.station.create({ data: { name } });
}

/** Update a station’s name */
export async function update({ id, name }) {
  return prisma.station.update({
    where: { id },
    data: { name }
  });
}

/** Delete a station */
export async function remove({ id }) {
  return prisma.station.delete({ where: { id } });
}

/** List all stations */
export async function list() {
  return prisma.station.findMany({ orderBy: { id: 'asc' } });
}

/** Get one station by id */
export async function get({ id }) {
  return prisma.station.findUnique({ where: { id } });
}
