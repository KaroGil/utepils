import { calculateDaylight, calculateUtepilsScore } from "./calculations";
import type { SunTimes } from "./sun";
import { formatOsloTime, getOsloDayKey, getOsloHour } from "./time";
import type { ForecastEntry, HourlyPoint } from "@/types/weather";

const HOUR_MS = 60 * 60 * 1000;

/*
 * Score every hour from the current hour and `hours` ahead, using the same
 * formula as the "Akkurat nå" score. `sunTimes` is keyed by Oslo day.
 */
export function buildHourlyScores(
  timeseries: ForecastEntry[],
  sunTimes: Record<string, SunTimes | null>,
  hours = 24,
): HourlyPoint[] {
  const now = new Date();
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
    const sun = sunTimes[getOsloDayKey(date)] ?? null;

    points.push({
      time: iso,
      hour: formatOsloTime(date),
      score: calculateUtepilsScore(
        temperature,
        wind,
        symbol,
        precipitation,
        hour,
        sun?.sunset,
        iso,
        sun?.sunrise,
      ),
      temperature,
      wind,
      precipitation,
      symbol,
      night: calculateDaylight(hour, sun?.sunset, sun?.sunrise) <= 0.1,
    });
  }

  return points;
}
