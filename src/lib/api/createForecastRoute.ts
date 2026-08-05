import { NextResponse } from "next/server";
import {
  BEST_TIME_OF_DAY_BONUS,
  calculateUtepilsScoreWithoutTime,
  mapSymbolToCondition,
} from "@/lib/calculations";
import type { CityConfig } from "@/lib/cities";

type DayPrediction = {
  date: string;
  label: string;
  score: number;
  bestHour: string;
  temperature: number;
  condition: string;
};

export function createForecastRoute(city: CityConfig) {
  return async function GET() {
    try {
      const params = new URLSearchParams({
        lat: String(city.lat),
        lon: String(city.lon),
      });

      const res = await fetch(
        `https://api.met.no/weatherapi/locationforecast/2.0/compact?${params}`,
        {
          headers: {
            "User-Agent": "utepils-meter/1.0",
            Accept: "application/json",
          },
          cache: "no-store",
        },
      );

      if (!res.ok) {
        return NextResponse.json(
          { error: "Could not fetch forecast data" },
          { status: 502 },
        );
      }

      const data = await res.json();
      const timeseries = data?.properties?.timeseries ?? [];

      const grouped = new Map<string, DayPrediction>();

      for (const entry of timeseries) {
        const iso = entry?.time;
        const instant = entry?.data?.instant?.details;
        const nextHour = entry?.data?.next_1_hours;

        if (!iso || !instant) continue;

        const date = new Date(iso);

        const dateKey = date.toLocaleDateString("sv-SE", {
          timeZone: city.timeZone,
        });

        const hour = date.toLocaleTimeString("en-GB", {
          timeZone: city.timeZone,
          hour: "2-digit",
          minute: "2-digit",
        });

        const temperature = instant.air_temperature;
        const wind = instant.wind_speed;
        const precipitation = nextHour?.details?.precipitation_amount ?? 0;
        const symbol = nextHour?.summary?.symbol_code ?? "";

        if (
          typeof temperature !== "number" ||
          typeof wind !== "number" ||
          typeof precipitation !== "number"
        ) {
          continue;
        }

        const condition = mapSymbolToCondition(symbol);

        const weatherScore = calculateUtepilsScoreWithoutTime(
          temperature,
          wind,
          condition,
          precipitation,
        );

        const score = Math.max(
          0,
          Math.min(100, weatherScore + BEST_TIME_OF_DAY_BONUS),
        );

        const existing = grouped.get(dateKey);

        if (!existing || score > existing.score) {
          grouped.set(dateKey, {
            date: dateKey,
            label: date.toLocaleDateString("no-NO", {
              timeZone: city.timeZone,
              weekday: "short",
            }),
            score,
            bestHour: hour,
            temperature,
            condition,
          });
        }
      }

      const todayKey = new Date().toLocaleDateString("sv-SE", {
        timeZone: city.timeZone,
      });

      const predictions = Array.from(grouped.values())
        .filter((day) => day.date >= todayKey)
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 7);

      return NextResponse.json(
        {
          city: city.name,
          predictions,
        },
        {
          headers: {
            "Cache-Control":
              "public, s-maxage=1800, stale-while-revalidate=3600",
          },
        },
      );
    } catch (error) {
      console.error(`GET /api/utepils/${city.slug}/forecast failed:`, error);

      return NextResponse.json(
        { error: `Could not fetch ${city.name} forecast data` },
        { status: 500 },
      );
    }
  };
}
