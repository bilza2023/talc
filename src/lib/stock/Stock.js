// src/lib/stock/Stock.js — unified schema, mmaCode-driven (no `family` field)
import { PrismaClient } from '@prisma/client';
import { randomUUID as uuidv4 } from 'crypto';

/**
 * Unified Stock service (station-free, mmaCode-driven).
 * Uses ONE pair of Prisma delegates that point to unified tables:
 *   - ledgerDelegate    (default: prisma.stockLedger)
 *   - transportDelegate (default: prisma.stockTransport)
 *
 * All commands REQUIRE mmaCode via toMmaCode/fromMmaCode.
 */
export default class Stock {
  /**
   * @param {Object} opts
   * @param {PrismaClient} [opts.prisma]
   * @param {string} [opts.ledgerDelegate='stockLedger']      // Prisma delegate name for unified ledger table
   * @param {string} [opts.transportDelegate='stockTransport'] // Prisma delegate name for unified transport table
   * @param {string} [opts.sizeDefault='ANY']
   */
  constructor({
    prisma,
    ledgerDelegate = 'stockLedger',
    transportDelegate = 'stockTransport',
    sizeDefault = 'ANY',
  } = {}) {
    this.prisma = prisma ?? new PrismaClient();
    this.ledgerDelegate = String(ledgerDelegate);
    this.transportDelegate = String(transportDelegate);
    this.sizeDefault = String(sizeDefault || 'ANY');
  }

