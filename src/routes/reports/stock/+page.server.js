import { stock } from '$lib/stocks/stockEngine.js';

const MMA_CODES = [
  'ABS_RAW',
  'ABS_SCREENED',
  'PSS_SCREENED',
  'PSS_SORTED',
  'KEF_SORTED'
];

const MMA_TO_CATEGORY = {
  ABS_RAW:       'Unscreened',
  ABS_SCREENED:  'Screened',
  PSS_SCREENED:  'Screened',
  PSS_SORTED:    'Sorted',
  KEF_SORTED:    'Sorted'
};

const COLUMNS = ['Unscreened', 'Screened', 'Sorted', 'Product'];

export const load = async () => {
  // Compute on-hand per MMA via engine (ledger-backed)
  const rows = [];
  for (const mmaCode of MMA_CODES) {
    const onhand = await stock.onHand({ mmaCode }); // number or { qty }, engine handles reversals/cancels
    const qty = typeof onhand === 'number' ? onhand : Number(onhand?.qty ?? 0);

    const cat = MMA_TO_CATEGORY[mmaCode];
    const row = { mmaCode, Unscreened: 0, Screened: 0, Sorted: 0, Product: 0 };
    row[cat] = qty;

    rows.push(row);
  }

  // Keep the payload tiny and explicit
  return {
    title: 'MMA Stock Totals',
    columns: COLUMNS,
    rows
  };
};
