const load = async ({ url }) => {
  return {
    stationCode: "KEF",
    stationName: "Karachi Export Facility",
    fromUrl: Object.fromEntries(url.searchParams.entries())
  };
};
export {
  load
};
