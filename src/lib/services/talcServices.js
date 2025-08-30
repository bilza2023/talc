
// src/lib/services/talcServices.js

/**
 * Talc service: deposit → dispatch → unload (+ helpers)
 * Mirrors Ore flow. TalcDeposit may optionally link to an OreTransport (traceability).
 *
 * @param {import('@prisma/client').PrismaClient} db
 */
export default function createTalcService(db) {
    if (!db) {
      throw Object.assign(new Error('Prisma client required'), { code: 'E_PRISMA_REQUIRED' });
    }
  
    const log = async (type, metadata) => {
      try {
        await db.log.create({ data: { type, metadata } });
      } catch { /* logging must not break main op */ }
    };
  
    const upper = (s) => String(s ?? '').toUpperCase();
  
    /**
     * Create a TalcDeposit at a station.
     * Optional traceability: link to an OreTransport via oreTransportId.
     * @param {{stationCode:string, weightTon:number, gradeCode:string, oreTransportId?:number}} v
     */
    async function deposit(v) {
      const data = {
        stationCode: v.stationCode,
        weightTon:   Number(v.weightTon),
        gradeCode:   upper(v.gradeCode),
        depositedAt: new Date(),
        ...(v.oreTransportId ? { oreTransportId: Number(v.oreTransportId) } : {})
      };
  
      if (!data.stationCode) throw Object.assign(new Error('stationCode required'), { code: 'E_MISSING_FIELD' });
      if (!(data.weightTon > 0)) throw Object.assign(new Error('weightTon must be > 0'), { code: 'E_BAD_FIELD' });
      if (!data.gradeCode) throw Object.assign(new Error('gradeCode required'), { code: 'E_MISSING_FIELD' });
  
      const row = await db.talcDeposit.create({ data });
      await log('TALC_DEPOSIT', { id: row.id, ...data });
      return row;
    }
  
    /**
     * Create a TalcTransport in "in_transit" status (dispatch between stations).
     * @param {{stationCode:string, toStation:string, truckNo?:string, weightTon:number, gradeCode:string}} v
     */
    async function dispatch(v) {
      const data = {
        fromStation:    v.stationCode,
        toStation:      v.toStation,
        truckNo:        v.truckNo ? String(v.truckNo) : null,
        sendWeightTon:  Number(v.weightTon),
        sendGradeCode:  upper(v.gradeCode),
        status:         'in_transit',
        dispatchedAt:   new Date()
      };
  
      if (!data.fromStation) throw Object.assign(new Error('stationCode required'), { code: 'E_MISSING_FIELD' });
      if (!data.toStation) throw Object.assign(new Error('toStation required'), { code: 'E_MISSING_FIELD' });
      if (!(data.sendWeightTon > 0)) throw Object.assign(new Error('weightTon must be > 0'), { code: 'E_BAD_FIELD' });
      if (data.fromStation === data.toStation) {
        throw Object.assign(new Error('fromStation and toStation cannot be the same'), { code: 'E_SAME_STATION' });
      }
  
      const row = await db.talcTransport.create({ data });
      await log('TALC_DISPATCH', { id: row.id, ...data });
      return row;
    }
  
    /**
     * Mark a TalcTransport as received (unload step).
     * Enforces: transport exists, is in_transit, and toStation matches receiving station.
     * (Business rules about ore→talc reconciliation intentionally deferred.)
     * @param {{transportId:number, stationCode:string, receiveWeightTon:number, receiveGradeCode:string, receivedBy:string}} v
     */
    async function unload(v) {
      // console.log("v" ,v);
      const id = Number(v.transportId);
      if (!(id > 0)) throw Object.assign(new Error('transportId required'), { code: 'E_MISSING_FIELD' });
  
      const transport = await db.talcTransport.findUnique({ where: { id } });
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
        receiveGradeCode: upper(v.receiveGradeCode),
        receivedBy:       String(v.receivedBy),
        receivedAt:       new Date(),
        status:           'received'
      };
  
      const row = await db.talcTransport.update({ where: { id }, data });
      await log('TALC_UNLOAD', { id, toStation: v.stationCode, ...data });
      return row;
    }
  
    /** List in-transit Talc transports; optional filter by toStation. */
    async function listInTransit(toStation) {
      return db.talcTransport.findMany({
        where: { status: 'in_transit', ...(toStation ? { toStation } : {}) },
        orderBy: { dispatchedAt: 'desc' }
      });
    }
  
    /** Fetch one Talc transport by id. */
    async function getTransport(id) {
      return db.talcTransport.findUnique({ where: { id: Number(id) } });
    }
  
    /** (Optional) simple Talc station stock: deposits + received - in_transit */
    async function getStationStock(stationCode) {
      const S = stationCode;
      const [depositsAgg, receivedAgg, inTransitAgg] = await Promise.all([
        db.talcDeposit.aggregate({ _sum: { weightTon: true }, where: { stationCode: S } }),
        db.talcTransport.aggregate({ _sum: { receiveWeightTon: true }, where: { toStation: S, status: 'received' } }),
        db.talcTransport.aggregate({ _sum: { sendWeightTon: true }, where: { fromStation: S, status: 'in_transit' } }),
      ]);
      const deposits  = Number(depositsAgg._sum.weightTon || 0);
      const received  = Number(receivedAgg._sum.receiveWeightTon || 0);
      const inTransit = Number(inTransitAgg._sum.sendWeightTon || 0);
      const stock     = deposits + received - inTransit;
      return { stationCode: S, deposits, received, inTransit, stock };
    }
  

    // Add inside createTalcService(db)
