import { calculateUtepilsScore, getVerdict } from "@/lib/calculations";
import { buildHourlyScores } from "@/lib/hourly";
import { findPeakToday } from "@/lib/peak";
import { fetchSunTimesForDays } from "@/lib/sun";
import { getNextOsloDayKeys, getOsloHour } from "@/lib/time";
import {
  fetchPlaceName,
  fetchWeatherTimeseries,
  getCurrentWeather,
} from "@/lib/weather";

/*
 * Everything the front page needs for one location. Pass `name` when the
 * place is already known to skip the reverse geocoding lookup.
 */
export async function getUtepilsData({
  lat,
  lon,
  name,
}: {
  lat: number;
  lon: number;
  name?: string;
}) {
  const now = new Date();
  const [todayKey, tomorrowKey] = getNextOsloDayKeys(2, now);

  const [timeseries, sunTimes, city] = await Promise.all([
    fetchWeatherTimeseries(lat, lon),
    fetchSunTimesForDays(lat, lon, [todayKey, tomorrowKey]),
    name ?? fetchPlaceName(lat, lon),
  ]);

  const weather = getCurrentWeather(timeseries, city);
  const sun = sunTimes[todayKey] ?? { sunrise: null, sunset: null };
  const hourly = buildHourlyScores(timeseries, sunTimes);

  const score = calculateUtepilsScore(
    weather.temperature,
    weather.wind,
    weather.symbol,
    weather.precipitation,
    getOsloHour(now),
    sun.sunset,
    now.toISOString(),
    sun.sunrise,
  );

  return {
    city,
    score,
    verdict: getVerdict(score),
    weather,
    sun,
    peakToday: findPeakToday(hourly),
    hourly,
  };
}
