import { s as stock } from "../../../../chunks/stockEngine.js";
const MMA_CODES = [
  "ABS_RAW",
  "ABS_SCREENED",
  "PSS_SCREENED",
  "PSS_SORTED",
  "KEF_SORTED"
];
const MMA_TO_CATEGORY = {
  ABS_RAW: "Unscreened",
  ABS_SCREENED: "Screened",
  PSS_SCREENED: "Screened",
  PSS_SORTED: "Sorted",
  KEF_SORTED: "Sorted"
};
const COLUMNS = ["Unscreened", "Screened", "Sorted", "Product"];
const load = async () => {
  const rows = [];
  for (const mmaCode of MMA_CODES) {
    const onhand = await stock.onHand({ mmaCode });
    const qty = typeof onhand === "number" ? onhand : Number(onhand?.qty ?? 0);
    const cat = MMA_TO_CATEGORY[mmaCode];
    const row = { mmaCode, Unscreened: 0, Screened: 0, Sorted: 0, Product: 0 };
    row[cat] = qty;
    rows.push(row);
  }
  return {
    title: "MMA Stock Totals",
    columns: COLUMNS,
    rows
  };
};
export {
  load
};
