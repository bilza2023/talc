// /src/routes/stations/abs/+layout.server.js
export const load = async ({ url }) => {
  return {
    stationCode: 'ABS',
    stationName: 'Abbottabad (ABS)',
    fromUrl: Object.fromEntries(url.searchParams.entries())
  };
};
