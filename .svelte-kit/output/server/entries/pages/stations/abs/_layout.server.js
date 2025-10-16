const load = async ({ url }) => {
  return {
    stationCode: "ABS",
    stationName: "Abbottabad (ABS)",
    fromUrl: Object.fromEntries(url.searchParams.entries())
  };
};
export {
  load
};
