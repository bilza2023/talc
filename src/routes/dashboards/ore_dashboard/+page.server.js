import createOreService from '/services/oreService.js';

export async function load() {
  const ore = createOreService();

  const [stocks, inTransitList] = await Promise.all([
    ore.getAllStocks(), // [{ stationCode, deposits, received, dispatched, inTransit, stock }]
    ore.listTransports({ status: ore.TRANSPORT_STATUS.IN_TRANSIT })
  ]);

  const totalStock = stocks.reduce((a, s) => a + Number(s.stock || 0), 0);
  const inTransitTons = inTransitList.reduce((a, t) => a + Number(t.weightTon || 0), 0);
  const systemTotal = totalStock + inTransitTons;

  return {
    stocks,
    inTransitList,
    totals: { totalStock, inTransitTons, systemTotal },
    at: new Date().toISOString()
  };
}
