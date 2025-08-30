// src/lib/services/oreServices.js

/**
 * Factory so you can inject a Prisma client (great for tests).
 * @param {import('@prisma/client').PrismaClient} db
 */
export default function createOreService(db) {
  if (!db) {
    throw Object.assign(new Error('Prisma client required'), { code: 'E_PRISMA_REQUIRED' });
  }

  const log = async (type, metadata) => {
    try {
      await db.log.create({ data: { type, metadata } });
    } catch {
      // don't fail main op due to logging
    }
  };

  /**
   * Create an OreDeposit (external inflow from supplier -> station).
   * @param {{stationCode:string, supplierId:number, weightTon:number, gradeCode:string, truckNo:string}} v
   */
  async function deposit(v) {
    const data = {
      stationCode: v.stationCode,
      supplierId:  Number(v.supplierId),
      weightTon:   Number(v.weightTon),
      gradeCode:   String(v.gradeCode).toUpperCase(),
      truckNo:     String(v.truckNo)
      // depositedAt via DB default now()
    };
    const row = await db.oreDeposit.create({ data });
    await log('ORE_DEPOSIT', { id: row.id, ...data });
    return row;
  }

  /**
   * Create an OreTransport as "in_transit" (dispatch between stations).
   * @param {{stationCode:string, toStation:string, truckNo:string, weightTon:number, gradeCode:string, supplierId?:number}} v
   */
  async function dispatch(v) {
    const data = {
      fromStation:    v.stationCode,
      toStation:      v.toStation,
      truckNo:        String(v.truckNo),
      sendWeightTon:  Number(v.weightTon),
      sendGradeCode:  String(v.gradeCode).toUpperCase(),
      status:         'in_transit',
      ...(v.supplierId ? { supplierId: Number(v.supplierId) } : {})
      // dispatchedAt via DB default now()
    };
    const row = await db.oreTransport.create({ data });
    await log('ORE_DISPATCH', { id: row.id, ...data });
    return row;
  }

  /**
   * Mark an existing OreTransport as received (unload step).
   * @param {{transportId:number, stationCode:string, receiveWeightTon:number, receiveGradeCode:string, receivedBy:string}} v
   */
  async function unload(v) {
    const id = Number(v.transportId);
    const transport = await db.oreTransport.findUnique({ where: { id } });

    if (!transport) {
      const err = new Error('Transport not found'); err.code = 'E_NOT_FOUND'; throw err;
    }
    if (transport.status !== 'in_transit') {
      const err = new Error('Transport not in transit'); err.code = 'E_BAD_STATUS'; throw err;
    }
    if (transport.toStation !== v.stationCode) {
      const err = new Error('Receiving station mismatch'); err.code = 'E_STATION_MISMATCH'; throw err;
    }

    const data = {
      receiveWeightTon: Number(v.receiveWeightTon),
      receiveGradeCode: String(v.receiveGradeCode).toUpperCase(),
      receivedBy:       String(v.receivedBy),
      receivedAt:       new Date(),
      status:           'received'
    };

    const row = await db.oreTransport.update({ where: { id }, data });
    await log('ORE_UNLOAD', { id, toStation: v.stationCode, ...data });
    return row;
  }

  // Helpers
  async function listInTransit(toStation) {
    return db.oreTransport.findMany({
      where: { status: 'in_transit', ...(toStation ? { toStation } : {}) },
      orderBy: { dispatchedAt: 'desc' }
    });
  }

  async function getTransport(id) {
    return db.oreTransport.findUnique({ where: { id: Number(id) } });
  }

// add this function inside createOreService(db), below helpers (or anywhere before the return)

async function getStationStock(stationCode) {
  const S = stationCode;

  const [depositsAgg, receivedAgg, inTransitAgg] = await Promise.all([
    // External inflow at this station
    db.oreDeposit.aggregate({
      _sum: { weightTon: true },
      where: { stationCode: S }
    }),

    // Received transfers into this station
    db.oreTransport.aggregate({
      _sum: { receiveWeightTon: true },
      where: { toStation: S, status: 'received' }
    }),

    // Outbound transfers still in transit (not yet received elsewhere)
    db.oreTransport.aggregate({
      _sum: { sendWeightTon: true },
      where: { fromStation: S, status: 'in_transit' }
    })
  ]);

  const deposits  = Number(depositsAgg._sum.weightTon || 0);
  const received  = Number(receivedAgg._sum.receiveWeightTon || 0);
  const inTransit = Number(inTransitAgg._sum.sendWeightTon || 0);

  const stock = deposits + received - inTransit;
  return { stationCode: S, deposits, received, inTransit, stock };
}


  return { deposit, dispatch, unload, listInTransit, getTransport,getStationStock };
}
