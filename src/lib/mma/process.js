// src/lib/mma/process.js
// Global cross-stage processes (screen, sort)
// - SCREENING: rawMaterial3s -> processed4s
// - SORTING:   processed4s   -> sorted4s

import { PrismaClient } from '@prisma/client';

const DEFAULT_TOL = 1e-6;

function assertPositive(n, msg = 'qty must be > 0') {
  if (!(typeof n === 'number' && isFinite(n) && n > 0)) {
    throw new Error(msg);
  }
}

function approxEq(a, b, tol = DEFAULT_TOL) {
  return Math.abs(Number(a) - Number(b)) <= tol;
}

export class Processes {
  /**
   * @param {{ prisma?: PrismaClient }} opts
   */
  constructor(opts = {}) {
    this.prisma = opts.prisma ?? new PrismaClient();
  }

  /**
   * SCREENING: raw -> processed (3-slot -> 4-slot)
   *
   * @param {{
   *  fromMmaCode: string,   // e.g. 'ABS_RAW'
   *  toMmaCode: string,     // e.g. 'ABS_PROCESSED'
   *  supplierId: number,
   *  shade: 'WHITE'|'GREY'|'LIGHTGREY'|'GREEN'|'MIXED',
   *  inputQty: number,
   *  outputs: Array<{ size: 'LUMPS'|'CHIPS'|'FINE', qty: number, shade?: string }>,
   *  meta?: Record<string, any>
   * }} args
   *
   * @returns {Promise<{ process: any, consumed: any, produced: any[] }>}
   */
  async screen(args) {
    const {
      fromMmaCode,
      toMmaCode,
      supplierId,
      shade,
      inputQty,
      outputs = [],
      meta = {},
    } = args;

    assertPositive(inputQty, 'inputQty must be > 0');
    if (!outputs.length) throw new Error('outputs[] is required (at least one item)');
    outputs.forEach(o => assertPositive(o.qty, 'each outputs[i].qty must be > 0'));

    const sumOut = outputs.reduce((s, o) => s + Number(o.qty), 0);

    // Optional conservation check (sum(outputs) == inputQty)
    if (!approxEq(sumOut, inputQty)) {
      // Allow non-exact but warn via error to keep data clean.
      throw new Error(`Screening conservation failed: inputQty=${inputQty} != sum(outputs)=${sumOut}`);
    }

    return this.prisma.$transaction(async (tx) => {
      // 1) Process header
      const process = await tx.process.create({
        data: {
          type: 'SCREENING',
          fromTable: 'RAW_MATERIAL_3S',
          toTable: 'PROCESSED_4S',
          fromMmaCode,
          toMmaCode,
          meta,
        },
      });

      // 2) Consume from RAW (bornAs: PROCESS, RECEIVED)
      const consumed = await tx.rawMaterial3s.create({
        data: {
          bornAs: 'PROCESS',
          status: 'RECEIVED',
          fromMmaCode,
          toMmaCode,
          supplierId,
          dispatchShade: shade,
          receiveShade: shade,
          dispatchQty: inputQty,
          receiveQty: inputQty,
          receivedAt: new Date(),
          processId: process.id,
        },
      });

      // 3) Produce into PROCESSED per output split
      const produced = [];
      for (const o of outputs) {
        const outShade = o.shade ?? shade;
        produced.push(
          await tx.processed4s.create({
            data: {
              bornAs: 'PROCESS',
              status: 'RECEIVED',
              fromMmaCode,
              toMmaCode,
              supplierId,
              size: o.size,
              dispatchShade: outShade,
              receiveShade: outShade,
              dispatchQty: o.qty,
              receiveQty: o.qty,
              receivedAt: new Date(),
              processId: process.id,
            },
          })
        );
      }

      return { process, consumed, produced };
    });
  }

  /**
   * SORTING: processed -> sorted (4-slot -> 4-slot)
   * Supports impurities in meta: { HT, Wastage }
   *
   * @param {{
   *  fromMmaCode: string,   // e.g. 'PSS_PROCESSED'
   *  toMmaCode: string,     // e.g. 'PSS_SORTED'
   *  supplierId: number,
   *  shade: 'WHITE'|'GREY'|'LIGHTGREY'|'GREEN'|'MIXED',
   *  size: 'LUMPS'|'CHIPS'|'FINE',
   *  inputQty: number,
   *  outputs: Array<{ qty: number, size?: 'LUMPS'|'CHIPS'|'FINE', shade?: string }>,
   *  meta?: { HT?: number, Wastage?: number, [k: string]: any }
   * }} args
   *
   * @returns {Promise<{ process: any, consumed: any, produced: any[] }>}
   */
  async sort(args) {
    const {
      fromMmaCode,
      toMmaCode,
      supplierId,
      shade,
      size,
      inputQty,
      outputs = [],
      meta = {},
    } = args;

    assertPositive(inputQty, 'inputQty must be > 0');
    if (!outputs.length) throw new Error('outputs[] is required (at least one item)');
    outputs.forEach(o => assertPositive(o.qty, 'each outputs[i].qty must be > 0'));

    const sumOut = outputs.reduce((s, o) => s + Number(o.qty), 0);
    const HT = Number(meta?.HT ?? 0);
    const Wastage = Number(meta?.Wastage ?? 0);

    // Conservation: input == sum(outputs) + HT + Wastage
    const rhs = sumOut + HT + Wastage;
    if (!approxEq(inputQty, rhs)) {
      throw new Error(
        `Sorting conservation failed: inputQty=${inputQty} != outputs+impurities=${rhs} (sumOut=${sumOut}, HT=${HT}, Wastage=${Wastage})`
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // 1) Process header
      const process = await tx.process.create({
        data: {
          type: 'SORTING',
          fromTable: 'PROCESSED_4S',
          toTable: 'SORTED_4S',
          fromMmaCode,
          toMmaCode,
          meta, // includes HT, Wastage, etc.
        },
      });

      // 2) Consume from PROCESSED
      const consumed = await tx.processed4s.create({
        data: {
          bornAs: 'PROCESS',
          status: 'RECEIVED',
          fromMmaCode,
          toMmaCode,
          supplierId,
          size,
          dispatchShade: shade,
          receiveShade: shade,
          dispatchQty: inputQty,
          receiveQty: inputQty,
          receivedAt: new Date(),
          processId: process.id,
        },
      });

      // 3) Produce into SORTED per output split
      const produced = [];
      for (const o of outputs) {
        const outShade = o.shade ?? shade;
        const outSize = o.size ?? size; // usually size stays the same for sorting
        produced.push(
          await tx.sorted4s.create({
            data: {
              bornAs: 'PROCESS',
              status: 'RECEIVED',
              fromMmaCode,
              toMmaCode,
              supplierId,
              size: outSize,
              dispatchShade: outShade,
              receiveShade: outShade,
              dispatchQty: o.qty,
              receiveQty: o.qty,
              receivedAt: new Date(),
              processId: process.id,
            },
          })
        );
      }

      return { process, consumed, produced };
    });
  }
}

// Default singleton for quick use
export const processes = new Processes();
