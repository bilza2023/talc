// /home/bilal-tariq/ab/src/lib/core/mmas/abs_unscreened_raw.js
// Pure capability factory: NO imports here.
// Station will inject a ready `base` (Mma) and a `depositToScreened` function.

export default function createAbsUnscreenedRaw({ base, depositToScreened }) {
  return {
    // 1) Purchase into ABS_UNSCREENED_RAW (alias of deposit)
    purchase(payload) {
      return base.deposit(payload);
    },

    // 2) Dispatch to PSS (whitelisted route)
    dispatchToPSS(payload) {
      return base.dispatch({ ...payload, toStation: 'PSS', toMma: 'PSS_SORTED' });
    },

    // 3) Dispatch to KEF (whitelisted route)
    dispatchToKEF(payload) {
      return base.dispatch({ ...payload, toStation: 'KEF', toMma: 'KEF_SORTED' });
    },

    // 4) Process: screen (local 1→1)
    //    withdraw from ABS_UNSCREENED_RAW, deposit into ABS_SCREENED
    async screen(payload) {
      const withdrawn = await base.withdraw(payload);
      const deposited = await depositToScreened(payload);
      return { withdrawn, deposited };
    }
  };
}
