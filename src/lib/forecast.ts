import { calculateUtepilsScore } from "@/lib/calculations";
import { mapSymbolToCondition } from "@/lib/conditions";
import { TIMEZONE } from "@/lib/time";
import type { SunTimes } from "@/lib/sun";
import type { ForecastPoint } from "@/types/weather";

type ForecastEntry = {
  time?: string;
  data?: {
    instant?: {
      details?: {
        air_temperature?: number;
        wind_speed?: number;
      };
    };
    next_1_hours?: ForecastPeriod;
    next_6_hours?: ForecastPeriod;
  };
};

type ForecastPeriod = {
  details?: {
    precipitation_amount?: number;
  };
  summary?: {
    symbol_code?: string;
  };
};

function getForecastPoint(
  entry: ForecastEntry,
  timeZone: string,
  sunTimes: Record<string, SunTimes | null>,
) {
  const iso = entry.time;
  const instant = entry.data?.instant?.details;
  const nextHour = entry.data?.next_1_hours;
  // MET only has hourly periods for the first ~2.5 days, then 6-hour ones.
  const nextSixHours = entry.data?.next_6_hours;

  if (!iso || !instant) return null;

  const date = new Date(iso);
  const temperature = instant.air_temperature;
  const wind = instant.wind_speed;
  const precipitation =
    nextHour?.details?.precipitation_amount ??
    (nextSixHours?.details?.precipitation_amount ?? 0) / 6;
  const symbol =
    nextHour?.summary?.symbol_code ?? nextSixHours?.summary?.symbol_code ?? "";

  if (
    typeof temperature !== "number" ||
    typeof wind !== "number" ||
    typeof precipitation !== "number"
  ) {
    return null;
  }

  const hour = date.toLocaleTimeString("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
  });

  const day = date.toLocaleDateString("sv-SE", { timeZone });
  const sun = sunTimes[day] ?? null;

  return {
    date: day,
    label: date.toLocaleDateString("no-NO", { timeZone, weekday: "short" }),
    bestHour: hour,
    temperature,
    condition: mapSymbolToCondition(symbol),
    score: calculateUtepilsScore(
      temperature,
      wind,
      symbol,
      precipitation,
      Number(hour.slice(0, 2)),
      sun?.sunset,
      iso,
      sun?.sunrise,
    ),
  } satisfies ForecastPoint;
}

export function buildDailyForecast(
  timeseries: ForecastEntry[],
  timeZone = TIMEZONE,
  sunTimes: Record<string, SunTimes | null> = {},
): ForecastPoint[] {
  const grouped = new Map<string, ForecastPoint>();

  for (const entry of timeseries) {
    const point = getForecastPoint(entry, timeZone, sunTimes);
    if (!point) continue;

    const existing = grouped.get(point.date);
    if (!existing || point.score > existing.score) {
      grouped.set(point.date, point);
    }
  }

  const todayKey = new Date().toLocaleDateString("sv-SE", { timeZone });

  return Array.from(grouped.values())
    .filter((day) => day.date >= todayKey)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 7);
}
