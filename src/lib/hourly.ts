import { calculateDaylight, calculateUtepilsScore } from "./calculations";
import { fetchSunset } from "./sun";
import { formatOsloTime, getOsloDayKey, getOsloHour } from "./time";
import { fetchWeatherTimeseries } from "./weather";
import type { ForecastEntry, HourlyPoint } from "@/types/weather";

const HOUR_MS = 60 * 60 * 1000;

/*
 * Score every hour from the current hour and `hours` ahead, using the same
 * formula as the "Akkurat nå" score.
 */
export async function fetchHourlyScores(
  lat: number,
  lon: number,
  hours = 24,
): Promise<HourlyPoint[]> {
  const now = new Date();
  const todayKey = getOsloDayKey(now);
  const tomorrowKey = getOsloDayKey(new Date(now.getTime() + 24 * HOUR_MS));

  const [data, sunsetToday, sunsetTomorrow] = await Promise.all([
    fetchWeatherTimeseries(lat, lon),
    fetchSunset(lat, lon, todayKey).catch(() => null),
    fetchSunset(lat, lon, tomorrowKey).catch(() => null),
  ]);

  const sunsets: Record<string, string | null> = {
    [todayKey]: sunsetToday,
    [tomorrowKey]: sunsetTomorrow,
  };

  const timeseries: ForecastEntry[] = data?.properties?.timeseries ?? [];
  const points: HourlyPoint[] = [];

  for (const entry of timeseries) {
    if (points.length >= hours) break;

    const iso = entry.time;
    const instant = entry.data?.instant?.details;
    const nextHour = entry.data?.next_1_hours;

    if (!iso || !instant) continue;

    const date = new Date(iso);

    // Skip anything older than the current hour.
    if (date.getTime() <= now.getTime() - HOUR_MS) continue;

    const temperature = instant.air_temperature;
    const wind = instant.wind_speed;
    const precipitation = nextHour?.details?.precipitation_amount ?? 0;
    const symbol = nextHour?.summary?.symbol_code ?? "";

    if (typeof temperature !== "number" || typeof wind !== "number") {
      continue;
    }

    const hour = getOsloHour(date);
    const sunsetIso = sunsets[getOsloDayKey(date)] ?? null;

    points.push({
      time: iso,
      hour: formatOsloTime(date),
      score: calculateUtepilsScore(
        temperature,
        wind,
        symbol,
        precipitation,
        hour,
        sunsetIso,
        iso,
      ),
      temperature,
      wind,
      precipitation,
      symbol,
      night: calculateDaylight(hour, sunsetIso) <= 0.1,
    });
  }

  return points;
}
