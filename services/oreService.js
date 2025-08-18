// services/oreService.js
import { PrismaClient, StationCode } from '@prisma/client';

const defaultPrisma = new PrismaClient();
const TRANSPORT_STATUS = {
  IN_TRANSIT: 'in_transit',
  RECEIVED: 'received',
  CANCELLED: 'cancelled',
};

/**
 * Ore Service (owns Ore + OreTransport)
 * Usage:
 *   const oreService = createOreService();
 *   await oreService.createDeposit({ stationCode:'JSS', supplierId:1, weightTon:20, gradeCode:'WL' });
 */
export default function createOreService(prisma = defaultPrisma) {
  // ---- internal helpers ----------------------------------------------------

  function now() {
    return new Date();
  }

  function assert(value, msg) {
    if (!value) throw new Error(msg);
  }

  function asStationCode(code) {
    // Tolerate lowercase input, enforce enum-like values; SQLite stores TEXT anyway.
    const normalized = String(code || '').toUpperCase();
    const allowed = StationCode ? Object.values(StationCode) : ['JSS', 'PSS', 'KEF'];
    assert(allowed.includes(normalized), `Invalid stationCode: ${code}`);
    return normalized;
  }

  async function logEvent(type, metadata = {}, level = 'info') {
    return prisma.log.create({
      data: { type, level, metadata, createdAt: now() },
    });
  }

  // ---- deposits (Ore table) ------------------------------------------------

  /**
   * Create a deposit (supplier -> station)
   * data: { stationCode, supplierId, weightTon, gradeCode, batchRef? }
   */
  async function createDeposit(data) {
    assert(data, 'data required');
    const stationCode = asStationCode(data.stationCode);
    const supplierId = Number(data.supplierId);
    const weightTon = Number(data.weightTon);
    const gradeCode = String(data.gradeCode || '').toUpperCase();
    const batchRef  = data.batchRef ?? null;

    assert(supplierId > 0, 'supplierId required');
    assert(weightTon > 0, 'weightTon must be > 0');
    assert(gradeCode, 'gradeCode required');

    const row = await prisma.ore.create({
      data: { stationCode, supplierId, weightTon, gradeCode, batchRef, createdAt: now() },
    });

    await logEvent('ORE_DEPOSIT', { stationCode, supplierId, weightTon, gradeCode, oreId: row.id });
    return row;
  }

  /**
   * List deposit events
   * filter: { stationCode?, supplierId?, gradeCode?, from?, to? }
   */
  async function listDeposits(filter = {}) {
    const where = {};
    if (filter.stationCode) where.stationCode = asStationCode(filter.stationCode);
    if (filter.supplierId)  where.supplierId  = Number(filter.supplierId);
    if (filter.gradeCode)   where.gradeCode   = String(filter.gradeCode).toUpperCase();
    if (filter.from || filter.to) {
      where.createdAt = {};
      if (filter.from) where.createdAt.gte = new Date(filter.from);
      if (filter.to)   where.createdAt.lte = new Date(filter.to);
    }
    return prisma.ore.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  // ---- transports (OreTransport table) ------------------------------------

  /**
   * Dispatch ore from one station to another (creates a transport)
   * data: { fromStation, toStation, truckNo, weightTon, gradeCode?, supplierId?, departedAt? }
   * options: { enforceStock = true }
   */
  async function dispatch(data, options = { enforceStock: true }) {
    assert(data, 'data required');
    const fromStation = asStationCode(data.fromStation);
    const toStation   = asStationCode(data.toStation);
    const truckNo     = String(data.truckNo || '').trim();
    const weightTon   = Number(data.weightTon);
    const gradeCode   = data.gradeCode ? String(data.gradeCode).toUpperCase() : null;
    const supplierId  = data.supplierId ? Number(data.supplierId) : null;
    const departedAt  = data.departedAt ? new Date(data.departedAt) : now();

    assert(truckNo, 'truckNo required');
    assert(weightTon > 0, 'weightTon must be > 0');
    assert(fromStation !== toStation, 'fromStation and toStation cannot be the same');

    if (options.enforceStock) {
      const s = await getStationStock(fromStation);
      if (weightTon > s.stock) {
        const e = new Error(
          `INSUFFICIENT_STOCK: trying to dispatch ${weightTon}t from ${fromStation} but stock is ${s.stock}t`
        );
        e.code = 'INSUFFICIENT_STOCK';
        throw e;
      }
    }

    const row = await prisma.oreTransport.create({
      data: {
        fromStation,
        toStation,
        truckNo,
        weightTon,
        gradeCode,
        supplierId,
        status: TRANSPORT_STATUS.IN_TRANSIT,
        departedAt,
      },
    });

    await logEvent('ORE_DISPATCH', {
      fromStation, toStation, truckNo, weightTon, gradeCode, supplierId, transportId: row.id,
    });

    return row;
  }

  /**
   * Mark a transport as received at destination
   * args: { transportId, receivedAt? }
   */
  async function receive({ transportId, receivedAt = null }) {
    const id = Number(transportId);
    assert(id > 0, 'transportId required');

    const row = await prisma.oreTransport.update({
      where: { id },
      data: {
        status: TRANSPORT_STATUS.RECEIVED,
        receivedAt: receivedAt ? new Date(receivedAt) : now(),
      },
    });

    await logEvent('ORE_RECEIVE', {
      toStation: row.toStation,
      fromStation: row.fromStation,
      truckNo: row.truckNo,
      weightTon: row.weightTon,
      transportId: row.id,
    });

    return row;
  }

  /**
   * List transports (dispatch/receive events)
   * filter: { fromStation?, toStation?, status?, from?, to? }
   */
  async function listTransports(filter = {}) {
    const where = {};
    if (filter.fromStation) where.fromStation = asStationCode(filter.fromStation);
    if (filter.toStation)   where.toStation   = asStationCode(filter.toStation);
    if (filter.status)      where.status      = String(filter.status);
    if (filter.from || filter.to) {
      // If status=received, use receivedAt; otherwise use departedAt window
      const useReceived = filter.status === TRANSPORT_STATUS.RECEIVED;
      const key = useReceived ? 'receivedAt' : 'departedAt';
      where[key] = {};
      if (filter.from) where[key].gte = new Date(filter.from);
      if (filter.to)   where[key].lte = new Date(filter.to);
    }

    return prisma.oreTransport.findMany({
      where,
      orderBy: [{ departedAt: 'desc' }, { id: 'desc' }],
    });
  }

  // ---- stock calculations (derived) ---------------------------------------

  /**
   * Get station stock snapshot
   * stock = deposits + received - dispatched
   * inTransit = transports out that haven't been received yet
   */
  async function getStationStock(stationCode) {
    const S = asStationCode(stationCode);

    const [depositsAgg, receivedAgg, dispatchedAgg, inTransitAgg] = await Promise.all([
      prisma.ore.aggregate({
        _sum: { weightTon: true },
        where: { stationCode: S },
      }),
      prisma.oreTransport.aggregate({
        _sum: { weightTon: true },
        where: { toStation: S, status: TRANSPORT_STATUS.RECEIVED },
      }),
      prisma.oreTransport.aggregate({
        _sum: { weightTon: true },
        where: { fromStation: S }, // all dispatched count against origin (received or not)
      }),
      prisma.oreTransport.aggregate({
        _sum: { weightTon: true },
        where: { fromStation: S, status: TRANSPORT_STATUS.IN_TRANSIT },
      }),
    ]);

    const deposits   = Number(depositsAgg._sum.weightTon || 0);
    const received   = Number(receivedAgg._sum.weightTon || 0);
    const dispatched = Number(dispatchedAgg._sum.weightTon || 0);
    const inTransit  = Number(inTransitAgg._sum.weightTon || 0);
    const stock      = deposits + received - dispatched;

    return { stationCode: S, deposits, received, dispatched, inTransit, stock };
  }

  /**
   * Station summary: stock + recent activity
   */
  async function getStationSummary(stationCode) {
    const S = asStationCode(stationCode);

    const [stock, recentDeposits, recentOut, recentIn] = await Promise.all([
      getStationStock(S),
      prisma.ore.findMany({
        where: { stationCode: S },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.oreTransport.findMany({
        where: { fromStation: S },
        orderBy: { departedAt: 'desc' },
        take: 10,
      }),
      prisma.oreTransport.findMany({
        where: { toStation: S, status: TRANSPORT_STATUS.RECEIVED },
        orderBy: { receivedAt: 'desc' },
        take: 10,
      }),
    ]);

    return { ...stock, recentDeposits, recentDispatches: recentOut, recentReceipts: recentIn };
  }

  /**
   * Snapshot across all stations (based on enum set)
   */
  async function getAllStocks() {
    const stations = StationCode ? Object.values(StationCode) : ['JSS', 'PSS', 'KEF'];
    const results = await Promise.all(stations.map(getStationStock));
    return results;
  }

  // ---- public API ----------------------------------------------------------

  return {
    // deposits
    createDeposit,
    listDeposits,

    // transports
    dispatch,
    receive,
    listTransports,

    // stock / summaries
    getStationStock,
    getStationSummary,
    getAllStocks,

    // logging (exposed in case callers want to add custom logs)
    logEvent,

    // exposed constants
    TRANSPORT_STATUS,
  };
}
