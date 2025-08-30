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

// lib/services/talcServices.js (inside createTalcService(prisma))
// inside createOreService(db)
async function listOreByStation({ stationCode, onlyReceived = true, since = null, limit = 100, excludeLinked = false }) {
  const where = {
    toStation: stationCode,
    ...(onlyReceived ? { status: 'received' } : {}),
    ...(since ? { receivedAt: { gte: since } } : {})
  };

  const rows = await db.oreTransport.findMany({
    where,
    orderBy: [{ receivedAt: 'desc' }, { dispatchedAt: 'desc' }, { id: 'desc' }],
    take: limit,
    select: {
      id: true,
      truckNo: true,
      fromStation: true,
      toStation: true,
      sendGradeCode: true,
      sendWeightTon: true,
      receiveGradeCode: true,
      receiveWeightTon: true,
      dispatchedAt: true,
      receivedAt: true,
      status: true
    }
  });

  if (excludeLinked && rows.length) {
    const ids = rows.map(r => r.id);
    const linked = await db.talcDeposit.findMany({
      where: { oreTransportId: { in: ids } },
      select: { oreTransportId: true }
    });
    const linkedSet = new Set(linked.map(x => x.oreTransportId).filter(Boolean));
    return rows.filter(r => !linkedSet.has(r.id));
  }

  return rows;
}

// Add inside createOreService(db)
async function overview({ since = null } = {}) {
  const depWhere  = since ? { depositedAt: { gte: since } } : {};
  const recvWhere = since ? { status: 'received', receivedAt: { gte: since } } : { status: 'received' };

  const [depAgg, recvAgg, inAgg] = await Promise.all([
    db.oreDeposit.aggregate({ _sum: { weightTon: true }, where: depWhere }),
    db.oreTransport.aggregate({ _sum: { receiveWeightTon: true }, where: recvWhere }),
    db.oreTransport.aggregate({ _sum: { sendWeightTon: true }, _count: { _all: true }, where: { status: 'in_transit' } })
  ]);

  return {
    depositsTonSince: Number(depAgg._sum.weightTon || 0),
    receivedTonSince: Number(recvAgg._sum.receiveWeightTon || 0),
    inTransitTon:     Number(inAgg._sum.sendWeightTon || 0),
    inTransitCount:   Number((inAgg._count && inAgg._count._all) || 0)
  };
}


// Inside createOreService(db)
async function groupByTruck({ since = null, dateFrom = null, dateTo = null } = {}) {
  const from = dateFrom || since || null;
  const whereBase = {
    truckNo: { not: null },
    ...(from ? { dispatchedAt: { gte: from } } : {}),
    ...(dateTo ? { dispatchedAt: { gte: from, lte: dateTo } } : {})
  };

  // Aggregates by truck
  const agg = await db.oreTransport.groupBy({
    by: ["truckNo"],
    where: whereBase,
    _sum: { sendWeightTon: true, receiveWeightTon: true },
    _count: { _all: true },
    _max: { dispatchedAt: true }
  });

  // For avg turnaround, read only received rows in window
  const recvd = await db.oreTransport.findMany({
    where: { ...whereBase, status: "received" },
    select: { truckNo: true, dispatchedAt: true, receivedAt: true }
  });

  const durByTruck = new Map(); // truckNo -> { sumHrs, n }
  for (const t of recvd) {
    if (!t.receivedAt || !t.dispatchedAt) continue;
    const hrs = (new Date(t.receivedAt).getTime() - new Date(t.dispatchedAt).getTime()) / 3600000;
    const cur = durByTruck.get(t.truckNo) || { sumHrs: 0, n: 0 };
    cur.sumHrs += hrs;
    cur.n += 1;
    durByTruck.set(t.truckNo, cur);
  }

  return agg.map((r) => {
    const { sumHrs, n } = durByTruck.get(r.truckNo) || { sumHrs: 0, n: 0 };
    return {
      material: "ore",
      truckNo: r.truckNo,
      tripsCount: r._count?._all || 0,
      totalSendTon: Number(r._sum?.sendWeightTon || 0),
      totalReceiveTon: Number(r._sum?.receiveWeightTon || 0),
      avgTurnaroundHrs_sum: sumHrs,
      avgTurnaroundHrs_n: n,
      lastTripAt: r._max?.dispatchedAt || null
    };
  });
}

// Inside createOreService(db)
async function listTransports({
  since = null,
  dateFrom = null,
  dateTo = null,
  status = null,
  fromStation = null,
  toStation = null
} = {}) {
  const from = dateFrom || since || null;

  const where = {
    ...(from || dateTo
      ? { dispatchedAt: { ...(from ? { gte: from } : {}), ...(dateTo ? { lte: dateTo } : {}) } }
      : {}),
    ...(status ? { status } : {}),
    ...(fromStation ? { fromStation } : {}),
    ...(toStation ? { toStation } : {})
  };

  return db.oreTransport.findMany({
    where,
    select: {
      id: true,
      fromStation: true,
      toStation: true,
      sendWeightTon: true,
      sendGradeCode: true,
      dispatchedAt: true,
      receivedAt: true,
      status: true
    },
    orderBy: { dispatchedAt: 'desc' }
  });
}



// Add to returned object:
return {
  deposit, dispatch, unload, listInTransit, getTransport, getStationStock, overview, groupByTruck,
  listTransports
};

}
