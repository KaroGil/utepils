import {
  calculateUtepilsScore,
  mapSymbolToCondition,
} from "@/lib/calculations";
import { TIMEZONE } from "@/lib/time";
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
    next_1_hours?: {
      details?: {
        precipitation_amount?: number;
      };
      summary?: {
        symbol_code?: string;
      };
    };
  };
};

function getForecastPoint(entry: ForecastEntry, timeZone: string) {
  const iso = entry.time;
  const instant = entry.data?.instant?.details;
  const nextHour = entry.data?.next_1_hours;

  if (!iso || !instant) return null;

  const date = new Date(iso);
  const temperature = instant.air_temperature;
  const wind = instant.wind_speed;
  const precipitation = nextHour?.details?.precipitation_amount ?? 0;
  const symbol = nextHour?.summary?.symbol_code ?? "";

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

  return {
    date: date.toLocaleDateString("sv-SE", { timeZone }),
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
      null,
      iso,
    ),
  } satisfies ForecastPoint;
}

export function buildDailyForecast(
  timeseries: ForecastEntry[],
  timeZone = TIMEZONE,
): ForecastPoint[] {
  const grouped = new Map<string, ForecastPoint>();

  for (const entry of timeseries) {
    const point = getForecastPoint(entry, timeZone);
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