  // ---------- tiny helpers ----------
  #Ledger(tx = this.prisma) {
    const d = tx[this.ledgerDelegate];
    if (!d) throw new Error(`Prisma delegate "${this.ledgerDelegate}" not found`);
    return d;
  }
  #Transport(tx = this.prisma) {
    const d = tx[this.transportDelegate];
    if (!d) throw new Error(`Prisma delegate "${this.transportDelegate}" not found`);
    return d;
  }
  #size(size) { return size ?? this.sizeDefault; }
  #need(val, name) { if (val == null || val === '') throw new Error(`${name} is required`); }
  #needPos(qty) { if (qty == null || Number(qty) <= 0) throw new Error('qty must be > 0'); }

  // ============================================================
  //                         VERBS (mutations)
  // ============================================================

  /**
   * deposit: append +qty in ledger (DIRECT or PROCESS)
   */
  async deposit({
    toMmaCode, supplierId, shade, qty, size,
    processId, reason = 'DIRECT', meta,
  }) {
    this.#need(toMmaCode, 'toMmaCode');
    this.#need(supplierId, 'supplierId');
    this.#need(shade, 'shade');
    this.#needPos(qty);

    const finalSize = this.#size(size);
    const linkId = processId ?? null;
    const finalReason = processId ? 'PROCESS' : String(reason || 'DIRECT');

    const post = await this.#Ledger().create({
      data: {
        mmaCode: String(toMmaCode),
        supplierId: Number(supplierId),
        shade: String(shade),
        size: String(finalSize),
        qtyDelta: Number(qty),
        reason: finalReason,
        linkId,
        meta: meta ?? null,
      },
    });
    return { posting: post };
  }

  /**
   * withdraw: append -qty in ledger (PROCESS), availability-guarded
   */
  async withdraw({
    fromMmaCode, supplierId, shade, qty, size,
    processId, reason = 'PROCESS', meta,
  }) {
    this.#need(fromMmaCode, 'fromMmaCode');
    this.#need(supplierId, 'supplierId');
    this.#need(shade, 'shade');
    this.#needPos(qty);
    if (!processId) throw new Error('withdraw requires processId');

    const finalSize = this.#size(size);

    // availability guard
    const available = await this.onHand({ mmaCode: fromMmaCode, supplierId, shade, size: finalSize });
    if (Number(available) < Number(qty)) {
      throw new Error(`Insufficient stock at ${fromMmaCode} (available=${available}, requested=${qty})`);
    }

    const post = await this.#Ledger().create({
      data: {
        mmaCode: String(fromMmaCode),
        supplierId: Number(supplierId),
        shade: String(shade),
        size: String(finalSize),
        qtyDelta: -Number(qty),
        reason: String(reason || 'PROCESS'),
        linkId: String(processId),
        meta: meta ?? null,
      },
    });
    return { posting: post };
  }

  /**
   * dispatch: create DISPATCH transport and post -qty at source (atomic)
   */
  async dispatch({
    fromMmaCode, toMmaCode, supplierId, shade, qty, size,
    amount, meta, transportId,
  }) {
    this.#need(fromMmaCode, 'fromMmaCode');
    this.#need(toMmaCode, 'toMmaCode');
    this.#need(supplierId, 'supplierId');
    this.#need(shade, 'shade');
    this.#needPos(qty);

    const finalSize = this.#size(size);
    const tid = transportId ?? uuidv4();

    return this.prisma.$transaction(async (tx) => {
      // ensure available stock to dispatch
      const available = await this.onHand({ mmaCode: fromMmaCode, supplierId, shade, size: finalSize });
      if (Number(available) < Number(qty)) {
        throw new Error(`Insufficient stock at ${fromMmaCode} (available=${available}, requested=${qty})`);
      }

      // 1) transport: DISPATCH
      const tr = await this.#Transport(tx).create({
        data: {
          transportId: tid,
          type: 'DISPATCH',
          fromMmaCode: String(fromMmaCode),
          toMmaCode: String(toMmaCode),
          supplierId: Number(supplierId),
          shade: String(shade),
          size: String(finalSize),
          qty: Number(qty),
          amount: amount != null ? Number(amount) : null,
          meta: meta ?? null,
        },
      });

      // 2) ledger: -qty at source
      const led = await this.#Ledger(tx).create({
        data: {
          mmaCode: String(fromMmaCode),
          supplierId: Number(supplierId),
          shade: String(shade),
          size: String(finalSize),
          qtyDelta: -Number(qty),
          reason: 'TRANSPORT',
          linkId: tid,
          meta: meta ?? null,
        },
      });

      return { transportId: tid, dispatch: tr, posting: led };
    });
  }

  /**
   * receive: append RECEIVE event (+ ledger +qty) — idempotent per transportId
   */
  async receive({
    transportId, toMmaCode, supplierId, qty, shade,
    amount, meta,
  }) {
    this.#need(transportId, 'transportId');
    this.#need(toMmaCode, 'toMmaCode');
    this.#need(supplierId, 'supplierId');

    return this.prisma.$transaction(async (tx) => {
      const T = this.#Transport(tx);

      // find the dispatch (must exist)
      const dispatch = await T.findFirst({ where: { transportId, type: 'DISPATCH' } });
      if (!dispatch) throw new Error('DISPATCH not found for transportId');

      // not canceled / not already received
      const alreadyReceive = await T.findFirst({ where: { transportId, type: 'RECEIVE' } });
      if (alreadyReceive) return { transportId, receive: alreadyReceive, posting: null }; // idempotent
      const canceled = await T.findFirst({ where: { transportId, type: 'CANCEL' } });
      if (canceled) throw new Error('Transport is canceled');

      // defaults from dispatch if not provided
      const finalQty   = qty   != null ? Number(qty)   : Number(dispatch.qty);
      const finalShade = shade != null ? String(shade) : String(dispatch.shade);
      const finalSize  = String(dispatch.size);

      // transport: RECEIVE
      const rec = await T.create({
        data: {
          transportId,
          type: 'RECEIVE',
          fromMmaCode: String(dispatch.fromMmaCode),
          toMmaCode: String(toMmaCode),
          supplierId: Number(supplierId),
          shade: finalShade,
          size: finalSize,
          qty: finalQty,
          amount: amount != null ? Number(amount) : null,
          meta: meta ?? null,
        },
      });

      // ledger: +qty at destination
      const led = await this.#Ledger(tx).create({
        data: {
          mmaCode: String(toMmaCode),
          supplierId: Number(supplierId),
          shade: finalShade,
          size: finalSize,
          qtyDelta: Number(finalQty),
          reason: 'TRANSPORT',
          linkId: transportId,
          meta: meta ?? null,
        },
      });

      return { transportId, receive: rec, posting: led };
    });
  }

  /**
   * cancel: append CANCEL event (+ ledger reversal +qty)
   */
  async cancel({ transportId, meta }) {
    this.#need(transportId, 'transportId');

    return this.prisma.$transaction(async (tx) => {
      const T = this.#Transport(tx);

      // must have a dispatch
      const dispatch = await T.findFirst({ where: { transportId, type: 'DISPATCH' } });
      if (!dispatch) throw new Error('DISPATCH not found for transportId');

      // not already received, not already canceled
      const received = await T.findFirst({ where: { transportId, type: 'RECEIVE' } });
      if (received) throw new Error('Transport already received');
      const canceled = await T.findFirst({ where: { transportId, type: 'CANCEL' } });
      if (canceled) return { transportId, cancel: canceled, posting: null }; // idempotent

      // transport: CANCEL
      const can = await T.create({
        data: {
          transportId,
          type: 'CANCEL',
          fromMmaCode: String(dispatch.fromMmaCode),
          toMmaCode: String(dispatch.toMmaCode),
          supplierId: Number(dispatch.supplierId),
          shade: String(dispatch.shade),
          size: String(dispatch.size),
          qty: Number(dispatch.qty),
          amount: null,
          meta: meta ?? null,
        },
      });

      // ledger: reversal at source (+qty back)
      const led = await this.#Ledger(tx).create({
        data: {
          mmaCode: String(dispatch.fromMmaCode),
          supplierId: Number(dispatch.supplierId),
          shade: String(dispatch.shade),
          size: String(dispatch.size),
          qtyDelta: Number(dispatch.qty), // reversal
          reason: 'REVERSAL',
          linkId: transportId,
          meta: meta ?? null,
        },
      });

      return { transportId, cancel: can, posting: led };
    });
  }

  // ============================================================
  //                           READS
  // ============================================================

  /**
   * onHand: Σ qtyDelta with optional filters
   */
  async onHand({ mmaCode, supplierId, shade, size } = {}) {
    const L = this.#Ledger();
    const where = {
      ...(mmaCode ? { mmaCode: String(mmaCode) } : {}),
      ...(supplierId ? { supplierId: Number(supplierId) } : {}),
      ...(shade ? { shade: String(shade) } : {}),
      ...(size ? { size: String(this.#size(size)) } : {}),
    };
    const ag = await L.aggregate({ _sum: { qtyDelta: true }, where });
    return Number(ag._sum.qtyDelta ?? 0);
  }

  /**
   * slots: per-slot balances (groupBy), filtered to one mmaCode
   */
  async slots({ mmaCode, positiveOnly = true } = {}) {
    this.#need(mmaCode, 'mmaCode');

    const L = this.#Ledger();
    const rows = await L.groupBy({
      by: ['supplierId', 'shade', 'size'],
      where: { mmaCode: String(mmaCode) },
      _sum: { qtyDelta: true },
    });

    const out = [];
    for (const r of rows) {
      const qty = Number(r._sum.qtyDelta ?? 0);
      if (!positiveOnly || qty > 0) {
        out.push({
          mmaCode: String(mmaCode),
          supplierId: Number(r.supplierId),
          shade: String(r.shade),
          size: String(r.size),
          qty,
        });
      }
    }
    out.sort((a, b) => b.qty - a.qty);
    return out;
  }

  /**
 * slot: exact-bucket balance for a single tuple
 * Returns { mmaCode, supplierId, shade, size, qty } with strict, exact matching.
 * Note: For RAW buckets, callers must pass size: 'ANY' explicitly.
 */
  async slot({ mmaCode, supplierId, shade, size } = {}) {
    this.#need(mmaCode, 'mmaCode');
    this.#need(supplierId, 'supplierId');
    this.#need(shade, 'shade');
    this.#need(size, 'size');

    const L = this.#Ledger();
    const where = {
      mmaCode: String(mmaCode),
      supplierId: Number(supplierId),
      shade: String(shade),
      size: String(this.#size(size))
    };
    const ag = await L.aggregate({ _sum: { qtyDelta: true }, where });
    const qty = Number(ag._sum.qtyDelta ?? 0);

    return {
      mmaCode: where.mmaCode,
      supplierId: where.supplierId,
      shade: where.shade,
      size: where.size,
      qty
    };
  }
  
  /**
   * inbound: unsettled DISPATCH events TO this mmaCode
   */
  async inbound({ mmaCode } = {}) {
    this.#need(mmaCode, 'mmaCode');
    const T = this.#Transport();

    const dispatches = await T.findMany({
      where: { type: 'DISPATCH', toMmaCode: String(mmaCode) },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });

    if (!dispatches.length) return [];
    const ids = Array.from(new Set(dispatches.map(d => d.transportId)));

    const settled = await T.findMany({
      where: { transportId: { in: ids }, type: { in: ['RECEIVE', 'CANCEL'] } },
      select: { transportId: true },
    });
    const settledSet = new Set(settled.map(x => x.transportId));

    return dispatches.filter(d => !settledSet.has(d.transportId));
  }

  /**
   * outbound: unsettled DISPATCH events FROM this mmaCode
   */
  async outbound({ mmaCode } = {}) {
    this.#need(mmaCode, 'mmaCode');
    const T = this.#Transport();

    const dispatches = await T.findMany({
      where: { type: 'DISPATCH', fromMmaCode: String(mmaCode) },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });

    if (!dispatches.length) return [];
    const ids = Array.from(new Set(dispatches.map(d => d.transportId)));

    const settled = await T.findMany({
      where: { transportId: { in: ids }, type: { in: ['RECEIVE', 'CANCEL'] } },
      select: { transportId: true },
    });
    const settledSet = new Set(settled.map(x => x.transportId));

    return dispatches.filter(d => !settledSet.has(d.transportId));
  }

  /**
   * transportAmounts: money rollup buckets
   */
  async transportAmounts({ mmaCode }) {
    this.#need(mmaCode, 'mmaCode');
    const T = this.#Transport();

    const [outD, inD, inR] = await Promise.all([
      T.aggregate({ _sum: { amount: true }, where: { type: 'DISPATCH', fromMmaCode: String(mmaCode) } }),
      T.aggregate({
        _sum: { amount: true },
        where: {
          type: 'DISPATCH',
          toMmaCode: String(mmaCode),
          transportId: {
            notIn: (
              await T.findMany({
                where: { type: { in: ['RECEIVE', 'CANCEL'] }, toMmaCode: String(mmaCode) },
                select: { transportId: true },
              })
            ).map(x => x.transportId),
          },
        },
      }),
      T.aggregate({ _sum: { amount: true }, where: { type: 'RECEIVE', toMmaCode: String(mmaCode) } }),
    ]);

    return {
      outboundDispatched: Number(outD._sum.amount ?? 0),
      inboundInTransit:   Number(inD._sum.amount ?? 0),
      inboundReceived:    Number(inR._sum.amount ?? 0),
    };
  }

  /**
   * auditTransport: returns dispatch + optional receive/cancel + computed deltas
   */
  async auditTransport({ transportId }) {
    this.#need(transportId, 'transportId');
    const T = this.#Transport();
    const events = await T.findMany({ where: { transportId }, orderBy: { createdAt: 'asc' } });

    const dispatch = events.find(e => e.type === 'DISPATCH') ?? null;
    const receive  = events.find(e => e.type === 'RECEIVE') ?? null;
    const cancel   = events.find(e => e.type === 'CANCEL') ?? null;

    const deltas = receive && dispatch ? {
      qtyDelta: Number((receive.qty ?? 0) - (dispatch.qty ?? 0)),
      amountDelta: Number((receive.amount ?? 0) - (dispatch.amount ?? 0)),
      shadeDelta: (receive.shade || null) === (dispatch.shade || null) ? null : { from: dispatch.shade, to: receive.shade },
      size: dispatch.size ?? null,
    } : null;

    let status = 'IN_TRANSIT';
    if (cancel) status = 'CANCELED';
    if (receive) status = 'RECEIVED';

    return { status, dispatch, receive, cancel, deltas };
  }

  /**
   * auditProcess: list all withdrawals/deposits linked to a processId with totals
   */
  async auditProcess({ processId, mmaCode } = {}) {
    this.#need(processId, 'processId');
    const L = this.#Ledger();
    const where = { linkId: String(processId) };
    if (mmaCode) where.mmaCode = String(mmaCode);

    const rows = await L.findMany({ where, orderBy: { createdAt: 'asc' } });
    const total = rows.reduce((s, r) => s + Number(r.qtyDelta ?? 0), 0);

    return { rows, total };
  }
}
