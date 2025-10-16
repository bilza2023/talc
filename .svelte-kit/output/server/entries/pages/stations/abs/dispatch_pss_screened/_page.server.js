import { l as loadDispatch } from "../../../../../chunks/dispatchLoader.js";
const FROM_MMA = "ABS_SCREENED";
const TO_MMA = "PSS_SCREENED";
async function load(event) {
  return loadDispatch(event, { fromMmaCode: FROM_MMA, toMmaCode: TO_MMA }, { requireSize: true });
}
export {
  load
};
