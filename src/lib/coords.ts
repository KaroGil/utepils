export function isValidLatitude(lat: number) {
  return Number.isFinite(lat) && lat >= -90 && lat <= 90;
}

/*
 * MET requires at most 4 decimals (~10 m), and it lets nearby users share
 * cached responses.
 */
export function roundCoord(value: number) {
  return Math.round(value * 1e4) / 1e4;
}

export function isValidLongitude(lon: number) {
  return Number.isFinite(lon) && lon >= -180 && lon <= 180;
}
