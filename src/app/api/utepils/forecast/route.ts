import { NextRequest, NextResponse } from "next/server";
import {
  BEST_TIME_OF_DAY_BONUS,
  calculateUtepilsScoreWithoutTime,
  mapSymbolToCondition,
} from "@/lib/calculations";
import { isValidLatitude, isValidLongitude } from "@/lib/coords";

type DayPrediction = {
  date: string;
  label: string;
  score: number;
  bestHour: string;
  temperature: number;
  condition: string;
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const lat = Number(searchParams.get("lat"));
    const lon = Number(searchParams.get("lon"));

    if (!isValidLatitude(lat) || !isValidLongitude(lon)) {
      return NextResponse.json({ error: "Invalid lat/lon" }, { status: 400 });
    }

    const res = await fetch(
      `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`,
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

      const dateObj = new Date(iso);

      const dateKey = dateObj.toLocaleDateString("sv-SE", {
        timeZone: "Europe/Oslo",
      });

      const hour = dateObj.toLocaleTimeString("en-GB", {
        timeZone: "Europe/Oslo",
        hour: "2-digit",
        minute: "2-digit",
      });

      const temperature = instant.air_temperature;
      const wind = instant.wind_speed;
      const precipitation = nextHour?.details?.precipitation_amount ?? 0;
      const symbol = nextHour?.summary?.symbol_code ?? "";
      const condition = mapSymbolToCondition(symbol);

      if (
        typeof temperature !== "number" ||
        typeof wind !== "number" ||
        typeof precipitation !== "number"
      ) {
        continue;
      }

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
          label: dateObj.toLocaleDateString("no-NO", {
            timeZone: "Europe/Oslo",
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
      timeZone: "Europe/Oslo",
    });

    const predictions = Array.from(grouped.values())
      .filter((day) => day.date >= todayKey)
      .slice(0, 7);

    return NextResponse.json(
      {
        city: "Your location",
        predictions,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
        },
      },
    );
  } catch (error) {
    console.error("GET /api/utepils/forecast failed:", error);

    return NextResponse.json(
      { error: "Could not fetch forecast data" },
      { status: 500 },
    );
  }
}
