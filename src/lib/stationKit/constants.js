
// Canonical enums & UI labels for stations and families.

export const FAMILIES = /** @type {const} */ (['RAW', 'SCREENED', 'SORTED']);
export const FAMILY = /** @type {{[k in typeof FAMILIES[number]]: k}} */ ({
  RAW: 'RAW',
  SCREENED: 'SCREENED',
  SORTED: 'SORTED'
});

export const FAMILY_LABEL = {
  RAW: 'Unscreened',
  SCREENED: 'Screened',
  SORTED: 'Sorted'
};

export const STATION_CODES = /** @type {const} */ (['ABS', 'PSS', 'KEF']);
export const STATION = /** @type {{[k in typeof STATION_CODES[number]]: k}} */ ({
  ABS: 'ABS',
  PSS: 'PSS',
  KEF: 'KEF'
});
