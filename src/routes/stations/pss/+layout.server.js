// /src/routes/stations/pss/+layout.server.js
export const load = async ({ url }) => {
  return {
    stationCode: 'PSS',
    stationName: 'Peshawar (PSS)',
    fromUrl: Object.fromEntries(url.searchParams.entries())
  };
};
