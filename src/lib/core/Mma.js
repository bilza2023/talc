// /src/lib/core/Mma.js
// Ultra-thin façade over a stock engine, scoped to (stationCode, mmaCode).
// No Station imports. No registries. All dependencies are injected.

export default class Mma {
  /**
   * @param {Object} cfg
   * @param {string} cfg.stationCode
   * @param {string} cfg.mmaCode
   * @param {Object} cfg.stock                      // tested stock instance
   * @param {string[]} cfg.shadeList                // e.g., ['WHITE','GREY',...]
   * @param {string[]} cfg.sizeList                 // e.g., ['LUMPS','CHIPS','FINE']
   * @param {{ getSuppliers: (stationCode:string)=>Promise<Array<{id:number,name:string}>> }} cfg.services
   * @param {string[]} [cfg.dispatchUrls=[]]        // prebuilt URLs for UI buttons (allowed routes)
   */
  constructor({ stationCode, mmaCode, stock, shadeList, sizeList, services, dispatchUrls = [] }) {
    this.stationCode = stationCode;
    this.mmaCode = mmaCode;
    this.stock = stock;

    this._shadeList = shadeList;
    this._sizeList = sizeList;
    this._getSuppliers = services?.getSuppliers;
    this._dispatchUrls = dispatchUrls;
  }

  // ---------------- Live data (pass-through) ----------------
  async onHand() {
    return this.stock.onHand({ mmaCode: this.mmaCode });
  }
  async inbound() {
    return this.stock.inbound({ mmaCode: this.mmaCode });
  }
  async outbound() {
    return this.stock.outbound({ mmaCode: this.mmaCode });
  }

  /**
   * Slots grid (supplier × shade × size) with live qty from stock.
   * activeOnly=true → only positive/live slots (fast path).
   * activeOnly=false → full universe with zeros for missing combos.
   */
  async slots({ activeOnly = true } = {}) {
    if (!this._getSuppliers) throw new Error('MMA requires services.getSuppliers(stationCode)');
    const suppliers = await this._getSuppliers(this.stationCode);

    const live = await this.stock.slots({
      mmaCode: this.mmaCode,
      positiveOnly: activeOnly
    });

    const liveMap = new Map();
    for (const s of live) {
      liveMap.set(`${s.supplierId}|${s.shade}|${s.size}`, Number(s.qty) || 0);
    }

    const rows = [];
    for (const sup of suppliers) {
      for (const shade of this._shadeList) {
        for (const size of this._sizeList) {
          const key = `${sup.id}|${shade}|${size}`;
          const qty = liveMap.get(key) ?? 0;

          rows.push({
            stationCode: this.stationCode,
            mmaCode: this.mmaCode,
            supplierId: sup.id,
            supplierName: sup.name,
            shade,
            size,
            qty,
            // UI can render dispatch buttons directly from these URLs
            dispatchUrls: this._dispatchUrls
          });
        }
      }
    }

    return activeOnly ? rows.filter(r => r.qty > 0) : rows;
  }

  // ---------------- Operations (pass-through) ----------------
  // Purchase/Deposit into this MMA
  deposit(payload) {
    // { supplierId, shade, size, qty, meta? }
    return this.stock.deposit({ ...payload, mmaCode: this.mmaCode });
  }

  // Local consumption / process step inside a station/MMa
  withdraw(payload) {
    // { supplierId, shade, size, qty, meta? }
    return this.stock.withdraw({ ...payload, mmaCode: this.mmaCode });
  }

  // Transport out to another station/MMA
  dispatch(payload) {
    // { toStation, toMma, supplierId, shade, size, qty, meta? }
    return this.stock.dispatch({
      ...payload,
      fromStation: this.stationCode,
      fromMma: this.mmaCode
    });
  }

  // Complete an inbound transport into this MMA
  receive(payload) {
    // { ledgerId, qtyReceived?, variance?, notes? }
    return this.stock.receive({ ...payload, toMma: this.mmaCode });
  }

  // Cancel a live outbound transport created from this MMA
  cancel(payload) {
    // { ledgerId }
    return this.stock.cancel(payload);
  }

  // ---------------- Helpers ----------------
  getDispatchUrls() {
    return this._dispatchUrls;
  }
}
