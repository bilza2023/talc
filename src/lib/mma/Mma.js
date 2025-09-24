// /src/lib/mma/Mma.js
import { stations } from '$lib/stations/stations.js';
import { rawStock, processedStock, sortedStock } from '$lib/stocks/index.js';
import { SHADE_LIST, SIZE_LIST } from '$lib/mma/enums.js';
import { prisma } from '$lib/stocks/index.js'; // assuming prisma export is here

const STOCK_MAP = { rawStock, processedStock, sortedStock };

export default class Mma {
  constructor({ stationCode, mmaCode }) {
    this.stationCode = stationCode;
    this.mmaCode = mmaCode;

    // validate against stations config
    const station = stations[stationCode];
    if (!station) throw new Error(`Unknown station: ${stationCode}`);
    const mma = station.mmas.find((m) => m.mmaCode === mmaCode);
    if (!mma) throw new Error(`MMA ${mmaCode} not registered under station ${stationCode}`);

    this.mma = mma;
    this.stock = STOCK_MAP[mma.stock];
    if (!this.stock) throw new Error(`Unknown stock engine: ${mma.stock}`);
  }

  /** Return suppliers for this station */
  async suppliers() {
    return prisma.supplier.findMany({
      where: { stationCode: this.stationCode },
      select: { id: true, name: true },
      orderBy: { id: 'asc' },
    });
  }

  /**
   * Build the universe of slots: supplier × shade × size.
   * If activeOnly = true, filter down to slots that actually exist in stock.
   */
  async slots({ activeOnly = true } = {}) {
    const suppliers = await this.suppliers();

    // get real stock slots for this mma
    const baseSlots = await this.stock.slots({
      mmaCode: this.mmaCode,
      positiveOnly: activeOnly,
    });

    const existing = new Map();
    for (const s of baseSlots) {
      const k = `${s.supplierId}|${s.shade}|${s.size}`;
      existing.set(k, s);
    }

    const slots = [];
    for (const sup of suppliers) {
      for (const shade of SHADE_LIST) {
        for (const size of SIZE_LIST) {
          const k = `${sup.id}|${shade}|${size}`;
          const real = existing.get(k);
          slots.push({
            supplierId: sup.id,
            supplierName: sup.name,
            shade,
            size,
            qty: real ? real.qty : 0,
            mmaCode: this.mmaCode,
            stationCode: this.stationCode,
          });
        }
      }
    }

    return slots;
  }

  /** Quick summary: total qty across all slots */
  async onHand() {
    return this.stock.onHand({ mmaCode: this.mmaCode });
  }

  /** Inbound transports (live only) */
  async inbound() {
    return this.stock.inbound({ mmaCode: this.mmaCode });
  }

  /** Outbound transports (live only) */
  async outbound() {
    return this.stock.outbound({ mmaCode: this.mmaCode });
  }
}
