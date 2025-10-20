const load = async ({ url }) => {
  return {
    stationCode: "PSS",
    stationName: "Peshawar (PSS)",
    fromUrl: Object.fromEntries(url.searchParams.entries())
  };
};
export {
  load
};
