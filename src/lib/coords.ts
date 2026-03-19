export function isValidLatitude(lat: number) {
  return Number.isFinite(lat) && lat >= -90 && lat <= 90;
}

export function isValidLongitude(lon: number) {
  return Number.isFinite(lon) && lon >= -180 && lon <= 180;
}