async function overview({ since = null } = {}) {
  const depWhere  = since ? { depositedAt: { gte: since } } : {};
  const recvWhere = since ? { status: 'received', receivedAt: { gte: since } } : { status: 'received' };

  const [depAgg, recvAgg, inAgg] = await Promise.all([
    db.talcDeposit.aggregate({ _sum: { weightTon: true }, where: depWhere }),
    db.talcTransport.aggregate({ _sum: { receiveWeightTon: true }, where: recvWhere }),
    db.talcTransport.aggregate({ _sum: { sendWeightTon: true }, _count: { _all: true }, where: { status: 'in_transit' } })
  ]);

  return {
    depositsTonSince: Number(depAgg._sum.weightTon || 0),
    receivedTonSince: Number(recvAgg._sum.receiveWeightTon || 0),
    inTransitTon:     Number(inAgg._sum.sendWeightTon || 0),
    inTransitCount:   Number((inAgg._count && inAgg._count._all) || 0)
  };
}

// Inside createTalcService(db)
async function groupByTruck({ since = null, dateFrom = null, dateTo = null } = {}) {
  const from = dateFrom || since || null;
  const whereBase = {
    truckNo: { not: null },
    ...(from ? { dispatchedAt: { gte: from } } : {}),
    ...(dateTo ? { dispatchedAt: { gte: from, lte: dateTo } } : {})
  };

  const agg = await db.talcTransport.groupBy({
    by: ["truckNo"],
    where: whereBase,
    _sum: { sendWeightTon: true, receiveWeightTon: true },
    _count: { _all: true },
    _max: { dispatchedAt: true }
  });

  const recvd = await db.talcTransport.findMany({
    where: { ...whereBase, status: "received" },
    select: { truckNo: true, dispatchedAt: true, receivedAt: true }
  });

  const durByTruck = new Map();
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
      material: "talc",
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


// Inside createTalcService(db)
async function sumLinkedTalcByOreTransportIds({ oreTransportIds = [], dateFrom = null, dateTo = null } = {}) {
  if (!Array.isArray(oreTransportIds) || oreTransportIds.length === 0) {
    return new Map();
  }

  const where = {
    oreTransportId: { in: oreTransportIds },
    ...(dateFrom ? { depositedAt: { gte: dateFrom } } : {}),
    ...(dateTo ? { depositedAt: { lte: dateTo } } : {})
  };

  const agg = await db.talcDeposit.groupBy({
    by: ["oreTransportId"],
    where,
    _sum: { weightTon: true },
    _min: { depositedAt: true }
  });

  // Map: transportId -> { linkedTon, firstDepositAt }
  const map = new Map();
  for (const r of agg) {
    map.set(r.oreTransportId, {
      linkedTon: Number(r._sum?.weightTon || 0),
      firstDepositAt: r._min?.depositedAt || null
    });
  }
  return map;
}


// src/lib/services/talcServices.js
// ...
async function sumLinkedTalcByOreTransportIds({
  oreTransportIds = [],
  dateFrom = null,
  dateTo = null
} = {}) {
  if (!Array.isArray(oreTransportIds) || oreTransportIds.length === 0) {
    return new Map();
  }

  const where = {
    oreTransportId: { in: oreTransportIds },
    ...(dateFrom || dateTo
      ? { depositedAt: { ...(dateFrom ? { gte: dateFrom } : {}), ...(dateTo ? { lte: dateTo } : {}) } }
      : {})
  };

  const agg = await db.talcDeposit.groupBy({
    by: ['oreTransportId'],
    where,
    _sum: { weightTon: true },
    _min: { depositedAt: true }
  });

  const map = new Map();
  for (const r of agg) {
    map.set(r.oreTransportId, {
      linkedTon: Number(r._sum?.weightTon || 0),
      firstDepositAt: r._min?.depositedAt || null
    });
  }
  return map;
}


// Add to returned object:
return {
  deposit, dispatch, unload, listInTransit, getTransport, getStationStock, overview, groupByTruck,
  sumLinkedTalcByOreTransportIds,sumLinkedTalcByOreTransportIds
};


}
  